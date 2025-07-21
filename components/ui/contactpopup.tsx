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
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }))
  }

// In your ContactPopup component
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (typeof window === "undefined") {
      throw new Error("Window object not available");
    }

    // Validate all required fields are filled
    const requiredFields = ['name', 'company', 'position', 'email', 'phone'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
      }
    }

    // Get session data
    const userId = localStorage.getItem("user_id") || localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken") || localStorage.getItem("token");
    
    if (!userId || userId === "undefined" || userId === "null") {
      throw new Error("Please login again");
    }

    if (!authToken) {
      throw new Error("Authentication token missing");
    }

    // Prepare payload to match backend schema exactly
    const currentDate = new Date();
    const payload = {
      name: formData.name.trim(),
      company: formData.company.trim(),
      position: formData.position.trim(),
      contactInfo: {  // Changed to match backend expectation
        email: formData.email.trim(),
        phone: formData.phone.trim()
      },
      uploadedBy: userId,
      uploadDate: currentDate.toISOString(), // Fixed field name (removed extra 'D')
      status: formData.status,
      assignedTo: "Unassigned",
      lastContact: new Date(0).toISOString()
    };

    console.log("Final payload being sent:", payload);

    const response = await api.post(endpoints.contact.addContact, payload);

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to add contact");
    }

    toast.success("Contact added successfully");
    setOpen(false);
    setFormData({
      name: "",
      company: "",
      position: "",
      email: "",
      phone: "",
      status: "UNASSIGNED",
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Submission error:", error.message);
      
      let errorMessage = error.message;
      
      if (axios.isAxiosError(error)) {
        console.error("Backend response:", error.response?.data);
        
        if (error.response?.status === 500) {
          errorMessage = "Failed to add contact. Please check all fields and try again.";
        }
        
        if (error.response?.status === 401) {
          errorMessage = "Session expired. Please login again";
          // Clear auth data
          ['authToken', 'token', 'userId', 'user_id'].forEach(key => 
            localStorage.removeItem(key)
          );
          router.push("/auth/login");
        }
      }
      
      toast.error(errorMessage);
    } else {
      console.error("Unknown error:", error);
      toast.error("Failed to add contact");
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