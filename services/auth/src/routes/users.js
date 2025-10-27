const express = require("express")
const jwt = require("jsonwebtoken")

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "No token provided" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ error: "Invalid token" })
  }
}

module.exports = (pool) => {
  const router = express.Router()

  // Get current user
  router.get("/me", verifyToken, async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT id, email, username, full_name, avatar_url, role, created_at FROM users WHERE id = $1",
        [req.userId],
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" })
      }

      res.json(result.rows[0])
    } catch (error) {
      console.error("Get user error:", error)
      res.status(500).json({ error: "Failed to get user" })
    }
  })

  // Update user profile
  router.put("/me", verifyToken, async (req, res) => {
    try {
      const { full_name, avatar_url } = req.body

      const result = await pool.query(
        "UPDATE users SET full_name = $1, avatar_url = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, email, username, full_name, avatar_url, role",
        [full_name, avatar_url, req.userId],
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" })
      }

      res.json(result.rows[0])
    } catch (error) {
      console.error("Update user error:", error)
      res.status(500).json({ error: "Failed to update user" })
    }
  })

  return router
}
