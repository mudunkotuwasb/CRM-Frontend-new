import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
  withCredentials: true
})

//Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    const cleanToken = token.replace('Bearer ', '')
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
})

//Response interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.includes('/auth/login')) {
        handleLocalStorageRemoval();
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error)
  }
)

function handleLocalStorageRemoval() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userId')
  localStorage.removeItem('isAuthenticated')
}
export default api;