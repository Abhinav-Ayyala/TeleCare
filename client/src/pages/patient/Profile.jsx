import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Brain, Stethoscope, Calendar, FileText, FolderHeart, User as UserIcon, Save, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { getPatientProfile, updatePatientProfile } from '../../services/api';
import toast from 'react-hot-toast';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/patient/dashboard' },
  { label: 'Symptom Checker', icon: Brain, path: '/patient/symptom-checker' },
  { label: 'Find Doctors', icon: Stethoscope, path: '/patient/doctors' },
  { label: 'Appointments', icon: Calendar, path: '/patient/appointments' },
  { label: 'Prescriptions', icon: FileText, path: '/patient/prescriptions' },
  { label: 'Health Records', icon: FolderHeart, path: '/patient/health-records' },
  { label: 'Profile', icon: UserIcon, path: '/patient/profile' },
];

export default function Profile() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    gender: 'Male',
    blood_group: 'O+',
    allergies: '',
    medical_history: '',
    emergency_contact: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const loadProfile = async () => {
    setFetching(true);
    try {
      const res = await getPatientProfile();
      if (res.data && res.data.data) {
        const p = res.data.data;
        setFormData({
          first_name: p.first_name || '',
          last_name: p.last_name || '',
          phone: p.phone || '',
          date_of_birth: p.date_of_birth || '',
          gender: p.gender || 'Male',
          blood_group: p.blood_group || 'O+',
          allergies: p.allergies || '',
          medical_history: p.medical_history || '',
          emergency_contact: p.emergency_contact || ''
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updatePatientProfile(formData);
      if (res.data && res.data.success) {
        toast.success('Patient health profile updated successfully!');
      } else {
        throw new Error(res.data?.error || 'Failed to update');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error(err.response?.data?.error || 'Failed to save profile changes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Patient Health Profile</h1>
        <p className="text-slate-500">Manage your clinical demographic details and medical records</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="border-slate-200">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Avatar initials={`${formData.first_name?.[0] || 'P'}${formData.last_name?.[0] || 'T'}`} size="xl" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{formData.first_name} {formData.last_name}</h2>
              <p className="text-slate-500 text-xs mb-4">{user?.email}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Verified Patient
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 text-left text-xs space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Type:</span>
                  <span className="font-semibold text-slate-700 capitalize">{user?.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Blood Group:</span>
                  <span className="font-bold text-rose-600">{formData.blood_group}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-semibold text-slate-700">{formData.phone || 'Not set'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                Personal & Clinical Information
              </h3>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input 
                    label="First Name" 
                    name="first_name" 
                    value={formData.first_name} 
                    onChange={handleInputChange} 
                    required
                  />
                  <Input 
                    label="Last Name" 
                    name="last_name" 
                    value={formData.last_name} 
                    onChange={handleInputChange} 
                    required
                  />
                  <Input 
                    label="Phone Number" 
                    name="phone" 
                    type="tel" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                  />
                  <Input 
                    label="Email Address" 
                    value={user?.email || ''} 
                    disabled 
                  />
                  <Input 
                    label="Date of Birth" 
                    name="date_of_birth" 
                    type="date" 
                    value={formData.date_of_birth} 
                    onChange={handleInputChange} 
                  />
                  <Select 
                    label="Gender" 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleInputChange} 
                    options={['Male', 'Female', 'Other']} 
                  />
                  <Select 
                    label="Blood Group" 
                    name="blood_group" 
                    value={formData.blood_group} 
                    onChange={handleInputChange} 
                    options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} 
                  />
                  <Input 
                    label="Emergency Contact (Name & Phone)" 
                    name="emergency_contact" 
                    placeholder="e.g., Jane Doe (+91 9876543210)"
                    value={formData.emergency_contact} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Allergies & Sensitivities
                  </label>
                  <textarea
                    name="allergies"
                    rows="2"
                    placeholder="e.g., Penicillin, Peanuts, Pollen, Latex (or None)"
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-xs px-4 py-2 border outline-none resize-none bg-white"
                    value={formData.allergies}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Pre-existing Medical History & Chronic Conditions
                  </label>
                  <textarea
                    name="medical_history"
                    rows="2"
                    placeholder="e.g., Hypertension (2 years), Asthma, Type 2 Diabetes, Past surgeries..."
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-xs px-4 py-2 border outline-none resize-none bg-white"
                    value={formData.medical_history}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" loading={loading} icon={Save}>
                    Save Health Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
