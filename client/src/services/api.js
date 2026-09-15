import _axios from 'axios';

const api = _axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      const p = window.location.pathname;
      if (p !== '/login' && p !== '/register' && p !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginApi = (data) => api.post('/auth/login', data);
export const registerApi = (data) => api.post('/auth/register', data);
export const getMeApi = () => api.get('/auth/me');

// Doctors
export const getDoctors = (params) => api.get('/doctors', { params });
export const getDoctor = (id) => api.get(`/doctors/${id}`);
export const getDoctorDashboard = () => api.get('/doctors/dashboard');

// Symptoms AI
export const analyzeSymptomsApi = (data) => api.post('/symptoms/analyze', data);
export const getSymptomHistoryApi = () => api.get('/symptoms/history');

// Appointments
export const getAppointments = () => api.get('/appointments');
export const getAppointment = (id) => api.get(`/appointments/${id}`);
export const createAppointment = (data) => api.post('/appointments', data);
export const updateAppointmentStatus = (id, status) => api.put(`/appointments/${id}/status`, { status });
export const getAvailableSlots = (doctorId, date) => api.get(`/appointments/slots/${doctorId}/${date}`);

// Prescriptions
export const getPrescriptions = () => api.get('/prescriptions');
export const getPrescription = (id) => api.get(`/prescriptions/${id}`);
export const createPrescription = (data) => api.post('/prescriptions', data);

// Patients
export const getPatientDashboard = () => api.get('/patients/dashboard');
export const getPatientProfile = () => api.get('/patients/profile');
export const updatePatientProfile = (data) => api.put('/patients/profile', data);

// Admin
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = () => api.get('/admin/users');
export const toggleUserStatus = (id) => api.put(`/admin/users/${id}/status`);

export default api;
