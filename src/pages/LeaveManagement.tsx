import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { api, LeaveRequest } from '../services/api';

export default function LeaveManagement() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    api.leaveRequests.getAll().then(data => {
      setRequests(data);
      setLoading(false);
    });
  }, []);

  const handleApprove = async (id: string) => {
    const updated = await api.leaveRequests.updateStatus(id, 'approved');
    setRequests(prev => prev.map(r => r.id === id ? updated : r));
  };

  const handleReject = async (id: string) => {
    const updated = await api.leaveRequests.updateStatus(id, 'rejected');
    setRequests(prev => prev.map(r => r.id === id ? updated : r));
  };

  const filtered = requests.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesType = filterType === 'all' || r.type === filterType;
    return matchesStatus && matchesType;
  });

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const typeColors: Record<string, string> = {
    annual: '#f97316',
    sick: '#ef4444',
    personal: '#8b5cf6',
    maternity: '#ec4899',
    paternity: '#06b6d4',
  };

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
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Leave Requests
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Manage employee leave requests and approvals
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>{stats.pending}</p>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Pending</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>{stats.approved}</p>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Approved</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>{stats.rejected}</p>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Rejected</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
        >
          <option value="all">All Types</option>
          <option value="annual">Annual</option>
          <option value="sick">Sick</option>
          <option value="personal">Personal</option>
          <option value="maternity">Maternity</option>
          <option value="paternity">Paternity</option>
        </select>
      </div>

      {/* Leave Requests List */}
      <div className="space-y-3 stagger-children">
        {filtered.map(request => (
          <div key={request.id} className="glass-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: 'var(--gradient-primary)' }}>
                  {request.employeeName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{request.employeeName}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: `${typeColors[request.type]}15`, color: typeColors[request.type] }}>
                      {request.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <Calendar className="w-3 h-3" />
                      {request.startDate} → {request.endDate}
                    </span>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                    "{request.reason}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:flex-shrink-0">
                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  request.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                  request.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                  'bg-amber-500/10 text-amber-600'
                }`}>
                  {request.status}
                </span>
                {request.status === 'pending' && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: 'rgba(16, 185, 129, 0.1)' }}
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
          <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No requests found</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
