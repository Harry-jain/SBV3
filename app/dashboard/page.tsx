"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, LogOut, Code2 } from "lucide-react"
import Link from "next/link"

interface Room {
  id: string
  name: string
  description: string
  owner_id: string
  language: string
  is_public: boolean
  created_at: string
}

interface Profile {
  id: string
  email: string
  display_name: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newRoomName, setNewRoomName] = useState("")
  const [newRoomDescription, setNewRoomDescription] = useState("")
  const [newRoomLanguage, setNewRoomLanguage] = useState("javascript")
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) throw profileError
        setProfile(profileData)

        // Fetch user's rooms
        const { data: roomsData, error: roomsError } = await supabase
          .from("rooms")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false })

        if (roomsError) throw roomsError
        setRooms(roomsData || [])
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase, router])

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoomName.trim()) return

    setIsCreating(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { data: newRoom, error: createError } = await supabase
        .from("rooms")
        .insert({
          name: newRoomName,
          description: newRoomDescription,
          owner_id: user.id,
          language: newRoomLanguage,
          is_public: false,
        })
        .select()
        .single()

      if (createError) throw createError

      setRooms([newRoom, ...rooms])
      setNewRoomName("")
      setNewRoomDescription("")
      setNewRoomLanguage("javascript")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room")
    } finally {
      setIsCreating(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const { error } = await supabase.from("rooms").delete().eq("id", roomId)
      if (error) throw error
      setRooms(rooms.filter((r) => r.id !== roomId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete room")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">SyncBoard</h1>
            <p className="text-slate-400">Welcome back, {profile?.display_name || profile?.email}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-slate-600 text-slate-200 hover:bg-slate-700 bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Create Room Card */}
        <Card className="mb-8 border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Create New Room</CardTitle>
            <CardDescription className="text-slate-400">Start a new collaborative coding session</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-200">Room Name</label>
                <Input
                  placeholder="My awesome project"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="mt-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-200">Description</label>
                <Textarea
                  placeholder="What is this room for?"
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  className="mt-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-200">Language</label>
                <select
                  value={newRoomLanguage}
                  onChange={(e) => setNewRoomLanguage(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isCreating}>
                <Plus className="w-4 h-4 mr-2" />
                {isCreating ? "Creating..." : "Create Room"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Rooms List */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Your Rooms</h2>
          {rooms.length === 0 ? (
            <Card className="border-slate-700 bg-slate-800">
              <CardContent className="pt-6">
                <p className="text-center text-slate-400">No rooms yet. Create one to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <Card key={room.id} className="border-slate-700 bg-slate-800 hover:border-slate-600 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white">{room.name}</CardTitle>
                        {room.description && (
                          <CardDescription className="text-slate-400 mt-1">{room.description}</CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Code2 className="w-4 h-4" />
                        <span className="capitalize">{room.language}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/editor/${room.id}`} className="flex-1">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">Open</Button>
                        </Link>
                        <Button
                          variant="outline"
                          onClick={() => handleDeleteRoom(room.id)}
                          className="border-slate-600 text-slate-200 hover:bg-red-900 hover:text-red-200"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
