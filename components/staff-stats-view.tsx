"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, Calendar, Clock, Award } from "lucide-react"
import { useEffect, useState } from "react" // Add: Import useState and useEffect
import api from "@/lib/api" // Add: Import API client
import endpoints from "@/lib/endpoints" // Add: Import endpoints
import { toast } from "sonner" // Add: Import toast for error handling

export function StaffStatsView() {
  //State for loading and error handling
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Current performance data
  const [currentStats,setCurrentStats] = useState( {
    contactsToday: 0,
    contactsThisWeek: 0,
    contactsThisMonth: 0,
    callsToday: 0,
    callsThisWeek: 0,
    callsThisMonth: 0,
    conversionsToday: 0,
    conversionsThisWeek: 0,
    conversionsThisMonth: 0,
  })

  // Goals
  const goals = {
    daily: 200,
    weekly: 1000,
    monthly: 4000,
  }


  //Fetch contacts and calculate stats
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true)
        setError(null)

        //Get current date ranges
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

        //Fetch contacts from API
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

        //Calculate counts based on uploadDate
        const contactsToday = contacts.filter((contact: any) => {
          const uploadDate = new Date(contact.uploadDate)
          return uploadDate >= today
        }).length

        const contactsThisWeek = contacts.filter((contact: any) => {
          const uploadDate = new Date(contact.uploadDate)
          return uploadDate >= startOfWeek
        }).length

        const contactsThisMonth = contacts.filter((contact: any) => {
          const uploadDate = new Date(contact.uploadDate)
          return uploadDate >= startOfMonth
        }).length

        setCurrentStats(prev => ({
          ...prev,
          contactsToday,
          contactsThisWeek,
          contactsThisMonth,
        }))
      } catch (err: any) {
        console.error("Error fetching contacts:", err)
        setError(err.message || "Failed to load contact stats")
        toast.error("Failed to load performance data")
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  // Calculate progress percentages
  const dailyProgress = (currentStats.contactsToday / goals.daily) * 100
  const weeklyProgress = (currentStats.contactsThisWeek / goals.weekly) * 100
  const monthlyProgress = (currentStats.contactsThisMonth / goals.monthly) * 100

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500"
    if (progress >= 80) return "bg-blue-500"
    if (progress >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getStatusBadge = (progress: number) => {
    if (progress >= 100) return <Badge className="bg-green-100 text-green-800">Target Achieved</Badge>
    if (progress >= 80) return <Badge className="bg-blue-100 text-blue-800">On Track</Badge>
    if (progress >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Behind Schedule</Badge>
    return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Performance Stats</h1>
          <p className="text-gray-600 mt-1">Track your progress against daily, weekly, and monthly targets</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium">Just now</p>
        </div>
      </div>

      {/* Current Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.contactsToday}</div>
            <p className="text-xs text-muted-foreground">
              {currentStats.callsToday} calls • {currentStats.conversionsToday} conversions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.contactsThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              {currentStats.callsThisWeek} calls • {currentStats.conversionsThisWeek} conversions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.contactsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              {currentStats.callsThisMonth} calls • {currentStats.conversionsThisMonth} conversions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Targets Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Contact Targets & Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Daily Target */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Daily Goal</h3>
                <p className="text-sm text-gray-600">Target: {goals.daily} contacts</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{currentStats.contactsToday}</div>
                {getStatusBadge(dailyProgress)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(dailyProgress)}%</span>
              </div>
              <Progress value={dailyProgress} className="h-3" />
              <p className="text-xs text-gray-500">
                {goals.daily - currentStats.contactsToday > 0
                  ? `${goals.daily - currentStats.contactsToday} contacts remaining`
                  : `Target exceeded by ${currentStats.contactsToday - goals.daily} contacts`}
              </p>
            </div>
          </div>

          {/* Weekly Target */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Weekly Goal</h3>
                <p className="text-sm text-gray-600">Target: {goals.weekly} contacts</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{currentStats.contactsThisWeek}</div>
                {getStatusBadge(weeklyProgress)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(weeklyProgress)}%</span>
              </div>
              <Progress value={weeklyProgress} className="h-3" />
              <p className="text-xs text-gray-500">
                {goals.weekly - currentStats.contactsThisWeek > 0
                  ? `${goals.weekly - currentStats.contactsThisWeek} contacts remaining`
                  : `Target exceeded by ${currentStats.contactsThisWeek - goals.weekly} contacts`}
              </p>
            </div>
          </div>

          {/* Monthly Target */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Monthly Goal</h3>
                <p className="text-sm text-gray-600">Target: {goals.monthly} contacts</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{currentStats.contactsThisMonth}</div>
                {getStatusBadge(monthlyProgress)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(monthlyProgress)}%</span>
              </div>
              <Progress value={monthlyProgress} className="h-3" />
              <p className="text-xs text-gray-500">
                {goals.monthly - currentStats.contactsThisMonth > 0
                  ? `${goals.monthly - currentStats.contactsThisMonth} contacts remaining`
                  : `Target exceeded by ${currentStats.contactsThisMonth - goals.monthly} contacts`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Exceeded daily target</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">5-day streak of meeting targets</p>
                  <p className="text-xs text-muted-foreground">This week</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Best conversion rate this month</p>
                  <p className="text-xs text-muted-foreground">12.2% conversion rate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg. Daily Contacts</span>
                <span className="text-sm font-bold">
                   {Math.round(currentStats.contactsThisWeek / (new Date().getDay() || 7))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conversion Rate</span>
                <span className="text-sm font-bold">12.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Best Day This Week</span>
                <span className="text-sm font-bold">Wednesday (210)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Streak</span>
                <span className="text-sm font-bold">5 days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
