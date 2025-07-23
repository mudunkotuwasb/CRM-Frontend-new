"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import axios from "axios"
import endpoints from "@/lib/endpoints"

export function ContactPopup() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    position: "",
    email: "",
    phone: "",
    status: "UNASSIGNED",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Enhanced validation
      const requiredFields = ['name', 'company', 'position', 'email', 'phone'];
      for (const field of requiredFields) {
        const value = formData[field as keyof typeof formData]?.trim();
        if (!value) {
          throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        }
        
        // Additional email validation
        if (field === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            throw new Error("Please enter a valid email address");
          }
        }
      }

      // Get user session data
      const userId = localStorage.getItem("user_id") || localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken") || localStorage.getItem("token");
      
      if (!userId || userId === "undefined" || userId === "null") {
        throw new Error("Please login again");
      }

      if (!authToken) {
        throw new Error("Authentication token missing");
      }

      // Prepare payload with additional checks
      const payload = {
        name: formData.name.trim(),
        company: formData.company.trim(),
        position: formData.position.trim(),
        contactInfo: {
          email: formData.email.trim(),
          phone: formData.phone.trim()
        },
        uploadedBy: userId,
        uploadDate: new Date().toISOString(),
        status: formData.status,
        assignedTo: "Unassigned",
        lastContact: new Date(0).toISOString()
      };

      // Check for duplicate contact before submitting
      try {
        const checkResponse = await api.get(endpoints.contact.getAllContacts, {
          params: {
            email: payload.contactInfo.email
          }
        });

        if (checkResponse.data?.some((contact: any) => 
          contact.contactInfo?.email === payload.contactInfo.email
        )) {
          throw new Error("A contact with this email already exists");
        }
      } catch (checkError) {
        console.warn("Duplicate check failed, proceeding anyway", checkError);
      }

      // Submit the contact API
      const response = await api.post(endpoints.contact.addContact, payload);

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to add contact");
      }

      toast.success("Contact added successfully");
      
      // Reset form completely
      setFormData({
        name: "",
        company: "",
        position: "",
        email: "",
        phone: "",
        status: "UNASSIGNED",
      });
      setOpen(false);

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 500) {
          if (error.response?.data?.message?.includes('duplicate key')) {
            toast.error("A contact with this email already exists");
          } else {
            toast.error("Server error. Please try again later.");
          }
        } else if (error.response?.status === 401) {
          toast.error("Session expired. Please login again");
          ['authToken', 'token', 'userId', 'user_id'].forEach(key => 
            localStorage.removeItem(key)
          );
          router.push("/auth/login");
        } else {
          toast.error(error.response?.data?.message || "Failed to add contact");
        }
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company" className="text-right">
              Company
            </Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-right">
              Position
            </Label>
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select 
              value={formData.status} 
              onValueChange={handleStatusChange}
              required
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ASSIGNED">ASSIGNED</SelectItem>
                <SelectItem value="UNASSIGNED">UNASSIGNED</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}