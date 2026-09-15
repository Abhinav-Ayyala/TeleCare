import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Brain, Stethoscope, Calendar, 
  FileText, FolderHeart, User, Search, MapPin, Star
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/patient/dashboard' },
  { label: 'Symptom Checker', icon: Brain, path: '/patient/symptom-checker' },
  { label: 'Find Doctors', icon: Stethoscope, path: '/patient/doctors' },
  { label: 'Appointments', icon: Calendar, path: '/patient/appointments' },
  { label: 'Prescriptions', icon: FileText, path: '/patient/prescriptions' },
  { label: 'Health Records', icon: FolderHeart, path: '/patient/health-records' },
  { label: 'Profile', icon: User, path: '/patient/profile' },
];

export default function DoctorDiscovery() {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  
  // Mock doctors data
  useEffect(() => {
    setTimeout(() => {
      setDoctors([
        { id: 1, firstName: 'Sarah', lastName: 'Jenkins', specialization: 'Cardiologist', qualification: 'MD, FACC', experienceYears: 15, fee: 1500, rating: 4.9, reviews: 124, available: true },
        { id: 2, firstName: 'Raj', lastName: 'Patel', specialization: 'General Physician', qualification: 'MBBS, MD', experienceYears: 8, fee: 800, rating: 4.7, reviews: 89, available: true },
        { id: 3, firstName: 'Elena', lastName: 'Rodriguez', specialization: 'Dermatologist', qualification: 'MD, FAAD', experienceYears: 12, fee: 1200, rating: 4.8, reviews: 215, available: false },
        { id: 4, firstName: 'Michael', lastName: 'Chang', specialization: 'Pediatrician', qualification: 'MD, FAAP', experienceYears: 10, fee: 1000, rating: 4.9, reviews: 156, available: true },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <DashboardLayout navItems={navItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Find a Doctor</h1>
        <p className="text-slate-500">Book consultations with leading healthcare professionals</p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input icon={Search} placeholder="Search by name or condition..." />
            </div>
            <Select 
              options={['All Specialties', 'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician']} 
            />
            <Button className="w-full">Search</Button>
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
            <Card key={doctor.id} className="flex flex-col">
              <CardContent className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar initials={`${doctor.firstName[0]}${doctor.lastName[0]}`} size="lg" />
                      {doctor.available && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Dr. {doctor.firstName} {doctor.lastName}</h3>
                      <p className="text-sm text-sky-600 font-medium">{doctor.specialization}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-6">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Qualification</span>
                    <span className="font-medium text-slate-900">{doctor.qualification}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Experience</span>
                    <span className="font-medium text-slate-900">{doctor.experienceYears} Years</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Consultation Fee</span>
                    <span className="font-medium text-slate-900">₹{doctor.fee}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">Rating</span>
                    <span className="font-medium text-slate-900 flex items-center">
                      <Star className="w-4 h-4 text-amber-400 mr-1 fill-current" />
                      {doctor.rating} ({doctor.reviews})
                    </span>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex gap-3">
                <Button variant="secondary" className="flex-1">Profile</Button>
                <Button className="flex-1">Book</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={Search}
          title="No doctors found"
          description="We couldn't find any doctors matching your search criteria. Try adjusting your filters."
        />
      )}
    </DashboardLayout>
  );
}
