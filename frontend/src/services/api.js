import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // enable sending cookies
});

export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const signupUser = (data) => api.post('/auth/signup', data);
export const fetchProfile = () => api.get('/employees/profile');
export const updateAvailability = (data) => api.post('/employees/availability', data);
export const fetchShifts = (params) => api.get('/employees/shifts', { params });
export const generateSchedule = (data) => api.post('/admin/schedule/generate', data);
export const updateSeniority = (employeeId, data) => api.patch(`/admin/employees/${employeeId}/seniority`, data);

export default api;
