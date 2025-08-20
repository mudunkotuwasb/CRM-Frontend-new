"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, TrendingUp, Target,CheckCircle  } from "lucide-react"
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  //Calculate start of the week
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  //State for recent contacts and loading status
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [completedContacts, setCompletedContacts] = useState<Contact[]>([]);
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
            .slice(0, 5);
          setRecentContacts(sortedContacts);

          // Get completed contacts (status = "COMPLETED")
          const completed = response.data.allContacts
            .filter((contact: Contact) => contact.status === "COMPLETED")
            .sort((a: Contact, b: Contact) => 
              new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime()
            )
            .slice(0, 5);
          setCompletedContacts(completed);

          //Calculate contacts added today
          const contactsToday = response.data.allContacts.filter((contact: Contact) => {
            const contactDate = new Date(contact.uploadDate);
            contactDate.setHours(0, 0, 0, 0);
            return contactDate.getTime() === today.getTime();
          }).length;


          //Calculate contacts added this week
          const contactsThisWeek = response.data.allContacts.filter((contact: Contact) => {
            const contactDate = new Date(contact.uploadDate);
            return contactDate >= startOfWeek;
          }).length;


          //Calculate contacts added this month
          const contactsThisMonth = response.data.allContacts.filter((contact: Contact) => {
            const contactDate = new Date(contact.uploadDate);
            return (
              contactDate.getMonth() === currentMonth &&
              contactDate.getFullYear() === currentYear
            );
          }).length;

          setStats(prevStats => ({
            ...prevStats,
            callsToday: contactsToday,
            callsThisWeek: contactsThisWeek,
            conversionsThisMonth: contactsThisMonth
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls Made</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.callsToday}</div>
            <p className="text-xs text-muted-foreground">
              Today • {stats.callsThisWeek} this week • {stats.conversionsThisMonth}{" "}this month
            </p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionsThisMonth}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>


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
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Completed Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completedContacts.length > 0 ? (
              <div className="space-y-4">
                {completedContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {contact.company} - {contact.position}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last Contact:{" "}
                        {new Date(contact.lastContact).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Completed
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-32">
                <p className="text-muted-foreground">No completed contacts</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}