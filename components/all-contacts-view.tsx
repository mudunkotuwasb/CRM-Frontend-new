"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, Filter, Users, Eye, Upload, Download, FileSpreadsheet, X } from "lucide-react"
import api from "@/lib/api"
import endpoints from "@/lib/endpoints"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import axios from "axios"
import { ContactPopup } from "@/components/ui/contactpopup"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CheckCircle, XCircle } from "lucide-react"
import Papa from "papaparse"

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
  status: "ASSIGNED" | "UNASSIGNED" | "COMPLETED" | "NOT COMPLETE"
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

interface CSVContact {
  name: string
  company: string
  position: string
  email: string
  phone: string
}

export function AllContactsView({ userRole }: AllContactsViewProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [allContacts, setAllContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userDataMap, setUserDataMap] = useState<Record<string, string>>({});
  const [filterType, setFilterType] = useState<'name' | 'company' | 'email'>('name');
  
  // CSV Import states
  const [csvImportOpen, setCsvImportOpen] = useState(false)
  const [csvData, setCsvData] = useState<CSVContact[]>([])
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvLoading, setCsvLoading] = useState(false)
  const [csvPreview, setCsvPreview] = useState<CSVContact[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await api.get(endpoints.contact.getAllContacts)
        if (!response.data?.allContacts) {
          console.log("No contacts data found in response")
        }

        const transformedContacts = response.data.allContacts.map((contact: any) => ({
          _id: contact._id,
          name: contact.Name || contact.name,
          company: contact.company,
          position: contact.position,
          email: contact.contactInfo?.email || contact.email || 'No email',
          phone: contact.contactInfo?.phone || contact.phone || 'No phone',
          uploadedBy: contact.uploadedBy || 'System',
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

  const filteredContacts = displayContacts.filter(contact => 
    contact[filterType].toLowerCase().includes(searchTerm.toLowerCase())
  );

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

    const handleStatusChange = async (
    contactId: string,
    newStatus: "COMPLETED" | "NOT COMPLETE"
  ) => {
    try {
      const response = await api.post(endpoints.contact.updateStatus, {
        contactId,
        status: newStatus,
      });

      if (response.data?.success) {
        setAllContacts((prev) =>
          prev.map((c) =>
            c._id === contactId ? { ...c, status: newStatus } : c
          )
        );
        toast.success(`Contact marked as ${newStatus}`);
      } else {
        throw new Error(response.data?.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status. Please try again.");
    }
  };


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

  const getUploaderName = (contact: Contact) => {
    return contact.uploadedBy;
  };

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
      complete: (results: Papa.ParseResult<any>) => {
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
        const refreshResponse = await api.get(endpoints.contact.getAllContacts)
        if (refreshResponse.data?.allContacts) {
          const transformedContacts = refreshResponse.data.allContacts.map((contact: any) => ({
            _id: contact._id,
            name: contact.Name || contact.name,
            company: contact.company,
            position: contact.position,
            email: contact.contactInfo?.email || contact.email || 'No email',
            phone: contact.contactInfo?.phone || contact.phone || 'No phone',
            uploadedBy: contact.uploadedBy || 'System',
            uploadDate: contact.uploadDate,
            assignedTo: contact.assignedTo || "Unassigned",
            status: contact.status || "UNASSIGNED",
            lastContact: contact.lastContact || new Date(0),
            isDeleted: contact.isDeleted || false
          }))
          setAllContacts(transformedContacts)
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
                placeholder={`Search by ${filterType}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter: {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterType('name')}>
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('company')}>
                  Company
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('email')}>
                  Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm">
        <Eye className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem 
        onClick={() => handleStatusChange(contact._id, "COMPLETED")}
        className={contact.status === "COMPLETED" ? "bg-green-50 text-green-700 font-medium" : ""}
      >
        <CheckCircle className={`mr-2 h-4 w-4 ${contact.status === "COMPLETED" ? "text-green-600" : "text-gray-400"}`} />
        Mark as Completed
        {contact.status === "COMPLETED" }
      </DropdownMenuItem>
      <DropdownMenuItem 
        onClick={() => handleStatusChange(contact._id, "NOT COMPLETE")}
        className={contact.status === "NOT COMPLETE" ? "bg-red-50 text-red-700 font-medium" : ""}
      >
        <XCircle className={`mr-2 h-4 w-4 ${contact.status === "NOT COMPLETE" ? "text-red-600" : "text-gray-400"}`} />
        Mark as Not Complete
        {contact.status === "NOT COMPLETE" }
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
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