import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, Share2, 
  MessageSquare, FileText, User, AlertTriangle, 
  CheckCircle2, Plus, Trash2, Send, Clock, ShieldCheck, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAppointment, createPrescription, updateAppointmentStatus } from '../services/api';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';

export default function ConsultationRoom() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Media state
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [cameraError, setCameraError] = useState(false);

  // In-call tabs
  const [activePanel, setActivePanel] = useState('clinical'); // 'clinical', 'chat', 'rx'
  const [chatMessages, setChatMessages] = useState([
    { sender: 'System', text: 'Secure WebRTC end-to-end encrypted consultation initialized.', time: 'Just now' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Prescription modal / form state
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxDiagnosis, setRxDiagnosis] = useState('');
  const [rxMedications, setRxMedications] = useState([
    { name: 'Paracetamol', dosage: '500mg', frequency: '1-0-1 (After food)', duration: '5 Days' }
  ]);
  const [rxInstructions, setRxInstructions] = useState('Stay well hydrated and get adequate rest. Avoid cold foods.');
  const [rxFollowUp, setRxFollowUp] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  });
  const [rxSubmitting, setRxSubmitting] = useState(false);
  const [issuedRx, setIssuedRx] = useState(null);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  // Load appointment details
  useEffect(() => {
    getAppointment(id)
      .then(res => {
        if (res.data && res.data.data) {
          setAppointment(res.data.data);
          setRxDiagnosis(res.data.data.reason || 'Acute Viral Infection');
          if (res.data.data.prescription) {
            setIssuedRx(res.data.data.prescription);
          }
        } else {
          toast.error('Appointment not found');
        }
      })
      .catch(err => {
        console.error('Failed to load consultation:', err);
        toast.error('Unable to load appointment');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Request camera and microphone
  useEffect(() => {
    let stream = null;
    navigator.mediaDevices?.getUserMedia?.({ video: true, audio: true })
      .then(s => {
        stream = s;
        localStreamRef.current = s;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = s;
        }
        setCameraError(false);
      })
      .catch(err => {
        console.warn('Webcam permission not granted or device not found:', err.message);
        setCameraError(true);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !micActive;
      });
    }
    setMicActive(!micActive);
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !cameraActive;
      });
    }
    setCameraActive(!cameraActive);
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setScreenSharing(true);
        stream.getVideoTracks()[0].onended = () => {
          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
          setScreenSharing(false);
        };
      } catch (e) {
        toast.error('Screen sharing was cancelled');
      }
    } else {
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      setScreenSharing(false);
    }
  };

  const handleEndCall = () => {
    if (window.confirm('Are you sure you want to end this consultation?')) {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (user?.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/appointments');
      }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      sender: user?.firstName || (user?.role === 'doctor' ? 'Doctor' : 'Patient'),
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  // Prescription functions
  const addMedicationRow = () => {
    setRxMedications(prev => [
      ...prev,
      { name: '', dosage: '500mg', frequency: '1-0-1', duration: '5 Days' }
    ]);
  };

  const removeMedicationRow = (index) => {
    setRxMedications(prev => prev.filter((_, i) => i !== index));
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...rxMedications];
    updated[index][field] = value;
    setRxMedications(updated);
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    if (!rxDiagnosis.trim()) {
      toast.error('Diagnosis is required');
      return;
    }

    setRxSubmitting(true);
    try {
      const payload = {
        appointment_id: id,
        patient_id: appointment.patient_id,
        diagnosis: rxDiagnosis.trim(),
        medications: rxMedications.filter(m => m.name.trim()),
        instructions: rxInstructions.trim(),
        follow_up_date: rxFollowUp
      };

      const res = await createPrescription(payload);
      if (res.data && res.data.success) {
        toast.success('Digital prescription generated and saved to Patient EHR!');
        setShowRxModal(false);
        setIssuedRx(payload);
        setChatMessages(prev => [
          ...prev,
          { sender: 'Dr. ' + (user?.lastName || 'Doctor'), text: `📄 Official prescription issued for: ${rxDiagnosis}. Saved to patient records.`, time: 'Just now' }
        ]);
      } else {
        throw new Error(res.data?.error || 'Failed to save');
      }
    } catch (err) {
      console.error('Prescription save error:', err);
      toast.error(err.response?.data?.error || 'Failed to generate prescription');
    } finally {
      setRxSubmitting(false);
    }
  };

  const isDoctor = user?.role === 'doctor';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <Activity className="w-10 h-10 text-sky-400 animate-spin mx-auto" />
          <p className="text-sm font-medium">Connecting to secure consultation room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      {/* Top Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-white">
              TC
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-tight">TeleCare Virtual Clinic</span>
              <span className="text-[10px] text-emerald-400 block flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Encrypted Peer Session
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Duration: <strong className="text-white font-mono">{formatTimer(callDuration)}</strong></span>
          </div>
        </div>

        {/* User Info & Mode */}
        <div className="flex items-center gap-3">
          <Badge variant={isDoctor ? 'warning' : 'default'} className="uppercase text-[10px]">
            {isDoctor ? 'Doctor Session' : 'Patient Session'}
          </Badge>

          {isDoctor && (
            <Button 
              size="sm" 
              onClick={() => setShowRxModal(true)} 
              icon={FileText}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Write Prescription
            </Button>
          )}

          <Button 
            variant="danger" 
            size="sm" 
            onClick={handleEndCall}
            icon={PhoneOff}
          >
            Leave
          </Button>
        </div>
      </header>

      {/* Main Grid: Video Area (Left) + Clinical/Chat Side Panel (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* VIDEO DISPLAY AREA (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden">
          {/* Main Remote Screen */}
          <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden flex items-center justify-center shadow-2xl">
            {/* Remote Simulated Stream */}
            <div className="text-center p-8 space-y-4">
              <div className="relative inline-block">
                <div className="w-28 h-28 rounded-full bg-slate-800 border-4 border-sky-500/30 flex items-center justify-center mx-auto text-4xl font-bold text-sky-300 shadow-inner">
                  {isDoctor 
                    ? `${appointment?.patient_fn?.[0] || 'P'}${appointment?.patient_ln?.[0] || 'T'}` 
                    : `Dr`}
                </div>
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  {isDoctor 
                    ? `${appointment?.patient_fn} ${appointment?.patient_ln}` 
                    : `Dr. ${appointment?.doctor_fn} ${appointment?.doctor_ln}`}
                </h3>
                <p className="text-xs text-sky-400 font-medium mt-1">
                  {isDoctor ? 'Patient • Live Audio/Video Stream' : `${appointment?.specialization} • Online Consultation`}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-xs text-slate-300">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>HD Audio • WebRTC Stream Connected</span>
              </div>
            </div>

            {/* Local Video Inset (Picture-in-Picture) */}
            <div className="absolute bottom-4 right-4 w-44 sm:w-56 h-32 sm:h-40 bg-slate-950 rounded-xl border-2 border-slate-700 overflow-hidden shadow-2xl">
              {!cameraError ? (
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover mirror"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-slate-500 bg-slate-900">
                  <User className="w-8 h-8 text-slate-600 mb-1" />
                  <span className="text-[10px]">Local Camera Off</span>
                </div>
              )}
              <div className="absolute bottom-1.5 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-white">
                You ({isDoctor ? 'Doctor' : 'Patient'})
              </div>
            </div>
          </div>

          {/* Bottom Floating Control Bar */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={toggleMic}
              className={`p-3.5 rounded-full transition-all ${
                micActive ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
              }`}
              title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={toggleCamera}
              className={`p-3.5 rounded-full transition-all ${
                cameraActive ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
              }`}
              title={cameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {cameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={toggleScreenShare}
              className={`p-3.5 rounded-full transition-all ${
                screenSharing ? 'bg-sky-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
              title="Share Screen"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActivePanel(activePanel === 'chat' ? 'clinical' : 'chat')}
              className={`p-3.5 rounded-full transition-all ${
                activePanel === 'chat' ? 'bg-sky-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
              title="Toggle In-Call Chat"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleEndCall}
              className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-lg"
              title="End Consultation"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SIDE PANEL (4 cols): Clinical Details & Chat */}
        <div className="lg:col-span-4 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden">
          {/* Panel Selector Header */}
          <div className="p-3 border-b border-slate-800 flex gap-1 bg-slate-900/80">
            <button
              onClick={() => setActivePanel('clinical')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activePanel === 'clinical' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              {isDoctor ? 'Patient Info & Triage' : 'Visit Details'}
            </button>

            <button
              onClick={() => setActivePanel('chat')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activePanel === 'chat' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              In-Call Chat
            </button>
          </div>

          {/* PANEL CONTENT */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {activePanel === 'clinical' && (
              <div className="space-y-5 text-xs">
                {/* Issued Prescription Alert if available */}
                {issuedRx && (
                  <div className="p-4 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-emerald-200">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Official Prescription Issued
                    </div>
                    <p className="text-[11px] text-emerald-300">
                      Diagnosis: <strong>{issuedRx.diagnosis}</strong>
                    </p>
                    <div className="mt-2">
                      <Link 
                        to="/patient/prescriptions" 
                        target="_blank" 
                        className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded inline-block"
                      >
                        View Prescription Document
                      </Link>
                    </div>
                  </div>
                )}

                {/* Patient Summary */}
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Patient Clinical Profile
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">NAME</span>
                      <span className="font-bold text-white">{appointment?.patient_fn} {appointment?.patient_ln}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">GENDER</span>
                      <span className="font-semibold text-white">{appointment?.gender || 'Adult'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">BLOOD GROUP</span>
                      <span className="font-bold text-rose-400">{appointment?.blood_group || 'O+'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">APPOINTMENT TIME</span>
                      <span className="font-bold text-sky-400">{appointment?.time_slot}</span>
                    </div>
                  </div>
                </div>

                {/* Reason & Reported Symptoms */}
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Consultation Reason / Chief Complaint
                  </span>
                  <p className="text-sm font-semibold text-white bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                    {appointment?.reason || 'General Health Consultation'}
                  </p>
                  {appointment?.notes && (
                    <div className="pt-2 text-slate-400 text-[11px]">
                      Patient Notes: "{appointment.notes}"
                    </div>
                  )}
                </div>

                {/* Allergies & Medical History */}
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Medical History & Safeguards
                  </span>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ALLERGIES</span>
                    <span className="text-slate-300">{appointment?.allergies || 'No known allergies reported.'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">CHRONIC CONDITIONS / HISTORY</span>
                    <span className="text-slate-300">{appointment?.medical_history || 'No chronic history recorded.'}</span>
                  </div>
                </div>

                {/* Doctor Action: Write Prescription */}
                {isDoctor && (
                  <div className="pt-2">
                    <Button 
                      onClick={() => setShowRxModal(true)} 
                      fullWidth 
                      icon={FileText}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
                    >
                      Write Digital Prescription
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* IN-CALL CHAT */}
            {activePanel === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-3 overflow-y-auto mb-4 text-xs">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`p-3 rounded-xl border ${
                      msg.sender === 'System' 
                        ? 'bg-slate-800/60 border-slate-700 text-slate-400 text-center italic text-[11px]' 
                        : 'bg-slate-800 border-slate-700 text-slate-200'
                    }`}>
                      {msg.sender !== 'System' && (
                        <div className="flex justify-between items-center mb-1 text-[10px]">
                          <span className="font-bold text-sky-400">{msg.sender}</span>
                          <span className="text-slate-500">{msg.time}</span>
                        </div>
                      )}
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type clinical note or message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg text-xs px-3 py-2 text-white outline-none focus:border-sky-500"
                  />
                  <Button type="submit" size="sm" icon={Send}></Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DOCTOR IN-CALL PRESCRIPTION WRITER MODAL */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-850">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">TeleCare Clinical Suite</span>
                <h3 className="text-lg font-bold text-white">Generate Electronic Prescription (Rx)</h3>
                <p className="text-xs text-slate-400">Patient: {appointment?.patient_fn} {appointment?.patient_ln}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowRxModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePrescription} className="p-6 space-y-5 text-xs">
              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Official Clinical Diagnosis *</label>
                <input
                  type="text"
                  placeholder="e.g., Acute Viral Bronchitis, Seasonal Rhinitis"
                  value={rxDiagnosis}
                  onChange={(e) => setRxDiagnosis(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white outline-none focus:border-emerald-500 text-sm font-semibold"
                  required
                />
              </div>

              {/* Medications itemizer */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-300">Medications & Dosage</label>
                  <button
                    type="button"
                    onClick={addMedicationRow}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Drug
                  </button>
                </div>

                <div className="space-y-2">
                  {rxMedications.map((med, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Medicine name..."
                          value={med.name}
                          onChange={(e) => handleMedChange(index, 'name', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Dosage..."
                          value={med.dosage}
                          onChange={(e) => handleMedChange(index, 'dosage', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Frequency..."
                          value={med.frequency}
                          onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-between">
                        <input
                          type="text"
                          placeholder="5 Days"
                          value={med.duration}
                          onChange={(e) => handleMedChange(index, 'duration', e.target.value)}
                          className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-1.5 text-xs text-white"
                        />
                        {rxMedications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicationRow(index)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dietary / Special Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Dietary & Clinical Instructions</label>
                <textarea
                  rows="2"
                  value={rxInstructions}
                  onChange={(e) => setRxInstructions(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-emerald-500 resize-none"
                ></textarea>
              </div>

              {/* Follow up date */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Recommended Follow-up Date</label>
                <input
                  type="date"
                  value={rxFollowUp}
                  onChange={(e) => setRxFollowUp(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-slate-800">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowRxModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  loading={rxSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                  icon={CheckCircle2}
                >
                  Sign & Issue Prescription
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
