import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Brain, Stethoscope, Calendar, 
  FileText, FolderHeart, User, Activity, AlertTriangle, 
  CheckCircle2, Clock, ShieldAlert, Heart, RefreshCw, ArrowRight
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import { getSymptomHistoryApi, getAppointments, getPrescriptions, getPatientProfile } from '../../services/api';
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

export default function HealthRecords() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('symptoms'); // 'symptoms', 'appointments', 'prescriptions', 'profile'
  const [loading, setLoading] = useState(true);
  
  const [symptomHistory, setSymptomHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [profile, setProfile] = useState(null);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [symRes, apptRes, rxRes, profRes] = await Promise.allSettled([
        getSymptomHistoryApi(),
        getAppointments(),
        getPrescriptions(),
        getPatientProfile()
      ]);

      if (symRes.status === 'fulfilled' && symRes.value.data?.data) {
        setSymptomHistory(symRes.value.data.data);
      }
      if (apptRes.status === 'fulfilled' && apptRes.value.data?.data) {
        setAppointments(apptRes.value.data.data);
      }
      if (rxRes.status === 'fulfilled' && rxRes.value.data?.data) {
        setPrescriptions(rxRes.value.data.data);
      }
      if (profRes.status === 'fulfilled' && profRes.value.data?.data) {
        setProfile(profRes.value.data.data);
      }
    } catch (err) {
      console.error('Failed to load health records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <DashboardLayout navItems={navItems}>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Electronic Health Records (EHR)</h1>
          <p className="text-slate-500">Comprehensive chronological timeline of your AI assessments, visits, and clinical records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadAllData} icon={RefreshCw} size="sm">
            Refresh
          </Button>
          <Button onClick={() => navigate('/patient/symptom-checker')} icon={Brain} size="sm">
            New AI Assessment
          </Button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card className="mb-8 border-sky-100 bg-gradient-to-r from-sky-50/50 to-teal-50/50">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">FULL NAME</span>
              <span className="font-bold text-slate-900 text-sm">{profile?.first_name} {profile?.last_name || 'Patient'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">BLOOD GROUP</span>
              <span className="font-bold text-rose-600 text-sm">{profile?.blood_group || 'Not Specified'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">ALLERGIES</span>
              <span className="font-semibold text-slate-800 text-sm">{profile?.allergies || 'None Known'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">TOTAL ASSESSMENTS</span>
              <span className="font-bold text-sky-700 text-sm">{symptomHistory.length} Checks</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3">
        {[
          { key: 'symptoms', label: `AI Triage History (${symptomHistory.length})`, icon: Brain },
          { key: 'appointments', label: `Consultations (${appointments.length})`, icon: Calendar },
          { key: 'prescriptions', label: `Digital Rx (${prescriptions.length})`, icon: FileText },
          { key: 'profile', label: 'Clinical Profile & Vitals', icon: Heart }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === tab.key
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <SkeletonLoader count={3} />
      ) : (
        <>
          {/* TAB 1: SYMPTOMS HISTORY */}
          {activeTab === 'symptoms' && (
            <div className="space-y-4">
              {symptomHistory.length > 0 ? (
                symptomHistory.map(item => {
                  const urgency = item.urgency || item.ai_result?.urgency || 'moderate';
                  return (
                    <Card key={item.id} className="border-slate-200 hover:border-sky-300 transition-all">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {urgency === 'emergency' ? '🔴' : urgency === 'high' ? '🟠' : urgency === 'moderate' ? '🟡' : '🟢'}
                            </span>
                            <h3 className="font-bold text-slate-900 text-base">
                              {item.ai_result?.urgency_label || `${urgency.toUpperCase()} Urgency Assessment`}
                            </h3>
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(item.created_at).toLocaleDateString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>

                        {/* Symptoms Chips */}
                        <div className="mb-4">
                          <span className="text-xs text-slate-500 block mb-1.5 font-medium">REPORTED SYMPTOMS:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {Array.isArray(item.symptoms) && item.symptoms.map((s, i) => (
                              <span key={i} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Top Conditions */}
                        {item.ai_result?.possible_conditions?.length > 0 && (
                          <div className="mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-500 block mb-2 font-medium">IDENTIFIED CONDITIONS:</span>
                            <div className="space-y-2">
                              {item.ai_result.possible_conditions.slice(0, 2).map((c, i) => (
                                <div key={i} className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-slate-800">{c.condition || c.name}</span>
                                  <span className="text-slate-500">Spec: <strong className="text-sky-700">{c.recommended_specialist || c.specialist}</strong></span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2 text-xs">
                          <span className="text-slate-400">Severity: <strong className="text-slate-700 capitalize">{item.severity}</strong> • Duration: {item.duration}</span>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => navigate('/patient/doctors')}
                            icon={ArrowRight}
                          >
                            Consult Doctor
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <EmptyState 
                  icon={Brain}
                  title="No symptom checks recorded"
                  description="Use TeleCare's AI Symptom Checker to record symptoms, evaluate triage urgency, and receive clinical guidance."
                  actionText="Start Symptom Assessment"
                  onAction={() => navigate('/patient/symptom-checker')}
                />
              )}
            </div>
          )}

          {/* TAB 2: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map(appt => (
                  <Card key={appt.id} className="border-slate-200">
                    <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 text-base">Dr. {appt.doctor_fn} {appt.doctor_ln}</h3>
                          <Badge variant={appt.status === 'completed' ? 'success' : appt.status === 'scheduled' ? 'default' : 'neutral'}>
                            {appt.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-sky-600 font-semibold">{appt.specialization}</p>
                        <p className="text-xs text-slate-500 mt-1">Reason: {appt.reason || 'General Consultation'}</p>
                      </div>
                      <div className="text-right text-xs">
                        <div className="font-bold text-slate-900">{appt.date} at {appt.time_slot}</div>
                        <div className="text-slate-400 capitalize">{appt.type} Visit</div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <EmptyState 
                  icon={Calendar}
                  title="No consultations yet"
                  description="All your past and upcoming consultations with doctors will be logged here."
                  actionText="Find a Doctor"
                  onAction={() => navigate('/patient/doctors')}
                />
              )}
            </div>
          )}

          {/* TAB 3: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              {prescriptions.length > 0 ? (
                prescriptions.map(rx => (
                  <Card key={rx.id} className="border-slate-200">
                    <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-sky-600 uppercase">Rx #{rx.id.slice(0, 8)}</span>
                        <h3 className="font-bold text-slate-900 text-base">Diagnosis: {rx.diagnosis}</h3>
                        <p className="text-xs text-slate-500">Issued by Dr. {rx.doctor_fn} {rx.doctor_ln} ({rx.specialization})</p>
                      </div>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => navigate('/patient/prescriptions')}
                        icon={FileText}
                      >
                        View Full Prescription
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <EmptyState 
                  icon={FileText}
                  title="No prescriptions in your records"
                  description="When a doctor writes a prescription for you during a consultation, it will be saved here."
                  actionText="Book Consultation"
                  onAction={() => navigate('/patient/doctors')}
                />
              )}
            </div>
          )}

          {/* TAB 4: CLINICAL PROFILE */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>General Medical Summary</span>
                  <Button variant="secondary" size="sm" onClick={() => navigate('/patient/profile')}>
                    Edit Clinical Details
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block mb-1">DATE OF BIRTH</span>
                    <span className="font-bold text-slate-900 text-sm">{profile?.date_of_birth || 'Not specified'}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block mb-1">GENDER</span>
                    <span className="font-bold text-slate-900 text-sm">{profile?.gender || 'Not specified'}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block mb-1">BLOOD GROUP</span>
                    <span className="font-bold text-rose-600 text-sm">{profile?.blood_group || 'Unknown'}</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">Known Allergies:</span>
                    <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                      {profile?.allergies || 'No allergies recorded.'}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">Medical History / Pre-existing Conditions:</span>
                    <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                      {profile?.medical_history || 'No chronic or previous major medical conditions reported.'}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">Emergency Contact:</span>
                    <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                      {profile?.emergency_contact || 'None specified.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
