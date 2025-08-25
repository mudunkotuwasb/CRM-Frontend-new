"use client";

import { useState } from "react"
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
import { Trash2 } from "lucide-react"

interface Contact {
  _id: string;
  name: string;
  company: string;
  position: string;
  phone: string;
  email: string;
  status: string;
  lastContact: string | Date;
  uploadedBy: string;
  uploadDate: string | Date;
  contactHistory?: ContactHistory[];
}
interface ContactHistory {
  id: number;
  date: string;
  contactedBy: string;
  notes: string;
  outcome: string;
  nextAction?: string;
  scheduledDate?: string;
}

interface ContactPopupProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  contact?: Contact;
  viewMode?: boolean;
}

// Read-only field component
const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-600">{label}</Label>
    <p className="text-base font-medium text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-200 min-h-[40px] flex items-center">
      {value || "-"}
    </p>
  </div>
);


const mapDisplayToStatus = (displayStatus: string): string => {
  switch (displayStatus) {
    case "Unassigned":
      return "UNASSIGNED";
    case "Assigned":
      return "ASSIGNED";
    case "In Progress":
      return "IN_PROGRESS";
    case "Completed":
      return "COMPLETED";
    case "Pending":
      return "PENDING";
    case "Rejected":
      return "REJECTED";
    default:
      return displayStatus;
  }
};

export function ContactPopup({
  children,
  open,
  onOpenChange,
  contact,
  viewMode = false,
}: ContactPopupProps) {
  const router = useRouter()
  const [_open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: contact?.name || "",
    company: contact?.company || "",
    position: contact?.position || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    status: contact?.status ? mapDisplayToStatus(contact.status) : "UNASSIGNED",
  });
  const [errors, setErrors] = useState({
    name: "",
    company: "",
    position: "",
    email: "",
    phone: "",
  })

  const validateForm = () => {
    const newErrors = {
      name: "",
      company: "",
      position: "",
      email: "",
      phone: "",
    }
    let isValid = true

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
      isValid = false
    }

    // Company validation
    if (!formData.company.trim()) {
      newErrors.company = "Company is required"
      isValid = false
    }

    // Position validation
    if (!formData.position.trim()) {
      newErrors.position = "Position is required"
      isValid = false
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
      isValid = false
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required"
      isValid = false
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Phone must contain only digits"
      isValid = false
    } else if (formData.phone.length !== 10) {
      newErrors.phone = "Phone must be exactly 10 digits"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Phone number validation - only allow digits
    if (name === "phone") {
      if (value === "" || /^\d+$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }))
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userId = localStorage.getItem("user_id") || localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken") || localStorage.getItem("token");

      if (!userId || userId === "undefined" || userId === "null") {
        throw new Error("Please login again");
      }

      if (!authToken) {
        throw new Error("Authentication token missing");
      }

      let response;
      if (contact) {
        const updatePayload = {
          name: formData.name.trim(),
          company: formData.company.trim(),
          position: formData.position.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          status: formData.status,
        };
        response = await api.put(
          endpoints.contact.updateContact(contact._id),
          updatePayload
        );
      } else {
        const addPayload = {
          name: formData.name.trim(),
          company: formData.company.trim(),
          position: formData.position.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          status: formData.status,
          uploadedBy: userId,
          uploadDate: new Date().toISOString(),
          assignedTo: "Unassigned",
          lastContact: new Date(0).toISOString(),
        };
        response = await api.post(endpoints.contact.addContact, addPayload);
      }

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to add contact");
      }

      toast.success(`Contact ${contact ? "updated" : "added"} successfully`);

      if (!contact) {
        setFormData({
          name: "",
          company: "",
          position: "",
          email: "",
          phone: "",
          status: "UNASSIGNED",
        });
      }

      // Close the popup
      if (onOpenChange) {
        onOpenChange(false);
      } else {
        setOpen(false);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 500) {
          if (error.response?.data?.message?.includes("duplicate key")) {
            toast.error("A contact with this email already exists");
          } else {
            toast.error("Server error. Please try again later.");
          }
        } else if (error.response?.status === 401) {
          toast.error("Session expired. Please login again");
          ["authToken", "token", "userId", "user_id"].forEach((key) =>
            localStorage.removeItem(key)
          );
          router.push("/auth/login");
        } else {
          toast.error(
            error.response?.data?.message || "Failed to save contact"
          );
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

  const handleDeleteHistory = async (historyId: number) => {
    if (!contact?._id) return;

    if (!confirm("Are you sure you want to delete this contact history?")) {
      return;
    }

    try {
      console.log("Deleting history:", {
        contactId: contact._id,
        historyId,
        endpoint: endpoints.contact.deleteContactHistory(
          contact._id,
          historyId
        ),
      });

      const response = await api.delete(
        endpoints.contact.deleteContactHistory(contact._id, historyId)
      );

      if (response.data.success) {
        toast.success("Contact history deleted successfully");
        // Refresh the data
        router.refresh();
        if (onOpenChange) {
          onOpenChange(false);
          setTimeout(() => onOpenChange(true), 100);
        } else {
          setOpen(false);
          setTimeout(() => setOpen(true), 100);
        }
      } else {
        throw new Error(
          response.data.message || "Failed to delete contact history"
        );
      }
    } catch (error: any) {
      console.error("Full error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });

      if (error.response?.status === 400) {
        toast.error("Invalid request. Please try again.");
      } else if (error.response?.status === 404) {
        toast.error("Contact or history not found.");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to delete contact history"
        );
      }
    }
  };

  return (
    <Dialog
      open={open !== undefined ? open : _open}
      onOpenChange={onOpenChange || setOpen}
    >
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] rounded-lg">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {viewMode
              ? "Contact Details"
              : contact
              ? "Edit Contact"
              : "Add New Contact"}
          </DialogTitle>
          {!viewMode && (
            <p className="text-sm text-gray-500 mt-1">
              {contact
                ? "Update the contact information"
                : "Add a new contact to your database"}
            </p>
          )}
        </DialogHeader>

        {viewMode ? (
          <div className="mt-4 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-medium text-gray-500 text-sm mb-4 uppercase tracking-wide">
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <ReadOnlyField label="Name" value={contact?.name || ""} />
                    <ReadOnlyField
                      label="Position"
                      value={contact?.position || ""}
                    />
                    <ReadOnlyField
                      label="Status"
                      value={contact?.status || ""}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-medium text-gray-500 text-sm mb-4 uppercase tracking-wide">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <ReadOnlyField
                      label="Company"
                      value={contact?.company || ""}
                    />
                    <ReadOnlyField label="Email" value={contact?.email || ""} />
                    <ReadOnlyField label="Phone" value={contact?.phone || ""} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-medium text-gray-500 text-sm mb-4 uppercase tracking-wide">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReadOnlyField
                  label="Last Contact"
                  value={
                    contact?.lastContact
                      ? new Date(contact.lastContact).toLocaleDateString()
                      : "Never"
                  }
                />
              </div>
            </div>
            {contact?.contactHistory && contact.contactHistory.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-medium text-gray-500 text-sm mb-4 uppercase tracking-wide">
                  Contact History
                </h3>
                <div className="space-y-3">
                  {contact.contactHistory.map((history) => (
                    <div
                      key={history.id}
                      className="bg-white p-4 rounded-md border shadow-sm relative"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(history.date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {history.outcome}
                        </span>
                      </div>
                      <p className="mt-3 text-gray-700">{history.notes}</p>
                      {history.nextAction && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Next Action:</span>{" "}
                            {history.nextAction}
                            {history.scheduledDate &&
                              ` (${new Date(
                                history.scheduledDate
                              ).toLocaleDateString()})`}
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteHistory(history.id)}
                        className="mt-3 ml-auto p-1 text-red-400 hover:text-red-600 block"
                        title="Delete this history"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange?.(false) || setOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Name
                    </Label>
                    <span className="text-xs text-red-500">Required</span>
                  </div>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={
                      errors.name ? "border-red-500 focus:ring-red-500" : ""
                    }
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="company"
                      className="text-sm font-medium text-gray-700"
                    >
                      Company
                    </Label>
                    <span className="text-xs text-red-500">Required</span>
                  </div>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className={
                      errors.company ? "border-red-500 focus:ring-red-500" : ""
                    }
                    placeholder="Acme Inc."
                  />
                  {errors.company && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.company}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="position"
                      className="text-sm font-medium text-gray-700"
                    >
                      Position
                    </Label>
                    <span className="text-xs text-red-500">Required</span>
                  </div>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className={
                      errors.position ? "border-red-500 focus:ring-red-500" : ""
                    }
                    placeholder="Marketing Manager"
                  />
                  {errors.position && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.position}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="status"
                      className="text-sm font-medium text-gray-700"
                    >
                      Status
                    </Label>
                    <span className="text-xs text-red-500">Required</span>
                  </div>
                  <Select
                    value={formData.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ASSIGNED">ASSIGNED</SelectItem>
                      <SelectItem value="UNASSIGNED">UNASSIGNED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email
                    </Label>
                    <span className="text-xs text-red-500">Required</span>
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={
                      errors.email ? "border-red-500 focus:ring-red-500" : ""
                    }
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700"
                    >
                      Phone
                    </Label>
                    <span className="text-xs text-red-500">Required</span>
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={
                      errors.phone ? "border-red-500 focus:ring-red-500" : ""
                    }
                    placeholder="1234567890"
                    maxLength={10}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  onOpenChange ? onOpenChange(false) : setOpen(false)
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {contact ? "Updating..." : "Adding..."}
                  </span>
                ) : contact ? (
                  "Update Contact"
                ) : (
                  "Add Contact"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}