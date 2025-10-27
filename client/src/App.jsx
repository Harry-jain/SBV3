"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./App.css"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token) => {
    try {
      const response = await axios.get("http://localhost:3000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(response.data.user)
      setIsAuthenticated(true)
    } catch (error) {
      localStorage.removeItem("accessToken")
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (token, userData) => {
    localStorage.setItem("accessToken", token)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    setUser(null)
    setIsAuthenticated(false)
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="App">
      {isAuthenticated ? <DashboardPage user={user} onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />}
    </div>
  )
}

export default App
