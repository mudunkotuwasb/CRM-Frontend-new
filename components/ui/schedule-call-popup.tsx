// components/ui/schedule-call-popup.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Clock, Phone } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import api from "@/lib/api"
import endpoints from "@/lib/endpoints"
import { toast } from "sonner"

// Define Contact interface locally
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
  contactHistory?: ContactHistory[]
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

interface ScheduleCallPopupProps {
  contacts: Contact[]
  children: React.ReactNode
}

export function ScheduleCallPopup({ contacts, children }: ScheduleCallPopupProps) {
  const [open, setOpen] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState("09:00")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00"
  ]

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId) 
        : [...prev, contactId]
    )
  }

  const handleScheduleCalls = async () => {
    if (!date) {
      toast.error("Please select a date")
      return
    }

    if (selectedContacts.length === 0) {
      toast.error("Please select at least one contact")
      return
    }

    setLoading(true)
    try {
      // Combine date and time
      const scheduledDateTime = new Date(date)
      const [hours, minutes] = time.split(':').map(Number)
      scheduledDateTime.setHours(hours, minutes)

      const payload = {
        contactIds: selectedContacts,
        scheduledDate: scheduledDateTime.toISOString(),
        notes: notes
      }

      const response = await api.post(endpoints.contact.scheduleCalls, payload)
      
      if (response.data.success) {
        toast.success("Calls scheduled successfully")
        setOpen(false)
        // Reset form
        setSelectedContacts([])
        setDate(undefined)
        setTime("09:00")
        setNotes("")
      } else {
        throw new Error(response.data.message || "Failed to schedule calls")
      }
    } catch (error: any) {
      console.error("Scheduling error:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to schedule calls"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Schedule Calls
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Contact Selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Select Contacts</h3>
            <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
              {contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contacts available</p>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact: Contact) => (
                    <div key={contact._id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`contact-${contact._id}`}
                        checked={selectedContacts.includes(contact._id)}
                        onCheckedChange={() => toggleContactSelection(contact._id)}
                      />
                      <label
                        htmlFor={`contact-${contact._id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                      >
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {contact.company} • {contact.phone}
                          </p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date and Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="time">Time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select time" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot: string) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about these calls..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleScheduleCalls} 
              disabled={loading || !date || selectedContacts.length === 0}
            >
              {loading ? "Scheduling..." : "Schedule Calls"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}