"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Users, Zap, ArrowRight } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setIsAuthenticated(!!user)
      } catch (error) {
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-white">SyncBoard</h1>
          </div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  Dashboard
                </Button>
                <Button onClick={() => router.push("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
                  Go to App
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push("/auth/login")}
                  className="border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  Login
                </Button>
                <Button onClick={() => router.push("/auth/sign-up")} className="bg-blue-600 hover:bg-blue-700">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-white text-balance">Collaborate in Real-time</h2>
          <p className="text-xl text-slate-400 mb-8 text-balance">
            A powerful collaborative IDE for teams to code together seamlessly
          </p>
          {!isAuthenticated && (
            <Button size="lg" onClick={() => router.push("/auth/sign-up")} className="bg-blue-600 hover:bg-blue-700">
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <Code2 className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle className="text-white">Live Code Editing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400">
                Edit code together in real-time with syntax highlighting and instant updates
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <Users className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle className="text-white">Team Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400">
                See who's online, track changes, and communicate with your team members
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <Zap className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle className="text-white">Instant Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400">
                Changes sync instantly across all connected clients with zero latency
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        {!isAuthenticated && (
          <Card className="bg-blue-600 border-blue-500">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Ready to collaborate?</CardTitle>
              <CardDescription className="text-blue-100">
                Join thousands of developers using SyncBoard for real-time collaboration
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button size="lg" variant="secondary" onClick={() => router.push("/auth/sign-up")}>
                Start Free Today
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
