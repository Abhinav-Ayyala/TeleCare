import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Badge from '../ui/Badge';

export default function Sidebar({ navItems = [], mobileOpen, setMobileOpen }) {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-[65px] left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col pt-6 pb-4 overflow-y-auto">
          <div className="px-6 mb-8">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Menu
            </h2>
            <nav className="space-y-1.5">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={index}
                    to={item.path}
                    end={item.path === `/${user?.role}/dashboard`}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `
                      group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-sky-50 text-sky-700' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
          
          <div className="mt-auto px-6">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center space-x-3">
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate capitalize">{user?.role} Account</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
