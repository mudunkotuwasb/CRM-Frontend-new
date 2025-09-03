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
import { Flame, Mail } from "lucide-react"


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
    hotLeads: 0 ,
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
  const [hotLeads, setHotLeads] = useState<Contact[]>([]);

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
        
        setUpcomingCalls(upcoming.slice(0, 3)); //Show 3 upcoming calls

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

  useEffect(() => {
    const filterHotLeads = async () => {
      try {
        const response = await api.get(endpoints.contact.getAllContacts, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.allContacts) {
          const hotLeadsData = response.data.allContacts
            .filter((contact: Contact) => contact.status === "HOT LEAD")
            .slice(0, 3); // Show top 3 hot leads
          setHotLeads(hotLeadsData);
          setStats(prevStats => ({
            ...prevStats,
            hotLeads: hotLeadsData.length
          }));
        }
      } catch (error) {
        console.error("Error fetching hot leads:", error);
      }
    };

    filterHotLeads();
  }, []);

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

  // Function to format phone number
  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if the number has 10 digits
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    // Return original if format doesn't match expected pattern
    return phone;
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.hotLeads}</div>
          <p className="text-xs text-muted-foreground">Active hot leads</p>
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

      {/* Hot Leads and Upcoming Calls Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hot Leads Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Flame className="h-5 w-5 mr-2 text-orange-500" />
              Hot Leads ({hotLeads.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {hotLeads.length > 0 ? (
              <div className="space-y-3">
                {hotLeads.map((lead: Contact) => (
                  <div
                    key={lead._id}
                    className="p-3 border rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="bg-orange-100 p-1 rounded-full">
                            <Flame className="h-3 w-3 text-orange-600" />
                          </div>
                          <p className="font-medium text-sm">{lead.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center mb-1">
                          <Building className="h-3 w-3 mr-1" />
                          {lead.company}
                        </p>
                        {lead.position && (
                          <p className="text-xs text-muted-foreground flex items-center mb-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {lead.position}
                          </p>
                        )}
                        <div className="flex flex-col space-y-1 mt-2">
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatPhoneNumber(lead.phone)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground truncate">
                              {lead.email}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <a 
                            href={`tel:${lead.phone}`}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </a>
                          <a 
                            href={`mailto:${lead.email}`}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </a>
                        </div>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800 text-xs">
                        Hot Lead
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Flame className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">No hot leads found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mark contacts as Hot Leads to see them here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Calls Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              Upcoming Calls ({upcomingCalls.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {upcomingCalls.length > 0 ? (
              <div className="space-y-3">
                {upcomingCalls.map((call: ScheduledCall) => (
                  <div
                    key={call._id}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="bg-blue-100 p-1 rounded-full">
                            <Phone className="h-3 w-3 text-blue-600" />
                          </div>
                          <p className="font-medium text-sm">{call.contactId.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center mb-1">
                          <Building className="h-3 w-3 mr-1" />
                          {call.contactId.company}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center mb-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatScheduledDate(call.scheduledDate)}
                        </p>
                        {call.notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            "{call.notes}"
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <a 
                            href={`tel:${call.contactId.phone}`}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            {formatPhoneNumber(call.contactId.phone)}
                          </a>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteScheduledCall(call._id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-100 text-xs h-6 px-2"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                      <Badge className={getStatusColor(call.status) + " text-xs"}>
                        {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">No upcoming scheduled calls</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Schedule calls from the Contacts page to see them here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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