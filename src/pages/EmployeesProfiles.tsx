// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ArrowLeft, FilePlus, Edit, Trash2, Eye, FileDown, Printer } from 'lucide-react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { api, Employee } from '../services/api';
import { Contract, contractStorage } from '../utils/storage';
import { OnboardingReport, onboardingReportStorage } from '../utils/storage';
import { PersonnelRecord } from '../utils/storage';
import { EmploymentStatusChange, employmentStatusStorage } from '../utils/storage';
import { WorkCertificate, workCertificateStorage } from '../utils/storage';
import { TerminationCertificate, terminationCertificateStorage } from '../utils/storage';
import ContractForm from '../components/ContractForm';
import OnboardingReportForm from '../components/OnboardingReportForm';
import EmploymentStatusForm from '../components/EmploymentStatusForm';
import WorkCertificateForm from '../components/WorkCertificateForm';
import TerminationCertificateForm from '../components/TerminationCertificateForm';

interface ProfileData {
  employeeNumber: string; lastName: string; firstName: string; fatherName: string; motherLastName: string; motherFirstName: string;
  position: string; department: string; group: string; classification: string; degree: string; phone: string;
}

interface OutletContextType {
  selectedContract: Contract | null; selectedOnboardingReport: OnboardingReport | null; selectedPersonnelRecord: PersonnelRecord | null;
  selectedEmploymentStatusChange: EmploymentStatusChange | null; selectedWorkCertificate: WorkCertificate | null; selectedTerminationCertificate: TerminationCertificate | null;
  employeeNumber: string; setEmployeeNumber: (value: string) => void;
  hasExpandedItem: boolean; expandedSection: string | null;
}

export default function EmployeesProfiles() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedContract, selectedOnboardingReport, selectedPersonnelRecord, selectedEmploymentStatusChange, selectedWorkCertificate, selectedTerminationCertificate, employeeNumber, setEmployeeNumber, hasExpandedItem, expandedSection } = useOutletContext<OutletContextType>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    employeeNumber: '', lastName: '', firstName: '', fatherName: '', motherLastName: '', motherFirstName: '',
    position: '', department: '', group: '', classification: '', degree: '', phone: '',
  });
  const [showError, setShowError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownResults, setDropdownResults] = useState<Employee[]>([]);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);
  const [showOnboardingReportForm, setShowOnboardingReportForm] = useState(false);
  const [showEmploymentStatusForm, setShowEmploymentStatusForm] = useState(false);
  const [showWorkCertificateForm, setShowWorkCertificateForm] = useState(false);
  const [showTerminationCertificateForm, setShowTerminationCertificateForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmType, setDeleteConfirmType] = useState<'contract' | 'onboarding' | 'workCertificate' | 'terminationCertificate' | null>(null);
  const [showTerminatedError, setShowTerminatedError] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  
  const numberInputRef = useRef<HTMLInputElement>(null);
  const lastNameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fromList = location.state?.employee;
  const navigationSource = localStorage.getItem('employeesListFrom');

  useEffect(() => {
    const savedEmployees = localStorage.getItem('phoenix-hr-employees');
    if (savedEmployees) {
      const employeeData = JSON.parse(savedEmployees);
      setEmployees(employeeData);
      setLoading(false);
      if (location.state?.employee) {
        const emp = location.state.employee;
        setProfile({
          employeeNumber: emp.employeeNumber, lastName: emp.lastName, firstName: emp.firstName,
          fatherName: emp.fatherName || '', motherLastName: emp.motherLastName || '', motherFirstName: emp.motherFirstName || '',
          position: emp.position, department: emp.department, group: emp.group,
          classification: emp.classification || '', degree: emp.degree || '', phone: emp.phone || '',
        });
        setEmployeeNumber(emp.employeeNumber);
        setCurrentEmployee(emp);
        setHasLoadedProfile(true);
      }
    } else {
      api.employees.getAll().then(data => {
        setEmployees(data);
        setLoading(false);
        if (location.state?.employee) {
          const emp = location.state.employee;
          setProfile({
            employeeNumber: emp.employeeNumber, lastName: emp.lastName, firstName: emp.firstName,
            fatherName: emp.fatherName || '', motherLastName: emp.motherLastName || '', motherFirstName: emp.motherFirstName || '',
            position: emp.position, department: emp.department, group: emp.group,
            classification: emp.classification || '', degree: emp.degree || '', phone: emp.phone || '',
          });
          setEmployeeNumber(emp.employeeNumber);
          setCurrentEmployee(emp);
          setHasLoadedProfile(true);
        }
      });
    }
  }, [location.state, setEmployeeNumber]);

  const handleNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setProfile(prev => ({ ...prev, employeeNumber: value }));
  };

  const handleNumberKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const num = profile.employeeNumber;
      if (!num) return;
      const padded = num.padStart(4, '0');
      setProfile(prev => ({ ...prev, employeeNumber: padded }));
      const found = employees.find(emp => emp.employeeNumber === padded);
      if (found) {
        fillProfile(found);
        setShowError(false);
      } else {
        setShowError(true);
      }
    }
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value;
    setProfile(prev => ({ ...prev, lastName: value }));
    if (value.length >= 1) {
      const results = employees.filter(emp => emp.lastName.toLowerCase().startsWith(value.toLowerCase())).sort((a, b) => a.lastName.localeCompare(b.lastName));
      setDropdownResults(results);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setDropdownResults([]);
    }
  };

  const handleDropdownSelect = (emp: Employee) => {
    fillProfile(emp);
    setShowDropdown(false);
  };

  const fillProfile = (emp: Employee) => {
    setProfile({
      employeeNumber: emp.employeeNumber, lastName: emp.lastName, firstName: emp.firstName,
      fatherName: emp.fatherName || '', motherLastName: emp.motherLastName || '', motherFirstName: emp.motherFirstName || '',
      position: emp.position, department: emp.department, group: emp.group,
      classification: emp.classification || '', degree: emp.degree || '', phone: emp.phone || '',
    });
    setShowError(false);
    setHasLoadedProfile(true);
    setEmployeeNumber(emp.employeeNumber);
    setCurrentEmployee(emp);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target) && lastNameInputRef.current && !lastNameInputRef.current.contains(target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoBack = () => {
    localStorage.removeItem('employeesListFrom');
    navigate('/employees/list');
  };

  const [showNoContractError, setShowNoContractError] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showNotTerminatedError, setShowNotTerminatedError] = useState(false);

  const handleNewContract = () => {
    if (!currentEmployee) return;
    
    if (expandedSection === 'employmentStatus') {
      // Check if employee is terminated
      if (currentEmployee.status === 'terminated') {
        setShowTerminatedError(true);
        return;
      }
      
      // Check if employee has an active contract
      const contracts = contractStorage.getContracts(currentEmployee.employeeNumber);
      const hasActiveContract = contracts.some(c => !c.isExpired);
      
      if (!hasActiveContract) {
        setShowNoContractError(true);
        return;
      }
      
      setShowEmploymentStatusForm(true);
    } else if (expandedSection === 'onboarding') {
      if (currentEmployee.status === 'terminated') {
        setShowTerminatedError(true);
        return;
      }
      setShowOnboardingReportForm(true);
    } else if (expandedSection === 'contracts') {
      if (currentEmployee.status === 'terminated') {
        setShowTerminatedError(true);
        return;
      }
      setShowContractForm(true);
    } else if (expandedSection === 'workCertificates') {
      if (currentEmployee.status === 'terminated') {
        setShowTerminatedError(true);
        return;
      }
      setShowWorkCertificateForm(true);
    } else if (expandedSection === 'terminationCertificates') {
      if (currentEmployee.status !== 'terminated') {
        setShowNotTerminatedError(true);
        return;
      }
      setShowTerminationCertificateForm(true);
    }
  };

  const handleOnboardingReportSave = (report: OnboardingReport) => {
    onboardingReportStorage.saveReport(report);
    setShowOnboardingReportForm(false);
  };

  const handleContractSave = (contract: Contract) => {
    if (contract.id) {
      contractStorage.updateContract(contract.id, contract);
    } else {
      contractStorage.saveContract(contract);
    }
    const savedEmployees = localStorage.getItem('phoenix-hr-employees');
    if (savedEmployees) {
      const empList = JSON.parse(savedEmployees);
      const index = empList.findIndex(e => e.employeeNumber === contract.employeeNumber);
      if (index !== -1) {
        empList[index].currentContractStartDate = contract.startDate;
        empList[index].currentContractEndDate = contract.endDate;
        localStorage.setItem('phoenix-hr-employees', JSON.stringify(empList));
        setEmployees(empList);
      }
    }
    setShowContractForm(false);
  };

  const handleEmploymentStatusSave = (statusChange: EmploymentStatusChange) => {
    if (statusChange.id) {
      employmentStatusStorage.updateStatusChange(statusChange.id, statusChange);
    } else {
      employmentStatusStorage.saveStatusChange(statusChange);
    }
    
    // Update employee data with new status
    const savedEmployees = localStorage.getItem('phoenix-hr-employees');
    if (savedEmployees) {
      const empList = JSON.parse(savedEmployees);
      const index = empList.findIndex((e: Employee) => e.employeeNumber === statusChange.employeeNumber);
      if (index !== -1) {
        empList[index].position = statusChange.newJob;
        empList[index].department = statusChange.newDepartment;
        empList[index].classification = statusChange.newClassification;
        empList[index].degree = statusChange.newDegree;
        empList[index].group = statusChange.newGroup;
        empList[index].basicSalary = statusChange.newBasicSalary;
        empList[index].contractualStatus = statusChange.newContractualStatus;
        localStorage.setItem('phoenix-hr-employees', JSON.stringify(empList));
        setEmployees(empList);
        
        // Update current employee
        setCurrentEmployee(empList[index]);
      }
    }
    
    setShowEmploymentStatusForm(false);
    
    // Show reminder about financial values
    setShowReminder(true);
  };

  const handleWorkCertificateSave = (certificate: WorkCertificate) => {
    if (certificate.id) {
      workCertificateStorage.updateCertificate(certificate.id, certificate);
    } else {
      workCertificateStorage.saveCertificate(certificate);
    }
    setShowWorkCertificateForm(false);
  };

  const handleTerminationCertificateSave = (certificate: TerminationCertificate) => {
    if (certificate.id) {
      terminationCertificateStorage.updateCertificate(certificate.id, certificate);
    } else {
      terminationCertificateStorage.saveCertificate(certificate);
    }
    setShowTerminationCertificateForm(false);
  };

  const handleEdit = () => {
    if (selectedContract) {
      setShowContractForm(true);
    } else if (selectedOnboardingReport) {
      setShowOnboardingReportForm(true);
    } else if (selectedEmploymentStatusChange) {
      setShowEmploymentStatusForm(true);
    } else if (selectedWorkCertificate) {
      setShowWorkCertificateForm(true);
    } else if (selectedTerminationCertificate) {
      setShowTerminationCertificateForm(true);
    }
  };

  const handleDelete = () => {
    if (selectedContract) {
      setDeleteConfirmType('contract');
      setShowDeleteConfirm(true);
    } else if (selectedOnboardingReport) {
      setDeleteConfirmType('onboarding');
      setShowDeleteConfirm(true);
    } else if (selectedEmploymentStatusChange) {
      setDeleteConfirmType('employmentStatus');
      setShowDeleteConfirm(true);
    } else if (selectedWorkCertificate) {
      setDeleteConfirmType('workCertificate');
      setShowDeleteConfirm(true);
    } else if (selectedTerminationCertificate) {
      setDeleteConfirmType('terminationCertificate');
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (deleteConfirmType === 'contract' && selectedContract) {
      contractStorage.deleteContract(selectedContract.employeeNumber, selectedContract.id);
    } else if (deleteConfirmType === 'onboarding' && selectedOnboardingReport) {
      onboardingReportStorage.deleteReport(selectedOnboardingReport.employeeNumber);
    } else if (deleteConfirmType === 'employmentStatus' && selectedEmploymentStatusChange) {
      employmentStatusStorage.deleteStatusChange(selectedEmploymentStatusChange.employeeNumber, selectedEmploymentStatusChange.id);
    } else if (deleteConfirmType === 'workCertificate' && selectedWorkCertificate) {
      workCertificateStorage.deleteCertificate(selectedWorkCertificate.employeeNumber, selectedWorkCertificate.id);
    } else if (deleteConfirmType === 'terminationCertificate' && selectedTerminationCertificate) {
      terminationCertificateStorage.deleteCertificate(selectedTerminationCertificate.employeeNumber, selectedTerminationCertificate.id);
    }
    setShowDeleteConfirm(false);
    setDeleteConfirmType(null);
  };

  const handleExportPDF = () => {
    if (selectedContract) console.log('Export PDF for contract:', selectedContract);
    else if (selectedOnboardingReport) console.log('Export PDF for onboarding report:', selectedOnboardingReport);
    else if (selectedPersonnelRecord) console.log('Export PDF for personnel record:', selectedPersonnelRecord);
    else if (selectedWorkCertificate) console.log('Export PDF for work certificate:', selectedWorkCertificate);
    else if (selectedTerminationCertificate) console.log('Export PDF for termination certificate:', selectedTerminationCertificate);
  };

  const handlePrint = () => {
    if (selectedContract) console.log('Print contract:', selectedContract);
    else if (selectedOnboardingReport) console.log('Print onboarding report:', selectedOnboardingReport);
    else if (selectedPersonnelRecord) console.log('Print personnel record:', selectedPersonnelRecord);
    else if (selectedWorkCertificate) console.log('Print work certificate:', selectedWorkCertificate);
    else if (selectedTerminationCertificate) console.log('Print termination certificate:', selectedTerminationCertificate);
    window.print();
  };

  if (loading) {
    return (<div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-3 border-phoenix-200 border-t-phoenix-500 rounded-full animate-spin" /></div>);
  }

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
      <div className="pt-6 pb-2 px-6 max-w-[1600px] mx-auto w-full">
        <div className="flex items-center gap-4">
          {fromList && navigationSource === 'list' && (<button onClick={handleGoBack} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}><ArrowLeft className="w-4 h-4" />Back to list</button>)}
        </div>
      </div>
      <div className="pt-2 pb-6 px-6 max-w-[1600px] mx-auto w-full">
        <div className="glass-card p-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Employee No.</label>
              <input ref={numberInputRef} type="text" value={profile.employeeNumber} onChange={handleNumberChange} onKeyDown={handleNumberKeyDown} maxLength={4} placeholder="0000" className="w-24 px-3 py-2.5 rounded-xl text-sm font-mono text-center outline-none focus:ring-2 focus:ring-phoenix-500/30" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Family Name</label>
              <div className="relative">
                <input ref={lastNameInputRef} type="text" value={profile.lastName} onChange={handleLastNameChange} placeholder="Type to search" className="w-52 px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
              </div>
              {showDropdown && dropdownResults.length > 0 && (<div ref={dropdownRef} className="absolute top-full left-0 mt-1 w-64 max-h-48 overflow-y-auto rounded-xl z-50 animate-fade-in-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>{dropdownResults.map(emp => (<div key={emp.id} onDoubleClick={() => handleDropdownSelect(emp)} className="px-3 py-2 cursor-pointer transition-colors hover:bg-[var(--bg-tertiary)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}><p className="text-sm" style={{ color: 'var(--text-primary)' }}>{emp.lastName}, {emp.firstName}</p><p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>No. {emp.employeeNumber} · {emp.department}</p></div>))}<div className="px-3 py-1.5" style={{ background: 'var(--bg-tertiary)' }}><p className="text-[10px] text-center" style={{ color: 'var(--text-tertiary)' }}>Double-click to select</p></div></div>)}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Name</label>
              <input type="text" value={profile.firstName} readOnly className="w-52 px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Job</label>
              <input type="text" value={profile.position} readOnly className="w-52 px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Department</label>
              <input type="text" value={profile.department} readOnly className="w-40 px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Group</label>
              <input type="text" value={profile.group} readOnly className="w-40 px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Class-Degree</label>
              <input type="text" value={profile.classification && profile.degree ? `${profile.classification}-${profile.degree}` : ''} readOnly className="w-24 px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Phone</label>
              <input type="text" value={profile.phone} readOnly className="w-40 px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 pb-6 max-w-[1600px] mx-auto w-full">
        <div className="flex gap-3 justify-center">
          <button disabled={!hasLoadedProfile || !hasExpandedItem || expandedSection === 'personnel'} onClick={handleNewContract} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}><FilePlus className="w-4 h-4" />New</button>
          <button disabled={!selectedContract && !selectedOnboardingReport && !selectedPersonnelRecord && !selectedEmploymentStatusChange && !selectedWorkCertificate && !selectedTerminationCertificate} onClick={handleEdit} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}><Edit className="w-4 h-4" />Edit</button>
          <button disabled={(!selectedContract && !selectedOnboardingReport && !selectedEmploymentStatusChange && !selectedWorkCertificate && !selectedTerminationCertificate) || (selectedContract?.isFirstContract) || (selectedContract?.isExpired) || !!selectedPersonnelRecord} onClick={handleDelete} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}><Trash2 className="w-4 h-4" />Delete</button>
          <button disabled={!selectedContract && !selectedOnboardingReport && !selectedPersonnelRecord && !selectedEmploymentStatusChange && !selectedWorkCertificate && !selectedTerminationCertificate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}><Eye className="w-4 h-4" />View</button>
          <button disabled={!selectedContract && !selectedOnboardingReport && !selectedPersonnelRecord && !selectedEmploymentStatusChange && !selectedWorkCertificate && !selectedTerminationCertificate} onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}><FileDown className="w-4 h-4" />Export as PDF</button>
          <button disabled={!selectedContract && !selectedOnboardingReport && !selectedPersonnelRecord && !selectedEmploymentStatusChange && !selectedWorkCertificate && !selectedTerminationCertificate} onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}><Printer className="w-4 h-4" />Print</button>
        </div>
      </div>
      <AnimatePresence>
        {showError && (<><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }} className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="glass-card p-8 text-center max-w-sm w-full" style={{ background: 'var(--bg-card)' }}><div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#ef4444' }}><X className="w-8 h-8 text-white" strokeWidth={3} /></div><h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Invalid employee number</h3><p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>The employee number you entered does not exist in our records.</p><button onClick={() => { setShowError(false); setProfile(prev => ({ ...prev, employeeNumber: '' })); numberInputRef.current?.focus(); }} className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-105" style={{ background: 'var(--gradient-primary)' }}>Try typing again</button></div></motion.div></>)}
      </AnimatePresence>
      {showContractForm && currentEmployee && (<ContractForm employee={currentEmployee} contract={selectedContract} onClose={() => setShowContractForm(false)} onSave={handleContractSave} />)}
      {showOnboardingReportForm && currentEmployee && (<OnboardingReportForm employee={currentEmployee} report={selectedOnboardingReport} onClose={() => setShowOnboardingReportForm(false)} onSave={handleOnboardingReportSave} />)}
      {showEmploymentStatusForm && currentEmployee && (<EmploymentStatusForm employee={currentEmployee} statusChange={selectedEmploymentStatusChange} onClose={() => setShowEmploymentStatusForm(false)} onSave={handleEmploymentStatusSave} />)}
      {showWorkCertificateForm && currentEmployee && (<WorkCertificateForm employee={currentEmployee} certificate={selectedWorkCertificate} onClose={() => setShowWorkCertificateForm(false)} onSave={handleWorkCertificateSave} />)}
      {showTerminationCertificateForm && currentEmployee && (<TerminationCertificateForm employee={currentEmployee} certificate={selectedTerminationCertificate} onClose={() => setShowTerminationCertificateForm(false)} onSave={handleTerminationCertificateSave} />)}
      <AnimatePresence>
        {showTerminatedError && (<><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowTerminatedError(false)} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }} className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="glass-card p-8 text-center max-w-sm w-full" style={{ background: 'var(--bg-card)' }}><div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#ef4444' }}><X className="w-8 h-8 text-white" strokeWidth={3} /></div><h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Unable to add contract</h3><p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Unable to add a new contract for a terminated employee.</p><button onClick={() => setShowTerminatedError(false)} className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-105" style={{ background: 'var(--gradient-primary)' }}>Ok</button></div></motion.div></>)}
      </AnimatePresence>
      <AnimatePresence>
        {showNotTerminatedError && (<><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowNotTerminatedError(false)} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }} className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="glass-card p-8 text-center max-w-sm w-full" style={{ background: 'var(--bg-card)' }}><div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#ef4444' }}><X className="w-8 h-8 text-white" strokeWidth={3} /></div><h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Unable to issue certificate</h3><p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Unable to issue a work certificate for an existing employee.</p><button onClick={() => setShowNotTerminatedError(false)} className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-105" style={{ background: 'var(--gradient-primary)' }}>Ok</button></div></motion.div></>)}
      </AnimatePresence>
      <AnimatePresence>
        {showDeleteConfirm && (<><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowDeleteConfirm(false)} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }} className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="glass-card p-8 text-center max-w-sm w-full" style={{ background: 'var(--bg-card)' }}><div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239, 68, 68, 0.1)' }}><Trash2 className="w-8 h-8 text-red-500" /></div><h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{deleteConfirmType === 'contract' ? 'Delete Contract' : deleteConfirmType === 'onboarding' ? 'Delete Onboarding Report' : deleteConfirmType === 'employmentStatus' ? 'Delete Employment Status Change' : deleteConfirmType === 'workCertificate' ? 'Delete Work Certificate' : 'Delete Termination Certificate'}</h3><p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{deleteConfirmType === 'contract' ? 'Do you really want to delete this contract?' : deleteConfirmType === 'onboarding' ? 'Do you really want to delete this onboarding report?' : deleteConfirmType === 'employmentStatus' ? 'Do you really want to delete this employment status change?' : deleteConfirmType === 'workCertificate' ? 'Do you really want to delete this work certificate?' : 'Do you really want to delete this termination certificate?'}</p><div className="flex gap-3 justify-center"><button onClick={() => setShowDeleteConfirm(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>No</button><button onClick={confirmDelete} className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105" style={{ background: '#ef4444' }}>Yes</button></div></div></motion.div></>)}
      </AnimatePresence>
      <AnimatePresence>
        {showNoContractError && (<><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowNoContractError(false)} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }} className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="glass-card p-8 text-center max-w-sm w-full" style={{ background: 'var(--bg-card)' }}><div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#f59e0b' }}><AlertCircle className="w-8 h-8 text-white" strokeWidth={3} /></div><h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>No Active Contract</h3><p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>This employee doesn't have an active contract, please add a new contract first.</p><button onClick={() => setShowNoContractError(false)} className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-105" style={{ background: 'var(--gradient-primary)' }}>Ok</button></div></motion.div></>)}
      </AnimatePresence>
      <AnimatePresence>
        {showReminder && (<><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowReminder(false)} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }} className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="glass-card p-8 text-center max-w-md w-full" style={{ background: 'var(--bg-card)' }}><div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(59, 130, 246, 0.1)' }}><AlertCircle className="w-8 h-8 text-blue-500" strokeWidth={3} /></div><h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Reminder</h3><p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Please change the financial values in the administrative decisions if the change you made affects employee's classification or degree.</p><button onClick={() => setShowReminder(false)} className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-105" style={{ background: 'var(--gradient-primary)' }}>Ok</button></div></motion.div></>)}
      </AnimatePresence>
    </div>
  );
}
