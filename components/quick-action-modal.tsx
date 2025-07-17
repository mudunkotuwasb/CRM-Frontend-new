"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Phone, MessageSquare, Clock, CheckCircle } from "lucide-react"
import { format } from "date-fns"

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

interface QuickActionModalProps {
  contact: Contact
  isOpen: boolean
  onClose: () => void
  onUpdateContact: (contact: Contact) => void
}

export function QuickActionModal({ contact, isOpen, onClose, onUpdateContact }: QuickActionModalProps) {
  const [activeTab, setActiveTab] = useState("call")
  const [notes, setNotes] = useState("")
  const [outcome, setOutcome] = useState("")
  const [nextAction, setNextAction] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState("")

  const currentUser = localStorage.getItem("userEmail") || "Current User"

  const handleQuickSave = () => {
    if (!notes.trim() && !outcome) return

    const newHistory: ContactHistory = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      contactedBy: currentUser,
      notes: notes || `Quick ${activeTab} action`,
      outcome: outcome || activeTab,
      nextAction: nextAction || undefined,
      scheduledDate: selectedDate && selectedTime ? `${format(selectedDate, "yyyy-MM-dd")} ${selectedTime}` : undefined,
    }

    const updatedContact = {
      ...contact,
      lastContact: newHistory.date,
      contactHistory: [...contact.contactHistory, newHistory],
    }

    onUpdateContact(updatedContact)

    // Reset form
    setNotes("")
    setOutcome("")
    setNextAction("")
    setSelectedDate(undefined)
    setSelectedTime("")

    onClose()
  }

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ]

  const callOutcomes = [
    { value: "answered", label: "Call Answered" },
    { value: "voicemail", label: "Left Voicemail" },
    { value: "no-answer", label: "No Answer" },
    { value: "busy", label: "Line Busy" },
    { value: "interested", label: "Showed Interest" },
    { value: "not-interested", label: "Not Interested" },
    { value: "callback", label: "Requested Callback" },
  ]

  const followUpOutcomes = [
    { value: "email-sent", label: "Email Sent" },
    { value: "proposal-sent", label: "Proposal Sent" },
    { value: "quote-sent", label: "Quote Sent" },
    { value: "meeting-scheduled", label: "Meeting Scheduled" },
    { value: "demo-scheduled", label: "Demo Scheduled" },
    { value: "follow-up-needed", label: "Follow-up Needed" },
  ]

  const statusUpdates = [
    { value: "hot-lead", label: "Hot Lead" },
    { value: "warm-lead", label: "Warm Lead" },
    { value: "cold-lead", label: "Cold Lead" },
    { value: "negotiation", label: "In Negotiation" },
    { value: "proposal-sent", label: "Proposal Sent" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Quick Action - {contact.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="call" className="flex items-center">
              <Phone className="mr-2 h-4 w-4" />
              Call
            </TabsTrigger>
            <TabsTrigger value="follow-up" className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              Follow-up
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="update" className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              Update
            </TabsTrigger>
          </TabsList>

          <TabsContent value="call" className="space-y-4">
            <div>
              <Label>Call Outcome</Label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger>
                  <SelectValue placeholder="Select call outcome" />
                </SelectTrigger>
                <SelectContent>
                  {callOutcomes.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Call Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about the call..."
                rows={3}
              />
            </div>
            <div>
              <Label>Next Action</Label>
              <Textarea
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="What's the next step?"
                rows={2}
              />
            </div>
          </TabsContent>

          <TabsContent value="follow-up" className="space-y-4">
            <div>
              <Label>Follow-up Type</Label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger>
                  <SelectValue placeholder="Select follow-up type" />
                </SelectTrigger>
                <SelectContent>
                  {followUpOutcomes.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Follow-up Details</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe the follow-up action taken..."
                rows={3}
              />
            </div>
            <div>
              <Label>Next Steps</Label>
              <Textarea
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="What should happen next?"
                rows={2}
              />
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Select Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Meeting Type</Label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger>
                  <SelectValue placeholder="Select meeting type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="meeting">In-Person Meeting</SelectItem>
                  <SelectItem value="demo">Product Demo</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Meeting Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add meeting agenda or notes..."
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="update" className="space-y-4">
            <div>
              <Label>Update Status</Label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {statusUpdates.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Update Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain the status change..."
                rows={3}
              />
            </div>
            <div>
              <Label>Next Action Required</Label>
              <Textarea
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="What needs to be done next?"
                rows={2}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex space-x-2 pt-4">
          <Button onClick={handleQuickSave} className="flex-1">
            <Clock className="mr-2 h-4 w-4" />
            Save Quick Action
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
