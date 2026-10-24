import { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { api, Employee } from '../services/api';

interface ProfileData {
  employeeNumber: string;
  lastName: string;
  firstName: string;
  position: string;
  department: string;
  group: string;
}

export default function EmployeesProfiles() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    employeeNumber: '',
    lastName: '',
    firstName: '',
    position: '',
    department: '',
    group: '',
  });
  const [showError, setShowError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownResults, setDropdownResults] = useState<Employee[]>([]);
  
  const numberInputRef = useRef<HTMLInputElement>(null);
  const lastNameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.employees.getAll().then(data => {
      setEmployees(data);
      setLoading(false);
    });
  }, []);

  // Handle employee number input - only allow digits, max 4
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setProfile(prev => ({ ...prev, employeeNumber: value }));
  };

  // Handle Enter key on employee number
  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const num = profile.employeeNumber;
      if (!num) return;
      
      // Pad to 4 digits
      const padded = num.padStart(4, '0');
      setProfile(prev => ({ ...prev, employeeNumber: padded }));
      
      // Search for employee
      const found = employees.find(emp => emp.employeeNumber === padded);
      if (found) {
        fillProfile(found);
        setShowError(false);
      } else {
        setShowError(true);
      }
    }
  };

  // Handle family name search
  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProfile(prev => ({ ...prev, lastName: value }));
    
    if (value.length >= 1) {
      const results = employees
        .filter(emp => emp.lastName.toLowerCase().startsWith(value.toLowerCase()))
        .sort((a, b) => a.lastName.localeCompare(b.lastName));
      setDropdownResults(results);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setDropdownResults([]);
    }
  };

  // Double-click on dropdown item fills all fields
  const handleDropdownSelect = (emp: Employee) => {
    fillProfile(emp);
    setShowDropdown(false);
  };

  // Fill all profile fields from employee data
  const fillProfile = (emp: Employee) => {
    setProfile({
      employeeNumber: emp.employeeNumber,
      lastName: emp.lastName,
      firstName: emp.firstName,
      position: emp.position,
      department: emp.department,
      group: emp.group,
    });
    setShowError(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          lastNameInputRef.current && !lastNameInputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-phoenix-200 border-t-phoenix-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Employees' Profiles
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Search and view employee profiles by number or family name
        </p>
      </div>

      {/* Search Boxes Row */}
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-end gap-3">
          {/* Employee Number Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Employee No.
            </label>
            <input
              ref={numberInputRef}
              type="text"
              value={profile.employeeNumber}
              onChange={handleNumberChange}
              onKeyDown={handleNumberKeyDown}
              maxLength={4}
              placeholder="0001"
              className="w-24 px-3 py-2.5 rounded-xl text-sm font-mono text-center outline-none focus:ring-2 focus:ring-phoenix-500/30"
              style={{ 
                background: 'var(--bg-tertiary)', 
                border: '1px solid var(--border-color)', 
                color: 'var(--text-primary)' 
              }}
            />
          </div>

          {/* Family Name Box */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Family Name
            </label>
            <div className="relative">
              <input
                ref={lastNameInputRef}
                type="text"
                value={profile.lastName}
                onChange={handleLastNameChange}
                placeholder="Search by family name..."
                className="w-52 px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                style={{ 
                  background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-primary)' 
                }}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
            </div>

            {/* Dropdown */}
            {showDropdown && dropdownResults.length > 0 && (
              <div 
                ref={dropdownRef}
                className="absolute top-full left-0 mt-1 w-64 max-h-48 overflow-y-auto rounded-xl z-50 animate-fade-in-up"
                style={{ 
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                {dropdownResults.map(emp => (
                  <div
                    key={emp.id}
                    onDoubleClick={() => handleDropdownSelect(emp)}
                    className="px-3 py-2 cursor-pointer transition-colors hover:bg-[var(--bg-tertiary)]"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {emp.lastName}, {emp.firstName}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                      No. {emp.employeeNumber} · {emp.department}
                    </p>
                  </div>
                ))}
                <div className="px-3 py-1.5" style={{ background: 'var(--bg-tertiary)' }}>
                  <p className="text-[10px] text-center" style={{ color: 'var(--text-tertiary)' }}>
                    Double-click to select
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Name Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Name
            </label>
            <input
              type="text"
              value={profile.firstName}
              readOnly
              placeholder="—"
              className="w-40 px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ 
                background: 'var(--bg-tertiary)', 
                border: '1px solid var(--border-color)', 
                color: 'var(--text-primary)' 
              }}
            />
          </div>

          {/* Job Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Job
            </label>
            <input
              type="text"
              value={profile.position}
              readOnly
              placeholder="—"
              className="w-40 px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ 
                background: 'var(--bg-tertiary)', 
                border: '1px solid var(--border-color)', 
                color: 'var(--text-primary)' 
              }}
            />
          </div>

          {/* Department Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Department
            </label>
            <input
              type="text"
              value={profile.department}
              readOnly
              placeholder="—"
              className="w-40 px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ 
                background: 'var(--bg-tertiary)', 
                border: '1px solid var(--border-color)', 
                color: 'var(--text-primary)' 
              }}
            />
          </div>

          {/* Group Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Group
            </label>
            <input
              type="text"
              value={profile.group}
              readOnly
              placeholder="—"
              className="w-40 px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ 
                background: 'var(--bg-tertiary)', 
                border: '1px solid var(--border-color)', 
                color: 'var(--text-primary)' 
              }}
            />
          </div>
        </div>
      </div>

      {/* Profile Section - Empty for now */}
      <div className="flex gap-6">
        {/* Profile Sidebar - Empty placeholder */}
        <div 
          className="w-56 flex-shrink-0 rounded-2xl p-4"
          style={{ 
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            minHeight: '400px'
          }}
        >
          <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
            Profile sidebar content will be added here
          </p>
        </div>

        {/* Main Profile Content */}
        <div className="flex-1 glass-card p-6" style={{ minHeight: '400px' }}>
          {profile.employeeNumber ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4"
                style={{ background: 'var(--gradient-primary)' }}>
                {profile.firstName[0]}{profile.lastName[0]}
              </div>
              <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {profile.position} · {profile.department}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Employee No. {profile.employeeNumber}
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                Enter an employee number or search by family name to view their profile
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Modal */}
      {showError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" 
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card p-8 text-center animate-fade-in-up max-w-sm w-full" 
            style={{ background: 'var(--bg-card)' }}>
            {/* Red circle with X */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: '#ef4444' }}>
              <X className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
            <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              Invalid employee number
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              The employee number you entered does not exist in our records.
            </p>
            <button
              onClick={() => {
                setShowError(false);
                setProfile(prev => ({ ...prev, employeeNumber: '' }));
                numberInputRef.current?.focus();
              }}
              className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-105"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Try typing again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
