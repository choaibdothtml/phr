import { useState, useEffect } from 'react';
import { Flame, Menu, ChevronDown, ChevronRight, Lock, FileText, ClipboardList, RefreshCw } from 'lucide-react';
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
    <div className="w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-primary)' }}><Flame className="w-5 h-5 text-white" /></div>
          <div className="flex-1"><h1 className="text-lg font-bold text-[var(--text-primary)]">Phoenix HR</h1><p className="text-xs text-[var(--text-tertiary)]">Management Suite</p></div>
          <button onClick={onShowMainSidebar} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors flex-shrink-0" title="Show Navigation"><Menu className="w-5 h-5 text-[var(--text-secondary)]" /></button>
        </div>

        {/* Contracts */}
        <div className="mb-4">
          <button onClick={() => handleExpandCollapse('contracts')} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
            <span className="font-semibold text-[var(--text-primary)]">Contracts</span>
            {expandedItems.has('contracts') ? <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />}
          </button>
          {expandedItems.has('contracts') && (<div className="ml-4 mt-2 space-y-2">{sortedContracts.length === 0 ? <p className="text-sm text-[var(--text-tertiary)] italic px-3 py-2">(No documents have been prepared yet)</p> : sortedContracts.map(c => (<button key={c.id} onClick={() => handleContractClick(c)} className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${selectedContractId === c.id ? 'bg-[rgba(var(--primary-color-rgb),0.15)]' : 'hover:bg-[var(--bg-tertiary)]'}`}>{c.isExpired && <Lock className="w-3 h-3 text-[var(--text-tertiary)]" />}<span className="text-sm text-[var(--text-primary)]">{c.startDate}</span></button>))}</div>)}
        </div>

        {/* Employee onboarding report */}
        <div className="mb-4">
          <button onClick={() => handleExpandCollapse('onboarding')} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
            <span className="font-semibold text-[var(--text-primary)]">Employee onboarding report</span>
            {expandedItems.has('onboarding') ? <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />}
          </button>
          {expandedItems.has('onboarding') && (<div className="ml-4 mt-2 space-y-2">{onboardingReport ? <button onClick={() => handleOnboardingReportClick(onboardingReport)} className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${selectedReportId === onboardingReport.id ? 'bg-[rgba(var(--primary-color-rgb),0.15)]' : 'hover:bg-[var(--bg-tertiary)]'}`}><FileText className="w-3 h-3 text-[var(--text-secondary)]" /><span className="text-sm text-[var(--text-primary)]">{onboardingReport.entryDate}</span></button> : <p className="text-sm text-[var(--text-tertiary)] italic px-3 py-2">(No documents have been prepared yet)</p>}</div>)}
        </div>

        {/* Personnel record */}
        <div className="mb-4">
          <button onClick={() => handleExpandCollapse('personnel')} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
            <span className="font-semibold text-[var(--text-primary)]">Personnel record</span>
            {expandedItems.has('personnel') ? <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />}
          </button>
          {expandedItems.has('personnel') && (<div className="ml-4 mt-2 space-y-2">{personnelRecord ? <button onClick={() => handlePersonnelRecordClick(personnelRecord)} className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${selectedPersonnelRecordId === personnelRecord.id ? 'bg-[rgba(var(--primary-color-rgb),0.15)]' : 'hover:bg-[var(--bg-tertiary)]'}`}><ClipboardList className="w-3 h-3 text-[var(--text-secondary)]" /><span className="text-sm text-[var(--text-primary)]">{personnelRecord.contractStartDate}</span></button> : <p className="text-sm text-[var(--text-tertiary)] italic px-3 py-2">(No documents have been prepared yet)</p>}</div>)}
        </div>

        {/* Change employment status */}
        <div className="mb-4">
          <button onClick={() => handleExpandCollapse('employmentStatus')} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
            <span className="font-semibold text-[var(--text-primary)]">Change employment status</span>
            {expandedItems.has('employmentStatus') ? <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />}
          </button>
          {expandedItems.has('employmentStatus') && (<div className="ml-4 mt-2 space-y-2">{sortedStatusChanges.length === 0 ? <p className="text-sm text-[var(--text-tertiary)] italic px-3 py-2">(No documents have been prepared yet)</p> : sortedStatusChanges.map(c => (<button key={c.id} onClick={() => handleEmploymentStatusChangeClick(c)} className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${selectedStatusChangeId === c.id ? 'bg-[rgba(var(--primary-color-rgb),0.15)]' : 'hover:bg-[var(--bg-tertiary)]'}`}><RefreshCw className="w-3 h-3 text-[var(--text-secondary)]" /><span className="text-sm text-[var(--text-primary)]">{c.dateOfIssue}</span></button>))}</div>)}
        </div>
      </div>
    </div>
  );
}
