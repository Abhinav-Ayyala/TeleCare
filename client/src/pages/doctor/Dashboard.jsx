import React from 'react';
import { LayoutDashboard, Calendar, Users, FileText, User, Clock, Activity, Star } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
  { label: 'Appointments', icon: Calendar, path: '/doctor/appointments' },
  { label: 'My Patients', icon: Users, path: '/doctor/patients' },
  { label: 'Prescriptions', icon: FileText, path: '/doctor/prescriptions' },
  { label: 'Profile', icon: User, path: '/doctor/profile' },
];

export default function Dashboard() {
  const { user } = useAuth();
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <DashboardLayout navItems={navItems}>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, Dr. {user?.lastName}!</h1>
          <p className="text-slate-500">{today}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">View Schedule</Button>
          <Button>Write Prescription</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Today's Appointments", value: '0', icon: Clock, color: 'text-sky-600' },
          { label: 'Total Patients', value: '0', icon: Users, color: 'text-teal-600' },
          { label: 'Total Consultations', value: '0', icon: Activity, color: 'text-indigo-600' },
          { label: 'Rating', value: '5.0', icon: Star, color: 'text-amber-500' }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState 
                icon={Calendar} 
                title="No appointments today" 
                description="You don't have any appointments scheduled for today." 
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState 
                icon={Users} 
                title="No recent patients" 
                description="Your patient list is empty." 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
