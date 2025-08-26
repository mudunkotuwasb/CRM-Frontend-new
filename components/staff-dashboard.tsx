"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Target, CheckCircle, Plus, Calendar, Clock, Building, MapPin, Trash2 } from "lucide-react"
import { ContactPopup } from "@/components/ui/contactpopup"
import { useEffect, useState } from "react";
import endpoints from "@/lib/endpoints";
import api from "@/lib/api";
import { toast } from "sonner";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isTomorrow, isThisWeek, parseISO } from "date-fns";

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

//Define ScheduledCall interface
interface ScheduledCall {
  _id: string;
  contactId: {
    _id: string;
    name: string;
    company: string;
    phone: string;
    email: string;
    position?: string;
  };
  scheduledDate: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  completedAt?: string;
  createdAt: string;
}

export function StaffDashboard() {
  const [stats,setStats] = useState( {
    callsToday: 0,
    callsThisWeek: 0,
    callsThisMonth: 189,
    hotLeads: 8,
    conversionsThisMonth: 0,
    assignedContacts: 156,
    scheduledCallsToday: 0,
    scheduledCallsThisWeek: 0,
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
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);
  const [upcomingCalls, setUpcomingCalls] = useState<ScheduledCall[]>([]);

  //Fetch scheduled calls from backend
  const fetchScheduledCalls = async () => {
    try {
      const response = await api.get(endpoints.contact.getScheduledCalls, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        const calls: ScheduledCall[] = response.data.data;
        setScheduledCalls(calls);

        //Filter upcoming calls
        const now = new Date();
        const upcoming = calls.filter((call: ScheduledCall) => 
          call.status === 'scheduled' && 
          new Date(call.scheduledDate) > now
        ).sort((a: ScheduledCall, b: ScheduledCall) => 
          new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
        );
        
        setUpcomingCalls(upcoming.slice(0, 5)); //Show 5 upcoming calls

        //Calculate stats for scheduled calls
        const totalScheduledCalls = calls.filter((call: ScheduledCall) => 
          call.status === 'scheduled'
        ).length;

        const scheduledToday = calls.filter((call: ScheduledCall) => {
          const callDate = new Date(call.scheduledDate);
          return isToday(callDate) && call.status === 'scheduled';
        }).length;

        setStats(prevStats => ({
          ...prevStats,
          scheduledCallsToday: totalScheduledCalls,
          scheduledCallsThisWeek: scheduledToday
        }));
      }
    } catch (error: any) {
      console.error("Error fetching scheduled calls:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load scheduled calls";
      toast.error(errorMessage);
    }
  };

  //Delete scheduled call
  const deleteScheduledCall = async (callId: string) => {
    if (!window.confirm("Are you sure you want to delete this scheduled call?")) {
      return;
    }

    try {
      const response = await api.delete(`/contact-manager/scheduledCalls/${callId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        toast.success("Scheduled call deleted successfully");
        // Refresh the scheduled calls
        fetchScheduledCalls();
      } else {
        throw new Error(response.data.message || "Failed to delete scheduled call");
      }
    } catch (error: any) {
      console.error("Error deleting scheduled call:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete scheduled call";
      toast.error(errorMessage);
    }
  };

  //Fetch recent contacts from backend
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
    fetchScheduledCalls();
  }, []);

  //Function to format date display
  const formatScheduledDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'EEE, MMM d • h:mm a');
    }
  };

  //Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'missed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <div className="flex space-x-2">
          <ContactPopup>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
          </ContactPopup>
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
            <CardTitle className="text-sm font-medium">Scheduled Calls</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledCallsToday}</div>
            <p className="text-xs text-muted-foreground">
              Total scheduled • {stats.scheduledCallsThisWeek} today
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

      {/* Upcoming Calls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Upcoming Scheduled Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingCalls.length > 0 ? (
            <div className="space-y-4">
              {upcomingCalls.map((call: ScheduledCall) => (
                <div
                  key={call._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Phone className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{call.contactId.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {call.contactId.company}
                          {call.contactId.position && (
                            <>
                              <MapPin className="h-3 w-3 mx-2" />
                              {call.contactId.position}
                            </>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatScheduledDate(call.scheduledDate)}
                        </p>
                        {call.notes && (
                          <p className="text-sm text-muted-foreground mt-1 italic">
                            "{call.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getStatusColor(call.status)}>
                      {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                    </Badge>
                    <a 
                      href={`tel:${call.contactId.phone}`}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      {call.contactId.phone}
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteScheduledCall(call._id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No upcoming scheduled calls</p>
              <p className="text-sm text-muted-foreground mt-1">
                Schedule calls from the Contacts page to see them here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Contacts and Completed Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            {recentContacts.length > 0 ? (
              <div className="space-y-4">
                {recentContacts.map((contact: Contact) => (
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
                {completedContacts.map((contact: Contact) => (
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