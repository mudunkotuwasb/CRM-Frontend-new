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
    
  }
} as const;

export default endpoints;
