import { useState } from 'react';
import { Building2, Users, DollarSign, Settings as SettingsIcon } from 'lucide-react';
import DepartmentsTab from './DepartmentsTab';
import GroupsClassificationsTab from './GroupsClassificationsTab';
import BasicSalariesTab from './BasicSalariesTab';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('departments');

  const tabs = [
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'groups', label: 'Groups and classifications', icon: Users },
    { id: 'salaries', label: 'Basic salaries', icon: DollarSign },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in-up h-full">
      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative"
              style={{ 
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid #f97316' : '2px solid transparent',
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'departments' && <DepartmentsTab />}
        {activeTab === 'groups' && <GroupsClassificationsTab />}
        {activeTab === 'salaries' && <BasicSalariesTab />}
      </div>
    </div>
  );
}
