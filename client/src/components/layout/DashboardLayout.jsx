import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function DashboardLayout({ navItems, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        <Sidebar navItems={navItems} mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
        
        <main className="flex-1 min-w-0 flex flex-col lg:pl-64">
          <div className="lg:hidden p-4 border-b border-slate-200 bg-white flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 mr-2 text-slate-500 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="font-medium text-slate-900">Dashboard Menu</span>
          </div>
          
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
