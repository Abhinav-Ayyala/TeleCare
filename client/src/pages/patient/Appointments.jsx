import React from 'react';
import { LayoutDashboard, Brain, Stethoscope, Calendar, FileText, FolderHeart, User } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EmptyState from '../../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/patient/dashboard' },
  { label: 'Symptom Checker', icon: Brain, path: '/patient/symptom-checker' },
  { label: 'Find Doctors', icon: Stethoscope, path: '/patient/doctors' },
  { label: 'Appointments', icon: Calendar, path: '/patient/appointments' },
  { label: 'Prescriptions', icon: FileText, path: '/patient/prescriptions' },
  { label: 'Health Records', icon: FolderHeart, path: '/patient/health-records' },
  { label: 'Profile', icon: User, path: '/patient/profile' },
];

export default function Appointments() {
  const navigate = useNavigate();

  return (
    <DashboardLayout navItems={navItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
        <p className="text-slate-500">Manage your upcoming and past consultations</p>
      </div>

      <EmptyState 
        icon={Calendar}
        title="No appointments yet"
        description="Book a consultation with a doctor to get started."
        actionText="Find a Doctor"
        onAction={() => navigate('/patient/doctors')}
      />
    </DashboardLayout>
  );
}
