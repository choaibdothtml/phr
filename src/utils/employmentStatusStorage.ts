export interface EmploymentStatusChange {
  id: string;
  employeeNumber: string;
  referenceCode: string;
  dateOfIssue: string;
  takesEffect: string;
  // Current status (before change)
  currentJob: string;
  currentDepartment: string;
  currentClassification: string;
  currentDegree: string;
  currentGroup: string;
  currentBasicSalary: string;
  currentContractualStatus: string;
  // New status (after change)
  newJob: string;
  newDepartment: string;
  newClassification: string;
  newDegree: string;
  newGroup: string;
  newBasicSalary: string;
  newContractualStatus: string;
}

export interface EmploymentHistory {
  employeeNumber: string;
  history: EmploymentStatusChange[];
}

const STORAGE_KEY = 'phoenix-hr-employment-status-changes';
const HISTORY_KEY = 'phoenix-hr-employment-history';

export const employmentStatusStorage = {
  // Get all status changes for an employee
  getStatusChanges: (employeeNumber: string): EmploymentStatusChange[] => {
    const allChanges = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return allChanges[employeeNumber] || [];
  },

  // Save a new status change
  saveStatusChange: (change: EmploymentStatusChange): void => {
    const allChanges = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!allChanges[change.employeeNumber]) {
      allChanges[change.employeeNumber] = [];
    }
    allChanges[change.employeeNumber].push(change);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allChanges));
    
    // Also save to employment history
    saveToHistory(change);
  },

  // Update an existing status change
  updateStatusChange: (changeId: string, updatedChange: EmploymentStatusChange): void => {
    const allChanges = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const employeeChanges = allChanges[updatedChange.employeeNumber] || [];
    const index = employeeChanges.findIndex((c: EmploymentStatusChange) => c.id === changeId);
    if (index !== -1) {
      employeeChanges[index] = updatedChange;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allChanges));
    }
  },

  // Delete a status change
  deleteStatusChange: (employeeNumber: string, changeId: string): void => {
    const allChanges = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const employeeChanges = allChanges[employeeNumber] || [];
    allChanges[employeeNumber] = employeeChanges.filter((c: EmploymentStatusChange) => c.id !== changeId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allChanges));
  },

  // Get employment history for an employee
  getEmploymentHistory: (employeeNumber: string): EmploymentHistory | null => {
    const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    return allHistory[employeeNumber] || null;
  }
};

// Save to employment history (hidden table)
const saveToHistory = (change: EmploymentStatusChange): void => {
  const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
  if (!allHistory[change.employeeNumber]) {
    allHistory[change.employeeNumber] = {
      employeeNumber: change.employeeNumber,
      history: []
    };
  }
  allHistory[change.employeeNumber].history.push(change);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
};
