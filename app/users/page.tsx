"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UsersManagement } from "@/components/users-management"
import { Sidebar } from "@/components/sidebar"

export default function UsersPage() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const auth = localStorage.getItem("isAuthenticated")

    if (!auth || !role) {
      router.push("/")
      return
    }

    if (role !== "admin") {
      router.push("/dashboard")
      return
    }

    setUserRole(role)
    setIsAuthenticated(true)
  }, [router])

  if (!isAuthenticated || !userRole) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={userRole} />
      <main className="flex-1 overflow-auto">
        <UsersManagement />
      </main>
    </div>
  )
}
