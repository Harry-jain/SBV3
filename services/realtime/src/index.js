const express = require("express")
const http = require("http")
const WebSocket = require("ws")
const jwt = require("jsonwebtoken")
const redis = require("redis")
require("dotenv").config()

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })
const PORT = process.env.PORT || 3002

// Redis client for pub/sub
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
})

redisClient.connect()

// Middleware
app.use(express.json())

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "realtime-service" })
})

// Store active connections
const connections = new Map()
const rooms = new Map()

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

// WebSocket connection handler
wss.on("connection", (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const token = url.searchParams.get("token")
  const roomId = url.searchParams.get("room")

  // Verify token
  const decoded = verifyToken(token)
  if (!decoded) {
    ws.close(1008, "Unauthorized")
    return
  }

  const userId = decoded.userId
  const connectionId = `${userId}-${Date.now()}`

  // Store connection
  connections.set(connectionId, {
    ws,
    userId,
    roomId,
  })

  // Join room
  if (roomId) {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set())
    }
    rooms.get(roomId).add(connectionId)

    // Notify room members
    broadcastToRoom(roomId, {
      type: "user-joined",
      userId,
      timestamp: new Date().toISOString(),
    })
  }

  // Handle messages
  ws.on("message", async (data) => {
    try {
      const message = JSON.parse(data)

      if (message.type === "code-update") {
        // Store code state in Redis
        if (roomId) {
          await redisClient.set(`room:${roomId}:code`, message.content)
        }
      }

      // Store message in Redis for persistence
      if (roomId) {
        await redisClient.lPush(
          `room:${roomId}:messages`,
          JSON.stringify({
            userId,
            ...message,
            timestamp: new Date().toISOString(),
          }),
        )

        // Keep only last 1000 messages
        await redisClient.lTrim(`room:${roomId}:messages`, 0, 999)
      }

      // Broadcast to room
      if (roomId) {
        broadcastToRoom(roomId, {
          type: message.type,
          userId,
          ...message,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Message error:", error)
    }
  })

  // Handle disconnect
  ws.on("close", () => {
    connections.delete(connectionId)

    if (roomId) {
      rooms.get(roomId)?.delete(connectionId)

      // Notify room members
      broadcastToRoom(roomId, {
        type: "user-left",
        userId,
        timestamp: new Date().toISOString(),
      })
    }
  })

  // Handle errors
  ws.on("error", (error) => {
    console.error("WebSocket error:", error)
  })
})

// Broadcast to room
function broadcastToRoom(roomId, message) {
  const roomConnections = rooms.get(roomId)
  if (!roomConnections) return

  roomConnections.forEach((connectionId) => {
    const connection = connections.get(connectionId)
    if (connection && connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(message))
    }
  })
}

// REST endpoints for room management
app.post("/api/rooms", (req, res) => {
  const { roomId, name, description } = req.body

  if (!roomId) {
    return res.status(400).json({ error: "Room ID required" })
  }

  // Store room metadata in Redis
  redisClient.hSet(`room:${roomId}`, {
    name: name || roomId,
    description: description || "",
    created_at: new Date().toISOString(),
  })

  res.status(201).json({ roomId, name, description })
})

app.get("/api/rooms/:roomId/messages", async (req, res) => {
  try {
    const { roomId } = req.params
    const limit = Number.parseInt(req.query.limit) || 50

    const messages = await redisClient.lRange(`room:${roomId}:messages`, 0, limit - 1)

    res.json({
      roomId,
      messages: messages.map((msg) => JSON.parse(msg)),
    })
  } catch (error) {
    console.error("Get messages error:", error)
    res.status(500).json({ error: "Failed to get messages" })
  }
})

app.get("/api/rooms/:roomId/users", (req, res) => {
  const { roomId } = req.params
  const roomConnections = rooms.get(roomId) || new Set()

  const users = Array.from(roomConnections).map((connectionId) => {
    const connection = connections.get(connectionId)
    return {
      userId: connection.userId,
      connectionId,
    }
  })

  res.json({ roomId, users, count: users.length })
})

// Start server
server.listen(PORT, () => {
  console.log(`Realtime service running on port ${PORT}`)
})
