const express = require("express")
const httpProxy = require("http-proxy")
const cors = require("cors")
require("dotenv").config()

const app = express()
app.use(cors())
app.use(express.json())

// Create proxies for each service
const authProxy = httpProxy.createProxyServer({})
const communicationProxy = httpProxy.createProxyServer({})

// Route to auth service
app.use("/api/auth", (req, res) => {
  authProxy.web(req, res, {
    target: process.env.AUTH_SERVICE_URL,
  })
})

// Route to communication service
app.use("/api/communication", (req, res) => {
  communicationProxy.web(req, res, {
    target: process.env.COMMUNICATION_SERVICE_URL,
  })
})

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "API Gateway is running" })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`)
})
