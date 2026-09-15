import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Brain, Stethoscope, Calendar, 
  FileText, FolderHeart, User, Activity, Clock, 
  Video, ArrowRight, CheckCircle2, Shield
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
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
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  useEffect(() => {
    getPatientDashboard()
      .then(res => {
        if (res.data && res.data.data) {
          setData(res.data.data);
        }
      })
      .catch(err => console.error('Dashboard error:', err))
      .finally(() => setLoading(false));
  }, []);

  const upcomingAppointments = data?.recentAppointments?.filter(a => a.status === 'scheduled' || a.status === 'in-progress') || [];

  return (
    <DashboardLayout navItems={navItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.firstName}!</h1>
        <p className="text-slate-500">{today} • TeleCare Patient Portal</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/patient/symptom-checker">
          <Card className="hover:border-sky-500 hover:shadow-md transition-all cursor-pointer h-full border-sky-100 bg-sky-50/50">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-sky-500 p-3 rounded-xl shadow-sm">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">AI Symptom Checker</h3>
                <p className="text-xs text-slate-500 mt-0.5">Clinical triage & specialist guide</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/patient/doctors">
          <Card className="hover:border-teal-500 hover:shadow-md transition-all cursor-pointer h-full border-teal-100 bg-teal-50/50">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-teal-500 p-3 rounded-xl shadow-sm">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Find a Doctor</h3>
                <p className="text-xs text-slate-500 mt-0.5">Browse 8+ medical specialties</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/patient/appointments">
          <Card className="hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer h-full border-indigo-100 bg-indigo-50/50">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-indigo-500 p-3 rounded-xl shadow-sm">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">My Appointments</h3>
                <p className="text-xs text-slate-500 mt-0.5">Join virtual consultation room</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Upcoming Consultations', value: data?.upcomingCount ?? 0, icon: Clock, color: 'text-sky-600' },
          { label: 'Digital Prescriptions', value: data?.prescriptionsCount ?? 0, icon: FileText, color: 'text-emerald-600' },
          { label: 'AI Symptom Checks', value: data?.symptomsCount ?? 0, icon: Activity, color: 'text-amber-600' },
          { label: 'Health Record Status', value: 'Active', icon: FolderHeart, color: 'text-rose-600' }
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Consultations */}
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold">Upcoming Consultations</CardTitle>
              <Link to="/patient/appointments" className="text-xs text-sky-600 font-semibold hover:underline">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 3).map(appt => (
                  <div key={appt.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Dr. {appt.doctor_first_name} {appt.doctor_last_name}</h4>
                      <p className="text-xs text-slate-500">{appt.date} at {appt.time_slot}</p>
                      <Badge variant="default" className="mt-1.5">{appt.status.toUpperCase()}</Badge>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/consultation/${appt.id}`)}
                      icon={Video}
                    >
                      Join Call
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={Calendar} 
                title="No upcoming appointments" 
                description="You don't have any video appointments scheduled." 
                actionText="Find a Doctor"
                onAction={() => navigate('/patient/doctors')}
              />
            )}
          </CardContent>
        </Card>

        {/* Clinical Activity & AI Quick Check */}
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold">AI Clinical Health Assistant</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="p-4 bg-gradient-to-r from-sky-50 to-teal-50 rounded-xl border border-sky-100">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Feeling unwell today?</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Enter your symptoms into our medical triage engine to receive preliminary guidance, urgency classification, and direct specialist matching.
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-3" 
                    onClick={() => navigate('/patient/symptom-checker')}
                    icon={ArrowRight}
                  >
                    Start Symptom Check
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Verified Patient Safeguards</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>End-to-End Encrypted WebRTC Video Consultation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Licensed Medical Practitioners across 8 Specialties</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Instant Digitally Signed Medical Prescriptions</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
