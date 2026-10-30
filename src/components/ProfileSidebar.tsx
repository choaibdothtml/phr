import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Menu, ChevronDown, ChevronRight, Lock, FileText, ClipboardList, RefreshCw, FileSignature, UserCheck, FileCheck2, Briefcase, Award, FileX } from 'lucide-react';
import { Contract, OnboardingReport, PersonnelRecord, EmploymentStatusChange, WorkCertificate, TerminationCertificate, contractStorage, onboardingReportStorage, personnelRecordStorage, employmentStatusStorage, workCertificateStorage, terminationCertificateStorage } from '../utils/storage';

interface ProfileSidebarProps {
  onShowMainSidebar: () => void;
  employeeNumber: string;
  onContractSelect: (c: Contract | null) => void;
  onExpandedItemChange: (e: boolean) => void;
  onOnboardingReportSelect: (r: OnboardingReport | null) => void;
  onPersonnelRecordSelect: (r: PersonnelRecord | null) => void;
  onEmploymentStatusChangeSelect: (c: EmploymentStatusChange | null) => void;
  onWorkCertificateSelect: (w: WorkCertificate | null) => void;
  onTerminationCertificateSelect: (t: TerminationCertificate | null) => void;
  onSectionExpand: (s: string | null) => void;
}

export default function ProfileSidebar({ onShowMainSidebar, employeeNumber, onContractSelect, onExpandedItemChange, onOnboardingReportSelect, onPersonnelRecordSelect, onEmploymentStatusChangeSelect, onWorkCertificateSelect, onTerminationCertificateSelect, onSectionExpand }: ProfileSidebarProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [onboardingReport, setOnboardingReport] = useState<OnboardingReport | null>(null);
  const [personnelRecord, setPersonnelRecord] = useState<PersonnelRecord | null>(null);
  const [employmentStatusChanges, setEmploymentStatusChanges] = useState<EmploymentStatusChange[]>([]);
  const [workCertificates, setWorkCertificates] = useState<WorkCertificate[]>([]);
  const [terminationCertificates, setTerminationCertificates] = useState<TerminationCertificate[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedPersonnelRecordId, setSelectedPersonnelRecordId] = useState<string | null>(null);
  const [selectedStatusChangeId, setSelectedStatusChangeId] = useState<string | null>(null);
  const [selectedWorkCertificateId, setSelectedWorkCertificateId] = useState<string | null>(null);
  const [selectedTerminationCertificateId, setSelectedTerminationCertificateId] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeNumber) return;
    setContracts(contractStorage.getContracts(employeeNumber));
    setOnboardingReport(onboardingReportStorage.getReport(employeeNumber));
    setPersonnelRecord(personnelRecordStorage.getRecord(employeeNumber));
    setEmploymentStatusChanges(employmentStatusStorage.getStatusChanges(employeeNumber));
    setWorkCertificates(workCertificateStorage.getCertificates(employeeNumber));
    setTerminationCertificates(terminationCertificateStorage.getCertificates(employeeNumber));
    setSelectedContractId(null); setSelectedReportId(null); setSelectedPersonnelRecordId(null); setSelectedStatusChangeId(null); setSelectedWorkCertificateId(null); setSelectedTerminationCertificateId(null);
    setExpandedItem(null);
    onContractSelect(null); onOnboardingReportSelect(null); onPersonnelRecordSelect(null); onEmploymentStatusChangeSelect(null); onWorkCertificateSelect(null); onTerminationCertificateSelect(null);
    onExpandedItemChange(false);
  }, [employeeNumber]);

  useEffect(() => { const i = setInterval(() => { contractStorage.updateExpiredStatus(); setContracts(contractStorage.getContracts(employeeNumber)); }, 60000); return () => clearInterval(i); }, [employeeNumber]);

  const handleExpandCollapse = (itemId: string) => {
    if (expandedItem === itemId) {
      setExpandedItem(null);
      onSectionExpand(null);
      onExpandedItemChange(false);
    } else {
      setExpandedItem(itemId);
      onSectionExpand(itemId);
      onExpandedItemChange(true);
    }
  };

  const handleContractClick = (c: Contract) => { setSelectedContractId(c.id); setSelectedReportId(null); setSelectedPersonnelRecordId(null); setSelectedStatusChangeId(null); setSelectedWorkCertificateId(null); setSelectedTerminationCertificateId(null); onContractSelect(c); onOnboardingReportSelect(null); onPersonnelRecordSelect(null); onEmploymentStatusChangeSelect(null); onWorkCertificateSelect(null); onTerminationCertificateSelect(null); };
  const handleOnboardingReportClick = (r: OnboardingReport) => { setSelectedReportId(r.id); setSelectedContractId(null); setSelectedPersonnelRecordId(null); setSelectedStatusChangeId(null); setSelectedWorkCertificateId(null); setSelectedTerminationCertificateId(null); onOnboardingReportSelect(r); onContractSelect(null); onPersonnelRecordSelect(null); onEmploymentStatusChangeSelect(null); onWorkCertificateSelect(null); onTerminationCertificateSelect(null); };
  const handlePersonnelRecordClick = (r: PersonnelRecord) => { setSelectedPersonnelRecordId(r.id); setSelectedContractId(null); setSelectedReportId(null); setSelectedStatusChangeId(null); setSelectedWorkCertificateId(null); setSelectedTerminationCertificateId(null); onPersonnelRecordSelect(r); onContractSelect(null); onOnboardingReportSelect(null); onEmploymentStatusChangeSelect(null); onWorkCertificateSelect(null); onTerminationCertificateSelect(null); };
  const handleEmploymentStatusChangeClick = (c: EmploymentStatusChange) => { setSelectedStatusChangeId(c.id); setSelectedContractId(null); setSelectedReportId(null); setSelectedPersonnelRecordId(null); setSelectedWorkCertificateId(null); setSelectedTerminationCertificateId(null); onEmploymentStatusChangeSelect(c); onContractSelect(null); onOnboardingReportSelect(null); onPersonnelRecordSelect(null); onWorkCertificateSelect(null); onTerminationCertificateSelect(null); };
  const handleWorkCertificateClick = (w: WorkCertificate) => { setSelectedWorkCertificateId(w.id); setSelectedContractId(null); setSelectedReportId(null); setSelectedPersonnelRecordId(null); setSelectedStatusChangeId(null); setSelectedTerminationCertificateId(null); onWorkCertificateSelect(w); onContractSelect(null); onOnboardingReportSelect(null); onPersonnelRecordSelect(null); onEmploymentStatusChangeSelect(null); onTerminationCertificateSelect(null); };
  const handleTerminationCertificateClick = (t: TerminationCertificate) => { setSelectedTerminationCertificateId(t.id); setSelectedContractId(null); setSelectedReportId(null); setSelectedPersonnelRecordId(null); setSelectedStatusChangeId(null); setSelectedWorkCertificateId(null); onTerminationCertificateSelect(t); onContractSelect(null); onOnboardingReportSelect(null); onPersonnelRecordSelect(null); onEmploymentStatusChangeSelect(null); onWorkCertificateSelect(null); };

  const sortedContracts = [...contracts].sort((a, b) => new Date(a.startDate.split('/').reverse().join('-')).getTime() - new Date(b.startDate.split('/').reverse().join('-')).getTime());
  const sortedStatusChanges = [...employmentStatusChanges].sort((a, b) => new Date(a.dateOfIssue.split('/').reverse().join('-')).getTime() - new Date(b.dateOfIssue.split('/').reverse().join('-')).getTime());
  const sortedWorkCertificates = [...workCertificates].sort((a, b) => new Date(a.dateOfIssue.split('/').reverse().join('-')).getTime() - new Date(b.dateOfIssue.split('/').reverse().join('-')).getTime());
  const sortedTerminationCertificates = [...terminationCertificates].sort((a, b) => new Date(a.dateOfIssue.split('/').reverse().join('-')).getTime() - new Date(b.dateOfIssue.split('/').reverse().join('-')).getTime());

  return (
    <div className="w-72 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] h-full overflow-y-auto">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 pb-5 border-b border-[var(--border-color)]">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md" style={{ background: 'var(--gradient-primary)' }}>
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Phoenix HR</h1>
            <p className="text-xs text-[var(--text-tertiary)] font-medium">Employee Profile</p>
          </div>
          <button onClick={onShowMainSidebar} className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[var(--bg-tertiary)] transition-all hover:scale-105 flex-shrink-0" title="Show Navigation">
            <Menu className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Documents Section */}
        <div className="space-y-3">
          {/* Contracts */}
          <div className="rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)]">
            <button onClick={() => handleExpandCollapse('contracts')} className="w-full flex items-center gap-3 p-3.5 hover:bg-[var(--bg-tertiary)] transition-all group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--primary-color-rgb), 0.1)' }}>
                <FileSignature className="w-4 h-4" style={{ color: 'var(--phoenix-500)' }} />
              </div>
              <span className="flex-1 text-left text-sm font-semibold text-[var(--text-primary)]">Contracts</span>
              <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${expandedItem === 'contracts' ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            <AnimatePresence>
              {expandedItem === 'contracts' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-1 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
                    {sortedContracts.length === 0 ? (
                      <p className="text-xs text-[var(--text-tertiary)] italic px-3 py-3 text-center">(No documents have been prepared yet)</p>
                    ) : (
                      <div className="space-y-1.5 mt-2">
                        {sortedContracts.map(c => (
                          <button key={c.id} onClick={() => handleContractClick(c)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left ${selectedContractId === c.id ? 'bg-[rgba(var(--primary-color-rgb),0.15)] shadow-sm' : 'hover:bg-[var(--bg-tertiary)]'}`}>
                            {c.isExpired && <Lock className="w-3 h-3 text-[var(--text-tertiary)] flex-shrink-0" />}
                            <span className="text-xs font-medium text-[var(--text-primary)]">{c.startDate}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Employee onboarding report */}
          <div className="rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)]">
            <button onClick={() => handleExpandCollapse('onboarding')} className="w-full flex items-center gap-3 p-3.5 hover:bg-[var(--bg-tertiary)] transition-all group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--primary-color-rgb), 0.1)' }}>
                <UserCheck className="w-4 h-4" style={{ color: 'var(--phoenix-500)' }} />
              </div>
              <span className="flex-1 text-left text-sm font-semibold text-[var(--text-primary)]">Onboarding report</span>
              <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${expandedItem === 'onboarding' ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            <AnimatePresence>
              {expandedItem === 'onboarding' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-1 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
                    {onboardingReport ? (
                      <div className="space-y-1.5 mt-2">
                        <button onClick={() => handleOnboardingReportClick(onboardingReport)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left ${selectedReportId === onboardingReport.id ? 'bg-[rgba(var(--primary-color-rgb),0.15)] shadow-sm' : 'hover:bg-[var(--bg-tertiary)]'}`}>
                          <FileText className="w-3 h-3 text-[var(--text-secondary)] flex-shrink-0" />
                          <span className="text-xs font-medium text-[var(--text-primary)]">{onboardingReport.entryDate}</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--text-tertiary)] italic px-3 py-3 text-center">(No documents have been prepared yet)</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Personnel record */}
          <div className="rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)]">
            <button onClick={() => handleExpandCollapse('personnel')} className="w-full flex items-center gap-3 p-3.5 hover:bg-[var(--bg-tertiary)] transition-all group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--primary-color-rgb), 0.1)' }}>
                <ClipboardList className="w-4 h-4" style={{ color: 'var(--phoenix-500)' }} />
              </div>
              <span className="flex-1 text-left text-sm font-semibold text-[var(--text-primary)]">Personnel record</span>
              <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${expandedItem === 'personnel' ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            <AnimatePresence>
              {expandedItem === 'personnel' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-1 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
                    {personnelRecord ? (
                      <div className="space-y-1.5 mt-2">
                        <button onClick={() => handlePersonnelRecordClick(personnelRecord)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left ${selectedPersonnelRecordId === personnelRecord.id ? 'bg-[rgba(var(--primary-color-rgb),0.15)] shadow-sm' : 'hover:bg-[var(--bg-tertiary)]'}`}>
                          <FileCheck2 className="w-3 h-3 text-[var(--text-secondary)] flex-shrink-0" />
                          <span className="text-xs font-medium text-[var(--text-primary)]">{personnelRecord.contractStartDate}</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--text-tertiary)] italic px-3 py-3 text-center">(No documents have been prepared yet)</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Change employment status */}
          <div className="rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)]">
            <button onClick={() => handleExpandCollapse('employmentStatus')} className="w-full flex items-center gap-3 p-3.5 hover:bg-[var(--bg-tertiary)] transition-all group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--primary-color-rgb), 0.1)' }}>
                <Briefcase className="w-4 h-4" style={{ color: 'var(--phoenix-500)' }} />
              </div>
              <span className="flex-1 text-left text-sm font-semibold text-[var(--text-primary)]">Employment status</span>
              <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${expandedItem === 'employmentStatus' ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            <AnimatePresence>
              {expandedItem === 'employmentStatus' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-1 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
                    {sortedStatusChanges.length === 0 ? (
                      <p className="text-xs text-[var(--text-tertiary)] italic px-3 py-3 text-center">(No documents have been prepared yet)</p>
                    ) : (
                      <div className="space-y-1.5 mt-2">
                        {sortedStatusChanges.map(c => (
                          <button key={c.id} onClick={() => handleEmploymentStatusChangeClick(c)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left ${selectedStatusChangeId === c.id ? 'bg-[rgba(var(--primary-color-rgb),0.15)] shadow-sm' : 'hover:bg-[var(--bg-tertiary)]'}`}>
                            <RefreshCw className="w-3 h-3 text-[var(--text-secondary)] flex-shrink-0" />
                            <span className="text-xs font-medium text-[var(--text-primary)]">{c.dateOfIssue}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Current work certificates */}
          <div className="rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)]">
            <button onClick={() => handleExpandCollapse('workCertificates')} className="w-full flex items-center gap-3 p-3.5 hover:bg-[var(--bg-tertiary)] transition-all group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--primary-color-rgb), 0.1)' }}>
                <Award className="w-4 h-4" style={{ color: 'var(--phoenix-500)' }} />
              </div>
              <span className="flex-1 text-left text-sm font-semibold text-[var(--text-primary)]">Work certificates</span>
              <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${expandedItem === 'workCertificates' ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            <AnimatePresence>
              {expandedItem === 'workCertificates' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-1 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
                    {sortedWorkCertificates.length === 0 ? (
                      <p className="text-xs text-[var(--text-tertiary)] italic px-3 py-3 text-center">(No certificates have been issued yet)</p>
                    ) : (
                      <div className="space-y-1.5 mt-2">
                        {sortedWorkCertificates.map(w => (
                          <button key={w.id} onClick={() => handleWorkCertificateClick(w)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left ${selectedWorkCertificateId === w.id ? 'bg-[rgba(var(--primary-color-rgb),0.15)] shadow-sm' : 'hover:bg-[var(--bg-tertiary)]'}`}>
                            <Award className="w-3 h-3 text-[var(--text-secondary)] flex-shrink-0" />
                            <span className="text-xs font-medium text-[var(--text-primary)]">{w.dateOfIssue}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Certificate of work (Termination) */}
          <div className="rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)]">
            <button onClick={() => handleExpandCollapse('terminationCertificates')} className="w-full flex items-center gap-3 p-3.5 hover:bg-[var(--bg-tertiary)] transition-all group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--primary-color-rgb), 0.1)' }}>
                <FileX className="w-4 h-4" style={{ color: 'var(--phoenix-500)' }} />
              </div>
              <span className="flex-1 text-left text-sm font-semibold text-[var(--text-primary)]">Certificate of work (Termination)</span>
              <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${expandedItem === 'terminationCertificates' ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            <AnimatePresence>
              {expandedItem === 'terminationCertificates' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-1 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
                    {sortedTerminationCertificates.length === 0 ? (
                      <p className="text-xs text-[var(--text-tertiary)] italic px-3 py-3 text-center">(No certificates have been issued yet)</p>
                    ) : (
                      <div className="space-y-1.5 mt-2">
                        {sortedTerminationCertificates.map(t => (
                          <button key={t.id} onClick={() => handleTerminationCertificateClick(t)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left ${selectedTerminationCertificateId === t.id ? 'bg-[rgba(var(--primary-color-rgb),0.15)] shadow-sm' : 'hover:bg-[var(--bg-tertiary)]'}`}>
                            <FileX className="w-3 h-3 text-[var(--text-secondary)] flex-shrink-0" />
                            <span className="text-xs font-medium text-[var(--text-primary)]">{t.dateOfIssue}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
