import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Brain, Stethoscope, Calendar, 
  FileText, FolderHeart, User, Search, Star, Clock, 
  Video, CheckCircle, AlertCircle, X, Shield, ArrowRight
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import { getDoctors, getAvailableSlots, createAppointment } from '../../services/api';
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

const SPECIALIZATIONS = [
  'All Specialties',
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Neurologist',
  'Psychiatrist',
  'Orthopedic',
  'Gynecologist',
  'Pulmonologist'
];

export default function DoctorDiscovery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialSpecialization = searchParams.get('specialization') || 'All Specialties';
  
  const [selectedSpecialization, setSelectedSpecialization] = useState(initialSpecialization);
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultationType, setConsultationType] = useState('video');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Sync specialization from URL param if changed externally
  useEffect(() => {
    const sp = searchParams.get('specialization');
    if (sp) {
      setSelectedSpecialization(sp);
    }
  }, [searchParams]);

  // Fetch doctors from database
  const loadDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSpecialization && selectedSpecialization !== 'All Specialties') {
        params.specialization = selectedSpecialization;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const res = await getDoctors(params);
      if (res.data && res.data.data) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
      toast.error('Unable to fetch doctors list. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [selectedSpecialization]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDoctors();
  };

  // Open booking modal
  const handleOpenBooking = async (doctor) => {
    setBookingDoctor(doctor);
    setSelectedSlot('');
    setReason('Follow-up consultation after AI symptom assessment');
    setNotes('');
    loadSlots(doctor.id, bookingDate);
  };

  // Load available time slots for chosen doctor and date
  const loadSlots = async (doctorId, date) => {
    setSlotsLoading(true);
    try {
      const res = await getAvailableSlots(doctorId, date);
      if (res.data && res.data.data) {
        setAvailableSlots(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedSlot(res.data.data[0]);
        } else {
          setSelectedSlot('');
        }
      }
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      // Fallback default slots if server endpoint has an issue
      const defaultSlots = ['09:30', '10:00', '11:00', '14:00', '15:30', '16:00'];
      setAvailableSlots(defaultSlots);
      setSelectedSlot(defaultSlots[0]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    setBookingDate(newDate);
    if (bookingDoctor) {
      loadSlots(bookingDoctor.id, newDate);
    }
  };

  // Submit appointment booking
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast.error('Please select an available time slot');
      return;
    }

    setBookingSubmitting(true);
    try {
      const payload = {
        doctor_id: bookingDoctor.id,
        date: bookingDate,
        time_slot: selectedSlot,
        type: consultationType,
        reason: reason.trim() || 'General Consultation',
        notes: notes.trim()
      };

      const res = await createAppointment(payload);
      if (res.data && res.data.success) {
        toast.success(`Appointment confirmed with Dr. ${bookingDoctor.first_name} ${bookingDoctor.last_name}!`);
        setBookingDoctor(null);
        navigate('/patient/appointments');
      } else {
        throw new Error(res.data?.error || 'Booking failed');
      }
    } catch (err) {
      console.error('Booking error:', err);
      toast.error(err.response?.data?.error || err.message || 'Failed to book appointment');
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Find a Doctor & Book Consultation</h1>
        <p className="text-slate-500">Connect with certified specialists for immediate or scheduled video appointments</p>
      </div>

      {/* Filters Card */}
      <Card className="mb-8 border-slate-200">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Search Doctor or Specialty</label>
              <Input 
                icon={Search} 
                placeholder="Search by doctor name, qualification, or illness..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Medical Specialization</label>
              <select
                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm px-4 py-2.5 border outline-none bg-white font-medium text-slate-800"
                value={selectedSpecialization}
                onChange={(e) => {
                  setSelectedSpecialization(e.target.value);
                  setSearchParams({ specialization: e.target.value });
                }}
              >
                {SPECIALIZATIONS.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex items-end">
              <Button type="submit" className="w-full" size="md">
                Filter
              </Button>
            </div>
          </form>

          {/* Quick pills */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500 py-1 font-medium">Quick Specializations:</span>
            {['General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist'].map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => {
                  setSelectedSpecialization(spec);
                  setSearchParams({ specialization: spec });
                }}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors border ${
                  selectedSpecialization === spec 
                    ? 'bg-sky-500 text-white border-sky-500' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-sky-300'
                }`}
              >
                {spec}
              </button>
            ))}
            {selectedSpecialization !== 'All Specialties' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSpecialization('All Specialties');
                  setSearchParams({});
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1"
              >
                Reset Filter
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Doctor Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonLoader count={6} />
        </div>
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(doctor => (
            <Card key={doctor.id} className="flex flex-col hover:border-sky-300 hover:shadow-md transition-all">
              <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar initials={`${doctor.first_name?.[0] || 'D'}${doctor.last_name?.[0] || 'R'}`} size="lg" />
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">Dr. {doctor.first_name} {doctor.last_name}</h3>
                        <p className="text-xs font-semibold text-sky-600">{doctor.specialization}</p>
                        <p className="text-xs text-slate-500">{doctor.qualification}</p>
                      </div>
                    </div>
                  </div>

                  {doctor.bio && (
                    <p className="text-xs text-slate-600 mb-4 line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      "{doctor.bio}"
                    </p>
                  )}

                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Experience</span>
                      <span className="font-semibold text-slate-900">{doctor.experience_years} Years</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 flex items-center gap-1"><Video className="w-3.5 h-3.5" /> Consultation Mode</span>
                      <span className="font-semibold text-emerald-600">Video & Audio</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Consultation Fee</span>
                      <span className="font-bold text-slate-900 text-sm">₹{doctor.consultation_fee}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Rating</span>
                      <span className="font-medium text-slate-900 flex items-center">
                        <Star className="w-3.5 h-3.5 text-amber-400 mr-1 fill-current" />
                        {doctor.rating || 4.8} / 5.0
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    onClick={() => handleOpenBooking(doctor)} 
                    fullWidth 
                    icon={Calendar}
                  >
                    Book Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={Search}
          title="No doctors match your criteria"
          description="We couldn't find any doctors with the selected filters. Try changing your specialty or search query."
          actionText="View All Doctors"
          onAction={() => {
            setSelectedSpecialization('All Specialties');
            setSearchQuery('');
            setSearchParams({});
          }}
        />
      )}

      {/* BOOKING MODAL */}
      {bookingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider">Schedule Consultation</span>
                <h3 className="text-lg font-bold text-slate-900">
                  Dr. {bookingDoctor.first_name} {bookingDoctor.last_name}
                </h3>
                <p className="text-xs text-slate-500">{bookingDoctor.specialization} • {bookingDoctor.qualification}</p>
              </div>
              <button 
                type="button"
                onClick={() => setBookingDoctor(null)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmBooking} className="p-6 space-y-5">
              {/* Consultation Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Consultation Medium</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultationType('video')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      consultationType === 'video'
                        ? 'bg-sky-50 border-sky-500 text-sky-900 ring-2 ring-sky-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-5 h-5 text-sky-600" />
                    <div>
                      <div className="font-bold text-xs">Video Call</div>
                      <div className="text-[10px] text-slate-500">Interactive HD WebRTC</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultationType('audio')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      consultationType === 'audio'
                        ? 'bg-sky-50 border-sky-500 text-sky-900 ring-2 ring-sky-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-5 h-5 text-teal-600" />
                    <div>
                      <div className="font-bold text-xs">Audio Consultation</div>
                      <div className="text-[10px] text-slate-500">Voice-only call</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Consultation Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm px-4 py-2 border outline-none bg-white font-medium text-slate-800"
                  required
                />
              </div>

              {/* Time Slot Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700">Available Time Slots</label>
                  {slotsLoading && <span className="text-[10px] text-sky-600 animate-pulse">Checking doctor availability...</span>}
                </div>
                
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium text-center border transition-all ${
                          selectedSlot === slot 
                            ? 'bg-sky-600 text-white border-sky-600 font-bold shadow-sm ring-2 ring-sky-200' 
                            : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-slate-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs">
                    No slots available on this date. Please pick a different date.
                  </div>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reason for Consultation</label>
                <input
                  type="text"
                  placeholder="e.g., Fever and persistent cough, follow-up after triage"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm px-4 py-2 border outline-none bg-white"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Medical Notes / Context (optional)</label>
                <textarea
                  rows="2"
                  placeholder="Any allergies, previous medications, or specific questions for the doctor..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm px-4 py-2 border outline-none resize-none bg-white"
                ></textarea>
              </div>

              {/* Summary Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500 block">Consultation Fee</span>
                  <span className="text-base font-bold text-slate-900">₹{bookingDoctor.consultation_fee}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Mode</span>
                  <span className="font-semibold text-sky-700 uppercase">{consultationType} Call</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setBookingDoctor(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  loading={bookingSubmitting} 
                  disabled={!selectedSlot || availableSlots.length === 0}
                  className="flex-1"
                  icon={CheckCircle}
                >
                  Confirm Appointment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
