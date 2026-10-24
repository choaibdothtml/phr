import { useState } from 'react';
import { Building2, Briefcase, Users, Settings as SettingsIcon } from 'lucide-react';
import DepartmentsTab from './DepartmentsTab';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('departments');

  const tabs = [
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'job-titles', label: 'Job Titles', icon: Briefcase },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'general', label: 'General', icon: SettingsIcon },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Configure your workspace preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="glass-card p-2">
        <div className="flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'nav-item-active' : 'nav-item'
                }`}
              >
                <Icon className="w-4 h-4" style={{ color: isActive ? '#f97316' : 'var(--text-secondary)' }} />
                <span style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'departments' && <DepartmentsTab />}
        {activeTab === 'job-titles' && <div className="glass-card p-6">Job Titles tab coming soon...</div>}
        {activeTab === 'groups' && <div className="glass-card p-6">Groups tab coming soon...</div>}
        {activeTab === 'general' && <div className="glass-card p-6">General settings coming soon...</div>}
      </div>
    </div>
  );
}
