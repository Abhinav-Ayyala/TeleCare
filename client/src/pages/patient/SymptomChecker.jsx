import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, LayoutDashboard, Stethoscope, Calendar, FileText, FolderHeart, User, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
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

const SYMPTOMS_LIST = [
  'Fever', 'Cough', 'Headache', 'Sore Throat', 'Fatigue', 'Chest Pain', 
  'Shortness of Breath', 'Abdominal Pain', 'Nausea', 'Vomiting', 'Diarrhea', 
  'Body Aches', 'Dizziness', 'Skin Rash', 'Joint Pain', 'Back Pain', 
  'Runny Nose', 'Sneezing', 'Loss of Appetite', 'Difficulty Sleeping', 
  'Anxiety', 'Palpitations', 'Frequent Urination', 'Blurred Vision', 
  'Ear Pain', 'Swelling'
];

export default function SymptomChecker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [details, setDetails] = useState({ duration: '', severity: '', extraInfo: '' });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      // Mocking the API response since we don't have a real AI backend hooked up yet
      // const res = await analyzeSymptomsApi({ symptoms: selectedSymptoms, details });
      
      setTimeout(() => {
        setResults({
          urgency: 'moderate',
          conditions: [
            { name: 'Viral Infection', probability: 'High', specialist: 'General Physician', desc: 'Common viral infection causing systemic symptoms.' },
            { name: 'Seasonal Allergies', probability: 'Medium', specialist: 'ENT Specialist', desc: 'Allergic reaction to environmental triggers.' }
          ],
          recommendations: ['Rest and hydrate', 'Monitor temperature', 'Consult a doctor if symptoms persist']
        });
        setLoading(false);
        setStep(4);
      }, 1500);

    } catch (error) {
      toast.error('Failed to analyze symptoms');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">AI Symptom Checker</h1>
        <p className="text-slate-500">Get preliminary guidance on your symptoms</p>
      </div>

      <div className="max-w-3xl mx-auto">
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select your symptoms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS_LIST.map((sym, i) => (
                  <button
                    key={i}
                    onClick={() => toggleSymptom(sym)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      selectedSymptoms.includes(sym) 
                        ? 'bg-sky-500 text-white border-sky-500' 
                        : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button 
                onClick={() => setStep(2)} 
                disabled={selectedSymptoms.length === 0}
                icon={ArrowRight}
              >
                Next Step
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Provide details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">How long have you had these symptoms?</label>
                <select 
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm px-4 py-2 border outline-none bg-white"
                  value={details.duration}
                  onChange={(e) => setDetails({...details, duration: e.target.value})}
                >
                  <option value="">Select duration...</option>
                  <option value="Less than a day">Less than a day</option>
                  <option value="1-3 days">1-3 days</option>
                  <option value="3-7 days">3-7 days</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="More than 2 weeks">More than 2 weeks</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">How severe are they?</label>
                <div className="grid grid-cols-3 gap-4">
                  {['Mild', 'Moderate', 'Severe'].map(sev => (
                    <button
                      key={sev}
                      onClick={() => setDetails({...details, severity: sev})}
                      className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-colors ${
                        details.severity === sev 
                          ? (sev === 'Mild' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 
                             sev === 'Moderate' ? 'bg-amber-50 border-amber-500 text-amber-700' : 
                             'bg-rose-50 border-rose-500 text-rose-700')
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl mb-1">
                        {sev === 'Mild' ? '🟢' : sev === 'Moderate' ? '🟡' : '🔴'}
                      </span>
                      <span className="font-medium">{sev}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Additional context (optional)</label>
                <textarea
                  rows="3"
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm px-4 py-2 border outline-none resize-none"
                  placeholder="Any other details..."
                  value={details.extraInfo}
                  onChange={(e) => setDetails({...details, extraInfo: e.target.value})}
                ></textarea>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="secondary" onClick={() => setStep(1)} icon={ArrowLeft}>Back</Button>
              <Button 
                onClick={() => setStep(3)} 
                disabled={!details.duration || !details.severity}
                icon={ArrowRight}
              >
                Review
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Review & Analyze</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="font-medium text-slate-900 mb-2">Selected Symptoms</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedSymptoms.map((sym, i) => (
                    <Badge key={i} variant="default">{sym}</Badge>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block">Duration</span>
                    <span className="font-medium text-slate-900">{details.duration}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Severity</span>
                    <span className="font-medium text-slate-900">{details.severity}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="secondary" onClick={() => setStep(2)} disabled={loading} icon={ArrowLeft}>Back</Button>
              <Button onClick={handleAnalyze} loading={loading} icon={Brain}>
                Analyze Symptoms
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 4 && results && (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl flex items-start gap-4 border ${
              results.urgency === 'low' ? 'bg-emerald-50 border-emerald-200' :
              results.urgency === 'moderate' ? 'bg-amber-50 border-amber-200' :
              results.urgency === 'high' ? 'bg-orange-50 border-orange-200' :
              'bg-rose-50 border-rose-200'
            }`}>
              <AlertTriangle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                results.urgency === 'low' ? 'text-emerald-600' :
                results.urgency === 'moderate' ? 'text-amber-600' :
                results.urgency === 'high' ? 'text-orange-600' :
                'text-rose-600'
              }`} />
              <div>
                <h3 className={`font-semibold text-lg ${
                  results.urgency === 'low' ? 'text-emerald-900' :
                  results.urgency === 'moderate' ? 'text-amber-900' :
                  results.urgency === 'high' ? 'text-orange-900' :
                  'text-rose-900'
                }`}>
                  {results.urgency === 'low' ? 'Low urgency — monitor symptoms' :
                   results.urgency === 'moderate' ? 'Medical consultation recommended' :
                   results.urgency === 'high' ? 'Prompt medical attention recommended' :
                   'Emergency: Seek immediate care'}
                </h3>
                {results.urgency === 'emergency' && (
                  <p className="text-rose-800 font-medium mt-1">
                    Your symptoms may require urgent medical attention. Please seek immediate in-person medical care or contact local emergency services.
                  </p>
                )}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Possible Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.conditions.map((cond, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-900">{cond.name}</h4>
                      <Badge variant={cond.probability === 'High' ? 'danger' : 'warning'}>
                        {cond.probability} Match
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{cond.desc}</p>
                    <div className="text-sm">
                      <span className="text-slate-500">Recommended Specialist: </span>
                      <span className="font-medium text-slate-900">{cond.specialist}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Next Steps & Recommendations</h3>
              <ul className="space-y-2 mb-6">
                {results.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700">
                    <span className="text-sky-500 mt-1">•</span> {rec}
                  </li>
                ))}
              </ul>
              
              <div className="p-3 bg-slate-50 text-xs text-slate-500 rounded-lg border border-slate-100 text-center mb-6">
                AI-generated preliminary guidance only — not a medical diagnosis.
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => navigate('/patient/doctors')} className="flex-1">
                  Find a Doctor
                </Button>
                <Button variant="secondary" onClick={() => {
                  setStep(1);
                  setSelectedSymptoms([]);
                  setDetails({ duration: '', severity: '', extraInfo: '' });
                }} className="flex-1">
                  Check Again
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
