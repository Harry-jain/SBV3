const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

module.exports = (pool) => {
  const router = express.Router()

  // Register
  router.post("/register", async (req, res) => {
    try {
      const { email, username, password, full_name } = req.body

      // Validate input
      if (!email || !username || !password) {
        return res.status(400).json({ error: "Missing required fields" })
      }

      // Check if user exists
      const existingUser = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $2", [email, username])

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: "User already exists" })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      const result = await pool.query(
        "INSERT INTO users (email, username, password_hash, full_name) VALUES ($1, $2, $3, $4) RETURNING id, email, username, full_name, role",
        [email, username, hashedPassword, full_name || null],
      )

      const user = result.rows[0]

      // Generate token
      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY || "24h",
      })

      // Store session
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await pool.query("INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)", [
        user.id,
        token,
        expiresAt,
      ])

      res.status(201).json({
        user,
        token,
      })
    } catch (error) {
      console.error("Register error:", error)
      res.status(500).json({ error: "Registration failed" })
    }
  })

  // Login
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" })
      }

      // Find user
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])

      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      const user = result.rows[0]

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash)

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      // Generate token
      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY || "24h",
      })

      // Store session
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await pool.query("INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)", [
        user.id,
        token,
        expiresAt,
      ])

      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
        },
        token,
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ error: "Login failed" })
    }
  })

  // Logout
  router.post("/logout", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1]

      if (!token) {
        return res.status(400).json({ error: "No token provided" })
      }

      await pool.query("DELETE FROM sessions WHERE token = $1", [token])

      res.json({ message: "Logged out successfully" })
    } catch (error) {
      console.error("Logout error:", error)
      res.status(500).json({ error: "Logout failed" })
    }
  })

  // Verify token
  router.post("/verify", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1]

      if (!token) {
        return res.status(401).json({ error: "No token provided" })
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Check if session exists
      const session = await pool.query("SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()", [token])

      if (session.rows.length === 0) {
        return res.status(401).json({ error: "Session expired" })
      }

      res.json({ valid: true, userId: decoded.userId })
    } catch (error) {
      res.status(401).json({ error: "Invalid token" })
    }
  })

  return router
}
