const express = require("express")
const httpProxy = require("http-proxy")
const cors = require("cors")
require("dotenv").config()

const app = express()
const PORT = process.env.GATEWAY_PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Create proxies for different services
const authProxy = httpProxy.createProxyServer({
  target: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  changeOrigin: true,
})

const realtimeProxy = httpProxy.createProxyServer({
  target: process.env.REALTIME_SERVICE_URL || "http://localhost:3002",
  changeOrigin: true,
})

const ideProxy = httpProxy.createProxyServer({
  target: process.env.IDE_SERVICE_URL || "http://localhost:3003",
  changeOrigin: true,
})

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "api-gateway" })
})

// Auth service routes
app.post("/api/auth/register", (req, res) => {
  authProxy.web(req, res)
})

app.post("/api/auth/login", (req, res) => {
  authProxy.web(req, res)
})

app.post("/api/auth/logout", (req, res) => {
  authProxy.web(req, res)
})

app.post("/api/auth/verify", (req, res) => {
  authProxy.web(req, res)
})

// User service routes
app.get("/api/users/me", (req, res) => {
  authProxy.web(req, res)
})

app.put("/api/users/me", (req, res) => {
  authProxy.web(req, res)
})

// Realtime service routes
app.use("/api/realtime", (req, res) => {
  realtimeProxy.web(req, res)
})

// IDE service routes
app.use("/api/ide", (req, res) => {
  ideProxy.web(req, res)
})

// WebSocket upgrade for realtime
const server = require("http").createServer(app)
const WebSocket = require("ws")

server.on("upgrade", (req, socket, head) => {
  if (req.url.startsWith("/ws/realtime")) {
    realtimeProxy.ws(req, socket, head)
  } else if (req.url.startsWith("/ws/ide")) {
    ideProxy.ws(req, socket, head)
  }
})

// Error handling
authProxy.on("error", (err, req, res) => {
  console.error("Auth proxy error:", err)
  res.status(503).json({ error: "Auth service unavailable" })
})

realtimeProxy.on("error", (err, req, res) => {
  console.error("Realtime proxy error:", err)
  res.status(503).json({ error: "Realtime service unavailable" })
})

ideProxy.on("error", (err, req, res) => {
  console.error("IDE proxy error:", err)
  res.status(503).json({ error: "IDE service unavailable" })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" })
})

// Start server
server.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`)
})
