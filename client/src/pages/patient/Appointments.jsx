import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Brain, Stethoscope, Calendar, 
  FileText, FolderHeart, User, Video, Clock, 
  CheckCircle2, XCircle, AlertCircle, ArrowRight, RefreshCw
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import { getAppointments, updateAppointmentStatus } from '../../services/api';
import toast from 'react-hot-toast';

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
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'completed', 'cancelled'

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await getAppointments();
      if (res.data && res.data.data) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
      toast.error('Unable to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await updateAppointmentStatus(id, 'cancelled');
      toast.success('Appointment cancelled');
      loadAppointments();
    } catch (err) {
      toast.error('Failed to cancel appointment');
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    if (filter === 'upcoming') return appt.status === 'scheduled' || appt.status === 'in-progress';
    if (filter === 'completed') return appt.status === 'completed';
    if (filter === 'cancelled') return appt.status === 'cancelled';
    return true;
  });

  const upcomingCount = appointments.filter(a => a.status === 'scheduled' || a.status === 'in-progress').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-slate-500">Manage your virtual consultations and telemedicine sessions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={loadAppointments} icon={RefreshCw} size="sm">
            Refresh
          </Button>
          <Button onClick={() => navigate('/patient/doctors')} icon={Calendar} size="sm">
            Book New Consultation
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3">
        {[
          { key: 'all', label: `All (${appointments.length})` },
          { key: 'upcoming', label: `Upcoming (${upcomingCount})` },
          { key: 'completed', label: `Completed (${completedCount})` },
          { key: 'cancelled', label: 'Cancelled' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === tab.key
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonLoader count={4} />
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map(appt => {
            const isUpcoming = appt.status === 'scheduled' || appt.status === 'in-progress';
            const isCompleted = appt.status === 'completed';
            const isCancelled = appt.status === 'cancelled';

            return (
              <Card key={appt.id} className="overflow-hidden border-slate-200 hover:border-slate-300 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Doctor Details */}
                    <div className="flex items-start gap-4">
                      <Avatar initials={`${appt.doctor_fn?.[0] || 'D'}${appt.doctor_ln?.[0] || 'R'}`} size="lg" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 text-base">
                            Dr. {appt.doctor_fn} {appt.doctor_ln}
                          </h3>
                          <Badge variant={
                            isCompleted ? 'success' :
                            isUpcoming ? 'default' : 'danger'
                          }>
                            {appt.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs font-semibold text-sky-600">{appt.specialization}</p>
                        <p className="text-xs text-slate-500 mt-1">Reason: <span className="font-medium text-slate-700">{appt.reason || 'General Consultation'}</span></p>
                      </div>
                    </div>

                    {/* Date & Time Slot Info */}
                    <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-start lg:items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-sky-600" />
                        <div>
                          <span className="block text-slate-400 text-[10px]">DATE</span>
                          <span className="font-bold text-slate-900">{appt.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <div>
                          <span className="block text-slate-400 text-[10px]">TIME</span>
                          <span className="font-bold text-slate-900">{appt.time_slot}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-indigo-600" />
                        <div>
                          <span className="block text-slate-400 text-[10px]">MODE</span>
                          <span className="font-bold text-slate-900 capitalize">{appt.type || 'Video'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-2.5">
                      {isUpcoming && (
                        <>
                          <Button 
                            onClick={() => navigate(`/consultation/${appt.id}`)}
                            icon={Video}
                            className="w-full sm:w-auto shadow-sm"
                          >
                            Join Video Consultation
                          </Button>
                          <Button 
                            variant="secondary" 
                            onClick={() => handleCancel(appt.id)}
                            className="w-full sm:w-auto text-rose-600 hover:bg-rose-50"
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {isCompleted && (
                        <Button 
                          variant="secondary"
                          onClick={() => navigate('/patient/prescriptions')}
                          icon={FileText}
                          className="w-full sm:w-auto"
                        >
                          View Prescription
                        </Button>
                      )}

                      {isCancelled && (
                        <Button 
                          variant="secondary"
                          onClick={() => navigate('/patient/doctors')}
                          className="w-full sm:w-auto"
                        >
                          Re-book
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          icon={Calendar}
          title={filter === 'all' ? "No appointments yet" : `No ${filter} appointments found`}
          description={filter === 'all' 
            ? "Book a virtual consultation with one of our certified specialists to receive medical guidance." 
            : `You have no appointments matching the "${filter}" status.`}
          actionText="Find a Doctor"
          onAction={() => navigate('/patient/doctors')}
        />
      )}
    </DashboardLayout>
  );
}
