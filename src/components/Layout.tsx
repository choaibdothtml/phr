import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import ProfileSidebar from './ProfileSidebar';
import { Contract } from '../utils/storage';
import { OnboardingReport } from '../utils/storage';
import { PersonnelRecord } from '../utils/storage';
import { EmploymentStatusChange } from '../utils/storage';
import { WorkCertificate } from '../utils/storage';
import { TerminationCertificate } from '../utils/storage';

export default function Layout() {
  const location = useLocation();
  const isProfilesPage = location.pathname === '/employees/profiles';
  const [showMainSidebar, setShowMainSidebar] = useState(false);

  // Apply sidebar color whenever theme changes
  useEffect(() => {
    const applySidebarColor = () => {
      const savedSidebarColor = localStorage.getItem('phoenix-hr-sidebar-color');
      if (savedSidebarColor) {
        const isDark = document.documentElement.classList.contains('dark');
        const sidebarColorsDark: Record<string, string> = {
          'default': '',
          'snow': '#0f1629',
          'mist': '#111827',
          'pearl': '#0a0e1a',
          'lavender': '#1a1625',
          'sky': '#0c1929',
          'mint': '#0a1f1d',
          'blush': '#1f0f10',
          'cream': '#1a1508',
          'slate': '#0f172a',
        };
        
        const sidebarColorsLight: Record<string, string> = {
          'default': '',
          'snow': '#ffffff',
          'mist': '#f4f6f9',
          'pearl': '#f1f5f9',
          'lavender': '#f5f3ff',
          'sky': '#f0f9ff',
          'mint': '#f0fdfa',
          'blush': '#fef2f2',
          'cream': '#fffbeb',
          'slate': '#f8fafc',
        };
        
        const color = isDark ? sidebarColorsDark[savedSidebarColor] : sidebarColorsLight[savedSidebarColor];
        if (color) {
          document.documentElement.style.setProperty('--bg-sidebar', color);
        }
      }
    };

    // Apply on mount
    applySidebarColor();

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      applySidebarColor();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedOnboardingReport, setSelectedOnboardingReport] = useState<OnboardingReport | null>(null);
  const [selectedPersonnelRecord, setSelectedPersonnelRecord] = useState<PersonnelRecord | null>(null);
  const [selectedEmploymentStatusChange, setSelectedEmploymentStatusChange] = useState<EmploymentStatusChange | null>(null);
  const [selectedWorkCertificate, setSelectedWorkCertificate] = useState<WorkCertificate | null>(null);
  const [selectedTerminationCertificate, setSelectedTerminationCertificate] = useState<TerminationCertificate | null>(null);
  const [employeeNumber, setEmployeeNumber] = useState<string>('');
  const [hasExpandedItem, setHasExpandedItem] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {isProfilesPage ? (
        <>
          <ProfileSidebar 
            onShowMainSidebar={() => setShowMainSidebar(true)}
            employeeNumber={employeeNumber}
            onContractSelect={setSelectedContract}
            onExpandedItemChange={setHasExpandedItem}
            onOnboardingReportSelect={setSelectedOnboardingReport}
            onPersonnelRecordSelect={setSelectedPersonnelRecord}
            onEmploymentStatusChangeSelect={setSelectedEmploymentStatusChange}
            onWorkCertificateSelect={setSelectedWorkCertificate}
            onTerminationCertificateSelect={setSelectedTerminationCertificate}
            onSectionExpand={setExpandedSection}
          />
          <AnimatePresence>
            {showMainSidebar && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowMainSidebar(false)} />
                <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full z-50"><Sidebar /></motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      ) : (<Sidebar />)}
      <main className="flex-1 overflow-y-auto mesh-bg">
        <Outlet context={{ selectedContract, selectedOnboardingReport, selectedPersonnelRecord, selectedEmploymentStatusChange, selectedWorkCertificate, selectedTerminationCertificate, employeeNumber, setEmployeeNumber, hasExpandedItem, expandedSection }} />
      </main>
    </div>
  );
}
