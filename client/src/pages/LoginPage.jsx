"use client"

import { useState } from "react"
import axios from "axios"
import "../styles/LoginPage.css"

function LoginPage({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isSignup) {
        await axios.post("http://localhost:3000/api/auth/signup", formData)
        setFormData({ username: "", email: "", password: "" })
        setIsSignup(false)
        setError("")
      } else {
        const response = await axios.post("http://localhost:3000/api/auth/signin", {
          email: formData.email,
          password: formData.password,
        })
        onLogin(response.data.accessToken, response.data.user)
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>SyncBoard</h1>
        <p className="subtitle">Collaborative Development Platform</p>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                required={isSignup}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Loading..." : isSignup ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="toggle-auth">
          <p>
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup)
                setError("")
              }}
              className="toggle-btn"
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
