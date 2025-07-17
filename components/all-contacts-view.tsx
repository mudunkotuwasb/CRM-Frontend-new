"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { ContactDetailsModal } from "@/components/contact-details-modal"
import { Search, Plus, Filter, Users, Eye, Upload, Download } from "lucide-react"

interface Contact {
  id: number
  name: string
  company: string
  role: string
  phone: string
  email: string
  uploadedBy: string
  uploadedDate: string
  assignedTo: string | null
  status: "unassigned" | "assigned"
  lastContactDate?: string
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

interface AllContactsViewProps {
  userRole: string
}

export function AllContactsView({ userRole }: AllContactsViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<number[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Mock data - in real app this would come from API
  const [allContacts, setAllContacts] = useState<Contact[]>([
    {
      id: 1,
      name: "John Anderson",
      company: "Tech Solutions Inc",
      role: "CTO",
      phone: "+1 (555) 123-4567",
      email: "john@techsolutions.com",
      uploadedBy: "Admin User",
      uploadedDate: "2024-01-10",
      assignedTo: userRole === "admin" ? "Sarah Johnson" : null,
      status: userRole === "admin" ? "assigned" : "unassigned",
      lastContactDate: "2024-01-15",
      contactHistory: [
        {
          id: 1,
          date: "2024-01-15",
          contactedBy: "Sarah Johnson",
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
      uploadedBy: "Mike Davis",
      uploadedDate: "2024-01-12",
      assignedTo: null,
      status: "unassigned",
      contactHistory: [],
    },
    {
      id: 3,
      name: "Mike Johnson",
      company: "StartupXYZ",
      role: "Founder",
      phone: "+1 (555) 345-6789",
      email: "mike@startupxyz.com",
      uploadedBy: "Admin User",
      uploadedDate: "2024-01-13",
      assignedTo: null,
      status: "unassigned",
      contactHistory: [],
    },
    {
      id: 4,
      name: "Emily Chen",
      company: "Design Studio",
      role: "Creative Director",
      phone: "+1 (555) 456-7890",
      email: "emily@designstudio.com",
      uploadedBy: "John Smith",
      uploadedDate: "2024-01-14",
      assignedTo: null,
      status: "unassigned",
      contactHistory: [],
    },
    {
      id: 5,
      name: "David Brown",
      company: "Finance Corp",
      role: "CFO",
      phone: "+1 (555) 567-8901",
      email: "david@financecorp.com",
      uploadedBy: "Sarah Johnson",
      uploadedDate: "2024-01-15",
      assignedTo: null,
      status: "unassigned",
      contactHistory: [],
    },
  ])

  // Filter contacts based on user role
  const displayContacts =
    userRole === "admin" ? allContacts : allContacts.filter((contact) => contact.status === "unassigned")

  const filteredContacts = displayContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelectContact = (contactId: number, checked: boolean) => {
    if (checked) {
      if (selectedContacts.length < 100) {
        setSelectedContacts([...selectedContacts, contactId])
      }
    } else {
      setSelectedContacts(selectedContacts.filter((id) => id !== contactId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const unassignedIds = filteredContacts
        .filter((contact) => contact.status === "unassigned")
        .slice(0, 100)
        .map((contact) => contact.id)
      setSelectedContacts(unassignedIds)
    } else {
      setSelectedContacts([])
    }
  }

  const handleAssignToMe = () => {
    const currentUser = localStorage.getItem("userEmail") || "Current User"

    setAllContacts((prevContacts) =>
      prevContacts.map((contact) =>
        selectedContacts.includes(contact.id)
          ? { ...contact, assignedTo: currentUser, status: "assigned" as const }
          : contact,
      ),
    )

    setSelectedContacts([])
    alert(`${selectedContacts.length} contacts assigned to you successfully!`)
  }

  const handleViewDetails = (contact: Contact) => {
    setSelectedContact(contact)
    setShowDetailsModal(true)
  }

  const getStatusBadge = (contact: Contact) => {
    if (contact.status === "unassigned") {
      return <Badge className="bg-blue-100 text-blue-800">Unassigned</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Assigned</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Contacts</h1>
          <p className="text-gray-600 mt-1">
            {userRole === "admin"
              ? "View all contacts and their assignments"
              : "Select up to 100 unassigned contacts to add to your list"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Contacts
          </Button>
          {userRole === "admin" && (
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
          {userRole !== "admin" && selectedContacts.length > 0 && (
            <Button onClick={handleAssignToMe}>
              <Users className="mr-2 h-4 w-4" />
              Assign {selectedContacts.length} to Me
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

      {/* Selection Summary */}
      {userRole !== "admin" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">{selectedContacts.length} of 100 contacts selected</p>
              <div className="text-sm text-gray-500">
                {filteredContacts.filter((c) => c.status === "unassigned").length} unassigned contacts available
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Contacts ({filteredContacts.length})
            {userRole === "admin" && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({allContacts.filter((c) => c.status === "unassigned").length} unassigned)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {userRole !== "admin" && (
                  <TableHead className="w-[50px]">
                    <Checkbox checked={selectedContacts.length > 0} onCheckedChange={handleSelectAll} />
                  </TableHead>
                )}
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Upload Date</TableHead>
                {userRole === "admin" && <TableHead>Assigned To</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  {userRole !== "admin" && (
                    <TableCell>
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) => handleSelectContact(contact.id, checked as boolean)}
                        disabled={
                          contact.status === "assigned" ||
                          (selectedContacts.length >= 100 && !selectedContacts.includes(contact.id))
                        }
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.role}</p>
                    </div>
                  </TableCell>
                  <TableCell>{contact.company}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{contact.phone}</div>
                      <div className="text-sm text-muted-foreground">{contact.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{contact.uploadedBy}</TableCell>
                  <TableCell>{contact.uploadedDate}</TableCell>
                  {userRole === "admin" && (
                    <TableCell>
                      {contact.assignedTo ? (
                        <span className="text-sm">{contact.assignedTo}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell>{getStatusBadge(contact)}</TableCell>
                  <TableCell>
                    {contact.lastContactDate ? (
                      <span className="text-sm">{contact.lastContactDate}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(contact)}>
                      <Eye className="h-4 w-4" />
                    </Button>
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
            setAllContacts((prevContacts) =>
              prevContacts.map((contact) => (contact.id === updatedContact.id ? updatedContact : contact)),
            )
            setSelectedContact(updatedContact)
          }}
        />
      )}
    </div>
  )
}
