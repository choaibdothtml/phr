// Termination Certificate Storage Utility

export interface TerminationCertificate {
  id: string;
  employeeNumber: string;
  referenceCode: string;
  dateOfIssue: string;
  includeAllJobs: boolean;
}

const STORAGE_KEY = 'phoenix-hr-termination-certificates';

export const terminationCertificateStorage = {
  getAll: (): TerminationCertificate[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getByEmployee: (employeeNumber: string): TerminationCertificate[] => {
    const all = terminationCertificateStorage.getAll();
    return all.filter(cert => cert.employeeNumber === employeeNumber);
  },

  save: (certificate: TerminationCertificate): void => {
    const all = terminationCertificateStorage.getAll();
    const existingIndex = all.findIndex(cert => cert.id === certificate.id);
    
    if (existingIndex >= 0) {
      all[existingIndex] = certificate;
    } else {
      all.push(certificate);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },

  delete: (id: string): void => {
    const all = terminationCertificateStorage.getAll();
    const filtered = all.filter(cert => cert.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  generateId: (): string => {
    return `tc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};
