import React, { useState } from 'react';
import { LayoutDashboard, Brain, Stethoscope, Calendar, FileText, FolderHeart, User as UserIcon } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
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
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    dob: user?.patient?.dob ? new Date(user.patient.dob).toISOString().split('T')[0] : '',
    gender: user?.patient?.gender || '',
    bloodGroup: user?.patient?.bloodGroup || '',
    allergies: user?.patient?.allergies || ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mock save
    setTimeout(() => {
      setLoading(false);
      toast.success('Profile updated successfully');
    }, 1000);
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Avatar initials={user?.firstName?.[0]} size="xl" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user?.firstName} {user?.lastName}</h2>
              <p className="text-slate-500 mb-4">{user?.email}</p>
              <Badge variant="default" className="capitalize">{user?.role}</Badge>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Personal Information</h3>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="First Name" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleInputChange} 
                  />
                  <Input 
                    label="Last Name" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleInputChange} 
                  />
                  <Input 
                    label="Phone Number" 
                    name="phone" 
                    type="tel" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                  />
                  <Input 
                    label="Email" 
                    value={user?.email || ''} 
                    disabled 
                  />
                  <Input 
                    label="Date of Birth" 
                    name="dob" 
                    type="date" 
                    value={formData.dob} 
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
                    name="bloodGroup" 
                    value={formData.bloodGroup} 
                    onChange={handleInputChange} 
                    options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Allergies (comma separated)</label>
                  <textarea
                    name="allergies"
                    rows="3"
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm px-4 py-2 border outline-none resize-none"
                    value={formData.allergies}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" loading={loading}>Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
