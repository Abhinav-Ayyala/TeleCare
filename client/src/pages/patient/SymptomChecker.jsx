import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, LayoutDashboard, Stethoscope, Calendar, 
  FileText, FolderHeart, User, AlertTriangle, ArrowRight, 
  ArrowLeft, CheckCircle2, ShieldAlert, Sparkles, Clock, AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { analyzeSymptomsApi } from '../../services/api';
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

const SYMPTOM_CATEGORIES = [
  {
    category: 'Respiratory & ENT',
    items: ['Cough', 'Shortness of Breath', 'Sore Throat', 'Runny Nose', 'Sneezing', 'Chest Tightness', 'Ear Pain']
  },
  {
    category: 'Systemic & General',
    items: ['Fever', 'Fatigue', 'Headache', 'Body Aches', 'Chills', 'Dizziness', 'Weakness', 'Loss of Appetite']
  },
  {
    category: 'Cardiovascular & Emergency Signs',
    items: ['Chest Pain', 'Palpitations', 'Cold Sweat', 'Loss of Consciousness', 'Sudden Severe Headache']
  },
  {
    category: 'Gastrointestinal & Abdominal',
    items: ['Abdominal Pain', 'Nausea', 'Vomiting', 'Diarrhea', 'Acid Reflux / Heartburn', 'Bloating']
  },
  {
    category: 'Musculoskeletal & Skin',
    items: ['Joint Pain', 'Back Pain', 'Muscle Spasms', 'Skin Rash', 'Swelling', 'Itching']
  }
];

export default function SymptomChecker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [details, setDetails] = useState({ 
    duration: '1-3 days', 
    severity: 'Moderate', 
    extraInfo: '' 
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const addCustomSymptom = (e) => {
    e.preventDefault();
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error('Please select at least one symptom');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        symptoms: selectedSymptoms,
        duration: details.duration,
        severity: details.severity.toLowerCase(),
        additional_info: details.extraInfo
      };
      
      const res = await analyzeSymptomsApi(payload);
      if (res.data && res.data.data) {
        setResults(res.data.data);
        setStep(4);
        toast.success('Preliminary assessment complete');
      } else {
        throw new Error('Invalid response from AI engine');
      }
    } catch (error) {
      console.error('Symptom analysis error:', error);
      toast.error(error.response?.data?.error || 'Failed to complete symptom check. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const topCondition = results?.possible_conditions?.[0];
  const recommendedSpecialist = topCondition?.recommended_specialist || 'General Physician';

  return (
    <DashboardLayout navItems={navItems}>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-semibold rounded-full flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> AI Clinical Triage
          </span>
          <span className="text-xs text-slate-400">Step {step} of 4</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">AI Symptom Assessment</h1>
        <p className="text-slate-500">Intelligent clinical triage and preliminary specialist recommendation</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* STEP 1: SYMPTOMS SELECTION */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>1. What symptoms are you experiencing?</span>
                <span className="text-sm font-normal text-slate-500">{selectedSymptoms.length} selected</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Custom input */}
              <form onSubmit={addCustomSymptom} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type any other symptom and press Add (e.g., chills, wheezing)..."
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  className="flex-1 rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm px-4 py-2 border outline-none bg-white"
                />
                <Button type="submit" variant="secondary" size="sm">Add</Button>
              </form>

              {/* Categorized symptoms */}
              <div className="space-y-5">
                {SYMPTOM_CATEGORIES.map((cat, idx) => (
                  <div key={idx} className="border-b border-slate-100 pb-4 last:border-0">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                      {cat.category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((sym) => {
                        const isSelected = selectedSymptoms.includes(sym);
                        const isEmergencySign = cat.category.includes('Emergency');
                        return (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => toggleSymptom(sym)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                              isSelected
                                ? 'bg-sky-600 text-white border-sky-600 shadow-sm ring-2 ring-sky-200'
                                : isEmergencySign
                                ? 'bg-rose-50/60 text-rose-800 border-rose-200 hover:border-rose-400'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-slate-50'
                            }`}
                          >
                            {isSelected && <span className="mr-1">✓</span>}
                            {sym}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected summary */}
              {selectedSymptoms.length > 0 && (
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-3.5">
                  <span className="text-xs font-semibold text-sky-900 block mb-2">Selected Symptoms:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSymptoms.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-white text-sky-800 text-xs px-2.5 py-1 rounded-md border border-sky-200 font-medium">
                        {s}
                        <button type="button" onClick={() => toggleSymptom(s)} className="text-slate-400 hover:text-slate-600 ml-1">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-between bg-slate-50 rounded-b-xl border-t border-slate-100">
              <span className="text-xs text-slate-500">Emergency symptoms require immediate in-person attention</span>
              <Button 
                onClick={() => setStep(2)} 
                disabled={selectedSymptoms.length === 0}
                icon={ArrowRight}
              >
                Next: Symptom Details
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* STEP 2: DURATION & SEVERITY */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Symptom Duration & Severity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  How long have these symptoms persisted?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {['Less than 24h', '1-3 days', '3-7 days', '1-2 weeks', 'More than 2 weeks'].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDetails({ ...details, duration: dur })}
                      className={`p-3 rounded-lg border text-xs font-medium text-center transition-all ${
                        details.duration === dur
                          ? 'bg-sky-50 border-sky-500 text-sky-700 ring-2 ring-sky-200'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Severity Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Mild', desc: 'Noticeable discomfort, but everyday tasks are manageable', emoji: '🟢', color: 'emerald' },
                    { label: 'Moderate', desc: 'Impacting daily activities, persistent discomfort', emoji: '🟡', color: 'amber' },
                    { label: 'Severe', desc: 'Debilitating or acute distress, inability to perform routine tasks', emoji: '🔴', color: 'rose' }
                  ].map((sev) => (
                    <button
                      key={sev.label}
                      type="button"
                      onClick={() => setDetails({ ...details, severity: sev.label })}
                      className={`p-4 border rounded-xl text-left transition-all ${
                        details.severity === sev.label 
                          ? (sev.color === 'emerald' ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200' :
                             sev.color === 'amber' ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200' :
                             'bg-rose-50 border-rose-500 ring-2 ring-rose-200')
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xl">{sev.emoji}</span>
                        <span className="font-bold text-slate-900">{sev.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{sev.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Additional Context (optional)
                </label>
                <textarea
                  rows="3"
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm px-4 py-2 border outline-none resize-none bg-white"
                  placeholder="Mention any existing conditions, triggers, temperature readings, or recent travel..."
                  value={details.extraInfo}
                  onChange={(e) => setDetails({ ...details, extraInfo: e.target.value })}
                ></textarea>
              </div>
            </CardContent>
            <CardFooter className="justify-between bg-slate-50 rounded-b-xl border-t border-slate-100">
              <Button variant="secondary" onClick={() => setStep(1)} icon={ArrowLeft}>Back</Button>
              <Button onClick={() => setStep(3)} icon={ArrowRight}>Review Summary</Button>
            </CardFooter>
          </Card>
        )}

        {/* STEP 3: REVIEW & CONFIRM */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. Review Intake & Run AI Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Reported Symptoms</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((sym, i) => (
                      <Badge key={i} variant="default" className="text-xs py-1 px-2.5">{sym}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200 text-sm">
                  <div>
                    <span className="text-slate-500 block text-xs">Duration</span>
                    <span className="font-semibold text-slate-900">{details.duration}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Severity</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1">
                      {details.severity === 'Mild' ? '🟢' : details.severity === 'Moderate' ? '🟡' : '🔴'} {details.severity}
                    </span>
                  </div>
                  {details.extraInfo && (
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-slate-500 block text-xs">Additional Context</span>
                      <span className="font-medium text-slate-900 text-xs truncate block">{details.extraInfo}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-3 text-xs text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Clinical Disclaimer:</span>
                  TeleCare's AI symptom assessment provides preliminary guidance only and is not a medical diagnosis. In case of acute chest pain, severe breathlessness, or trauma, contact emergency services immediately.
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between bg-slate-50 rounded-b-xl border-t border-slate-100">
              <Button variant="secondary" onClick={() => setStep(2)} disabled={loading} icon={ArrowLeft}>Back</Button>
              <Button onClick={handleAnalyze} loading={loading} icon={Brain}>
                Execute Clinical Assessment
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* STEP 4: RESULTS */}
        {step === 4 && results && (
          <div className="space-y-6">
            {/* Urgency / Triage Banner */}
            <div className={`p-6 rounded-2xl border ${
              results.urgency === 'emergency' 
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200' 
                : results.urgency === 'high' 
                ? 'bg-orange-50 border-orange-300' 
                : results.urgency === 'moderate' 
                ? 'bg-amber-50 border-amber-300' 
                : 'bg-emerald-50 border-emerald-300'
            }`}>
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white shadow-sm flex-shrink-0">
                  {results.urgency === 'emergency' ? (
                    <ShieldAlert className="w-8 h-8 text-rose-600 animate-pulse" />
                  ) : results.urgency === 'high' ? (
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                  ) : results.urgency === 'moderate' ? (
                    <AlertCircle className="w-8 h-8 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">
                      {results.urgency === 'emergency' ? '🔴' : results.urgency === 'high' ? '🟠' : results.urgency === 'moderate' ? '🟡' : '🟢'}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">
                      {results.urgency_label || (results.urgency === 'emergency' ? 'Emergency Attention Required' : `${results.urgency.toUpperCase()} Urgency`)}
                    </h2>
                  </div>

                  {results.urgency === 'emergency' ? (
                    <div className="mt-2 p-3.5 bg-rose-100 text-rose-950 rounded-xl text-sm font-semibold border border-rose-300">
                      🚨 Your symptoms may require urgent medical attention. Please seek immediate in-person medical care or contact local emergency services. Do not rely on a video consultation for an emergency.
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 mt-1">
                      {results.urgency === 'high'
                        ? 'Prompt medical attention is advised within 24 hours. Please schedule an urgent teleconsultation.'
                        : results.urgency === 'moderate'
                        ? 'A medical consultation with a specialist is recommended to evaluate and treat your symptoms.'
                        : 'Symptoms appear mild and self-limiting. Monitor condition and consult a physician if no improvement.'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Possible Conditions */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Possible Clinical Conditions</span>
                  <span className="text-xs text-slate-400 font-normal">Based on symptom pattern analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {results.possible_conditions?.length > 0 ? (
                  results.possible_conditions.map((cond, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-4 hover:border-sky-300 transition-colors bg-white">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center">
                            {i + 1}
                          </span>
                          <h4 className="font-bold text-slate-900">{cond.condition || cond.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Likelihood:</span>
                          <Badge variant={cond.likelihood === 'High' ? 'danger' : cond.likelihood === 'Moderate' ? 'warning' : 'neutral'}>
                            {cond.likelihood}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-3 ml-8 leading-relaxed">
                        {cond.description || cond.desc}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 ml-8 text-xs">
                        <span className="text-slate-500">
                          Recommended Field: <strong className="text-slate-800">{cond.recommended_specialist || cond.specialist}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => navigate(`/patient/doctors?specialization=${encodeURIComponent(cond.recommended_specialist || cond.specialist)}`)}
                          className="text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-1"
                        >
                          Find {cond.recommended_specialist || cond.specialist} <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No specific condition matched above threshold. A consultation with a General Physician is recommended.</p>
                )}
              </CardContent>
            </Card>

            {/* Recommendations & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base">Clinical Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <ul className="space-y-2.5 text-sm text-slate-700">
                    {results.recommendations?.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base">Recommended Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="p-5 flex flex-col justify-between">
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Connect with a verified <strong>{recommendedSpecialist}</strong> on TeleCare for a secure video consultation and official prescription.
                  </p>
                  <div className="space-y-2.5">
                    <Button 
                      onClick={() => navigate(`/patient/doctors?specialization=${encodeURIComponent(recommendedSpecialist)}`)} 
                      fullWidth 
                      icon={Stethoscope}
                    >
                      Book Consultation with {recommendedSpecialist}
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => navigate('/patient/doctors')} 
                      fullWidth
                    >
                      Browse All Doctors
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mandatory Disclaimer */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
              <p className="text-xs font-semibold text-slate-700">
                AI-generated preliminary guidance only — not a medical diagnosis.
              </p>
              <p className="text-xs text-slate-500">
                Data saved securely to your patient health record. You can review your past assessments anytime.
              </p>
            </div>

            {/* Actions bottom */}
            <div className="flex justify-center pt-2">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setStep(1);
                  setSelectedSymptoms([]);
                  setDetails({ duration: '1-3 days', severity: 'Moderate', extraInfo: '' });
                  setResults(null);
                }}
              >
                Run Another Symptom Check
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
