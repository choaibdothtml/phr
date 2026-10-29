import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import ProfileSidebar from './ProfileSidebar';
import { Contract } from '../utils/storage';
import { OnboardingReport } from '../utils/storage';
import { PersonnelRecord } from '../utils/storage';
import { EmploymentStatusChange } from '../utils/storage';

export default function Layout() {
  const location = useLocation();
  const isProfilesPage = location.pathname === '/employees/profiles';
  const [showMainSidebar, setShowMainSidebar] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedOnboardingReport, setSelectedOnboardingReport] = useState<OnboardingReport | null>(null);
  const [selectedPersonnelRecord, setSelectedPersonnelRecord] = useState<PersonnelRecord | null>(null);
  const [selectedEmploymentStatusChange, setSelectedEmploymentStatusChange] = useState<EmploymentStatusChange | null>(null);
  const [employeeNumber, setEmployeeNumber] = useState<string>('');
  const [hasExpandedItem, setHasExpandedItem] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {isProfilesPage ? (
        <>
          <Sidebar defaultCollapsed={true} />
          <ProfileSidebar 
            onShowMainSidebar={() => setShowMainSidebar(true)}
            employeeNumber={employeeNumber}
            onContractSelect={setSelectedContract}
            onExpandedItemChange={setHasExpandedItem}
            onOnboardingReportSelect={setSelectedOnboardingReport}
            onPersonnelRecordSelect={setSelectedPersonnelRecord}
            onEmploymentStatusChangeSelect={setSelectedEmploymentStatusChange}
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
        <Outlet context={{ selectedContract, selectedOnboardingReport, selectedPersonnelRecord, selectedEmploymentStatusChange, employeeNumber, setEmployeeNumber, hasExpandedItem, expandedSection }} />
      </main>
    </div>
  );
}
