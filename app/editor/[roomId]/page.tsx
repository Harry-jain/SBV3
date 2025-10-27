"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CodeEditor } from "@/components/code-editor"
import { ChatPanel } from "@/components/chat-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Copy, LogOut, Check } from "lucide-react"

interface RoomMember {
  id: string
  user_id: string
  profiles: {
    display_name: string
  }
}

interface Room {
  id: string
  name: string
  code: string
  language: string
  owner_id: string
}

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string

  const [room, setRoom] = useState<Room | null>(null)
  const [code, setCode] = useState("")
  const [members, setMembers] = useState<RoomMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        // Fetch room details
        const { data: roomData, error: roomError } = await supabase.from("rooms").select("*").eq("id", roomId).single()

        if (roomError) throw roomError
        setRoom(roomData)
        setCode(roomData.code || "")

        // Fetch room members
        const { data: membersData, error: membersError } = await supabase
          .from("room_members")
          .select("id, user_id, profiles(display_name)")
          .eq("room_id", roomId)

        if (membersError) throw membersError
        setMembers(membersData || [])

        // Join room if not already a member
        const isMember = membersData?.some((m) => m.user_id === user.id)
        if (!isMember) {
          await supabase.from("room_members").insert({
            room_id: roomId,
            user_id: user.id,
          })
          // Refetch members after joining
          const { data: updatedMembers } = await supabase
            .from("room_members")
            .select("id, user_id, profiles(display_name)")
            .eq("room_id", roomId)
          setMembers(updatedMembers || [])
        }

        const roomSubscription = supabase
          .channel(`room:${roomId}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "rooms",
              filter: `id=eq.${roomId}`,
            },
            (payload) => {
              setCode(payload.new.code || "")
            },
          )
          .subscribe()

        const membersSubscription = supabase
          .channel(`members:${roomId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "room_members",
              filter: `room_id=eq.${roomId}`,
            },
            async () => {
              const { data: updatedMembers } = await supabase
                .from("room_members")
                .select("id, user_id, profiles(display_name)")
                .eq("room_id", roomId)
              setMembers(updatedMembers || [])
            },
          )
          .subscribe()

        return () => {
          roomSubscription.unsubscribe()
          membersSubscription.unsubscribe()
        }
      } catch (err) {
        console.error("Error fetching room:", err)
        setError(err instanceof Error ? err.message : "Failed to load room")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoomData()
  }, [roomId, supabase, router])

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
  }

  const handleSaveCode = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase.from("rooms").update({ code }).eq("id", roomId)

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save code")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}/editor/${roomId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading editor...</p>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Card className="border-slate-700 bg-slate-800 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">{error || "Room not found"}</p>
            <Button onClick={() => router.push("/dashboard")} className="w-full bg-blue-600 hover:bg-blue-700">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{room.name}</h1>
            <p className="text-sm text-slate-400">Language: {room.language}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="w-4 h-4" />
              <span className="text-sm">{members.length} online</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyLink}
              className="border-slate-600 text-slate-200 hover:bg-slate-700 bg-transparent"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied" : "Share"}
            </Button>
            <Button size="sm" onClick={handleSaveCode} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              className="border-slate-600 text-slate-200 hover:bg-slate-700 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 container mx-auto p-4 flex gap-4 overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 flex flex-col overflow-hidden border-slate-700 bg-slate-800">
            <CardHeader className="border-b border-slate-700 py-3">
              <CardTitle className="text-white text-sm">Code Editor</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <CodeEditor value={code} onChange={handleCodeChange} language={room.language} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-80 flex flex-col gap-4 overflow-hidden">
          {/* Members */}
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader className="border-b border-slate-700 py-3">
              <CardTitle className="text-white text-sm">Active Members</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {members.length === 0 ? (
                  <p className="text-sm text-slate-400">No members connected</p>
                ) : (
                  members.map((member) => (
                    <div key={member.id} className="flex items-center gap-2 p-2 rounded bg-slate-700">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-slate-200">{member.profiles?.display_name || "User"}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat */}
          <div className="flex-1 min-h-0">
            <ChatPanel roomId={roomId} />
          </div>
        </div>
      </div>
    </main>
  )
}
