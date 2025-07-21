"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, TrendingUp, Target, Plus, HelpCircle } from "lucide-react"
import { ContactPopup } from "@/components/ui/contactpopup"

export function StaffDashboard() {
  const stats = {
    callsToday: 12,
    callsThisWeek: 47,
    callsThisMonth: 189,
    hotLeads: 8,
    conversionsThisMonth: 3,
    assignedContacts: 156,
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <HelpCircle className="mr-2 h-4 w-4" />
            Request Help
          </Button>
          <ContactPopup />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls Made</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.callsToday}</div>
            <p className="text-xs text-muted-foreground">
              Today • {stats.callsThisWeek} this week • {stats.callsThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hotLeads}</div>
            <p className="text-xs text-muted-foreground">Ready for follow-up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionsThisMonth}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col">
              <Phone className="h-6 w-6 mb-2" />
              Log Call
            </Button>
            <Button variant="outline" className="h-20 flex flex-col bg-transparent">
              <Plus className="h-6 w-6 mb-2" />
              Add Contact
            </Button>
            <Button variant="outline" className="h-20 flex flex-col bg-transparent">
              <TrendingUp className="h-6 w-6 mb-2" />
              Request Leads
            </Button>
            <Button variant="outline" className="h-20 flex flex-col bg-transparent">
              <HelpCircle className="h-6 w-6 mb-2" />
              Get Help
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">John Anderson</p>
                  <p className="text-xs text-muted-foreground">Tech Solutions Inc • Hot Lead</p>
                </div>
                <Button size="sm">Call</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sarah Williams</p>
                  <p className="text-xs text-muted-foreground">Marketing Pro • Follow-up</p>
                </div>
                <Button size="sm" variant="outline">
                  Email
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Mike Johnson</p>
                  <p className="text-xs text-muted-foreground">StartupXYZ • New Contact</p>
                </div>
                <Button size="sm">Call</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Follow-up call with John A.</p>
                  <p className="text-xs text-muted-foreground">10:00 AM</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Demo call with Sarah W.</p>
                  <p className="text-xs text-muted-foreground">2:00 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Team sync meeting</p>
                  <p className="text-xs text-muted-foreground">4:00 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
