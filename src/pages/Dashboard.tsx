import { useEffect, useState } from 'react';
import { 
  Users, UserCheck, UserX, Clock, TrendingUp, 
  Calendar, ArrowUpRight, ArrowDownRight, Flame,
  Briefcase, Heart, Award
} from 'lucide-react';
import { api, Employee, LeaveRequest } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const attendanceData = [
  { day: 'Mon', present: 42, absent: 3 },
  { day: 'Tue', present: 44, absent: 1 },
  { day: 'Wed', present: 40, absent: 5 },
  { day: 'Thu', present: 43, absent: 2 },
  { day: 'Fri', present: 38, absent: 7 },
];

const hiringData = [
  { month: 'Sep', hires: 3 },
  { month: 'Oct', hires: 5 },
  { month: 'Nov', hires: 2 },
  { month: 'Dec', hires: 4 },
  { month: 'Jan', hires: 6 },
  { month: 'Feb', hires: 3 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [emps, leaves] = await Promise.all([
        api.employees.getAll(),
        api.leaveRequests.getAll(),
      ]);
      setEmployees(emps);
      setLeaveRequests(leaves);
      setLoading(false);
    };
    loadData();
  }, []);

  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const onLeave = employees.filter(e => e.status === 'on-leave').length;
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;

  const stats = [
    { 
      label: 'Total Employees', 
      value: employees.length, 
      change: '+12%', 
      trend: 'up',
      icon: Users, 
      gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
      bgGlow: 'rgba(249, 115, 22, 0.1)'
    },
    { 
      label: 'Active Today', 
      value: activeEmployees, 
      change: '+3%', 
      trend: 'up',
      icon: UserCheck, 
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      bgGlow: 'rgba(16, 185, 129, 0.1)'
    },
    { 
      label: 'On Leave', 
      value: onLeave, 
      change: '-2%', 
      trend: 'down',
      icon: UserX, 
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      bgGlow: 'rgba(139, 92, 246, 0.1)'
    },
    { 
      label: 'Pending Requests', 
      value: pendingLeaves, 
      change: '+5%', 
      trend: 'up',
      icon: Clock, 
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      bgGlow: 'rgba(245, 158, 11, 0.1)'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-phoenix-200 border-t-phoenix-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Here's what's happening in your organization today.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <Calendar className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-5 relative overflow-hidden group">
              {/* Background glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
                style={{ background: stat.bgGlow }} />
              
              <div className="flex items-start justify-between relative">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-xs font-semibold ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>vs last month</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: stat.gradient }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attendance Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Weekly Attendance</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>This week's overview</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f97316' }} />
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#e2e8f0' }} />
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Absent</span>
              </div>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-md)'
                  }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                />
                <Bar dataKey="present" fill="#f97316" radius={[6, 6, 0, 0]} />
                <Bar dataKey="absent" fill="var(--border-color)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hiring Trend */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Hiring Trend</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>New hires over 6 months</p>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-500">+18%</span>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hiringData}>
                <defs>
                  <linearGradient id="hiringGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
                <Area type="monotone" dataKey="hires" stroke="#f97316" strokeWidth={2.5} fill="url(#hiringGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Leave Requests */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Leave Requests</h3>
            <button className="text-xs font-semibold text-phoenix-500 hover:text-phoenix-600 transition-colors">
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {leaveRequests.slice(0, 4).map(request => (
              <div key={request.id} className="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-[var(--bg-tertiary)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'var(--gradient-primary)' }}>
                    {request.employeeName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{request.employeeName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {request.type} · {request.startDate} to {request.endDate}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  request.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                  request.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                  'bg-amber-500/10 text-amber-600'
                }`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
          <div className="space-y-2.5">
            {[
              { icon: Users, label: 'Add Employee', color: '#f97316' },
              { icon: Briefcase, label: 'Post Job Opening', color: '#8b5cf6' },
              { icon: Heart, label: 'Request Leave', color: '#ec4899' },
              { icon: Award, label: 'Performance Review', color: '#06b6d4' },
              { icon: Flame, label: 'Generate Report', color: '#f59e0b' },
            ].map(action => {
              const Icon = action.icon;
              return (
                <button key={action.label}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] group"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: `${action.color}15` }}>
                    <Icon className="w-4 h-4" style={{ color: action.color }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
