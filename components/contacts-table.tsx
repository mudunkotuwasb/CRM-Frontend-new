"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  Trash2,
  Eye,
  Edit,
  StickyNote,
  FileSpreadsheet,
  X,
} from "lucide-react"
import api from "@/lib/api";
import endpoints from "@/lib/endpoints";
import { toast } from "sonner";
import { ContactPopup } from "@/components/ui/contactpopup"
import { NotePopup } from "@/components/ui/note-popup"
import { ScheduleCallPopup } from "@/components/ui/schedule-call-popup"

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

interface CSVContact {
  name: string
  company: string
  position: string
  email: string
  phone: string
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
  const [filterBy, setFilterBy] = useState<'name' | 'company' | 'email'>('name');

  // CSV Import states
  const [csvImportOpen, setCsvImportOpen] = useState(false)
  const [csvData, setCsvData] = useState<CSVContact[]>([])
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvLoading, setCsvLoading] = useState(false)
  const [csvPreview, setCsvPreview] = useState<CSVContact[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const getContactsById = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token"); //check token
        if (!token) {
          console.log("Authentication error - please login again");
          throw new Error("Authentication token missing");
        }

        const userId = localStorage.getItem("userId"); //get user ID from login
        if (!userId) {
          console.log("User ID is missing - please login again");
          throw new Error("User ID missing");
        }

        console.log("Fetching contacts for user ID:", userId);
        console.log("Request payload:", { adminId: userId });

        const response = await api.post(endpoints.contact.getContactsByAdminId, {
          adminId: userId, // Send user ID as adminId to match backend expectation
        }); //endpoint call

        console.log("API Response:", response.data);

        if (!response.data) {
          console.log("No data received from CRM backend");
          return;
        }

        // Handle no contacts are found for your user ID
        if (!response.data.contacts || response.data.contacts.length === 0) {
          toast.info("No contacts found for your account");
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
          email: contact.email || "",
          phone: contact.phone || "",
          status: mapStatusToDisplay(contact.status),
          lastContact: contact.lastContact ? new Date(contact.lastContact) : new Date(0),
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

    getContactsById(); // Changed function name
  }, []);

  const handleDeleteContact = async (contact: Contact) => {
    if (!window.confirm(`Are you sure you want to delete ${contact.name} from ${contact.company}? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log(`Deleting contact with ID: ${contact._id}`);
      
      const response = await api.delete(endpoints.contact.deleteContact(contact._id), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        toast.success("Contact deleted successfully");
        // Remove the contact from the local state instead of refreshing
        setContacts(prev => prev.filter(c => c._id !== contact._id));
        setFilteredContacts(prev => prev.filter(c => c._id !== contact._id));
      } else {
        throw new Error(response.data.message || "Failed to delete contact");
      }
    } catch (error: any) {
      console.error("Delete error details:", error);
      
      // More detailed error logging
      if (error.response) {
        console.error("Server response:", error.response.data);
        console.error("Status code:", error.response.status);
        console.error("Error message:", error.response.data?.message);
        console.error("Error details:", error.response.data?.error);
      }
      
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 
                           "Failed to delete contact";
      
      toast.error(`Delete failed: ${errorMessage}`);
    }
  }

  // Helper function to map backend status values to display values
  const mapStatusToDisplay = (status: string): string => {
    switch (status) {
      case "UNASSIGNED":
        return "Unassigned";
      case "ASSIGNED":
        return "Assigned";
      case "IN_PROGRESS":
        return "In Progress";
      case "COMPLETED":
        return "Completed";
      case "PENDING":
        return "Pending";
      case "REJECTED":
        return "Rejected";
      default:
        return status; // Return as-is if not recognized
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Assigned":
        return "bg-green-100 text-green-800"
      case "Unassigned":
        return "bg-blue-100 text-blue-800"
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

  const filterContacts = (type: 'name' | 'company' | 'email') => {
    setFilterBy(type);
    if (searchTerm.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact[type].toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  };

  // Add: Filter contacts based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
      contact[filterBy].toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  }, [searchTerm, contacts, filterBy]);

  // CSV Import Functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error("Please select a CSV file")
      return
    }

    setCsvFile(file)
    parseCsvFile(file)
  }

  const parseCsvFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error("CSV parsing errors:", results.errors)
          toast.error("Error parsing CSV file")
          return
        }

        const parsedData = results.data as any[]
        const validContacts: CSVContact[] = []
        const skippedRows: string[] = []

        parsedData.forEach((row, index) => {
          const contact: CSVContact = {
            name: String(row.name || row.Name || '').trim(),
            company: String(row.company || row.Company || '').trim(),
            position: String(row.position || row.Position || row.title || row.Title || '').trim(),
            email: String(row.email || row.Email || '').trim().toLowerCase(),
            phone: String(row.phone || row.Phone || row.mobile || row.Mobile || '').trim()
          }

          if (!contact.name) {
            skippedRows.push(`Row ${index + 2}: Missing name field`)
            return
          }

          if (contact.email && !contact.email.includes('@')) {
            console.warn(`Row ${index + 2}: Invalid email format, clearing email`)
            contact.email = ''
          }

          validContacts.push(contact)
        })

        if (validContacts.length === 0) {
          toast.error("No valid contacts found in CSV file")
          if (skippedRows.length > 0) {
            console.log("Skipped rows:", skippedRows)
          }
          return
        }

        setCsvData(validContacts)
        setCsvPreview(validContacts.slice(0, 5))
        
        let message = `${validContacts.length} contacts parsed successfully`
        if (skippedRows.length > 0) {
          message += ` (${skippedRows.length} rows skipped)`
          console.log("Skipped rows:", skippedRows)
        }
        
        toast.success(message)
      },
      error: (error: any) => {
        console.error("CSV parsing error:", error)
        toast.error("Failed to parse CSV file")
      }
    })
  }

  const handleCsvImport = async () => {
    if (csvData.length === 0) {
      toast.error("No data to import")
      return
    }

    setCsvLoading(true)
    try {
      const userId = localStorage.getItem("user_id") || localStorage.getItem("userId")

      if (!userId) {
        throw new Error("User ID not found. Please login again.")
      }

      // Use the flat structure that worked in debugging
      const contactsToImport = csvData.map(contact => ({
        name: contact.name,
        company: contact.company || "Default Company",
        position: contact.position || "Default Position", 
        email: contact.email || "default@example.com",
        phone: contact.phone || "000-000-0000",
        uploadedBy: userId,
        uploadDate: new Date().toISOString(),
        assignedTo: userId,
        status: "UNASSIGNED",
        lastContact: new Date().toISOString()
      }))

      let successCount = 0
      let failedCount = 0
      const errors: string[] = []

      for (let i = 0; i < contactsToImport.length; i++) {
        try {
          const contact = contactsToImport[i]
          
          if (!contact.name || contact.name.trim() === '') {
            failedCount++
            errors.push(`Contact ${i + 1}: Name is required`)
            continue
          }

          console.log(`Importing contact ${i + 1}: ${contact.name}`)
          
          const response = await api.post(endpoints.contact.addContact, contact)
          
          if (response.data?.success || response.status === 200 || response.status === 201) {
            successCount++
            console.log(`✓ Contact ${i + 1} (${contact.name}) imported successfully`)
          } else {
            failedCount++
            console.log(`✗ Contact ${i + 1} failed:`, response.data)
            errors.push(`Contact ${i + 1} (${contact.name}): ${response.data?.message || 'Unknown error'}`)
          }
        } catch (error) {
          failedCount++
          console.error(`✗ Contact ${i + 1} error:`, error)
          
          if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error || 
                               error.response?.statusText || 
                               'Unknown server error'
            
            errors.push(`Contact ${i + 1} (${contactsToImport[i].name}): ${errorMessage}`)
          } else {
            errors.push(`Contact ${i + 1} (${contactsToImport[i].name}): ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      // Show results
      if (successCount > 0) {
        toast.success(`${successCount} contacts imported successfully!`)
      }
      
      if (failedCount > 0) {
        toast.error(`${failedCount} contacts failed to import`)
        console.error("Import errors:", errors)
      }

      // Refresh contacts list if any were successful
      if (successCount > 0) {
        const userId = localStorage.getItem("userId")
        const refreshResponse = await api.post(endpoints.contact.getContactsByAdminId, {
          adminId: userId,
        })
        
        if (refreshResponse.data?.contacts) {
          const transformedContacts = refreshResponse.data.contacts.map((contact: any) => ({
            _id: contact._id,
            name: contact.name || "no name",
            company: contact.company || "no Company",
            position: contact.position || "",
            email: contact.email || "",
            phone: contact.phone || "",
            status: mapStatusToDisplay(contact.status),
            lastContact: contact.lastContact ? new Date(contact.lastContact) : new Date(0),
            assignedTo: contact.assignedTo || "Unassigned",
            uploadedBy: contact.uploadedBy || "System",
            uploadDate: contact.uploadDate? new Date(contact.uploadDate): new Date(),
            contactHistory: contact.contactHistory || [],
          }))
          setContacts(transformedContacts)
          setFilteredContacts(transformedContacts)
        }
      }

      // Reset CSV import state
      setCsvImportOpen(false)
      setCsvData([])
      setCsvPreview([])
      setCsvFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      console.error("Import error:", error)
      toast.error("Failed to import contacts. Please try again.")
    } finally {
      setCsvLoading(false)
    }
  }

  const resetCsvImport = () => {
    setCsvData([])
    setCsvPreview([])
    setCsvFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Contacts</h1>
        <div className="flex space-x-2">
          <Dialog open={csvImportOpen} onOpenChange={setCsvImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Contacts
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Import Contacts from CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="csv-file" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">Choose a CSV file</span>
                      <input
                        id="csv-file"
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      CSV should contain columns: name, company, position, email, phone
                    </p>
                  </div>
                  {csvFile && (
                    <div className="mt-4 flex items-center justify-center space-x-2">
                      <Badge variant="secondary">{csvFile.name}</Badge>
                      <Button variant="ghost" size="sm" onClick={resetCsvImport}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">CSV Format Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600">
                    <p className="mb-2">Your CSV file should have the following columns (case-insensitive):</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>name</strong> (required) - Contact's full name</li>
                      <li><strong>company</strong> - Company name</li>
                      <li><strong>position</strong> - Job title or position</li>
                      <li><strong>email</strong> - Email address</li>
                      <li><strong>phone</strong> - Phone number</li>
                    </ul>
                  </CardContent>
                </Card>

                {csvPreview.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Preview ({csvData.length} contacts)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvPreview.map((contact, index) => (
                            <TableRow key={index}>
                              <TableCell>{contact.name}</TableCell>
                              <TableCell>{contact.company || '-'}</TableCell>
                              <TableCell>{contact.position || '-'}</TableCell>
                              <TableCell>{contact.email || '-'}</TableCell>
                              <TableCell>{contact.phone || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {csvData.length > 5 && (
                        <p className="text-center text-sm text-gray-500 mt-2">
                          ... and {csvData.length - 5} more contacts
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCsvImportOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCsvImport}
                    disabled={csvData.length === 0 || csvLoading}
                  >
                    {csvLoading ? "Importing..." : `Import ${csvData.length} Contacts`}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                placeholder={`Search by ${filterBy}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter By
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => filterContacts('name')}>
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => filterContacts('company')}>
                  Company
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => filterContacts('email')}>
                  Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              
         <ScheduleCallPopup contacts={filteredContacts}>
              <Button size="sm" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
                Schedule Calls
              </Button>
         </ScheduleCallPopup>
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
                  <TableCell>{formatDate(contact.lastContact)}</TableCell> 
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
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem  onClick={() => { setSelectedContact(contact);setOpenEditPopup(true);}}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Contact
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                             <NotePopup contact={contact} onNoteAdded={() => {
                                 setRefreshContacts(prev => !prev);
                               }}>
                         <div className="flex items-center cursor-pointer">
                            <StickyNote className="mr-2 h-4 w-4" />
                          Add Note
                         </div>
                        </NotePopup>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteContact(contact)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Contact
                        </DropdownMenuItem>
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
                  setRefreshContacts((prev) => !prev);
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