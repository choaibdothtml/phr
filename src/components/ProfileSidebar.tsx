import { useState, useEffect } from 'react';
import { Flame, Menu, ChevronDown, ChevronRight, Lock, FileText, ClipboardList, RefreshCw, FileSignature, UserCheck, FileCheck2, Briefcase } from 'lucide-react';
import { Contract, OnboardingReport, PersonnelRecord, EmploymentStatusChange, contractStorage, onboardingReportStorage, personnelRecordStorage, employmentStatusStorage } from '../utils/storage';

interface ProfileSidebarProps {
  onShowMainSidebar: () => void;
  employeeNumber: string;
  onContractSelect: (c: Contract | null) => void;
  onExpandedItemChange: (e: boolean) => void;
  onOnboardingReportSelect: (r: OnboardingReport | null) => void;
  onPersonnelRecordSelect: (r: PersonnelRecord | null) => void;
  onEmploymentStatusChangeSelect: (c: EmploymentStatusChange | null) => void;
  onSectionExpand: (s: string | null) => void;
}

export default function ProfileSidebar({ onShowMainSidebar, employeeNumber, onContractSelect, onExpandedItemChange, onOnboardingReportSelect, onPersonnelRecordSelect, onEmploymentStatusChangeSelect, onSectionExpand }: ProfileSidebarProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [onboardingReport, setOnboardingReport] = useState<OnboardingReport | null>(null);
  const [personnelRecord, setPersonnelRecord] = useState<PersonnelRecord | null>(null);
  const [employmentStatusChanges, setEmploymentStatusChanges] = useState<EmploymentStatusChange[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedPersonnelRecordId, setSelectedPersonnelRecordId] = useState<string | null>(null);
  const [selectedStatusChangeId, setSelectedStatusChangeId] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeNumber) return;
    setContracts(contractStorage.getContracts(employeeNumber));
    setOnboardingReport(onboardingReportStorage.getReport(employeeNumber));
    setPersonnelRecord(personnelRecordStorage.getRecord(employeeNumber));
    setEmploymentStatusChanges(employmentStatusStorage.getStatusChanges(employeeNumber));
    setSelectedContractId(null); setSelectedReportId(null); setSelectedPersonnelRecordId(null); setSelectedStatusChangeId(null);
    setExpandedItems(new Set());
    onContractSelect(null); onOnboardingReportSelect(null); onPersonnelRecordSelect(null); onEmploymentStatusChangeSelect(null);
    onExpandedItemChange(false);
  }, [employeeNumber]);

  useEffect(() => { const i = setInterval(() => { contractStorage.updateExpiredStatus(); setContracts(contractStorage.getContracts(employeeNumber)); }, 60000); return () => clearInterval(i); }, [employeeNumber]);

  const handleExpandCollapse = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) { newExpanded.delete(itemId); if (newExpanded.size === 0) onSectionExpand(null); }
    else { newExpanded.add(itemId); onSectionExpand(itemId); }
    setExpandedItems(newExpanded); onExpandedItemChange(newExpanded.size > 0);
  };

  const handleContractClick = (c: Contract) => { setSelectedContractId(c.id); setSelectedReportId(null); setSelectedPersonnelRecordId(null); setSelectedStatusChangeId(null); onContractSelect(c); onOnboardingReportSelect(null); onPersonnelRecordSelect(null); onEmploymentStatusChangeSelect(null); };
  const handleOnboardingReportClick = (r: OnboardingReport) => { setSelectedReportId(r.id); setSelectedContractId(null); setSelectedPersonnelRecordId(null); setSelectedStatusChangeId(null); onOnboardingReportSelect(r); onContractSelect(null); onPersonnelRecordSelect(null); onEmploymentStatusChangeSelect(null); };
  const handlePersonnelRecordClick = (r: PersonnelRecord) => { setSelectedPersonnelRecordId(r.id); setSelectedContractId(null); setSelectedReportId(null); setSelectedStatusChangeId(null); onPersonnelRecordSelect(r); onContractSelect(null); onOnboardingReportSelect(null); onEmploymentStatusChangeSelect(null); };
  const handleEmploymentStatusChangeClick = (c: EmploymentStatusChange) => { setSelectedStatusChangeId(c.id); setSelectedContractId(null); setSelectedReportId(null); setSelectedPersonnelRecordId(null); onEmploymentStatusChangeSelect(c); onContractSelect(null); onOnboardingReportSelect(null); onPersonnelRecordSelect(null); };

  const sortedContracts = [...contracts].sort((a, b) => new Date(a.startDate.split('/').reverse().join('-')).getTime() - new Date(b.startDate.split('/').reverse().join('-')).getTime());
  const sortedStatusChanges = [...employmentStatusChanges].sort((a, b) => new Date(a.dateOfIssue.split('/').reverse().join('-')).getTime() - new Date(b.dateOfIssue.split('/').reverse().join('-')).getTime());

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
              <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${expandedItems.has('contracts') ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            {expandedItems.has('contracts') && (
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
            )}
          </div>

          {/* Employee onboarding report */}
          <div className="rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)]">
            <button onClick={() => handleExpandCollapse('onboarding')} className="w-full flex items-center gap-3 p-3.5 hover:bg-[var(--bg-tertiary)] transition-all group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--primary-color-rgb), 0.1)' }}>
                <UserCheck className="w-4 h-4" style={{ color: 'var(--phoenix-500)' }} />
              </div>
              <span className="flex-1 text-left text-sm font-semibold text-[var(--text-primary)]">Onboarding report</span>
              <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${expandedItems.has('onboarding') ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            {expandedItems.has('onboarding') && (
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
            )}
          </div>

          {/* Personnel record */}
          <div className="rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)]">
            <button onClick={() => handleExpandCollapse('personnel')} className="w-full flex items-center gap-3 p-3.5 hover:bg-[var(--bg-tertiary)] transition-all group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--primary-color-rgb), 0.1)' }}>
                <ClipboardList className="w-4 h-4" style={{ color: 'var(--phoenix-500)' }} />
              </div>
              <span className="flex-1 text-left text-sm font-semibold text-[var(--text-primary)]">Personnel record</span>
              <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${expandedItems.has('personnel') ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            {expandedItems.has('personnel') && (
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
            )}
          </div>

          {/* Change employment status */}
          <div className="rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)]">
            <button onClick={() => handleExpandCollapse('employmentStatus')} className="w-full flex items-center gap-3 p-3.5 hover:bg-[var(--bg-tertiary)] transition-all group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--primary-color-rgb), 0.1)' }}>
                <Briefcase className="w-4 h-4" style={{ color: 'var(--phoenix-500)' }} />
              </div>
              <span className="flex-1 text-left text-sm font-semibold text-[var(--text-primary)]">Employment status</span>
              <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${expandedItems.has('employmentStatus') ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            {expandedItems.has('employmentStatus') && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
