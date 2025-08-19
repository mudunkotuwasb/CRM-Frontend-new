"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, TrendingUp, Target, Plus, HelpCircle } from "lucide-react"
import { ContactPopup } from "@/components/ui/contactpopup"
import { useEffect, useState } from "react";
import endpoints from "@/lib/endpoints";
import api from "@/lib/api";
import { toast } from "sonner";
import axios from "axios";

//Define Contact interface matching schema
interface Contact {
  _id: string;
  name: string;
  company: string;
  position: string;
  email: string;
  phone: string;
  status: string;
  lastContact: Date;
  uploadDate: Date;
}

export function StaffDashboard() {
  const [stats,setStats] = useState( {
    callsToday: 0,
    callsThisWeek: 0,
    callsThisMonth: 189,
    hotLeads: 8,
    conversionsThisMonth: 0,
    assignedContacts: 156,
  })



  //State for recent contacts and loading status
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();


  //catch recent contacts from backend
  useEffect(() => {
    const RecentContacts = async () => {
      try {
        setError(null);

        const response = await api.get(endpoints.contact.getAllContacts, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.allContacts) {
          const sortedContacts = response.data.allContacts
            .sort(
              (a: Contact, b: Contact) =>
                new Date(b.uploadDate).getTime() -
                new Date(a.uploadDate).getTime()
            )
            .slice(0, 3);
          setRecentContacts(sortedContacts);

          setStats(prevStats => ({
            ...prevStats,
          }));
        }
      } catch (err: unknown) {
        let errorMessage = "Failed to load contacts";

        if (typeof err === "string") {
          errorMessage = err;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        } else if (axios.isAxiosError(err)) {
          errorMessage =
            err.response?.data?.message || err.message || errorMessage;
        }

        console.error("Error fetching contacts:", err);
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    RecentContacts();
  }, []);
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <div className="flex space-x-2">
          <ContactPopup />
        </div>
      </div>


      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col">
              <Phone className="h-6 w-6 mb-2" />
              Log Call
            </Button>

            <ContactPopup>
              <Button variant="outline" className="h-20 flex flex-col bg-transparent">
                <Plus className="h-6 w-6 mb-2" />
                Add Contact
              </Button>
            </ContactPopup>
          </div>
        </CardContent>
      </Card>

      {/* Recent Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            {recentContacts.length > 0 ? (
              <div className="space-y-4">
                {recentContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {contact.company} - {contact.position}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded:{" "}
                        {new Date(contact.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm">Call</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-32">
                <p>No recent contacts</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Follow-up call with John A.</p>
                  <p className="text-xs text-muted-foreground">10:00 AM</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Demo call with Sarah W.</p>
                  <p className="text-xs text-muted-foreground">2:00 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Team sync meeting</p>
                  <p className="text-xs text-muted-foreground">4:00 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}