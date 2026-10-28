import { useEffect, useState } from 'react';
import { Users, DollarSign, TrendingUp, MoreHorizontal } from 'lucide-react';
import { api, Department } from '../services/api';

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.departments.getAll().then(data => {
      setDepartments(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-phoenix-200 border-t-phoenix-500 rounded-full animate-spin" />
      </div>
    );
  }

  const totalEmployees = departments.reduce((sum, d) => sum + d.employeeCount, 0);
  const totalBudget = departments.reduce((sum, d) => sum + d.budget, 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Departments
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Overview of all organizational departments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249, 115, 22, 0.1)' }}>
              <Users className="w-5 h-5 text-phoenix-500" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Total Departments</p>
              <p className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>{departments.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
              <Users className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Total Employees</p>
              <p className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>{totalEmployees}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Total Budget</p>
              <p className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                ${(totalBudget / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
        {departments.map(dept => (
          <div key={dept.id} className="glass-card p-6 relative overflow-hidden group">
            {/* Color accent */}
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: dept.color }} />
            
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{dept.name}</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Head: {dept.head}</p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-tertiary)]">
                <MoreHorizontal className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Members</span>
                </div>
                <p className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>{dept.employeeCount}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Budget</span>
                </div>
                <p className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                  ${(dept.budget / 1000).toFixed(0)}K
                </p>
              </div>
            </div>

            {/* Progress bar - employee capacity */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  Capacity
                </span>
                <span className="text-[10px] font-semibold" style={{ color: dept.color }}>
                  {Math.round((dept.employeeCount / 30) * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.min((dept.employeeCount / 30) * 100, 100)}%`,
                    background: dept.color 
                  }}
                />
              </div>
            </div>

            {/* Per employee budget */}
            <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Avg. per employee</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  ${Math.round(dept.budget / dept.employeeCount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
