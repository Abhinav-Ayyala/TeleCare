import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Brain, Video, Calendar, FileText, Shield, Users, UserPlus, ClipboardList, Search, ShieldCheck, Lock, Key, AlertTriangle } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 to-white pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6">
                Healthcare Access, <span className="text-sky-600">Reimagined.</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                TeleCare connects patients with doctors through secure online consultations, AI-assisted preliminary symptom assessment, and digital healthcare management.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">Book a Consultation</Button>
                </Link>
              </div>
            </div>
            
            <div className="hidden lg:block relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-200 to-teal-200 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 p-8 grid grid-cols-2 gap-6">
                <div className="bg-sky-50 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                  <Brain className="w-12 h-12 text-sky-600 mb-4" />
                  <span className="font-semibold text-slate-900">AI Assessment</span>
                </div>
                <div className="bg-teal-50 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                  <Video className="w-12 h-12 text-teal-600 mb-4" />
                  <span className="font-semibold text-slate-900">Video Consult</span>
                </div>
                <div className="bg-emerald-50 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                  <FileText className="w-12 h-12 text-emerald-600 mb-4" />
                  <span className="font-semibold text-slate-900">Digital Records</span>
                </div>
                <div className="bg-amber-50 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                  <Shield className="w-12 h-12 text-amber-600 mb-4" />
                  <span className="font-semibold text-slate-900">Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-slate-100 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-sky-600">10,000+</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Consultations</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-sky-600">500+</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Doctors</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-sky-600">50+</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Specialties</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-sky-600">4.8</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need for your health</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Comprehensive digital healthcare platform designed for modern patients and doctors.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: "AI Symptom Checker", desc: "Get preliminary AI-powered symptom assessment and guidance before your consultation.", color: "text-sky-600", bg: "bg-sky-100" },
              { icon: Video, title: "Video Consultation", desc: "Connect with verified doctors through secure, high-quality video consultations.", color: "text-teal-600", bg: "bg-teal-100" },
              { icon: Calendar, title: "Appointment Scheduling", desc: "Book appointments with available doctors at times that work for you.", color: "text-indigo-600", bg: "bg-indigo-100" },
              { icon: FileText, title: "Digital Prescription", desc: "Receive and access your prescriptions digitally after every consultation.", color: "text-emerald-600", bg: "bg-emerald-100" },
              { icon: Shield, title: "Secure Health Records", desc: "Your health records are stored securely and accessible anytime.", color: "text-amber-600", bg: "bg-amber-100" },
              { icon: Users, title: "Role-Based Access", desc: "Dedicated dashboards for patients, doctors, and administrators.", color: "text-purple-600", bg: "bg-purple-100" },
            ].map((feature, i) => (
              <Card key={i} className="border-0 shadow-md hover:-translate-y-1 transition-transform duration-300">
                <div className="p-8">
                  <div className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-6`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How TeleCare Works</h2>
            <p className="text-lg text-slate-600">Your journey to better health in a few simple steps.</p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 md:gap-4 flex-wrap">
            {[
              { icon: UserPlus, label: "Create Account" },
              { icon: ClipboardList, label: "Describe Symptoms" },
              { icon: Brain, label: "AI Assessment" },
              { icon: Search, label: "Find a Doctor" },
              { icon: Calendar, label: "Book Consultation" },
              { icon: Video, label: "Video Consult" },
              { icon: FileText, label: "Get Prescription" }
            ].map((step, i, arr) => (
              <div key={i} className="flex flex-col items-center w-32 relative">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-sky-100 shadow-sm flex items-center justify-center text-sky-600 mb-4 z-10">
                  <step.icon className="w-7 h-7" />
                </div>
                <p className="text-sm font-medium text-slate-700 text-center">{step.label}</p>
                {i < arr.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-24 w-16 h-0.5 bg-sky-100"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Your Health Data, Protected</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">We use enterprise-grade security to ensure your medical information remains private and secure.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "Secure Authentication" },
              { icon: Users, title: "Role-Based Access" },
              { icon: ShieldCheck, title: "Protected Health Info" },
              { icon: Lock, title: "Encrypted Communication" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-800 border border-slate-700">
                <item.icon className="w-10 h-10 text-sky-400 mb-4" />
                <h3 className="font-semibold text-lg">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Disclaimer */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">Important Notice Regarding AI Tools</h4>
              <p className="text-amber-800 text-sm leading-relaxed">
                TeleCare's AI symptom checker provides preliminary guidance only and is not a medical diagnosis. Emergency symptoms require immediate in-person medical care. Always consult with a qualified healthcare provider for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
