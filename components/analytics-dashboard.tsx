"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Phone, Target, Users } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import api from "@/lib/api"
import endpoints from "@/lib/endpoints"
import { toast } from "sonner"

interface AnalyticsDashboardProps {
  userRole: string
}

export function AnalyticsDashboard({ userRole }: AnalyticsDashboardProps) {
  const isAdmin = userRole === "admin"
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [personalStats, setPersonalStats] = useState({
    callsToday: 0,
    callsThisWeek: 0,
    callsThisMonth: 0,
    conversionRate: 0,
    hotLeads: 0,
    conversions: 0,
    weeklyCalls: {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0
    }
  })
  const [teamStats, setTeamStats] = useState({
    totalCalls: 0,
    totalConversions: 0,
    averageConversionRate: 0,
    topPerformer: "None",
    teamSize: 0,
  })

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user information
      const currentUserId = localStorage.getItem("userId")
      const currentUserEmail = localStorage.getItem("userEmail")

      // Get current date ranges
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay() + 1)
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      // catch contacts from API
      const response = await api.get(endpoints.contact.getAllContacts, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.data.allContacts) {
        throw new Error("No contacts data received")
      }

      const contacts = response.data.allContacts

      // Filter contacts for current user
      const filteredContacts = isAdmin 
        ? contacts 
        : contacts.filter((contact: any) => {
            const isUploadedByUser = contact.uploadedBy?.toString() === currentUserId
            const isAssignedToUser = contact.assignedTo === currentUserEmail
            return isUploadedByUser || isAssignedToUser
          })

      // Calculate monthly calls using uploadDate
      const callsThisMonth = filteredContacts.filter((contact: any) => {
        const uploadDate = new Date(contact.uploadDate)
        return uploadDate >= startOfMonth
      }).length

      // Calculate conversions
      const conversions = filteredContacts.filter((contact: any) => 
        contact.status === "Assigned"
      ).length

      // Calculate conversion rate
      const conversionRate = callsThisMonth > 0 
        ? Math.round((conversions / callsThisMonth) * 100 * 10) / 10 
        : 0

      // Calculate weekly calls by uploadDate
      const weeklyCalls = {
        monday: filteredContacts.filter((contact: any) => {
          const uploadDate = new Date(contact.uploadDate)
          return uploadDate.getDay() === 1 && uploadDate >= startOfWeek
        }).length,
        tuesday: filteredContacts.filter((contact: any) => {
          const uploadDate = new Date(contact.uploadDate)
          return uploadDate.getDay() === 2 && uploadDate >= startOfWeek
        }).length,
        wednesday: filteredContacts.filter((contact: any) => {
          const uploadDate = new Date(contact.uploadDate)
          return uploadDate.getDay() === 3 && uploadDate >= startOfWeek
        }).length,
        thursday: filteredContacts.filter((contact: any) => {
          const uploadDate = new Date(contact.uploadDate)
          return uploadDate.getDay() === 4 && uploadDate >= startOfWeek
        }).length,
        friday: filteredContacts.filter((contact: any) => {
          const uploadDate = new Date(contact.uploadDate)
          return uploadDate.getDay() === 5 && uploadDate >= startOfWeek
        }).length
      }

      // Calculate today calls
      const callsToday = filteredContacts.filter((contact: any) => {
        const uploadDate = new Date(contact.uploadDate)
        return uploadDate >= today
      }).length

      // Calculate this week calls
      const callsThisWeek = filteredContacts.filter((contact: any) => {
        const uploadDate = new Date(contact.uploadDate)
        return uploadDate >= startOfWeek
      }).length

      // Calculate hot leads (contacts uploaded in last 3 days)
      const hotLeads = filteredContacts.filter((contact: any) => {
        return new Date(contact.uploadDate).getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000
      }).length

      setPersonalStats({
        callsToday,
        callsThisWeek,
        callsThisMonth,
        conversionRate,
        hotLeads,
        conversions,
        weeklyCalls
      })

      // For admin, calculate team stats
      if (isAdmin) {
        const teamCallsThisMonth = contacts.filter((contact: any) => 
          new Date(contact.uploadDate) >= startOfMonth
        ).length
        const teamConversions = contacts.filter((contact: any) => 
          contact.status === "Assigned"
        ).length
        const teamConversionRate = teamCallsThisMonth > 0
          ? Math.round((teamConversions / teamCallsThisMonth) * 100 * 10) / 10
          : 0

        setTeamStats({
          totalCalls: teamCallsThisMonth,
          totalConversions: teamConversions,
          averageConversionRate: teamConversionRate,
          topPerformer: "Calculating...",
          teamSize: 8
        })
      }

    } catch (err: any) {
      console.error("Error fetching contacts:", err)
      setError(err.message || "Failed to load contact stats")
      toast.error("Failed to load performance data")
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts, userRole])

  return (
    <div className="p-6 space-y-6">
      {/* Loading and error states */}
      {loading && <div>Loading data...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{isAdmin ? "Team Analytics" : "My Performance"}</h1>
        <Badge variant="outline">{isAdmin ? "Admin View" : "Personal View"}</Badge>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isAdmin ? "Total Calls" : "My Calls"}</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isAdmin ? teamStats.totalCalls : personalStats.callsThisMonth}</div>
            <p className="text-xs text-muted-foreground">{isAdmin ? "This month (team)" : "This month"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isAdmin ? teamStats.averageConversionRate : personalStats.conversionRate}%
            </div>
            <Progress
              value={isAdmin ? teamStats.averageConversionRate : personalStats.conversionRate}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isAdmin ? "Total Conversions" : "My Conversions"}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isAdmin ? teamStats.totalConversions : personalStats.conversions}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isAdmin ? "Team Size" : "Hot Leads"}</CardTitle>
            {isAdmin ? (
              <Users className="h-4 w-4 text-muted-foreground" />
            ) : (
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isAdmin ? teamStats.teamSize : personalStats.hotLeads}</div>
            <p className="text-xs text-muted-foreground">{isAdmin ? "Active staff members" : "Ready for follow-up"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{isAdmin ? "Team Performance" : "Weekly Activity"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isAdmin ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sarah Johnson</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="w-20" />
                      <span className="text-sm">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mike Davis</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={72} className="w-20" />
                      <span className="text-sm">72%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">John Smith</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={68} className="w-20" />
                      <span className="text-sm">68%</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Monday</span>
                    <span className="text-sm">{personalStats.weeklyCalls.monday} calls</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tuesday</span>
                    <span className="text-sm">{personalStats.weeklyCalls.tuesday} calls</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Wednesday</span>
                    <span className="text-sm">{personalStats.weeklyCalls.wednesday} calls</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Thursday</span>
                    <span className="text-sm">{personalStats.weeklyCalls.thursday} calls</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Friday</span>
                    <span className="text-sm">{personalStats.weeklyCalls.friday} calls</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {isAdmin ? "Team exceeded monthly target" : "Exceeded weekly call target"}
                  </p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {isAdmin ? "New conversion record set" : "Converted 3 leads this week"}
                  </p>
                  <p className="text-xs text-muted-foreground">5 days ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {isAdmin ? "Best team performance month" : "Improved conversion rate"}
                  </p>
                  <p className="text-xs text-muted-foreground">1 week ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}