"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send } from "lucide-react"

interface Message {
  id: string
  user_id: string
  content: string
  created_at: string
  profiles: {
    display_name: string
  }
}

interface ChatPanelProps {
  roomId: string
}

export function ChatPanel({ roomId }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("id, user_id, content, created_at, profiles(display_name)")
          .eq("room_id", roomId)
          .order("created_at", { ascending: true })
          .limit(50)

        if (error) throw error
        setMessages(data || [])
      } catch (err) {
        console.error("Error fetching messages:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()

    // Subscribe to new messages
    const subscription = supabase
      .channel(`messages:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [roomId, supabase])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsSending(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("messages").insert({
        room_id: roomId,
        user_id: user.id,
        content: newMessage,
      })

      if (error) throw error
      setNewMessage("")
    } catch (err) {
      console.error("Error sending message:", err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className="border-slate-700 bg-slate-800 h-full flex flex-col">
      <CardHeader className="border-b border-slate-700 py-3">
        <CardTitle className="text-white text-sm">Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <p className="text-sm text-slate-400">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-slate-400">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="text-sm">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-blue-400">{msg.profiles?.display_name || "User"}</span>
                <span className="text-xs text-slate-500">{new Date(msg.created_at).toLocaleTimeString()}</span>
              </div>
              <p className="text-slate-300 mt-1 break-words">{msg.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="border-t border-slate-700 p-3">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            disabled={isSending}
          />
          <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700" disabled={isSending}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}
