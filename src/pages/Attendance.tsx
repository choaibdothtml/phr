import { useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';

interface AttendanceEntry {
  id: string;
  employeeName: string;
  department: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'late' | 'absent' | 'half-day';
  hours: number;
}

const mockAttendance: AttendanceEntry[] = [
  { id: '1', employeeName: 'Sarah Mitchell', department: 'Human Resources', checkIn: '08:55', checkOut: '17:30', status: 'present', hours: 8.5 },
  { id: '2', employeeName: 'James Rodriguez', department: 'Engineering', checkIn: '09:15', checkOut: '18:00', status: 'late', hours: 8.75 },
  { id: '3', employeeName: 'Emily Chen', department: 'Design', checkIn: '08:45', checkOut: '17:15', status: 'present', hours: 8.5 },
  { id: '4', employeeName: 'Michael Thompson', department: 'Engineering', checkIn: '09:00', checkOut: '17:00', status: 'present', hours: 8.0 },
  { id: '5', employeeName: 'Lisa Park', department: 'Marketing', checkIn: '--', checkOut: '--', status: 'absent', hours: 0 },
  { id: '6', employeeName: 'David Wilson', department: 'Finance', checkIn: '08:30', checkOut: '12:30', status: 'half-day', hours: 4.0 },
  { id: '7', employeeName: 'Anna Kowalski', department: 'Design', checkIn: '09:30', checkOut: '18:00', status: 'late', hours: 8.5 },
  { id: '8', employeeName: 'Robert Kim', department: 'Engineering', checkIn: '08:50', checkOut: '17:45', status: 'present', hours: 8.9 },
  { id: '9', employeeName: 'Maria Garcia', department: 'Human Resources', checkIn: '08:58', checkOut: '17:20', status: 'present', hours: 8.4 },
  { id: '10', employeeName: 'Thomas Brown', department: 'Marketing', checkIn: '09:05', checkOut: '17:30', status: 'present', hours: 8.4 },
];

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = filterStatus === 'all' 
    ? mockAttendance 
    : mockAttendance.filter(a => a.status === filterStatus);

  const stats = {
    present: mockAttendance.filter(a => a.status === 'present').length,
    late: mockAttendance.filter(a => a.status === 'late').length,
    absent: mockAttendance.filter(a => a.status === 'absent').length,
    halfDay: mockAttendance.filter(a => a.status === 'half-day').length,
  };

  const statusConfig = {
    present: { icon: CheckCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Present' },
    late: { icon: Clock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'Late' },
    absent: { icon: XCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'Absent' },
    'half-day': { icon: AlertCircle, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', label: 'Half Day' },
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Attendance
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Track daily attendance and working hours
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <Calendar className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-sm outline-none cursor-pointer"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        {Object.entries(stats).map(([key, count]) => {
          const config = statusConfig[key as keyof typeof statusConfig];
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
              className={`glass-card p-4 text-left transition-all ${
                filterStatus === key ? 'ring-2 ring-phoenix-500/30' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: config.bg }}>
                  <Icon className="w-5 h-5" style={{ color: config.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>{count}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{config.label}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Attendance Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Attendance Log
          </h3>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {filtered.length} records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Employee</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Department</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Check In</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Check Out</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Hours</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => {
                const config = statusConfig[entry.status];
                const Icon = config.icon;
                return (
                  <tr key={entry.id} className="transition-colors hover:bg-[var(--bg-tertiary)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: 'var(--gradient-primary)' }}>
                          {entry.employeeName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{entry.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{entry.department}</td>
                    <td className="px-6 py-4 text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{entry.checkIn}</td>
                    <td className="px-6 py-4 text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{entry.checkOut}</td>
                    <td className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{entry.hours}h</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                        <span className="text-xs font-semibold" style={{ color: config.color }}>{config.label}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
