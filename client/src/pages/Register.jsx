import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, User, Phone, Briefcase, Award, Clock, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function Register() {
  const [role, setRole] = useState('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dob: '',
    gender: '',
    specialization: '',
    qualification: '',
    experienceYears: '',
    consultationFee: '',
    bio: ''
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const submitData = { ...formData, role };
    // Remove unneeded fields based on role
    if (role === 'patient') {
      delete submitData.specialization;
      delete submitData.qualification;
      delete submitData.experienceYears;
      delete submitData.consultationFee;
      delete submitData.bio;
    } else {
      delete submitData.dob;
      delete submitData.gender;
      submitData.experienceYears = Number(submitData.experienceYears);
      submitData.consultationFee = Number(submitData.consultationFee);
    }

    setIsLoading(true);
    const result = await register(submitData);
    setIsLoading(false);

    if (result.success) {
      toast.success('Registration successful!');
      navigate(`/${result.role}/dashboard`);
    }
  };

  const specializations = [
    'General Physician', 'Dermatologist', 'Cardiologist', 'Pediatrician', 
    'Neurologist', 'Psychiatrist', 'Orthopedic', 'Gynecologist', 
    'ENT Specialist', 'Ophthalmologist'
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-sky-500 p-2 rounded-xl shadow-sm">
              <Activity className="h-8 w-8 text-white" />
            </div>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-sky-600 hover:text-sky-500">
            Log in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <Card className="py-8 px-4 sm:rounded-2xl sm:px-10">
          <CardContent className="p-0">
            
            {/* Role Tabs */}
            <div className="flex p-1 space-x-1 bg-slate-100 rounded-xl mb-8">
              <button
                className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                  ${role === 'patient' 
                    ? 'bg-white text-sky-700 shadow-sm' 
                    : 'text-slate-600 hover:bg-white/[0.12] hover:text-slate-900'}`}
                onClick={() => setRole('patient')}
              >
                Patient
              </button>
              <button
                className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                  ${role === 'doctor' 
                    ? 'bg-white text-sky-700 shadow-sm' 
                    : 'text-slate-600 hover:bg-white/[0.12] hover:text-slate-900'}`}
                onClick={() => setRole('doctor')}
              >
                Doctor
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <Input
                  label="First name"
                  name="firstName"
                  icon={User}
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Last name"
                  name="lastName"
                  icon={User}
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <Input
                label="Email address"
                name="email"
                type="email"
                icon={Mail}
                value={formData.email}
                onChange={handleInputChange}
                required
              />

              <Input
                label="Phone number"
                name="phone"
                type="tel"
                icon={Phone}
                value={formData.phone}
                onChange={handleInputChange}
                required
              />

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  icon={Lock}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  icon={Lock}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {role === 'patient' && (
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <Input
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                  />
                  <Select
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    options={['Male', 'Female', 'Other']}
                    required
                  />
                </div>
              )}

              {role === 'doctor' && (
                <>
                  <Select
                    label="Specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    options={specializations}
                    required
                  />
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <Input
                      label="Qualification"
                      name="qualification"
                      icon={Award}
                      placeholder="MBBS, MD"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      label="Experience (Years)"
                      name="experienceYears"
                      type="number"
                      min="0"
                      icon={Clock}
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <Input
                    label="Consultation Fee (₹)"
                    name="consultationFee"
                    type="number"
                    min="0"
                    icon={DollarSign}
                    value={formData.consultationFee}
                    onChange={handleInputChange}
                    required
                  />

                  <div className="w-full">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Brief Bio</label>
                    <textarea
                      name="bio"
                      rows="3"
                      className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm px-4 py-2 border outline-none transition-shadow resize-none"
                      value={formData.bio}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                </>
              )}

              <Button type="submit" fullWidth size="lg" loading={isLoading}>
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
