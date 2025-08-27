"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Phone, Target, Users, Calendar, Clock, Award } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
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
    conversions: 0,
    hotLeads: 0,
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
      const currentUserEmail = localStorage.getItem("userEmail")
      const currentUsername = localStorage.getItem("username")

      // Get current date ranges
      const now = new Date()
      const today = new Date(now.setHours(0, 0, 0, 0))
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
           return contact.uploadedBy === currentUsername || contact.assignedTo === currentUserEmail;
});

      // Calculate counts
      const callsToday = filteredContacts.filter((contact: any) => {
        const uploadDate = new Date(contact.uploadDate)
        return uploadDate >= today;
      }).length

    const callsThisWeek = filteredContacts.filter((contact: any) => {
      const uploadDate = new Date(contact.uploadDate);
      return uploadDate >= startOfWeek;
    }).length;

    const callsThisMonth = filteredContacts.filter((contact: any) => {
      const uploadDate = new Date(contact.uploadDate);
      return uploadDate >= startOfMonth;
    }).length;

    const conversions = filteredContacts.filter((contact: any) => 
      contact.status === "ASSIGNED"
    ).length;

    const conversionRate = callsThisMonth > 0 
      ? Math.round((conversions / callsThisMonth) * 100 * 10) / 10 
      : 0;

      // Calculate weekly calls
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

      // Calculate hot leads (contacts uploaded in last 3 days)
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const hotLeads = filteredContacts.filter((contact: any) => {
        const uploadDate = new Date(contact.uploadDate)
        return uploadDate > threeDaysAgo
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
        const teamCallsThisMonth = contacts.filter((contact: any) => {
        const uploadDate = new Date(contact.uploadDate);
        return uploadDate >= startOfMonth;
      }).length;
      
        const teamConversions = contacts.filter((contact: any) => 
          contact.status === "ASSIGNED"
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

  // Prepare data for charts
  const weeklyCallsData = [
    { day: 'Mon', calls: personalStats.weeklyCalls.monday },
    { day: 'Tue', calls: personalStats.weeklyCalls.tuesday },
    { day: 'Wed', calls: personalStats.weeklyCalls.wednesday },
    { day: 'Thu', calls: personalStats.weeklyCalls.thursday },
    { day: 'Fri', calls: personalStats.weeklyCalls.friday },
  ]

  const performanceData = [
    { name: 'Calls Made', value: personalStats.callsThisMonth, color: '#3b82f6' },
    { name: 'Conversions', value: personalStats.conversions, color: '#10b981' },
    { name: 'Hot Leads', value: personalStats.hotLeads, color: '#f59e0b' },
  ]

  const conversionTrendData = [
    { period: 'Week 1', rate: Math.max(0, personalStats.conversionRate - 3) },
    { period: 'Week 2', rate: Math.max(0, personalStats.conversionRate - 1) },
    { period: 'Week 3', rate: Math.max(0, personalStats.conversionRate + 2) },
    { period: 'Week 4', rate: personalStats.conversionRate },
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  return (
    <div className="p-6 space-y-6">
      {/* Loading and error states */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading analytics...</span>
        </div>
      )}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-700">Error: {error}</div>
          </CardContent>
        </Card>
      )}

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
            <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personalStats.hotLeads}</div>
            <p className="text-xs text-muted-foreground">Last 3 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Calls Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Call Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyCallsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Overview Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {performanceData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Conversion Rate Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={conversionTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">Today's Calls</span>
              <span className="text-lg font-bold text-blue-600">{personalStats.callsToday}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">This Week</span>
              <span className="text-lg font-bold text-green-600">{personalStats.callsThisWeek}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
              <span className="text-sm font-medium">Success Rate</span>
              <span className="text-lg font-bold text-amber-600">{personalStats.conversionRate}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium">Active Leads</span>
              <span className="text-lg font-bold text-purple-600">{personalStats.hotLeads}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights for Admin */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{teamStats.teamSize}</div>
                <div className="text-sm text-gray-600">Team Members</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{teamStats.totalCalls}</div>
                <div className="text-sm text-gray-600">Total Team Calls</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{teamStats.averageConversionRate}%</div>
                <div className="text-sm text-gray-600">Team Avg. Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}