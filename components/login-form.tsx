"use client"

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import endpoints from "@/lib/endpoints";

// Utility function to persist auth data
const persistAuthData = (token: string, role: string, email: string, username: string, userId: string) => {
  if (typeof window !== "undefined") {
    const cleanToken = token.replace('Bearer ', '');
    
    // Clear any existing auth data first
    const authKeys = [
      'authToken', 'token', 'userId', 'user_id',
      'userRole', 'userEmail', 'username', 'isAuthenticated'
    ];
    authKeys.forEach(key => localStorage.removeItem(key));
    
    // Extract user_id from token if not provided
    let finalUserId = userId;
    if (!finalUserId || finalUserId === "undefined") {
      try {
        const payload = JSON.parse(atob(cleanToken.split('.')[1]));
        finalUserId = payload.user_id;
      } catch (e) {
        console.error("Failed to extract user_id from token", e);
      }
    }

    // Store new auth data
    localStorage.setItem("authToken", cleanToken);
    localStorage.setItem("token", cleanToken);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("username", username);
    
    // Store user ID with both key variations
    localStorage.setItem("userId", finalUserId);
    localStorage.setItem("user_id", finalUserId);
    localStorage.setItem("isAuthenticated", "true");
    
    // Debug logging
    console.log("Auth data stored:", {
      userId: localStorage.getItem("userId"),
      user_id: localStorage.getItem("user_id"),
      token: localStorage.getItem("token"),
      extractedFromToken: finalUserId
    });
  }
}


export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    const response = await api.post(endpoints.auth.login, {
      email,
      password
    });

    if (response.data && response.data.success) {
      const { token, role, email: userEmail, username, user_id } = response.data;
      
      // Debug the response structure
      console.log("Login response:", {
        token,
        user_id, 
        fullResponse: response.data
      });

      if (token) {
        persistAuthData(
          token, 
          role, 
          userEmail, 
          username, 
          user_id || response.data.user?.id || response.data.user?._id
        );
        router.push("/dashboard");
      } else {
        throw new Error("Token not received in response");
      }
    } else {
      throw new Error(response.data?.message || "Login failed");
    }
  } catch (err: any) {
    console.error("Login error:", err);
    if (err.response?.data?.reason === "password") {
      setError("Invalid password");
    } else if (err.response?.data?.message) {
      setError(err.response.data.message);
    } else {
      setError("Login failed. Please check your credentials and try again.");
    }
  } finally {
    setIsLoading(false);
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