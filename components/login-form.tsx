"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import api from "@/lib/api"

// Utility function to persist auth data
const persistAuthData = (token: string, role: string, email: string) => {
  if (typeof window !== "undefined"){localStorage.setItem("authToken", token)
  localStorage.setItem("userRole", role)
  localStorage.setItem("userEmail", email)
  localStorage.setItem("isAuthenticated", "true")
  }
}

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("Attempting login...")
      }
      const response = await api.post("/auth/login", {
        username: email,
        password
      })

      if (!response.data || !response.data.token) {
        throw new Error("Invalid response structure from server side")
      }

      const { token, role, email: userEmail } = response.data

      if (token) {
        persistAuthData(token, role, userEmail)
        router.push("/dashboard")
      } else {
        throw new Error("No token received")
      }
    } catch (err: any) {
      console.error("Login error:", err.response?.status || err.message)
      setError(
        err.response?.data?.message || 
        "Login failed. Please check your credentials and try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 text-sm text-red-500">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@demo.com or staff@demo.com"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}