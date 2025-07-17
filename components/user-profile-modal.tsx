"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Phone,
  TrendingUp,
  TrendingDown,
  UserX,
  CalendarIcon,
  Search,
  Target,
  Award,
  AlertTriangle,
} from "lucide-react"
import { format } from "date-fns"

interface UserProfile {
  id: number
  name: string
  email: string
  role: "admin" | "staff"
  status: "active" | "inactive"
  joinDate: string
  lastLogin: string
  assignedContacts: number
  convertedLeads: number
  lostLeads: number
  abandonedContacts: number
  totalCalls: number
  conversionRate: number
}

interface Contact {
  id: number
  name: string
  company: string
  phone: string
  email: string
  status: "actively-contacting" | "abandoned" | "lost" | "rescheduled" | "missed-to-contact" | "converted"
  lastContact: string
  nextAction: string
  assignedDate: string
}

interface UserProfileModalProps {
  user: UserProfile
  isOpen: boolean
  onClose: () => void
}

export function UserProfileModal({ user, isOpen, onClose }: UserProfileModalProps) {
  const [dateRange, setDateRange] = useState("30-days")
  const [contactFilter, setContactFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [customDateFrom, setCustomDateFrom] = useState<Date>()
  const [customDateTo, setCustomDateTo] = useState<Date>()

  // Mock contact data for the user
  const userContacts: Contact[] = [
    {
      id: 1,
      name: "John Anderson",
      company: "Tech Solutions Inc",
      phone: "+1 (555) 123-4567",
      email: "john@techsolutions.com",
      status: "actively-contacting",
      lastContact: "2024-01-20",
      nextAction: "Follow-up call scheduled",
      assignedDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Sarah Williams",
      company: "Marketing Pro",
      phone: "+1 (555) 234-5678",
      email: "sarah@marketingpro.com",
      status: "converted",
      lastContact: "2024-01-19",
      nextAction: "Deal closed",
      assignedDate: "2024-01-10",
    },
    {
      id: 3,
      name: "Mike Johnson",
      company: "StartupXYZ",
      phone: "+1 (555) 345-6789",
      email: "mike@startupxyz.com",
      status: "rescheduled",
      lastContact: "2024-01-18",
      nextAction: "Meeting rescheduled to Jan 25",
      assignedDate: "2024-01-12",
    },
    {
      id: 4,
      name: "Emily Chen",
      company: "Design Studio",
      phone: "+1 (555) 456-7890",
      email: "emily@designstudio.com",
      status: "abandoned",
      lastContact: "2024-01-10",
      nextAction: "No response after 3 attempts",
      assignedDate: "2024-01-08",
    },
    {
      id: 5,
      name: "David Brown",
      company: "Finance Corp",
      phone: "+1 (555) 567-8901",
      email: "david@financecorp.com",
      status: "lost",
      lastContact: "2024-01-17",
      nextAction: "Chose competitor",
      assignedDate: "2024-01-05",
    },
    {
      id: 6,
      name: "Lisa Wilson",
      company: "Retail Plus",
      phone: "+1 (555) 678-9012",
      email: "lisa@retailplus.com",
      status: "missed-to-contact",
      lastContact: "2024-01-15",
      nextAction: "Missed scheduled call",
      assignedDate: "2024-01-14",
    },
  ]

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case "7-days":
        return "Last 7 Days"
      case "30-days":
        return "Last 30 Days"
      case "90-days":
        return "Last 90 Days"
      case "custom":
        return customDateFrom && customDateTo
          ? `${format(customDateFrom, "MMM dd")} - ${format(customDateTo, "MMM dd")}`
          : "Custom Range"
      default:
        return "Last 30 Days"
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "actively-contacting": { color: "bg-blue-100 text-blue-800", label: "Actively Contacting" },
      abandoned: { color: "bg-gray-100 text-gray-800", label: "Abandoned" },
      lost: { color: "bg-red-100 text-red-800", label: "Lost" },
      rescheduled: { color: "bg-yellow-100 text-yellow-800", label: "Rescheduled" },
      "missed-to-contact": { color: "bg-orange-100 text-orange-800", label: "Missed to Contact" },
      converted: { color: "bg-green-100 text-green-800", label: "Converted" },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const filteredContacts = userContacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = contactFilter === "all" || contact.status === contactFilter
    return matchesSearch && matchesFilter
  })

  const getContactStatusCounts = () => {
    return {
      activelyContacting: userContacts.filter((c) => c.status === "actively-contacting").length,
      abandoned: userContacts.filter((c) => c.status === "abandoned").length,
      lost: userContacts.filter((c) => c.status === "lost").length,
      rescheduled: userContacts.filter((c) => c.status === "rescheduled").length,
      missedToContact: userContacts.filter((c) => c.status === "missed-to-contact").length,
      converted: userContacts.filter((c) => c.status === "converted").length,
    }
  }

  const statusCounts = getContactStatusCounts()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserX className="h-5 w-5" />
            <span>{user.name} - Performance Profile</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserX className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className="bg-blue-100 text-blue-800">{user.role}</Badge>
                      <Badge className="bg-green-100 text-green-800">{user.status}</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Member since</p>
                  <p className="font-medium">{user.joinDate}</p>
                  <p className="text-sm text-gray-500 mt-1">Last login: {user.lastLogin}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Performance Metrics
                </span>
                <div className="flex items-center space-x-2">
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7-days">Last 7 Days</SelectItem>
                      <SelectItem value="30-days">Last 30 Days</SelectItem>
                      <SelectItem value="90-days">Last 90 Days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                  {dateRange === "custom" && (
                    <div className="flex items-center space-x-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm">
                            {customDateFrom ? format(customDateFrom, "MMM dd") : "From"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={customDateFrom} onSelect={setCustomDateFrom} />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm">
                            {customDateTo ? format(customDateTo, "MMM dd") : "To"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={customDateTo} onSelect={setCustomDateTo} />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Showing data for: {getDateRangeLabel()}</p>

              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Assigned Contacts</p>
                        <p className="text-2xl font-bold">{user.assignedContacts}</p>
                      </div>
                      <Target className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Converted Leads</p>
                        <p className="text-2xl font-bold text-green-600">{user.convertedLeads}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Lost Leads</p>
                        <p className="text-2xl font-bold text-red-600">{user.lostLeads}</p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Abandoned Contacts</p>
                        <p className="text-2xl font-bold text-gray-600">{user.abandonedContacts}</p>
                      </div>
                      <UserX className="h-8 w-8 text-gray-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Calls</p>
                        <p className="text-xl font-bold">{user.totalCalls}</p>
                      </div>
                      <Phone className="h-6 w-6 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Conversion Rate</p>
                        <p className="text-xl font-bold">{user.conversionRate}%</p>
                      </div>
                      <Award className="h-6 w-6 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg. Calls per Contact</p>
                        <p className="text-xl font-bold">
                          {user.assignedContacts > 0 ? (user.totalCalls / user.assignedContacts).toFixed(1) : "0"}
                        </p>
                      </div>
                      <AlertTriangle className="h-6 w-6 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Contact Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{statusCounts.activelyContacting}</p>
                  <p className="text-sm text-gray-600">Actively Contacting</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{statusCounts.converted}</p>
                  <p className="text-sm text-gray-600">Converted</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{statusCounts.rescheduled}</p>
                  <p className="text-sm text-gray-600">Rescheduled</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{statusCounts.missedToContact}</p>
                  <p className="text-sm text-gray-600">Missed to Contact</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">{statusCounts.abandoned}</p>
                  <p className="text-sm text-gray-600">Abandoned</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{statusCounts.lost}</p>
                  <p className="text-sm text-gray-600">Lost</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Contacts List */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Contacts ({filteredContacts.length})</CardTitle>
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={contactFilter} onValueChange={setContactFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contacts</SelectItem>
                    <SelectItem value="actively-contacting">Actively Contacting</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    <SelectItem value="missed-to-contact">Missed to Contact</SelectItem>
                    <SelectItem value="abandoned">Abandoned</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Next Action</TableHead>
                    <TableHead>Assigned Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{contact.company}</TableCell>
                      <TableCell>{getStatusBadge(contact.status)}</TableCell>
                      <TableCell>{contact.lastContact}</TableCell>
                      <TableCell>
                        <span className="text-sm">{contact.nextAction}</span>
                      </TableCell>
                      <TableCell>{contact.assignedDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
