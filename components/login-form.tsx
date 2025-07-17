"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import api from "@/lib/api" // Import the configured axios instance

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
    console.log("Sending request to:", process.env.NEXT_PUBLIC_API_URL + "/auth/login")
    const response = await api.post("/auth/login", {
      username: email,
      password
    })

    console.log("Login response:", response.data)

    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token)
      localStorage.setItem("userRole", response.data.role)
      localStorage.setItem("userEmail", response.data.email)
      localStorage.setItem("isAuthenticated", "true")

      router.push("/dashboard")
    } else {
      throw new Error("No token received")
    }
  } catch (err: any) {
    console.error("Full error object:", err)
    const errorMessage = err.response?.data?.message 
      || err.message 
      || "Login failed. Please try again."
    setError(errorMessage)
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
