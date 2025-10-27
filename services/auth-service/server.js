const express = require("express")
const cors = require("cors")
const { Pool } = require("pg")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const redis = require("redis")
require("dotenv").config()

const app = express()
app.use(cors())
app.use(express.json())

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Redis connection
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
})
redisClient.connect()

// Helper function to hash password
async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

// Helper function to compare password
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}

// Helper function to generate JWT
function generateToken(userId, roles) {
  return jwt.sign({ userId, roles }, process.env.JWT_SECRET, { expiresIn: "24h" })
}

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ error: "No token provided" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    req.roles = decoded.roles
    next()
  } catch (error) {
    res.status(401).json({ error: "Invalid token" })
  }
}

// Register endpoint
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Check if user exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $2", [email, username])

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, passwordHash],
    )

    const userId = result.rows[0].id

    // Assign default role
    await pool.query("INSERT INTO user_roles (user_id, role_id) SELECT $1, id FROM roles WHERE name = $2", [
      userId,
      "user",
    ])

    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Login endpoint
app.post("/api/auth/signin", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" })
    }

    // Get user
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email])

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const user = userResult.rows[0]

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash)
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Get user roles
    const rolesResult = await pool.query(
      "SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = $1",
      [user.id],
    )

    const roles = rolesResult.rows.map((r) => r.name)

    // Generate token
    const token = generateToken(user.id, roles)

    // Store session in Redis
    await redisClient.setEx(`session:${user.id}`, 86400, JSON.stringify({ userId: user.id, roles }))

    res.json({
      message: "Login successful",
      accessToken: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Protected route example
app.get("/api/auth/me", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username, email FROM users WHERE id = $1", [req.userId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      user: {
        ...result.rows[0],
        roles: req.roles,
      },
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Auth service is running" })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`)
})
