import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Users, DollarSign, Landmark, Palette, Key, Database, Briefcase } from 'lucide-react';
import DepartmentsTab from './DepartmentsTab';
import GroupsClassificationsTab from './GroupsClassificationsTab';
import BasicSalariesTab from './BasicSalariesTab';
import BanksTab from './BanksTab';
import AppearancesTab from './AppearancesTab';
import JobTitlesTab from './JobTitlesTab';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('departments');

  const tabs = [
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'jobTitles', label: 'Job titles', icon: Briefcase },
    { id: 'groups', label: 'Groups and classifications', icon: Users },
    { id: 'salaries', label: 'Basic salaries', icon: DollarSign },
    { id: 'banks', label: 'Banks', icon: Landmark },
    { id: 'appearances', label: 'Appearances', icon: Palette },
    { id: 'password', label: 'Change password', icon: Key },
    { id: 'backup', label: 'Backup/Restore', icon: Database },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in-up h-full">
      {/* Tabs Navigation */}
      <div className="flex justify-center gap-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative rounded-t-lg"
              style={{ 
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--phoenix-500)' : '2px solid transparent',
                background: isActive ? 'rgba(var(--primary-color-rgb), 0.1)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(var(--primary-color-rgb), 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'departments' && <DepartmentsTab />}
          {activeTab === 'jobTitles' && <JobTitlesTab />}
          {activeTab === 'groups' && <GroupsClassificationsTab />}
          {activeTab === 'salaries' && <BasicSalariesTab />}
          {activeTab === 'banks' && <BanksTab />}
          {activeTab === 'appearances' && <AppearancesTab />}
          {activeTab === 'password' && <div className="glass-card p-6"><p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Coming soon...</p></div>}
          {activeTab === 'backup' && <div className="glass-card p-6"><p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Coming soon...</p></div>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
