"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/DashboardPage.css"

function DashboardPage({ user, onLogout }) {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await axios.get(`http://localhost:3000/api/communication/conversations/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setConversations(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching conversations:", error)
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await axios.get(`http://localhost:3000/api/communication/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(response.data.reverse())
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const token = localStorage.getItem("accessToken")
      await axios.post(
        "http://localhost:3000/api/communication/messages",
        {
          conversationId: selectedConversation.id,
          userId: user.id,
          content: newMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setNewMessage("")
      fetchMessages(selectedConversation.id)
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>SyncBoard</h1>
        <div className="user-info">
          <span>{user.username}</span>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <h2>Conversations</h2>
          {loading ? (
            <p>Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="no-conversations">No conversations yet</p>
          ) : (
            <ul className="conversation-list">
              {conversations.map((conv) => (
                <li
                  key={conv.id}
                  className={`conversation-item ${selectedConversation?.id === conv.id ? "active" : ""}`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  {conv.name || `Conversation ${conv.id}`}
                </li>
              ))}
            </ul>
          )}
        </aside>

        <main className="chat-area">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <h2>{selectedConversation.name || `Conversation ${selectedConversation.id}`}</h2>
              </div>

              <div className="messages-container">
                {messages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.user_id === user.id ? "own" : "other"}`}>
                    <p className="message-content">{msg.content}</p>
                    <span className="message-time">{new Date(msg.created_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="message-form">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="message-input"
                />
                <button type="submit" className="send-btn">
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="no-conversation-selected">
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default DashboardPage
