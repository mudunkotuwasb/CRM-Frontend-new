"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ContactDetailsModal } from "@/components/contact-details-modal"
import { QuickActionModal } from "@/components/quick-action-modal"
import {
  Search,
  Plus,
  Download,
  Upload,
  MoreHorizontal,
  Phone,
  Mail,
  Filter,
  MessageSquare,
  Calendar,
  Zap,
} from "lucide-react"

interface Contact {
  id: number
  name: string
  company: string
  role: string
  phone: string
  email: string
  status: string
  lastContact: string
  assignedTo: string
  uploadedBy: string
  uploadedDate: string
  contactHistory: ContactHistory[]
}

interface ContactHistory {
  id: number
  date: string
  contactedBy: string
  notes: string
  outcome: string
  nextAction?: string
  scheduledDate?: string
}

interface ContactsTableProps {
  userRole: string
}

export function ContactsTable({ userRole }: ContactsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showQuickAction, setShowQuickAction] = useState(false)

  const contacts: Contact[] = [
    {
      id: 1,
      name: "John Anderson",
      company: "Tech Solutions Inc",
      role: "CTO",
      phone: "+1 (555) 123-4567",
      email: "john@techsolutions.com",
      status: "Hot Lead",
      lastContact: "2024-01-15",
      assignedTo: "Current User",
      uploadedBy: "Admin User",
      uploadedDate: "2024-01-10",
      contactHistory: [
        {
          id: 1,
          date: "2024-01-15",
          contactedBy: "Current User",
          notes: "Initial contact made, showed interest in our product",
          outcome: "interested",
          nextAction: "Send proposal",
        },
      ],
    },
    {
      id: 2,
      name: "Sarah Williams",
      company: "Marketing Pro",
      role: "Marketing Director",
      phone: "+1 (555) 234-5678",
      email: "sarah@marketingpro.com",
      status: "Follow-up",
      lastContact: "2024-01-14",
      assignedTo: "Current User",
      uploadedBy: "Mike Davis",
      uploadedDate: "2024-01-12",
      contactHistory: [],
    },
    {
      id: 3,
      name: "Mike Johnson",
      company: "StartupXYZ",
      role: "Founder",
      phone: "+1 (555) 345-6789",
      email: "mike@startupxyz.com",
      status: "New",
      lastContact: "2024-01-13",
      assignedTo: "Current User",
      uploadedBy: "Admin User",
      uploadedDate: "2024-01-13",
      contactHistory: [],
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hot Lead":
        return "bg-red-100 text-red-800"
      case "Follow-up":
        return "bg-yellow-100 text-yellow-800"
      case "New":
        return "bg-blue-100 text-blue-800"
      case "Converted":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleQuickAction = (contact: Contact, action: string) => {
    setSelectedContact(contact)
    setShowQuickAction(true)
  }

  const handleViewDetails = (contact: Contact) => {
    setSelectedContact(contact)
    setShowDetailsModal(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Contacts</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          {userRole === "admin" && (
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
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
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Quick Actions</h3>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Bulk Follow-up
              </Button>
              <Button size="sm" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Calls
              </Button>
              <Button size="sm" variant="outline">
                <Zap className="mr-2 h-4 w-4" />
                Quick Update
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contacts ({contacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead>Quick Actions</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.role}</p>
                    </div>
                  </TableCell>
                  <TableCell>{contact.company}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-3 w-3" />
                        {contact.phone}
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-3 w-3" />
                        {contact.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(contact.status)}>{contact.status}</Badge>
                  </TableCell>
                  <TableCell>{contact.lastContact}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAction(contact, "call")}
                        className="h-8 px-2"
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAction(contact, "follow-up")}
                        className="h-8 px-2"
                      >
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAction(contact, "schedule")}
                        className="h-8 px-2"
                      >
                        <Calendar className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(contact)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Contact</DropdownMenuItem>
                        <DropdownMenuItem>Add Note</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Hot Lead</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Contact Details Modal */}
      {selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          userRole={userRole}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onUpdateContact={(updatedContact) => {
            // Update contact in the list
            setSelectedContact(updatedContact)
          }}
        />
      )}

      {/* Quick Action Modal */}
      {selectedContact && (
        <QuickActionModal
          contact={selectedContact}
          isOpen={showQuickAction}
          onClose={() => setShowQuickAction(false)}
          onUpdateContact={(updatedContact) => {
            // Update contact in the list
            setSelectedContact(updatedContact)
          }}
        />
      )}
    </div>
  )
}
