"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScheduleReminderModal } from "@/components/schedule-reminder-modal"
import { Phone, Mail, CalendarIcon, Plus, Clock, User, Building } from "lucide-react"

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

interface ContactDetailsModalProps {
  contact: Contact
  userRole: string
  isOpen: boolean
  onClose: () => void
  onUpdateContact: (contact: Contact) => void
}

export function ContactDetailsModal({ contact, userRole, isOpen, onClose, onUpdateContact }: ContactDetailsModalProps) {
  const [newContactNotes, setNewContactNotes] = useState("")
  const [newContactOutcome, setNewContactOutcome] = useState("")
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)

  const currentUser = localStorage.getItem("userEmail") || "Current User"

  const handleAddContactHistory = () => {
    if (!newContactNotes.trim() || !newContactOutcome) return

    const newHistory: ContactHistory = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      contactedBy: currentUser,
      notes: newContactNotes,
      outcome: newContactOutcome,
    }

    const updatedContact = {
      ...contact,
      lastContactDate: newHistory.date,
      contactHistory: [...contact.contactHistory, newHistory],
    }

    onUpdateContact(updatedContact)
    setNewContactNotes("")
    setNewContactOutcome("")
    setShowAddContact(false)
  }

  const handleScheduleReminder = (date: string, time: string, notes: string) => {
    const newHistory: ContactHistory = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      contactedBy: currentUser,
      notes: `Scheduled follow-up: ${notes}`,
      outcome: "scheduled",
      scheduledDate: `${date} ${time}`,
    }

    const updatedContact = {
      ...contact,
      lastContactDate: newHistory.date,
      contactHistory: [...contact.contactHistory, newHistory],
    }

    onUpdateContact(updatedContact)
    setShowScheduleModal(false)
  }

  const getOutcomeBadge = (outcome: string) => {
    const outcomeColors: { [key: string]: string } = {
      interested: "bg-green-100 text-green-800",
      "not-interested": "bg-red-100 text-red-800",
      "call-back": "bg-yellow-100 text-yellow-800",
      "quote-sent": "bg-blue-100 text-blue-800",
      negotiation: "bg-purple-100 text-purple-800",
      pending: "bg-orange-100 text-orange-800",
      won: "bg-green-100 text-green-800",
      lost: "bg-red-100 text-red-800",
      scheduled: "bg-blue-100 text-blue-800",
    }

    return (
      <Badge className={outcomeColors[outcome] || "bg-gray-100 text-gray-800"}>
        {outcome.replace("-", " ").toUpperCase()}
      </Badge>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{contact.name} - Contact Details</span>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-lg font-semibold">{contact.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Company & Role</Label>
                  <p>{contact.company}</p>
                  <p className="text-sm text-muted-foreground">{contact.role}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.email}</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Uploaded By</Label>
                      <p>{contact.uploadedBy}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Upload Date</Label>
                      <p>{contact.uploadedDate}</p>
                    </div>
                    {userRole === "admin" && (
                      <>
                        <div>
                          <Label className="text-xs text-muted-foreground">Assigned To</Label>
                          <p>{contact.assignedTo || "Unassigned"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Last Contact</Label>
                          <p>{contact.lastContactDate || "Never"}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="h-16 flex flex-col">
                    <Phone className="h-5 w-5 mb-1" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col bg-transparent">
                    <Mail className="h-5 w-5 mb-1" />
                    Send Email
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex flex-col bg-transparent"
                    onClick={() => setShowScheduleModal(true)}
                  >
                    <CalendarIcon className="h-5 w-5 mb-1" />
                    Schedule
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex flex-col bg-transparent"
                    onClick={() => setShowAddContact(true)}
                  >
                    <Plus className="h-5 w-5 mb-1" />
                    Log Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add New Contact Form */}
          {showAddContact && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Log New Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="outcome">Contact Outcome</Label>
                  <Select value={newContactOutcome} onValueChange={setNewContactOutcome}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interested">Interested</SelectItem>
                      <SelectItem value="not-interested">Not Interested</SelectItem>
                      <SelectItem value="call-back">Call Back Later</SelectItem>
                      <SelectItem value="quote-sent">Quote Sent</SelectItem>
                      <SelectItem value="negotiation">In Negotiation</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newContactNotes}
                    onChange={(e) => setNewContactNotes(e.target.value)}
                    placeholder="Add notes about this contact..."
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddContactHistory}>Save Contact</Button>
                  <Button variant="outline" onClick={() => setShowAddContact(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact History */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Contact History ({contact.contactHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contact.contactHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No contact history yet</p>
              ) : (
                <div className="space-y-4">
                  {contact.contactHistory
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((history) => (
                      <div key={history.id} className="border-l-2 border-blue-200 pl-4 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{history.contactedBy}</span>
                            {getOutcomeBadge(history.outcome)}
                          </div>
                          <span className="text-sm text-muted-foreground">{history.date}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{history.notes}</p>
                        {history.scheduledDate && (
                          <div className="flex items-center space-x-2 text-sm text-blue-600">
                            <CalendarIcon className="h-3 w-3" />
                            <span>Scheduled for: {history.scheduledDate}</span>
                          </div>
                        )}
                        {history.nextAction && (
                          <div className="text-sm text-orange-600">
                            <strong>Next Action:</strong> {history.nextAction}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* Schedule Reminder Modal */}
      <ScheduleReminderModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleScheduleReminder}
        contactName={contact.name}
      />
    </>
  )
}
