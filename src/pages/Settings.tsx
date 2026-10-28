import { useState } from 'react';
import { Building2, Users, DollarSign, Landmark, Palette, Key, Database, Briefcase, FileText } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('departments');
  const tabs = [
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'groups', label: 'Groups and classifications', icon: Users },
    { id: 'jobTitles', label: 'Job titles', icon: Briefcase },
    { id: 'salaries', label: 'Basic salaries', icon: DollarSign },
    { id: 'banks', label: 'Banks', icon: Landmark },
    { id: 'adminDecisions', label: 'Administrative decisions', icon: FileText },
    { id: 'appearances', label: 'Preferences', icon: Palette },
    { id: 'password', label: 'Change password', icon: Key },
    { id: 'backup', label: 'Backup/Restore', icon: Database },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in-up h-full">
      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative rounded-t-lg" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', borderBottom: isActive ? '2px solid var(--phoenix-500, #f97316)' : '2px solid transparent', background: isActive ? 'rgba(var(--primary-color-rgb), 0.1)' : 'transparent' }} onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(var(--primary-color-rgb), 0.08)'; }} onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>
      <div className="flex-1">
        <div className="glass-card p-12 text-center"><p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Settings tab: {activeTab} - needs full reconstruction from conversation history</p></div>
      </div>
    </div>
  );
}
