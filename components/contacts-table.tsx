"use client"

import { useState,useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import api from "@/lib/api";
import endpoints from "@/lib/endpoints";
import { toast } from "sonner";
import { ContactPopup } from "@/components/ui/contactpopup"

interface Contact {
  _id: string
  name: string
  company: string
  position: string
  phone: string
  email: string
  status: string
  lastContact: string | Date
  assignedTo: string
  uploadedBy: string
  uploadDate: string | Date
  contactHistory?: ContactHistory[];
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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openEditPopup, setOpenEditPopup] = useState(false);
  const [refreshContacts, setRefreshContacts] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [viewMode, setViewMode] = useState(false);

  useEffect(() => {
    const getContactsByEmail = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token"); //check token
        if (!token) {
          console.log("Authentication error - please login again");
          throw new Error("Authentication token missing");
        }

        const userEmail = localStorage.getItem("userEmail"); //check email
        if (!userEmail) {
          console.log("User Email is missing - please login again");
          throw new Error("User Email missing");
        }

        const response = await api.post(endpoints.contact.getContactsByEmail, {
          email: userEmail,
        }); //endpoint call

        if (!response.data) {
          console.log("No data received from CRM backend");
        }

        // Handle no contacts are found in your email
    if (!response.data.success || !response.data.contacts) {
      toast.info("No contacts found for your email");
      setContacts([]);
      setFilteredContacts([]);
      return;
    }

        const contactsData = response.data.contacts;

        // Transform each contact in the array
        const transformedContacts = contactsData.map((contact: any) => ({
          _id: contact._id,
          name: contact.name || "no name",
          company: contact.company || "no Company",
          position: contact.position || "",
          email: contact.email || userEmail,
          phone: contact.phone || "",
          status: contact.status === "ASSIGNED" ? "Assigned" : "Unassigned",
          lastContact: contact.lastContact? new Date(contact.lastContact): new Date(0),
          assignedTo: contact.assignedTo || "Unassigned",
          uploadedBy: contact.uploadedBy || "System",
          uploadDate: contact.uploadDate? new Date(contact.uploadDate): new Date(),
          contactHistory: contact.contactHistory || [],
        }));

        // Set the transformed all contacts in array
        setContacts(transformedContacts);
        setFilteredContacts(transformedContacts);
      } catch (error: any) {
        console.error("Fetch error:", error);
        const errorMessage =error.response?.data?.message ||error.message ||"Failed to load contacts";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    getContactsByEmail();
  }, []);

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
    setViewMode(true); // Set view mode to true
    setOpenEditPopup(true);
  }

  const formatDate = (date: string | Date) => {
    if (!date) return "Never";
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime())
      ? "Never"
      : dateObj.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };



    // Add: Filter contacts based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  }, [searchTerm, contacts]);




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
          <ContactPopup>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </ContactPopup>
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
          <CardTitle>Contacts ({filteredContacts.length})</CardTitle>
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
              {filteredContacts.map((contact) => (
                <TableRow key={contact._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {contact.position}
                      </p>
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
                    <Badge className={getStatusColor(contact.status)}>
                      {contact.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(contact.uploadDate)}</TableCell>
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
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(contact)}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem  onClick={() => { setSelectedContact(contact);setOpenEditPopup(true);}}>
                          Edit Contact
                        </DropdownMenuItem>
                        <DropdownMenuItem>Add Note</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Hot Lead</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {selectedContact && (
            <ContactPopup
              open={openEditPopup}
              onOpenChange={(open) => {
                setOpenEditPopup(open);
                if (!open) {
                  setRefreshContacts((prev) => !prev); // Refresh contacts when popup closes
                  setViewMode(false);
                }
              }}
              contact={selectedContact}
              viewMode={viewMode}
            >
              <Button className="hidden">Edit Contact Trigger</Button>
            </ContactPopup>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
