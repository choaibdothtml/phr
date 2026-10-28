export interface WorkCertificate {
  id: string;
  employeeNumber: string;
  referenceCode: string;
  dateOfIssue: string;
  usedFor: 'Administrative documents' | 'Passport' | 'Bank account';
}

const STORAGE_KEY = 'phoenix-hr-work-certificates';

export const workCertificateStorage = {
  // Get all work certificates for an employee
  getCertificates: (employeeNumber: string): WorkCertificate[] => {
    const allCertificates = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return allCertificates[employeeNumber] || [];
  },

  // Save a new work certificate
  saveCertificate: (certificate: WorkCertificate): void => {
    const allCertificates = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!allCertificates[certificate.employeeNumber]) {
      allCertificates[certificate.employeeNumber] = [];
    }
    allCertificates[certificate.employeeNumber].push(certificate);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allCertificates));
  },

  // Update an existing work certificate
  updateCertificate: (certificate: WorkCertificate): void => {
    const allCertificates = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const employeeCertificates = allCertificates[certificate.employeeNumber] || [];
    const index = employeeCertificates.findIndex((c: WorkCertificate) => c.id === certificate.id);
    if (index !== -1) {
      employeeCertificates[index] = certificate;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allCertificates));
    }
  },

  // Delete a work certificate
  deleteCertificate: (employeeNumber: string, certificateId: string): void => {
    const allCertificates = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const employeeCertificates = allCertificates[employeeNumber] || [];
    allCertificates[employeeNumber] = employeeCertificates.filter((c: WorkCertificate) => c.id !== certificateId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allCertificates));
  },

  // Check if date is after entry date
  isDateAfterEntryDate: (date: string, entryDate: string): boolean => {
    if (!date || !entryDate) return false;
    
    const checkDate = new Date(date.split('/').reverse().join('-'));
    const entry = new Date(entryDate.split('/').reverse().join('-'));
    
    return checkDate > entry;
  }
};
