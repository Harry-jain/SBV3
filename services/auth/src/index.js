const express = require("express")
const cors = require("cors")
const { Pool } = require("pg")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "auth-service" })
})

// Import routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")

// Use routes
app.use("/api/auth", authRoutes(pool))
app.use("/api/users", userRoutes(pool))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Internal server error" })
})

// Start server
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`)
})
