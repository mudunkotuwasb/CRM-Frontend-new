"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Phone, Target, Users } from "lucide-react"

interface AnalyticsDashboardProps {
  userRole: string
}

export function AnalyticsDashboard({ userRole }: AnalyticsDashboardProps) {
  const isAdmin = userRole === "admin"

  const personalStats = {
    callsToday: 12,
    callsThisWeek: 47,
    callsThisMonth: 189,
    conversionRate: 15.8,
    hotLeads: 8,
    conversions: 3,
  }

  const teamStats = {
    totalCalls: 456,
    totalConversions: 23,
    averageConversionRate: 12.4,
    topPerformer: "Sarah Johnson",
    teamSize: 8,
  }

  return (
    <div className="p-6 space-y-6">
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
                    <span className="text-sm">8 calls</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tuesday</span>
                    <span className="text-sm">12 calls</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Wednesday</span>
                    <span className="text-sm">15 calls</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Thursday</span>
                    <span className="text-sm">9 calls</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Friday</span>
                    <span className="text-sm">11 calls</span>
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
