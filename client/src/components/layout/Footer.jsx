import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-sky-500 p-1.5 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">TeleCare</span>
            </Link>
            <p className="text-slate-500 max-w-sm">
              Connecting patients with leading healthcare professionals through secure, AI-assisted telemedicine.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/#features" className="text-slate-500 hover:text-sky-600 transition-colors">Features</Link></li>
              <li><Link to="/#how-it-works" className="text-slate-500 hover:text-sky-600 transition-colors">How it Works</Link></li>
              <li><Link to="/login" className="text-slate-500 hover:text-sky-600 transition-colors">Patient Login</Link></li>
              <li><Link to="/login" className="text-slate-500 hover:text-sky-600 transition-colors">Doctor Portal</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-500 hover:text-sky-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-500 hover:text-sky-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-slate-500 hover:text-sky-600 transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} TeleCare Platform. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <span className="text-sm text-slate-400">Healthcare Access, Reimagined.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
