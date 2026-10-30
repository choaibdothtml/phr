// Work Certificate Storage Utility

export interface WorkCertificate {
  id: string;
  employeeNumber: string;
  referenceCode: string;
  dateOfIssue: string;
  usedFor: 'Administrative documents' | 'Passport' | 'Bank account';
}

const STORAGE_KEY = 'phoenix-hr-work-certificates';

export const workCertificateStorage = {
  getAll: (): WorkCertificate[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getByEmployee: (employeeNumber: string): WorkCertificate[] => {
    const all = workCertificateStorage.getAll();
    return all.filter(cert => cert.employeeNumber === employeeNumber);
  },

  save: (certificate: WorkCertificate): void => {
    const all = workCertificateStorage.getAll();
    const existingIndex = all.findIndex(cert => cert.id === certificate.id);
    
    if (existingIndex >= 0) {
      all[existingIndex] = certificate;
    } else {
      all.push(certificate);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },

  delete: (id: string): void => {
    const all = workCertificateStorage.getAll();
    const filtered = all.filter(cert => cert.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  generateId: (): string => {
    return `wc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};
