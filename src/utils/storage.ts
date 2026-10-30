// Combined storage utilities for Phoenix HR

// Contract Storage
export interface Contract {
  id: string; employeeNumber: string; referenceCode: string; dateOfIssue: string;
  startDate: string; duration: string; durationUnit: 'days' | 'months' | 'years';
  endDate: string; purposeOfAppointment: string; isExpired: boolean; isFirstContract: boolean;
}
const CONTRACTS_KEY = 'phoenix-hr-contracts';
export const contractStorage = {
  getContracts: (empNum: string): Contract[] => JSON.parse(localStorage.getItem(CONTRACTS_KEY) || '{}')[empNum] || [],
  saveContract: (c: Contract) => { const all = JSON.parse(localStorage.getItem(CONTRACTS_KEY) || '{}'); if (!all[c.employeeNumber]) all[c.employeeNumber] = []; all[c.employeeNumber].push(c); localStorage.setItem(CONTRACTS_KEY, JSON.stringify(all)); },
  updateContract: (id: string, c: Contract) => { const all = JSON.parse(localStorage.getItem(CONTRACTS_KEY) || '{}'); const emp = all[c.employeeNumber] || []; const idx = emp.findIndex((x: Contract) => x.id === id); if (idx !== -1) { emp[idx] = c; localStorage.setItem(CONTRACTS_KEY, JSON.stringify(all)); } },
  deleteContract: (empNum: string, id: string) => { const all = JSON.parse(localStorage.getItem(CONTRACTS_KEY) || '{}'); all[empNum] = (all[empNum] || []).filter((c: Contract) => c.id !== id); localStorage.setItem(CONTRACTS_KEY, JSON.stringify(all)); },
  isContractExpired: (endDate: string) => { if (!endDate) return false; const parts = endDate.split('/'); if (parts.length !== 3) return false; const end = new Date(+parts[2], +parts[1]-1, +parts[0]); return end < new Date(); },
  updateExpiredStatus: () => { const all = JSON.parse(localStorage.getItem(CONTRACTS_KEY) || '{}'); let changed = false; Object.keys(all).forEach(empNum => { all[empNum].forEach((c: Contract) => { const exp = contractStorage.isContractExpired(c.endDate); if (c.isExpired !== exp) { c.isExpired = exp; changed = true; } }); }); if (changed) localStorage.setItem(CONTRACTS_KEY, JSON.stringify(all)); },
};

// Onboarding Report Storage
export interface OnboardingReport {
  id: string; employeeNumber: string; referenceCode: string; entryDate: string; dateInLetters: string;
}
const ONBOARDING_KEY = 'phoenix-hr-onboarding-reports';
export const onboardingReportStorage = {
  getReport: (empNum: string): OnboardingReport | null => { const all = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '{}'); const reps = all[empNum] || []; return reps.length > 0 ? reps[0] : null; },
  saveReport: (r: OnboardingReport) => { const all = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '{}'); all[r.employeeNumber] = [r]; localStorage.setItem(ONBOARDING_KEY, JSON.stringify(all)); },
  deleteReport: (empNum: string) => { const all = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '{}'); delete all[empNum]; localStorage.setItem(ONBOARDING_KEY, JSON.stringify(all)); },
  dateToLetters: (dateStr: string): string => {
    if (!dateStr) return ''; const parts = dateStr.split('/'); if (parts.length !== 3) return '';
    const day = parseInt(parts[0]), month = parseInt(parts[1]) - 1, year = parseInt(parts[2]);
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const suffix = (n: number) => { const s = ['th','st','nd','rd'], v = n % 100; return s[(v-20)%10] || s[v] || s[0]; };
    return `The ${day}${suffix(day)} of ${months[month]}, ${year}`;
  },
};

// Personnel Record Storage
export interface PersonnelRecord { id: string; employeeNumber: string; contractStartDate: string; createdAt: string; }
const PERSONNEL_KEY = 'phoenix-hr-personnel-records';
export const personnelRecordStorage = {
  getRecord: (empNum: string): PersonnelRecord | null => JSON.parse(localStorage.getItem(PERSONNEL_KEY) || '{}')[empNum] || null,
  saveRecord: (r: PersonnelRecord) => { const all = JSON.parse(localStorage.getItem(PERSONNEL_KEY) || '{}'); all[r.employeeNumber] = r; localStorage.setItem(PERSONNEL_KEY, JSON.stringify(all)); },
  deleteRecord: (empNum: string) => { const all = JSON.parse(localStorage.getItem(PERSONNEL_KEY) || '{}'); delete all[empNum]; localStorage.setItem(PERSONNEL_KEY, JSON.stringify(all)); },
};

// Employment Status Storage
export interface EmploymentStatusChange {
  id: string; employeeNumber: string; referenceCode: string; dateOfIssue: string; takesEffect: string;
  currentJob: string; currentDepartment: string; currentClassification: string; currentDegree: string;
  currentGroup: string; currentBasicSalary: string; currentContractualStatus: string;
  newJob: string; newDepartment: string; newClassification: string; newDegree: string;
  newGroup: string; newBasicSalary: string; newContractualStatus: string;
}
const EMP_STATUS_KEY = 'phoenix-hr-employment-status-changes';
export const employmentStatusStorage = {
  getStatusChanges: (empNum: string): EmploymentStatusChange[] => JSON.parse(localStorage.getItem(EMP_STATUS_KEY) || '{}')[empNum] || [],
  saveStatusChange: (c: EmploymentStatusChange) => { const all = JSON.parse(localStorage.getItem(EMP_STATUS_KEY) || '{}'); if (!all[c.employeeNumber]) all[c.employeeNumber] = []; all[c.employeeNumber].push(c); localStorage.setItem(EMP_STATUS_KEY, JSON.stringify(all)); },
  updateStatusChange: (id: string, c: EmploymentStatusChange) => { const all = JSON.parse(localStorage.getItem(EMP_STATUS_KEY) || '{}'); const emp = all[c.employeeNumber] || []; const idx = emp.findIndex((x: EmploymentStatusChange) => x.id === id); if (idx !== -1) { emp[idx] = c; localStorage.setItem(EMP_STATUS_KEY, JSON.stringify(all)); } },
  deleteStatusChange: (empNum: string, id: string) => { const all = JSON.parse(localStorage.getItem(EMP_STATUS_KEY) || '{}'); all[empNum] = (all[empNum] || []).filter((c: EmploymentStatusChange) => c.id !== id); localStorage.setItem(EMP_STATUS_KEY, JSON.stringify(all)); },
};

// Work Certificate Storage
export interface WorkCertificate {
  id: string;
  employeeNumber: string;
  referenceCode: string;
  dateOfIssue: string;
  usedFor: 'Administrative documents' | 'Passport' | 'Bank account';
}

const WORK_CERT_KEY = 'phoenix-hr-work-certificates';
export const workCertificateStorage = {
  getCertificates: (empNum: string): WorkCertificate[] => JSON.parse(localStorage.getItem(WORK_CERT_KEY) || '{}')[empNum] || [],
  saveCertificate: (c: WorkCertificate) => { const all = JSON.parse(localStorage.getItem(WORK_CERT_KEY) || '{}'); if (!all[c.employeeNumber]) all[c.employeeNumber] = []; all[c.employeeNumber].push(c); localStorage.setItem(WORK_CERT_KEY, JSON.stringify(all)); },
  updateCertificate: (id: string, c: WorkCertificate) => { const all = JSON.parse(localStorage.getItem(WORK_CERT_KEY) || '{}'); const emp = all[c.employeeNumber] || []; const idx = emp.findIndex((x: WorkCertificate) => x.id === id); if (idx !== -1) { emp[idx] = c; localStorage.setItem(WORK_CERT_KEY, JSON.stringify(all)); } },
  deleteCertificate: (empNum: string, id: string) => { const all = JSON.parse(localStorage.getItem(WORK_CERT_KEY) || '{}'); all[empNum] = (all[empNum] || []).filter((c: WorkCertificate) => c.id !== id); localStorage.setItem(WORK_CERT_KEY, JSON.stringify(all)); },
};
