"use client"

// Update the import path below to the correct relative path if needed
import AddStaffForm from "../../components/ui/add-staff-form"

export default function AddStaffPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add Staff Member</h1>
      <AddStaffForm />
    </div>
  )
}
