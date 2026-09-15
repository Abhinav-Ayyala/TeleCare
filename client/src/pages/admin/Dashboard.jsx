import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Stethoscope, Heart, Settings, Activity, Calendar } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Users', icon: Users, path: '/admin/users' },
  { label: 'Doctors', icon: Stethoscope, path: '/admin/doctors' },
  { label: 'Patients', icon: Heart, path: '/admin/patients' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Mock data fetch
    setTimeout(() => {
      setUsers([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'patient', status: 'active', joined: '2023-10-12' },
        { id: 2, name: 'Dr. Sarah Jenkins', email: 'sarah.j@example.com', role: 'doctor', status: 'active', joined: '2023-10-15' },
        { id: 3, name: 'Mike Smith', email: 'mike@example.com', role: 'patient', status: 'active', joined: '2023-11-02' },
        { id: 4, name: 'Dr. Raj Patel', email: 'raj.p@example.com', role: 'doctor', status: 'inactive', joined: '2023-11-20' },
        { id: 5, name: 'Admin User', email: 'admin@telecare.com', role: 'admin', status: 'active', joined: '2023-01-01' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <DashboardLayout navItems={navItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Users', value: '1,245', icon: Users, color: 'text-indigo-600' },
          { label: 'Doctors', value: '142', icon: Stethoscope, color: 'text-teal-600' },
          { label: 'Patients', value: '1,100', icon: Heart, color: 'text-rose-600' },
          { label: 'Appointments', value: '4,521', icon: Calendar, color: 'text-sky-600' }
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonLoader count={5} />
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Joined</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                      <td className="px-6 py-4 text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role === 'admin' ? 'danger' : user.role === 'doctor' ? 'success' : 'default'} className="capitalize">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 ${user.status === 'active' ? 'text-emerald-600' : 'text-slate-500'}`}>
                          <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          <span className="capitalize">{user.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(user.joined).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-sky-600 hover:text-sky-800 font-medium text-xs bg-sky-50 px-3 py-1.5 rounded-lg transition-colors">
                          Toggle Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={Users} title="No users found" description="There are no users registered on the platform yet." />
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
