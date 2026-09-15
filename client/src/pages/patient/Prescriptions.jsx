import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Brain, Stethoscope, Calendar, 
  FileText, FolderHeart, User, Printer, Download, 
  Search, Pill, Clock, CheckCircle, X
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import { getPrescriptions } from '../../services/api';
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

export default function Prescriptions() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState(null);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await getPrescriptions();
      if (res.data && res.data.data) {
        setPrescriptions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
      toast.error('Unable to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Prescriptions</h1>
          <p className="text-slate-500">Access and download digital medical prescriptions issued by your doctors</p>
        </div>
        <Button onClick={() => navigate('/patient/doctors')} icon={Calendar} size="sm">
          Book Consultation
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <SkeletonLoader count={3} />
        </div>
      ) : prescriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prescriptions.map(rx => (
            <Card key={rx.id} className="hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                      Prescription #{rx.id.slice(0, 8)}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">
                      Dr. {rx.doctor_fn} {rx.doctor_ln}
                    </h3>
                    <p className="text-xs text-slate-500">{rx.specialization} • {rx.qualification}</p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    {new Date(rx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">PRIMARY DIAGNOSIS</span>
                    <span className="text-sm font-semibold text-slate-900">{rx.diagnosis}</span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block font-medium mb-1">PRESCRIBED MEDICATIONS</span>
                    <div className="space-y-1.5">
                      {Array.isArray(rx.medications) && rx.medications.length > 0 ? (
                        rx.medications.map((med, i) => (
                          <div key={i} className="text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                              <Pill className="w-3.5 h-3.5 text-sky-500" />
                              {med.name || med.medicine_name}
                            </span>
                            <span className="text-slate-500 font-medium">{med.dosage} • {med.frequency}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic">No specific medications itemized.</p>
                      )}
                    </div>
                  </div>

                  {rx.instructions && (
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">INSTRUCTIONS</span>
                      <p className="text-xs text-slate-600 line-clamp-2">{rx.instructions}</p>
                    </div>
                  )}

                  {rx.follow_up_date && (
                    <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      Follow-up recommended by: <strong>{rx.follow_up_date}</strong>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex gap-2">
                  <Button 
                    onClick={() => setSelectedRx(rx)} 
                    fullWidth 
                    variant="secondary"
                    size="sm"
                    icon={FileText}
                  >
                    View Official Rx
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={FileText}
          title="No digital prescriptions yet"
          description="Prescriptions issued by doctors during or after your consultations will automatically appear here."
          actionText="Consult a Doctor"
          onAction={() => navigate('/patient/doctors')}
        />
      )}

      {/* OFFICIAL PRESCRIPTION MODAL */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-slate-200 print:m-0 print:p-0 print:border-none print:shadow-none">
            {/* Action Bar (hidden in print) */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden rounded-t-2xl">
              <span className="text-xs font-semibold text-slate-500">Official Electronic Prescription</span>
              <div className="flex items-center gap-2">
                <Button onClick={handlePrint} variant="secondary" size="sm" icon={Printer}>
                  Print / Save PDF
                </Button>
                <button 
                  type="button" 
                  onClick={() => setSelectedRx(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Prescription Document */}
            <div className="p-8 space-y-6 print:p-0">
              {/* Rx Clinic Header */}
              <div className="flex justify-between items-start border-b-2 border-sky-600 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-sky-700 tracking-tight flex items-center gap-2">
                    <span>TeleCare</span>
                    <span className="text-xs font-normal text-slate-500">Digital Health Clinic</span>
                  </h2>
                  <p className="text-sm font-bold text-slate-900 mt-1">Dr. {selectedRx.doctor_fn} {selectedRx.doctor_ln}</p>
                  <p className="text-xs text-slate-600">{selectedRx.specialization} • {selectedRx.qualification}</p>
                  <p className="text-xs text-slate-400">Reg No: MED-IN-{selectedRx.doctor_id?.slice(0, 6)?.toUpperCase() || '2024-TC'}</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <div className="text-2xl font-serif text-sky-600 font-bold">℞</div>
                  <div>Date: <strong>{new Date(selectedRx.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</strong></div>
                  <div>Rx ID: <strong>{selectedRx.id.slice(0, 8).toUpperCase()}</strong></div>
                </div>
              </div>

              {/* Patient Info Row */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">PATIENT NAME</span>
                  <span className="font-bold text-slate-900">{selectedRx.patient_fn} {selectedRx.patient_ln || 'Patient'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">GENDER / AGE</span>
                  <span className="font-semibold text-slate-800">{selectedRx.gender || 'Adult'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">BLOOD GROUP</span>
                  <span className="font-semibold text-slate-800">{selectedRx.blood_group || 'O+'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CONSULTATION</span>
                  <span className="font-semibold text-emerald-700">Verified Virtual Visit</span>
                </div>
              </div>

              {/* Clinical Diagnosis */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Clinical Diagnosis</span>
                <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-lg text-sm font-bold text-sky-950">
                  {selectedRx.diagnosis}
                </div>
              </div>

              {/* Rx Medications Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Rx Prescribed Medications</span>
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Medicine Name</th>
                      <th className="p-2.5">Dosage</th>
                      <th className="p-2.5">Frequency</th>
                      <th className="p-2.5">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Array.isArray(selectedRx.medications) && selectedRx.medications.length > 0 ? (
                      selectedRx.medications.map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-400">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">{med.name || med.medicine_name}</td>
                          <td className="p-2.5 text-slate-700">{med.dosage}</td>
                          <td className="p-2.5 text-slate-700">{med.frequency}</td>
                          <td className="p-2.5 text-slate-700">{med.duration || '5 Days'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-3 text-center text-slate-400 italic">No medications recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Advice & Instructions */}
              {selectedRx.instructions && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Special Instructions & Diet</span>
                  <p className="text-xs text-slate-700 p-3 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed">
                    {selectedRx.instructions}
                  </p>
                </div>
              )}

              {/* Follow-up & Footer Signature */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                <div className="text-xs text-slate-500 space-y-1">
                  {selectedRx.follow_up_date && (
                    <p>Next Follow-up Date: <strong className="text-slate-800">{selectedRx.follow_up_date}</strong></p>
                  )}
                  <p className="text-[10px] text-slate-400">Valid digital prescription generated via TeleCare Telemedicine System.</p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-serif italic text-slate-800 font-semibold mb-1">
                    Dr. {selectedRx.doctor_fn} {selectedRx.doctor_ln}
                  </div>
                  <div className="border-t border-slate-400 w-36 ml-auto pt-0.5 text-[10px] text-slate-400 uppercase">
                    Authorized Signatory
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
