import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, Users, FileText, User, 
  Clock, Activity, Star, Video, RefreshCw, AlertCircle, CheckCircle2 
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import { getDoctorDashboard, updateAppointmentStatus } from '../../services/api';
import toast from 'react-hot-toast';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
  { label: 'Appointments', icon: Calendar, path: '/doctor/appointments' },
  { label: 'Prescriptions', icon: FileText, path: '/doctor/prescriptions' },
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getDoctorDashboard();
      if (res.data && res.data.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = data?.stats || {};
  const todaySchedule = data?.todaySchedule || [];
  const recentAppointments = data?.recentAppointments || [];

  return (
    <DashboardLayout navItems={navItems}>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, Dr. {user?.lastName || user?.firstName}!</h1>
          <p className="text-slate-500">{today} • Doctor Clinical Portal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadData} icon={RefreshCw} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Today's Appointments", value: stats.todayAppointments ?? 0, icon: Clock, color: 'text-sky-600' },
          { label: 'Total Unique Patients', value: stats.totalPatients ?? 0, icon: Users, color: 'text-teal-600' },
          { label: 'Completed Visits', value: stats.completedConsultations ?? 0, icon: Activity, color: 'text-indigo-600' },
          { label: 'Doctor Rating', value: `${stats.rating ?? 4.9} ★`, icon: Star, color: 'text-amber-500' }
        ].map((stat, i) => (
          <Card key={i} className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  Today's Consultation Schedule
                </CardTitle>
                <Badge variant="default">{todaySchedule.length} Scheduled</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <SkeletonLoader count={3} />
              ) : todaySchedule.length > 0 ? (
                <div className="space-y-4">
                  {todaySchedule.map(appt => (
                    <div key={appt.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Avatar initials={`${appt.patient_fn?.[0] || 'P'}${appt.patient_ln?.[0] || 'T'}`} size="md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{appt.patient_fn} {appt.patient_ln}</h4>
                            <span className="text-xs text-slate-500 font-medium">({appt.gender || 'Adult'}, {appt.blood_group || 'O+'})</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Slot: <strong>{appt.time_slot}</strong> • Reason: <span className="text-slate-800 font-medium">{appt.reason || 'General'}</span>
                          </p>
                          {appt.allergies && (
                            <span className="text-[10px] text-rose-600 font-semibold block mt-1">
                              Allergies: {appt.allergies}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm"
                          onClick={() => navigate(`/consultation/${appt.id}`)}
                          icon={Video}
                        >
                          Start Call
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={Calendar} 
                  title="No consultations scheduled for today" 
                  description="New patient bookings will automatically appear in your queue." 
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Patient Activity (1 Col) */}
        <div className="lg:col-span-1">
          <Card className="border-slate-200 h-full">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                Recent Consultations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {recentAppointments.length > 0 ? (
                <div className="divide-y divide-slate-100 space-y-3">
                  {recentAppointments.slice(0, 6).map((appt, i) => (
                    <div key={appt.id} className="pt-3 first:pt-0 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{appt.patient_fn} {appt.patient_ln}</div>
                        <div className="text-slate-400">{appt.date} • {appt.reason || 'Consultation'}</div>
                      </div>
                      <Badge variant={appt.status === 'completed' ? 'success' : 'default'}>
                        {appt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={Users} 
                  title="No patient records yet" 
                  description="Your consultation history will build as patients schedule appointments." 
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
