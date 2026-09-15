import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-sky-500 p-1.5 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">TeleCare</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {!user ? (
              <>
                <Link to="/#features" className="text-slate-600 hover:text-sky-600 font-medium">Features</Link>
                <Link to="/#how-it-works" className="text-slate-600 hover:text-sky-600 font-medium">How it Works</Link>
                <div className="h-6 w-px bg-slate-200"></div>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">Get Started</Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to={`/${user.role}/dashboard`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900 leading-none mb-1">
                      {user.role === 'doctor' ? `Dr. ${user.lastName}` : user.firstName}
                    </p>
                    <Badge variant="default" className="capitalize">{user.role}</Badge>
                  </div>
                  <Avatar initials={user.firstName?.[0]} size="sm" />
                </Link>
                <div className="h-6 w-px bg-slate-200"></div>
                <button onClick={handleLogout} className="text-slate-500 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
          {!user ? (
            <>
              <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-sky-600 hover:bg-slate-50">Login</Link>
              <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-sky-600 hover:bg-slate-50">Get Started</Link>
            </>
          ) : (
            <>
              <Link to={`/${user.role}/dashboard`} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-sky-600 hover:bg-slate-50">Dashboard</Link>
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-rose-600 hover:bg-rose-50">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
