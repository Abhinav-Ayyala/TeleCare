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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const loginApi = (data) => api.post('/auth/login', data);
export const registerApi = (data) => api.post('/auth/register', data);
export const getMeApi = () => api.get('/auth/me');

export const getDoctors = (params) => api.get('/doctors', { params });
export const getDoctor = (id) => api.get(`/doctors/${id}`);

export const analyzeSymptomsApi = (data) => api.post('/patient/symptom-checker', data);
export const getPatientDashboard = () => api.get('/patient/dashboard');
export const getAppointments = () => api.get('/patient/appointments');
export const createAppointment = (data) => api.post('/patient/appointments', data);

export const getDoctorDashboard = () => api.get('/doctor/dashboard');
export const getAvailableSlots = (doctorId, date) => api.get(`/doctors/${doctorId}/slots`, { params: { date } });

export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = () => api.get('/admin/users');

export default api;
