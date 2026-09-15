import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Mail, Lock, UserCheck, Stethoscope, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  const doLogin = async (loginEmail, loginPassword) => {
    setIsLoading(true);
    const result = await login(loginEmail, loginPassword);
    setIsLoading(false);

    if (result.success) {
      toast.success('Login successful!');
      if (from === '/') {
        navigate(`/${result.role}/dashboard`);
      } else {
        navigate(from);
      }
    } else {
      toast.error(result.error || 'Invalid credentials');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    await doLogin(email, password);
  };

  const fillAndLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    doLogin(demoEmail, demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-sky-500 p-2.5 rounded-xl shadow-sm">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">TeleCare</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{' '}
          <Link to="/register" className="font-medium text-sky-600 hover:text-sky-500">
            register for a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 sm:rounded-2xl sm:px-10 shadow-sm border border-slate-200">
          <CardContent className="p-0">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input
                label="Email address"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <Input
                label="Password"
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-700">
                    Remember me
                  </label>
                </div>

                <div className="text-xs">
                  <a href="#" className="font-medium text-sky-600 hover:text-sky-500">
                    Forgot password?
                  </a>
                </div>
              </div>

              <Button type="submit" fullWidth size="lg" loading={isLoading}>
                Sign in
              </Button>
            </form>

            {/* Quick Demo Login Section for Viva / Review */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <span className="block text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Quick One-Click Demo Logins
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillAndLogin('patient@demo.com', 'demo1234')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-sky-100 bg-sky-50/60 hover:bg-sky-100/70 transition-all text-center"
                >
                  <UserCheck className="w-4 h-4 text-sky-600 mb-1" />
                  <span className="text-xs font-bold text-slate-900">Patient</span>
                  <span className="text-[10px] text-slate-500">Demo User</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillAndLogin('rajesh.sharma@telecare.com', 'doctor123')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-teal-100 bg-teal-50/60 hover:bg-teal-100/70 transition-all text-center"
                >
                  <Stethoscope className="w-4 h-4 text-teal-600 mb-1" />
                  <span className="text-xs font-bold text-slate-900">Doctor</span>
                  <span className="text-[10px] text-slate-500">Dr. Sharma</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillAndLogin('admin@telecare.com', 'admin123')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-100/70 transition-all text-center"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600 mb-1" />
                  <span className="text-xs font-bold text-slate-900">Admin</span>
                  <span className="text-[10px] text-slate-500">System</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
