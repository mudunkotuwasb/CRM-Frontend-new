"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Target, TrendingUp, Award, AlertTriangle } from "lucide-react"

export function AdminStatsView() {
  // Team performance data
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@company.com",
      dailyTarget: 200,
      weeklyTarget: 1000,
      monthlyTarget: 4000,
      dailyProgress: 185,
      weeklyProgress: 920,
      monthlyProgress: 3650,
      conversionRate: 15.2,
      status: "active",
    },
    {
      id: 2,
      name: "Mike Davis",
      email: "mike@company.com",
      dailyTarget: 200,
      weeklyTarget: 1000,
      monthlyTarget: 4000,
      dailyProgress: 210,
      weeklyProgress: 1050,
      monthlyProgress: 4200,
      conversionRate: 12.8,
      status: "active",
    },
    {
      id: 3,
      name: "John Smith",
      email: "john@company.com",
      dailyTarget: 200,
      weeklyTarget: 1000,
      monthlyTarget: 4000,
      dailyProgress: 145,
      weeklyProgress: 780,
      monthlyProgress: 3100,
      conversionRate: 10.5,
      status: "active",
    },
    {
      id: 4,
      name: "Emily Chen",
      email: "emily@company.com",
      dailyTarget: 200,
      weeklyTarget: 1000,
      monthlyTarget: 4000,
      dailyProgress: 195,
      weeklyProgress: 975,
      monthlyProgress: 3890,
      conversionRate: 14.1,
      status: "active",
    },
  ]

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage >= 100) return "text-green-600"
    if (percentage >= 80) return "text-blue-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusBadge = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage >= 100) return <Badge className="bg-green-100 text-green-800">Achieved</Badge>
    if (percentage >= 80) return <Badge className="bg-blue-100 text-blue-800">On Track</Badge>
    if (percentage >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Behind</Badge>
    return <Badge className="bg-red-100 text-red-800">At Risk</Badge>
  }

  // Calculate team totals
  const teamTotals = teamMembers.reduce(
    (acc, member) => ({
      dailyProgress: acc.dailyProgress + member.dailyProgress,
      weeklyProgress: acc.weeklyProgress + member.weeklyProgress,
      monthlyProgress: acc.monthlyProgress + member.monthlyProgress,
      dailyTarget: acc.dailyTarget + member.dailyTarget,
      weeklyTarget: acc.weeklyTarget + member.weeklyTarget,
      monthlyTarget: acc.monthlyTarget + member.monthlyTarget,
    }),
    { dailyProgress: 0, weeklyProgress: 0, monthlyProgress: 0, dailyTarget: 0, weeklyTarget: 0, monthlyTarget: 0 },
  )

  const avgConversionRate = teamMembers.reduce((acc, member) => acc + member.conversionRate, 0) / teamMembers.length

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Performance Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time view of all team members' progress against targets</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Team Size</p>
          <p className="text-2xl font-bold">{teamMembers.length}</p>
        </div>
      </div>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Team Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamTotals.dailyProgress}</div>
            <p className="text-xs text-muted-foreground">Target: {teamTotals.dailyTarget}</p>
            <Progress value={(teamTotals.dailyProgress / teamTotals.dailyTarget) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Team Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamTotals.weeklyProgress}</div>
            <p className="text-xs text-muted-foreground">Target: {teamTotals.weeklyTarget}</p>
            <Progress value={(teamTotals.weeklyProgress / teamTotals.weeklyTarget) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Team Progress</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamTotals.monthlyProgress}</div>
            <p className="text-xs text-muted-foreground">Target: {teamTotals.monthlyTarget}</p>
            <Progress value={(teamTotals.monthlyProgress / teamTotals.monthlyTarget) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Team average</p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Individual Performance Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Member</TableHead>
                <TableHead>Daily Progress</TableHead>
                <TableHead>Weekly Progress</TableHead>
                <TableHead>Monthly Progress</TableHead>
                <TableHead>Conversion Rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${getProgressColor(member.dailyProgress, member.dailyTarget)}`}>
                          {member.dailyProgress}
                        </span>
                        <span className="text-sm text-muted-foreground">/ {member.dailyTarget}</span>
                      </div>
                      <Progress value={(member.dailyProgress / member.dailyTarget) * 100} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${getProgressColor(member.weeklyProgress, member.weeklyTarget)}`}>
                          {member.weeklyProgress}
                        </span>
                        <span className="text-sm text-muted-foreground">/ {member.weeklyTarget}</span>
                      </div>
                      <Progress value={(member.weeklyProgress / member.weeklyTarget) * 100} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-medium ${getProgressColor(member.monthlyProgress, member.monthlyTarget)}`}
                        >
                          {member.monthlyProgress}
                        </span>
                        <span className="text-sm text-muted-foreground">/ {member.monthlyTarget}</span>
                      </div>
                      <Progress value={(member.monthlyProgress / member.monthlyTarget) * 100} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{member.conversionRate}%</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(member.monthlyProgress, member.monthlyTarget)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
              Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">John Smith - Behind monthly target</p>
                  <p className="text-xs text-muted-foreground">77.5% of monthly goal achieved</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">John Smith - Below daily target</p>
                  <p className="text-xs text-muted-foreground">72.5% of daily goal achieved</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-green-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Mike Davis - Exceeded monthly target</p>
                  <p className="text-xs text-muted-foreground">105% of monthly goal achieved</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Sarah Johnson - Highest conversion rate</p>
                  <p className="text-xs text-muted-foreground">15.2% conversion rate</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Emily Chen - Consistent performer</p>
                  <p className="text-xs text-muted-foreground">97.3% of monthly goal achieved</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
