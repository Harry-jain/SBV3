const express = require("express")
const WebSocket = require("ws")
const http = require("http")
const { Pool } = require("pg")
const redis = require("redis")
require("dotenv").config()

const app = express()
app.use(express.json())

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Redis connection
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
})
redisClient.connect()

// Store active connections
const connections = new Map()

// WebSocket connection handler
wss.on("connection", (ws) => {
  console.log("New WebSocket connection")

  ws.on("message", async (data) => {
    try {
      const message = JSON.parse(data)
      console.log("Received message:", message)

      if (message.type === "join") {
        connections.set(ws, {
          userId: message.userId,
          conversationId: message.conversationId,
        })
      } else if (message.type === "message") {
        // Save message to database
        await pool.query("INSERT INTO messages (conversation_id, user_id, content) VALUES ($1, $2, $3)", [
          message.conversationId,
          message.userId,
          message.content,
        ])

        // Broadcast to all connected clients in the conversation
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            const clientData = connections.get(client)
            if (clientData?.conversationId === message.conversationId) {
              client.send(
                JSON.stringify({
                  type: "message",
                  userId: message.userId,
                  content: message.content,
                  timestamp: new Date(),
                }),
              )
            }
          }
        })
      }
    } catch (error) {
      console.error("WebSocket error:", error)
    }
  })

  ws.on("close", () => {
    connections.delete(ws)
    console.log("WebSocket connection closed")
  })
})

// REST endpoints
app.get("/api/communication/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const result = await pool.query(
      `SELECT c.* FROM conversations c
       JOIN conversation_members cm ON c.id = cm.conversation_id
       WHERE cm.user_id = $1`,
      [userId],
    )
    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.get("/api/communication/messages/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params
    const result = await pool.query(
      "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 50",
      [conversationId],
    )
    res.json(result.rows)
  } catch (error) {
    console.error("Error fetching messages:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/communication/conversations", async (req, res) => {
  try {
    const { name, type, createdBy, members } = req.body
    const result = await pool.query(
      "INSERT INTO conversations (name, type, created_by) VALUES ($1, $2, $3) RETURNING *",
      [name, type, createdBy],
    )

    const conversationId = result.rows[0].id

    // Add members
    for (const memberId of members) {
      await pool.query("INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2)", [
        conversationId,
        memberId,
      ])
    }

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error creating conversation:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Communication service is running" })
})

const PORT = process.env.PORT || 3002
server.listen(PORT, () => {
  console.log(`Communication service running on port ${PORT}`)
})
