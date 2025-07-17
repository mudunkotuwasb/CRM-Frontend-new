"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { UserProfileModal } from "@/components/user-profile-modal"
import { Search, Plus, Users, Eye, UserCheck, UserX, Copy, RefreshCw } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  role: "admin" | "staff"
  status: "active" | "inactive"
  joinDate: string
  lastLogin: string
  activeWorkTime: string
  isCurrentlyActive: boolean
  assignedContacts: number
  convertedLeads: number
  lostLeads: number
  abandonedContacts: number
  totalCalls: number
  conversionRate: number
  dailyTarget: number
  weeklyTarget: number
  monthlyTarget: number
}

export function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@company.com",
      role: "staff",
      status: "active",
      joinDate: "2024-01-15",
      lastLogin: "2024-01-20",
      activeWorkTime: "2h 45m",
      isCurrentlyActive: true,
      assignedContacts: 156,
      convertedLeads: 23,
      lostLeads: 12,
      abandonedContacts: 8,
      totalCalls: 189,
      conversionRate: 14.7,
      dailyTarget: 200,
      weeklyTarget: 1000,
      monthlyTarget: 4000,
    },
    {
      id: 2,
      name: "Mike Davis",
      email: "mike@company.com",
      role: "staff",
      status: "active",
      joinDate: "2024-01-10",
      lastLogin: "2024-01-20",
      activeWorkTime: "4h 12m",
      isCurrentlyActive: true,
      assignedContacts: 142,
      convertedLeads: 18,
      lostLeads: 15,
      abandonedContacts: 5,
      totalCalls: 167,
      conversionRate: 12.7,
      dailyTarget: 200,
      weeklyTarget: 1000,
      monthlyTarget: 4000,
    },
    {
      id: 3,
      name: "John Smith",
      email: "john@company.com",
      role: "staff",
      status: "active",
      joinDate: "2024-01-08",
      lastLogin: "2024-01-19",
      activeWorkTime: "1h 23m",
      isCurrentlyActive: false,
      assignedContacts: 134,
      convertedLeads: 15,
      lostLeads: 18,
      abandonedContacts: 12,
      totalCalls: 145,
      conversionRate: 11.2,
      dailyTarget: 180,
      weeklyTarget: 900,
      monthlyTarget: 3600,
    },
    {
      id: 4,
      name: "Emily Chen",
      email: "emily@company.com",
      role: "staff",
      status: "inactive",
      joinDate: "2024-01-12",
      lastLogin: "2024-01-18",
      activeWorkTime: "0h 0m",
      isCurrentlyActive: false,
      assignedContacts: 128,
      convertedLeads: 20,
      lostLeads: 10,
      abandonedContacts: 6,
      totalCalls: 156,
      conversionRate: 15.6,
      dailyTarget: 200,
      weeklyTarget: 1000,
      monthlyTarget: 4000,
    },
  ])

  // Add User Form State
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    dailyTarget: 200,
    weeklyTarget: 1000,
    monthlyTarget: 4000,
    password: "",
  })

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeUsers = users.filter((user) => user.status === "active")

  const handleViewProfile = (user: User) => {
    setSelectedUser(user)
    setShowUserProfile(true)
  }

  const handleToggleUserStatus = (userId: number) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "active" ? "inactive" : "active",
              isCurrentlyActive: user.status === "active" ? false : user.isCurrentlyActive,
              activeWorkTime: user.status === "active" ? "0h 0m" : user.activeWorkTime,
            }
          : user,
      ),
    )
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewUser({ ...newUser, password })
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(newUser.password)
    alert("Password copied to clipboard!")
  }

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Please fill in all required fields")
      return
    }

    const user: User = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: "staff",
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
      lastLogin: "Never",
      activeWorkTime: "0h 0m",
      isCurrentlyActive: false,
      assignedContacts: 0,
      convertedLeads: 0,
      lostLeads: 0,
      abandonedContacts: 0,
      totalCalls: 0,
      conversionRate: 0,
      dailyTarget: newUser.dailyTarget,
      weeklyTarget: newUser.weeklyTarget,
      monthlyTarget: newUser.monthlyTarget,
    }

    setUsers([...users, user])
    setNewUser({
      name: "",
      email: "",
      dailyTarget: 200,
      weeklyTarget: 1000,
      monthlyTarget: 4000,
      password: "",
    })
    setShowAddUser(false)
    alert("User added successfully!")
  }

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800">Staff</Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">
        <UserCheck className="mr-1 h-3 w-3" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <UserX className="mr-1 h-3 w-3" />
        Disabled
      </Badge>
    )
  }

  const getActiveStatusIndicator = (isActive: boolean, activeTime: string) => {
    if (isActive) {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-600">Working now</span>
          <span className="text-sm text-gray-500">({activeTime})</span>
        </div>
      )
    } else if (activeTime !== "0h 0m") {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-sm text-gray-600">Last session: {activeTime}</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <span className="text-sm text-gray-400">Not active today</span>
        </div>
      )
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage team members and view their performance • {activeUsers.length} active users
          </p>
        </div>
        <Button onClick={() => setShowAddUser(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Active Users Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Currently Active</p>
                <p className="text-2xl font-bold text-green-600">{users.filter((u) => u.isCurrentlyActive).length}</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Active Users</p>
                <p className="text-2xl font-bold">{activeUsers.length}</p>
              </div>
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Disabled Accounts</p>
                <p className="text-2xl font-bold text-red-600">{users.filter((u) => u.status === "inactive").length}</p>
              </div>
              <UserX className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Team Members ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead>Active Work Time</TableHead>
                <TableHead>Targets (D/W/M)</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {getStatusBadge(user.status)}
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={user.status === "active"}
                          onCheckedChange={() => handleToggleUserStatus(user.id)}
                          size="sm"
                        />
                        <span className="text-xs text-gray-500">{user.status === "active" ? "Disable" : "Enable"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getActiveStatusIndicator(user.isCurrentlyActive, user.activeWorkTime)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Daily: {user.dailyTarget}</div>
                      <div>Weekly: {user.weeklyTarget}</div>
                      <div>Monthly: {user.monthlyTarget}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Contacts:</span>
                        <span className="font-medium">{user.assignedContacts}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Conversion:</span>
                        <span className="font-medium text-green-600">{user.conversionRate}%</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{user.lastLogin}</span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleViewProfile(user)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Add New User
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="daily">Daily Target</Label>
                <Input
                  id="daily"
                  type="number"
                  value={newUser.dailyTarget}
                  onChange={(e) => setNewUser({ ...newUser, dailyTarget: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="weekly">Weekly Target</Label>
                <Input
                  id="weekly"
                  type="number"
                  value={newUser.weeklyTarget}
                  onChange={(e) => setNewUser({ ...newUser, weeklyTarget: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="monthly">Monthly Target</Label>
                <Input
                  id="monthly"
                  type="number"
                  value={newUser.monthlyTarget}
                  onChange={(e) => setNewUser({ ...newUser, monthlyTarget: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Generated Password *</Label>
              <div className="flex space-x-2">
                <Input id="password" value={newUser.password} readOnly className="flex-1" />
                <Button type="button" variant="outline" size="sm" onClick={generatePassword}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={copyPassword} disabled={!newUser.password}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Click generate to create a secure password</p>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button onClick={handleAddUser} className="flex-1">
                Add User
              </Button>
              <Button variant="outline" onClick={() => setShowAddUser(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal user={selectedUser} isOpen={showUserProfile} onClose={() => setShowUserProfile(false)} />
      )}
    </div>
  )
}
