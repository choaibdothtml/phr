import { Users, UserCheck, UserX, Clock, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
export default function Dashboard() {
  const { user } = useAuth();
  const stats = [
    { label: 'Total Employees', value: 0, change: '+0%', trend: 'up', icon: Users, gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
    { label: 'Active Today', value: 0, change: '+0%', trend: 'up', icon: UserCheck, gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    { label: 'On Leave', value: 0, change: '-0%', trend: 'down', icon: UserX, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
    { label: 'Pending Requests', value: 0, change: '+0%', trend: 'up', icon: Clock, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  ];
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in-up">
      <div><h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back, {user?.name?.split(' ')[0]} 👋</h1><p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Here's what's happening in your organization today.</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => { const Icon = stat.icon; return (
          <div key={stat.label} className="glass-card p-5 relative overflow-hidden group">
            <div className="flex items-start justify-between relative">
              <div><p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p><p className="text-3xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>{stat.value}</p><div className="flex items-center gap-1 mt-2">{stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />}<span className={`text-xs font-semibold ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>{stat.change}</span></div></div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: stat.gradient }}><Icon className="w-5 h-5 text-white" /></div>
            </div>
          </div>
        );})}
      </div>
      <div className="glass-card p-12 text-center"><p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Start adding employees to see dashboard analytics</p></div>
    </div>
  );
}
