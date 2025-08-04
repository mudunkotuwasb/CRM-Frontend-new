"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, Filter, Users, Eye, Upload, Download } from "lucide-react"
import api from "@/lib/api"
import endpoints from "@/lib/endpoints"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import axios from "axios"
import { ContactPopup } from "@/components/ui/contactpopup"

interface Contact {
  _id: string
  name: string
  company: string
  position: string
  email: string
  phone: string
  uploadedBy:  string
  uploadDate: string | Date
  assignedTo: string
  status: "ASSIGNED" | "UNASSIGNED"
  lastContact: string | Date
  isDeleted: boolean
}

interface AllContactsViewProps {
  userRole: string
}

interface UserData {
  _id: string;
  username: string;
  email: string;
}

export function AllContactsView({ userRole }: AllContactsViewProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [allContacts, setAllContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userDataMap, setUserDataMap] = useState<Record<string, string>>({});   //state to store user data
  
  



//Add useEffect to fetch user data when contacts load
useEffect(() => {
  const fetchUserNames = async () => {
    try {
      const token = localStorage.getItem("token");  // Get current user token from localStorage
      
      if (!token){
        throw new Error("user token missing please logi in again")
      }
      // Get unique user IDs from contacts
      const uniqueUserIds = Array.from(
        new Set(allContacts.map(contact => contact.uploadedBy))
      ).filter(id => id !== 'System');

      // Create a map to store username by ID
      const usernameMap: Record<string, string> = {};

      // current user's data which includes their username
      const currentUserResponse = await api.post(endpoints.auth.login,);

      //get current users data
      if (currentUserResponse.data?.username) {
        uniqueUserIds.forEach(id => {
          usernameMap[id] = currentUserResponse.data.username;
        });
      }
      setUserDataMap(usernameMap);
      
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  if (allContacts.length > 0) {
    fetchUserNames();
  }
}, [allContacts]);







  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await api.get(endpoints.contact.getAllContacts)
        if (!response.data?.allContacts) {
          console.log("No contacts data found in response")
        }

        // Transform data to match our interface
        const transformedContacts = response.data.allContacts.map((contact: any) => ({
          _id: contact._id,
          name: contact.name,
          company: contact.company,
          position: contact.position,
          email: contact.email || 'No email',
          phone: contact.phone || 'No phone',
          uploadedBy: contact.uploadedBy?.toString() || 'System',
          uploadDate: contact.uploadDate,
          assignedTo: contact.assignedTo || "Unassigned",
          status: contact.status || "UNASSIGNED",
          lastContact: contact.lastContact || new Date(0),
          isDeleted: contact.isDeleted || false
        }))

        setAllContacts(transformedContacts)
      } catch (error) {
        console.error("Failed to fetch contacts:", error)
        setError("Failed to load contacts. Please try again.")
        
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            toast.error("Session expired. Please login again.")
            router.push("/auth/login")
          } else if (error.response?.status === 403) {
            toast.error("You don't have permission to view contacts")
          }
        }
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [router])

  const displayContacts = allContacts.filter(contact => !contact.isDeleted)
  const unassignedContacts = displayContacts.filter(contact => contact.status === "UNASSIGNED")

  const filteredContacts = displayContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectContact = (contactId: string, checked: boolean) => {
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
      const unassignedIds = unassignedContacts
        .slice(0, 100)
        .map((contact) => contact._id)
      setSelectedContacts(unassignedIds)
    } else {
      setSelectedContacts([])
    }
  }

  const handleAssignToMe = async () => {
    try {
      const userId = localStorage.getItem("user_id") || localStorage.getItem("userId")
      const userName = localStorage.getItem("userName") || "Current User"
      
      if (!userId) {
        throw new Error("User ID not found. Please login again.")
      }

      const response = await api.post(endpoints.contact.assignContacts, {
        contactIds: selectedContacts,
        assignedTo: userId
      })

      if (response.data?.success) {
        setAllContacts(prevContacts =>
          prevContacts.map(contact =>
            selectedContacts.includes(contact._id)
              ? { 
                  ...contact, 
                  assignedTo: userName, 
                  status: "ASSIGNED" 
                }
              : contact
          )
        )
        setSelectedContacts([])
        toast.success(`${selectedContacts.length} contacts assigned successfully!`)
      } else {
        throw new Error(response.data?.message || "Failed to assign contacts")
      }
    } catch (error) {
      console.error("Assignment error:", error)
      toast.error("Failed to assign contacts. Please try again.")
    }
  }

  const getStatusBadge = (contact: Contact) => {
    return contact.status === "UNASSIGNED" 
      ? <Badge variant="secondary" className="bg-blue-50 text-blue-600">Unassigned</Badge>
      : <Badge variant="secondary" className="bg-green-50 text-green-600">Assigned</Badge>
  }

  const formatDate = (date: string | Date) => {
    if (!date) return "Never"
    const dateObj = new Date(date)
    return isNaN(dateObj.getTime()) 
      ? "Never" 
      : dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

//using localStorage
const getUploaderName = (contact: Contact) => {
  if (contact.uploadedBy === 'System') return 'System';
    const currentUserId = localStorage.getItem("user_id")// Get current user ID from localStorage
  
  // If this contact was uploaded by the current user
  if (contact.uploadedBy === currentUserId) {
    return localStorage.getItem("username");
  }
  return "Not your coontact";
};

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <p className="text-gray-500">Loading contacts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    )
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
          <ContactPopup>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
          </ContactPopup>
        </div>
      </div>

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

      {userRole !== "admin" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">{selectedContacts.length} of 100 contacts selected</p>
              <div className="text-sm text-gray-500">
                {unassignedContacts.length} unassigned contacts available
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Contacts ({filteredContacts.length})
            {userRole === "admin" && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({unassignedContacts.length} unassigned)
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
                    <Checkbox 
                      checked={selectedContacts.length > 0 && selectedContacts.length === unassignedContacts.slice(0, 100).length}
                      onCheckedChange={handleSelectAll}
                    />
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
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <TableRow key={contact._id}>
                    {userRole !== "admin" && (
                      <TableCell>
                        <Checkbox
                          checked={selectedContacts.includes(contact._id)}
                          onCheckedChange={(checked) => handleSelectContact(contact._id, checked as boolean)}
                          disabled={
                            contact.status === "ASSIGNED" ||
                            (selectedContacts.length >= 100 && !selectedContacts.includes(contact._id))
                          }
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.position}</p>
                      </div>
                    </TableCell>
                    <TableCell>{contact.company}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{contact.phone}</div>
                        <div className="text-sm text-muted-foreground">{contact.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getUploaderName(contact)}</TableCell>
                    <TableCell>{formatDate(contact.uploadDate)}</TableCell>
                    {userRole === "admin" && (
                      <TableCell>
                        {contact.assignedTo !== "Unassigned" ? (
                          <span className="text-sm">{contact.assignedTo}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>{getStatusBadge(contact)}</TableCell>
                    <TableCell>
                      {contact.lastContact && new Date(contact.lastContact).getTime() > 0 ? (
                        <span className="text-sm">{formatDate(contact.lastContact)}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={userRole === "admin" ? 9 : 10} className="h-24 text-center">
                    No contacts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}