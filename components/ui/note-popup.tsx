"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";
import endpoints from "@/lib/endpoints";

interface Contact {
  _id: string;
  name: string;
  company: string;
  position: string;
  phone: string;
  email: string;
  status: string;
}

interface NotePopupProps {
  contact: Contact;
  children?: React.ReactNode;
  onNoteAdded?: () => void;
}

export function NotePopup({ contact, children, onNoteAdded }: NotePopupProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    notes: "",
    outcome: "",
    nextAction: "",
    scheduledDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.notes.trim() || !formData.outcome) {
        toast.error("Notes and outcome are required fields");
        setLoading(false);
        return;
      }

      const response = await api.post(endpoints.contact.addNote(contact._id), {
        notes: formData.notes.trim(),
        outcome: formData.outcome,
        nextAction: formData.nextAction.trim(),
        scheduledDate: formData.scheduledDate
          ? new Date(formData.scheduledDate).toISOString()
          : undefined,
      });

      if (response.data.success) {
        toast.success("Note added successfully");
        setOpen(false);
        setFormData({
          notes: "",
          outcome: "",
          nextAction: "",
          scheduledDate: "",
        });
        onNoteAdded?.();
      } else {
        throw new Error(response.data.message || "Failed to add note");
      }
    } catch (error: any) {
      console.error("Error adding note:", error);
      if (error.response?.data?.error) {
        console.error("Server error details:", error.response.data.error);
      }
      toast.error(error.response?.data?.message || "Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextActions = [
    "Call back",
    "Send email",
    "Schedule meeting",
    "Send proposal",
    "Follow up next week",
    "Connect on LinkedIn",
    "Send additional information",
    "Wait for response",
    "No further action needed",
    "Other (specify in notes)",
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-lg">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Add Note for {contact.name}
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Record your conversation details and next steps
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Notes
                </Label>
                <span className="text-xs text-red-500">Required</span>
              </div>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === " ") {
                    e.stopPropagation();
                  }
                }}
                placeholder="Enter notes"
                required
                className="w-full min-h-[100px] p-3 text-sm border border-gray-300 rounded-md 
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  resize-none transition-colors"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="outcome" className="text-sm font-medium text-gray-700">
                    Outcome
                  </Label>
                  <span className="text-xs text-red-500">Required</span>
                </div>
                <Select
                  value={formData.outcome}
                  onValueChange={(value) => handleSelectChange("outcome", value)}
                  required
                >
                  <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="not_interested">Not Interested</SelectItem>
                    <SelectItem value="follow_up">Follow Up Required</SelectItem>
                    <SelectItem value="no_response">No Response</SelectItem>
                    <SelectItem value="callback">Callback Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextAction" className="text-sm font-medium text-gray-700">
                  Next Action
                </Label>
                <Select
                  value={formData.nextAction}
                  onValueChange={(value) => handleSelectChange("nextAction", value)}
                >
                  <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Select next action" />
                  </SelectTrigger>
                  <SelectContent>
                    {nextActions.map((action, index) => (
                      <SelectItem key={index} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledDate" className="text-sm font-medium text-gray-700">
                Scheduled Date
              </Label>
              <Input
                id="scheduledDate"
                name="scheduledDate"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700"
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
                  Adding...
                </span>
              ) : (
                "Add Note"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}