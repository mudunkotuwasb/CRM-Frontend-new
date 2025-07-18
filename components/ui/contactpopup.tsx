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

interface Business {
  _id: string
  businessName: string
}

export function ContactPopup() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [formData, setFormData] = useState({
    fullName: "",
    roleTitle: "",
    company: "",
    email: "",
    phone: "",
    department: "",
    status: "LEAD",
  })

  // Fetch businesses when dialog opens
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await api.get("/company-representative/allBusiness")
        // Ensure we're getting the data in correct format
        const businessData = response.data.allBusinesses || response.data || []
        setBusinesses(businessData)
      } catch (error: any) {
        console.error("Failed to fetch businesses", error)
        toast.error("Failed to load companies")
        if (error.response?.status === 401) {
          router.push('/auth/login?session_expired=true')
        }
      }
    }
    
    if (open) {
      fetchBusinesses()
    }
  }, [open, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }))
  }

  const handleCompanyChange = (value: string) => {
    setFormData(prev => ({ ...prev, company: value }))
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    // Validate form fields
    const requiredFields = [
      { field: 'fullName', name: 'Full Name' },
      { field: 'roleTitle', name: 'Role/Title' },
      { field: 'company', name: 'Company' },
      { field: 'email', name: 'Email' },
      { field: 'phone', name: 'Phone' },
      { field: 'department', name: 'Department' }
    ];

    for (const { field, name } of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        throw new Error(`${name} is required`);
      }
    }

    if (!/^[0-9a-fA-F]{24}$/.test(formData.company)) {
      throw new Error('Invalid company selection');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      throw new Error('Please enter a valid email address');
    }

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('No user session found');
    }

    const payload = {
      fullName: formData.fullName.trim(),
      roleTitle: formData.roleTitle.trim(),
      company: formData.company,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      department: formData.department.trim(),
      status: formData.status,
      assignedTo: userId,
      createdBy: userId
    };
    const response = await api.post("/api/company-representative/addContact", payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Server responded with failure");
    }

    toast.success("Contact added successfully");
    setOpen(false);
    setFormData({
      fullName: "",
      roleTitle: "",
      company: "",
      email: "",
      phone: "",
      department: "",
      status: "LEAD",
    });

  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Submission error:', error instanceof Error ? error.message : 'Unknown error');
    }
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const apiError = error as { 
        response?: { 
          status: number; 
          data?: { message?: string } 
        } 
      };
      if (apiError.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        errorMessage = "Session expired. Please login again.";
        router.push('/auth/login?session_expired=true');
      } else if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (apiError.response?.status === 400) {
        errorMessage = "Invalid data submitted. Please check all fields.";
      } else if (apiError.response?.status === 404) {
        errorMessage = "The requested resource was not found. Please check the company selection.";
      }
    }

    toast.error(errorMessage);
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
          {/* Form fields */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right">
              Full Name
            </Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="roleTitle" className="text-right">
              Role/Title
            </Label>
            <Input
              id="roleTitle"
              name="roleTitle"
              value={formData.roleTitle}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company" className="text-right">
              Company
            </Label>
            <Select 
              value={formData.company}
              onValueChange={handleCompanyChange}
              required
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {businesses.map((business) => (
                  <SelectItem key={business._id} value={business._id}>
                    {business.businessName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label htmlFor="department" className="text-right">
              Department
            </Label>
            <Input
              id="department"
              name="department"
              value={formData.department}
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
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="PROSPECT">PROSPECT</SelectItem>
                <SelectItem value="LEAD">LEAD</SelectItem>
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