import { useEffect, useState } from 'react';
import { Search, Filter, Plus, MoreVertical, Mail, Phone, MapPin } from 'lucide-react';
import { api, Employee } from '../services/api';

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    api.employees.getAll().then(data => {
      setEmployees(data);
      setLoading(false);
    });
  }, []);

  const departments = [...new Set(employees.map(e => e.department))];

  const filtered = employees.filter(emp => {
    const matchesSearch = `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.position}`
      .toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === 'all' || emp.department === filterDept;
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-phoenix-200 border-t-phoenix-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Employees
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage your team members and their information
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-105 hover:shadow-lg"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 max-w-sm"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
            <Search className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search by name, email, position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-full"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          {/* Department filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
            style={{ 
              background: 'var(--bg-tertiary)', 
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
            style={{ 
              background: 'var(--bg-tertiary)', 
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="on-leave">On Leave</option>
            <option value="terminated">Terminated</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-white dark:bg-ash-800 shadow-sm' : ''
              }`}
              style={{ color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list' ? 'bg-white dark:bg-ash-800 shadow-sm' : ''
              }`}
              style={{ color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
        Showing {filtered.length} of {employees.length} employees
      </p>

      {/* Employee Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
          {filtered.map(emp => (
            <div key={emp.id} className="glass-card p-5 group relative overflow-hidden">
              {/* Status indicator */}
              <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${
                emp.status === 'active' ? 'bg-emerald-500' :
                emp.status === 'on-leave' ? 'bg-amber-500' : 'bg-red-500'
              }`} />

              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white mb-4"
                style={{ background: 'var(--gradient-primary)' }}>
                {emp.firstName[0]}{emp.lastName[0]}
              </div>

              {/* Info */}
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {emp.firstName} {emp.lastName}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{emp.position}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{emp.department}</p>

              {/* Contact info - shown on hover */}
              <div className="mt-3 pt-3 space-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
                  <span className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>{emp.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
                  <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{emp.phone}</span>
                </div>
              </div>

              {/* Action button */}
              <button className="absolute top-3 right-8 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md flex items-center justify-center hover:bg-[var(--bg-tertiary)]">
                <MoreVertical className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Employee</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Department</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Position</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id} className="transition-colors hover:bg-[var(--bg-tertiary)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: 'var(--gradient-primary)' }}>
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{emp.department}</td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{emp.position}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                      emp.status === 'on-leave' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-red-500/10 text-red-600'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>{emp.joinDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card w-full max-w-lg p-6 animate-fade-in-up" style={{ background: 'var(--bg-card)' }}>
            <h2 className="font-display text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Add New Employee</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-tertiary)' }}>First Name</label>
                <input className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Last Name</label>
                <input className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Email</label>
                <input type="email" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Department</label>
                <select className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Position</label>
                <input className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                Cancel
              </button>
              <button onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105"
                style={{ background: 'var(--gradient-primary)' }}>
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
