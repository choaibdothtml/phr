export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  fatherName?: string;
  motherLastName?: string;
  motherFirstName?: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  group: string;
  joinDate: string;
  status: 'active' | 'on-leave' | 'terminated';
  classification?: string;
  degree?: string;
  socialSecurityNumber?: string;
  nationalIdNumber?: string;
  provinceOfResidency?: string;
  municipalityOfResidency?: string;
  address?: string;
  idNumber?: string;
  driverLicenseNumber?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  provinceOfBirth?: string;
  municipalityOfBirth?: string;
  situation?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  numberOfKids?: number;
  bloodType?: string;
  chronicDiseases?: string;
  studyDegree?: string;
  studyField?: string;
  studyInstitution?: string;
  studyDate?: string;
  bankName?: string;
  accountNumber?: string;
  payBasis?: string;
  contractualStatus?: string;
  employmentType?: string;
  hoursWorkedPerDay?: string;
  contractDuration?: string;
  contractDurationUnit?: string;
  probationaryPeriod?: string;
  probationaryPeriodUnit?: string;
  confirmationDate?: string;
  unsuccessfulProbationNotice?: string;
  resignationNotice?: string;
  appointmentPurpose?: string;
  currentContractStartDate?: string;
  currentContractEndDate?: string;
  dateOfLeavingWork?: string;
  reasonForLeaving?: string;
  basicSalary?: string;
}

export const api = {
  employees: {
    getAll: async (): Promise<Employee[]> => {
      const stored = localStorage.getItem('phoenix-hr-employees');
      return stored ? JSON.parse(stored) : [];
    },
  },
};
