const endpoints = {
  auth: {
    login: `/auth/login`,
    register: `/auth/register`,
    logout: `/auth/logout`
  },
  contact: {
    addContact: `/contact-manager/addContact`,
    getAllContacts: `/contact-manager/allContacts`,
     assignContacts: `/contact-manager/assignContacts`,
     getContactDetails: `/contact-manager/getContact`,
     getContactsByAdminId: `/contact-manager/getContactsByAdminId`,
     updateContact: (id: string) => `/contact-manager/updateContact/${id}`,
     updateStatus: "/contact-manager/updateStatus",
     deleteContact: (id: string) => `/contact-manager/delete/${id}`,
     addNote: (contactId: string) => `/contact-manager/${contactId}/notes`,
     deleteContactHistory: (contactId: string, historyId: number) => `/contact-manager/${contactId}/history/${historyId}`,
     scheduleCalls: `/contact-manager/scheduleCalls`,
     getScheduledCalls: `/contact-manager/scheduledCalls`,
     deleteScheduledCall: (id: string) => `/contact-manager/scheduledCalls/${id}`,
    
  }
} as const;

export default endpoints;
