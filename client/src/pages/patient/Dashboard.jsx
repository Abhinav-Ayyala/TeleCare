import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Brain, Stethoscope, Calendar, 
  FileText, FolderHeart, User, Activity, Clock
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { getPatientDashboard } from '../../services/api';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/patient/dashboard' },
  { label: 'Symptom Checker', icon: Brain, path: '/patient/symptom-checker' },
  { label: 'Find Doctors', icon: Stethoscope, path: '/patient/doctors' },
  { label: 'Appointments', icon: Calendar, path: '/patient/appointments' },
  { label: 'Prescriptions', icon: FileText, path: '/patient/prescriptions' },
  { label: 'Health Records', icon: FolderHeart, path: '/patient/health-records' },
  { label: 'Profile', icon: User, path: '/patient/profile' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <DashboardLayout navItems={navItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.firstName}!</h1>
        <p className="text-slate-500">{today}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/patient/symptom-checker">
          <Card className="hover:border-sky-500 hover:shadow-md transition-all cursor-pointer h-full border-sky-100 bg-sky-50/50">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-sky-500 p-3 rounded-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Symptom Checker</h3>
                <p className="text-sm text-slate-500">AI preliminary assessment</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/patient/doctors">
          <Card className="hover:border-teal-500 hover:shadow-md transition-all cursor-pointer h-full border-teal-100 bg-teal-50/50">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-teal-500 p-3 rounded-xl">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Find a Doctor</h3>
                <p className="text-sm text-slate-500">Browse & book specialists</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/patient/appointments">
          <Card className="hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer h-full border-indigo-100 bg-indigo-50/50">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-indigo-500 p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Book Appointment</h3>
                <p className="text-sm text-slate-500">Schedule a consultation</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Upcoming Apps', value: '0', icon: Clock, color: 'text-sky-600' },
          { label: 'Prescriptions', value: '0', icon: FileText, color: 'text-emerald-600' },
          { label: 'Symptom Checks', value: '0', icon: Activity, color: 'text-amber-600' },
          { label: 'Health Score', value: '95', icon: FolderHeart, color: 'text-rose-600' }
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState 
              icon={Calendar} 
              title="No upcoming appointments" 
              description="You don't have any appointments scheduled yet." 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState 
              icon={Activity} 
              title="No recent activity" 
              description="Your recent symptom checks and consultations will appear here." 
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
