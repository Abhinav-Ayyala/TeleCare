import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import SymptomChecker from './pages/patient/SymptomChecker';
import DoctorDiscovery from './pages/patient/DoctorDiscovery';
import PatientAppointments from './pages/patient/Appointments';
import Prescriptions from './pages/patient/Prescriptions';
import HealthRecords from './pages/patient/HealthRecords';
import PatientProfile from './pages/patient/Profile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

// Consultation Room
import ConsultationRoom from './pages/ConsultationRoom';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Patient Routes */}
        <Route path="/patient/dashboard" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient/symptom-checker" element={<ProtectedRoute role="patient"><SymptomChecker /></ProtectedRoute>} />
        <Route path="/patient/doctors" element={<ProtectedRoute role="patient"><DoctorDiscovery /></ProtectedRoute>} />
        <Route path="/patient/appointments" element={<ProtectedRoute role="patient"><PatientAppointments /></ProtectedRoute>} />
        <Route path="/patient/prescriptions" element={<ProtectedRoute role="patient"><Prescriptions /></ProtectedRoute>} />
        <Route path="/patient/health-records" element={<ProtectedRoute role="patient"><HealthRecords /></ProtectedRoute>} />
        <Route path="/patient/profile" element={<ProtectedRoute role="patient"><PatientProfile /></ProtectedRoute>} />
        <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />

        {/* Doctor Routes */}
        <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/prescriptions" element={<ProtectedRoute role="doctor"><Prescriptions /></ProtectedRoute>} />
        <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Video Consultation Room (Patient & Doctor) */}
        <Route path="/consultation/:id" element={<ProtectedRoute><ConsultationRoom /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
