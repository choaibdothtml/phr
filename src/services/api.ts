/**
 * Phoenix HR - API Service Layer
 * 
 * This module abstracts all backend communication.
 * Currently uses mock data for development.
 * 
 * To connect to your server:
 * 1. Set VITE_API_URL in .env
 * 2. Replace mock implementations with actual fetch calls
 * 3. Add authentication headers from AuthContext
 * 
 * Example:
 * const API_BASE = import.meta.env.VITE_API_URL || '/api';
 * 
 * async function getEmployees(): Promise<Employee[]> {
 *   const res = await fetch(`${API_BASE}/employees`, {
 *     headers: { 'Authorization': `Bearer ${token}` }
 *   });
 *   return res.json();
 * }
 */

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  group: string;
  joinDate: string;
  status: 'active' | 'on-leave' | 'terminated';
  avatar?: string;
  salary?: number;
  // New fields for comprehensive employee list
  classification?: string;
  degree?: string;
  socialSecurityNumber?: string;
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
  bankName?: string;
  accountNumber?: string;
  currentContractStartDate?: string;
  currentContractEndDate?: string;
  dateOfLeavingWork?: string;
  reasonForLeaving?: string;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  employeeCount: number;
  budget: number;
  color: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'late' | 'absent' | 'half-day';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}

// Mock Data
export const mockEmployees: Employee[] = [
  { 
    id: '1', employeeNumber: '0001', firstName: 'Sarah', lastName: 'Mitchell', email: 'sarah.m@phoenix.com', phone: '+1 555-0101', 
    department: 'Human Resources', position: 'HR Director', group: 'Management', joinDate: '2020-03-15', status: 'active', salary: 95000,
    classification: '5', degree: 'MBA', socialSecurityNumber: '123-45-6789', provinceOfResidency: 'California', 
    municipalityOfResidency: 'Los Angeles', address: '123 Main St', idNumber: 'CA123456', driverLicenseNumber: 'DL123456',
    gender: 'Female', dateOfBirth: '1985-06-15', provinceOfBirth: 'California', municipalityOfBirth: 'San Francisco',
    situation: 'Married', numberOfKids: 2, bloodType: 'A+', chronicDiseases: 'None', bankName: 'Chase Bank',
    accountNumber: '1234567890', currentContractStartDate: '2020-03-15', currentContractEndDate: '2025-03-14'
  },
  { 
    id: '2', employeeNumber: '0002', firstName: 'James', lastName: 'Rodriguez', email: 'james.r@phoenix.com', phone: '+1 555-0102',
    department: 'Engineering', position: 'Senior Developer', group: 'Backend', joinDate: '2021-06-01', status: 'active', salary: 105000,
    classification: '4', degree: 'MSc Computer Science', socialSecurityNumber: '234-56-7890', provinceOfResidency: 'Texas',
    municipalityOfResidency: 'Austin', address: '456 Oak Ave', idNumber: 'TX234567', driverLicenseNumber: 'DL234567',
    gender: 'Male', dateOfBirth: '1988-03-22', provinceOfBirth: 'Texas', municipalityOfBirth: 'Houston',
    situation: 'Single', numberOfKids: 0, bloodType: 'O+', chronicDiseases: 'None', bankName: 'Bank of America',
    accountNumber: '2345678901', currentContractStartDate: '2021-06-01', currentContractEndDate: '2026-05-31'
  },
  { 
    id: '3', employeeNumber: '0003', firstName: 'Emily', lastName: 'Chen', email: 'emily.c@phoenix.com', phone: '+1 555-0103',
    department: 'Design', position: 'UI/UX Designer', group: 'UI Team', joinDate: '2022-01-10', status: 'active', salary: 85000,
    classification: '3', degree: 'BFA Design', socialSecurityNumber: '345-67-8901', provinceOfResidency: 'New York',
    municipalityOfResidency: 'New York City', address: '789 Pine St', idNumber: 'NY345678', driverLicenseNumber: 'DL345678',
    gender: 'Female', dateOfBirth: '1992-11-08', provinceOfBirth: 'New York', municipalityOfBirth: 'Buffalo',
    situation: 'Single', numberOfKids: 0, bloodType: 'B+', chronicDiseases: 'None', bankName: 'Wells Fargo',
    accountNumber: '3456789012', currentContractStartDate: '2022-01-10', currentContractEndDate: '2027-01-09'
  },
  { 
    id: '4', employeeNumber: '0004', firstName: 'Michael', lastName: 'Thompson', email: 'michael.t@phoenix.com', phone: '+1 555-0104',
    department: 'Engineering', position: 'Backend Developer', group: 'Backend', joinDate: '2021-09-20', status: 'active', salary: 98000,
    classification: '4', degree: 'BSc Computer Science', socialSecurityNumber: '456-78-9012', provinceOfResidency: 'Washington',
    municipalityOfResidency: 'Seattle', address: '321 Elm St', idNumber: 'WA456789', driverLicenseNumber: 'DL456789',
    gender: 'Male', dateOfBirth: '1990-07-14', provinceOfBirth: 'Washington', municipalityOfBirth: 'Seattle',
    situation: 'Married', numberOfKids: 1, bloodType: 'AB+', chronicDiseases: 'None', bankName: 'US Bank',
    accountNumber: '4567890123', currentContractStartDate: '2021-09-20', currentContractEndDate: '2026-09-19'
  },
  { 
    id: '5', employeeNumber: '0005', firstName: 'Lisa', lastName: 'Park', email: 'lisa.p@phoenix.com', phone: '+1 555-0105',
    department: 'Marketing', position: 'Marketing Manager', group: 'Digital Marketing', joinDate: '2020-11-05', status: 'on-leave', salary: 88000,
    classification: '4', degree: 'MBA Marketing', socialSecurityNumber: '567-89-0123', provinceOfResidency: 'Illinois',
    municipalityOfResidency: 'Chicago', address: '654 Maple Dr', idNumber: 'IL567890', driverLicenseNumber: 'DL567890',
    gender: 'Female', dateOfBirth: '1987-09-30', provinceOfBirth: 'Illinois', municipalityOfBirth: 'Chicago',
    situation: 'Divorced', numberOfKids: 2, bloodType: 'A-', chronicDiseases: 'None', bankName: 'Citibank',
    accountNumber: '5678901234', currentContractStartDate: '2020-11-05', currentContractEndDate: '2025-11-04'
  },
  { 
    id: '6', employeeNumber: '0006', firstName: 'David', lastName: 'Wilson', email: 'david.w@phoenix.com', phone: '+1 555-0106',
    department: 'Finance', position: 'Financial Analyst', group: 'Accounting', joinDate: '2022-04-18', status: 'active', salary: 78000,
    classification: '3', degree: 'BSc Finance', socialSecurityNumber: '678-90-1234', provinceOfResidency: 'Florida',
    municipalityOfResidency: 'Miami', address: '987 Cedar Ln', idNumber: 'FL678901', driverLicenseNumber: 'DL678901',
    gender: 'Male', dateOfBirth: '1993-02-18', provinceOfBirth: 'Florida', municipalityOfBirth: 'Tampa',
    situation: 'Single', numberOfKids: 0, bloodType: 'O-', chronicDiseases: 'None', bankName: 'TD Bank',
    accountNumber: '6789012345', currentContractStartDate: '2022-04-18', currentContractEndDate: '2027-04-17'
  },
  { 
    id: '7', employeeNumber: '0007', firstName: 'Anna', lastName: 'Kowalski', email: 'anna.k@phoenix.com', phone: '+1 555-0107',
    department: 'Design', position: 'Graphic Designer', group: 'Creative', joinDate: '2023-02-14', status: 'active', salary: 72000,
    classification: '2', degree: 'BFA Graphic Design', socialSecurityNumber: '789-01-2345', provinceOfResidency: 'Oregon',
    municipalityOfResidency: 'Portland', address: '147 Birch Rd', idNumber: 'OR789012', driverLicenseNumber: 'DL789012',
    gender: 'Female', dateOfBirth: '1995-05-25', provinceOfBirth: 'Oregon', municipalityOfBirth: 'Portland',
    situation: 'Single', numberOfKids: 0, bloodType: 'B-', chronicDiseases: 'None', bankName: 'PNC Bank',
    accountNumber: '7890123456', currentContractStartDate: '2023-02-14', currentContractEndDate: '2028-02-13'
  },
  { 
    id: '8', employeeNumber: '0008', firstName: 'Robert', lastName: 'Kim', email: 'robert.k@phoenix.com', phone: '+1 555-0108',
    department: 'Engineering', position: 'DevOps Engineer', group: 'Infrastructure', joinDate: '2021-07-22', status: 'active', salary: 110000,
    classification: '5', degree: 'MSc Information Systems', socialSecurityNumber: '890-12-3456', provinceOfResidency: 'Colorado',
    municipalityOfResidency: 'Denver', address: '258 Spruce Ave', idNumber: 'CO890123', driverLicenseNumber: 'DL890123',
    gender: 'Male', dateOfBirth: '1986-12-03', provinceOfBirth: 'Colorado', municipalityOfBirth: 'Denver',
    situation: 'Married', numberOfKids: 3, bloodType: 'AB-', chronicDiseases: 'None', bankName: 'Capital One',
    accountNumber: '8901234567', currentContractStartDate: '2021-07-22', currentContractEndDate: '2026-07-21'
  },
  { 
    id: '9', employeeNumber: '0009', firstName: 'Maria', lastName: 'Garcia', email: 'maria.g@phoenix.com', phone: '+1 555-0109',
    department: 'Human Resources', position: 'HR Specialist', group: 'Recruitment', joinDate: '2022-08-30', status: 'active', salary: 68000,
    classification: '3', degree: 'BA Human Resources', socialSecurityNumber: '901-23-4567', provinceOfResidency: 'Arizona',
    municipalityOfResidency: 'Phoenix', address: '369 Willow St', idNumber: 'AZ901234', driverLicenseNumber: 'DL901234',
    gender: 'Female', dateOfBirth: '1994-08-12', provinceOfBirth: 'Arizona', municipalityOfBirth: 'Phoenix',
    situation: 'Single', numberOfKids: 0, bloodType: 'A+', chronicDiseases: 'None', bankName: 'Ally Bank',
    accountNumber: '9012345678', currentContractStartDate: '2022-08-30', currentContractEndDate: '2027-08-29'
  },
  { 
    id: '10', employeeNumber: '0010', firstName: 'Thomas', lastName: 'Brown', email: 'thomas.b@phoenix.com', phone: '+1 555-0110',
    department: 'Marketing', position: 'Content Strategist', group: 'Content', joinDate: '2023-05-01', status: 'active', salary: 75000,
    classification: '3', degree: 'BA English', socialSecurityNumber: '012-34-5678', provinceOfResidency: 'Georgia',
    municipalityOfResidency: 'Atlanta', address: '741 Ash Blvd', idNumber: 'GA012345', driverLicenseNumber: 'DL012345',
    gender: 'Male', dateOfBirth: '1991-04-07', provinceOfBirth: 'Georgia', municipalityOfBirth: 'Atlanta',
    situation: 'Married', numberOfKids: 1, bloodType: 'O+', chronicDiseases: 'None', bankName: 'Discover Bank',
    accountNumber: '0123456789', currentContractStartDate: '2023-05-01', currentContractEndDate: '2028-04-30'
  },
];

export const mockDepartments: Department[] = [
  { id: '1', name: 'Engineering', head: 'James Rodriguez', employeeCount: 24, budget: 2400000, color: '#f97316' },
  { id: '2', name: 'Design', head: 'Emily Chen', employeeCount: 12, budget: 960000, color: '#d946ef' },
  { id: '3', name: 'Marketing', head: 'Lisa Park', employeeCount: 8, budget: 640000, color: '#06b6d4' },
  { id: '4', name: 'Human Resources', head: 'Sarah Mitchell', employeeCount: 6, budget: 480000, color: '#10b981' },
  { id: '5', name: 'Finance', head: 'David Wilson', employeeCount: 5, budget: 400000, color: '#8b5cf6' },
];

export const mockLeaveRequests: LeaveRequest[] = [
  { id: '1', employeeId: '3', employeeName: 'Emily Chen', type: 'annual', startDate: '2026-02-10', endDate: '2026-02-14', status: 'pending', reason: 'Family vacation', createdAt: '2026-01-28' },
  { id: '2', employeeId: '5', employeeName: 'Lisa Park', type: 'sick', startDate: '2026-01-20', endDate: '2026-01-22', status: 'approved', reason: 'Medical appointment', createdAt: '2026-01-18' },
  { id: '3', employeeId: '7', employeeName: 'Anna Kowalski', type: 'personal', startDate: '2026-02-05', endDate: '2026-02-05', status: 'approved', reason: 'Personal matters', createdAt: '2026-01-30' },
  { id: '4', employeeId: '4', employeeName: 'Michael Thompson', type: 'annual', startDate: '2026-03-01', endDate: '2026-03-07', status: 'pending', reason: 'Travel plans', createdAt: '2026-02-01' },
  { id: '5', employeeId: '10', employeeName: 'Thomas Brown', type: 'sick', startDate: '2026-01-25', endDate: '2026-01-26', status: 'rejected', reason: 'Not enough sick days', createdAt: '2026-01-24' },
];

export const mockNotifications: Notification[] = [
  { id: '1', title: 'Leave Request', message: 'Emily Chen submitted a new leave request', type: 'info', read: false, createdAt: '2026-02-01T10:30:00' },
  { id: '2', title: 'Birthday Reminder', message: "Robert Kim's birthday is tomorrow", type: 'info', read: false, createdAt: '2026-02-01T09:00:00' },
  { id: '3', title: 'Contract Expiring', message: '3 contracts expiring this month', type: 'warning', read: true, createdAt: '2026-01-31T14:00:00' },
  { id: '4', title: 'Payroll Processed', message: 'January payroll has been processed successfully', type: 'success', read: true, createdAt: '2026-01-30T16:00:00' },
];

// API Functions (currently returning mock data)
export const api = {
  employees: {
    getAll: async (): Promise<Employee[]> => {
      // TODO: return fetch(`${API_BASE}/employees`).then(r => r.json())
      return new Promise(resolve => setTimeout(() => resolve(mockEmployees), 300));
    },
    getById: async (id: string): Promise<Employee | undefined> => {
      return new Promise(resolve => setTimeout(() => resolve(mockEmployees.find(e => e.id === id)), 200));
    },
    create: async (data: Partial<Employee>): Promise<Employee> => {
      const newEmployee: Employee = { ...data, id: String(Date.now()), status: 'active' } as Employee;
      return new Promise(resolve => setTimeout(() => resolve(newEmployee), 300));
    },
    update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
      const updated = { ...mockEmployees.find(e => e.id === id), ...data } as Employee;
      return new Promise(resolve => setTimeout(() => resolve(updated), 300));
    },
    delete: async (id: string): Promise<void> => {
      return new Promise(resolve => setTimeout(resolve, 200));
    },
  },
  departments: {
    getAll: async (): Promise<Department[]> => {
      return new Promise(resolve => setTimeout(() => resolve(mockDepartments), 200));
    },
  },
  leaveRequests: {
    getAll: async (): Promise<LeaveRequest[]> => {
      return new Promise(resolve => setTimeout(() => resolve(mockLeaveRequests), 200));
    },
    updateStatus: async (id: string, status: 'approved' | 'rejected'): Promise<LeaveRequest> => {
      const updated = { ...mockLeaveRequests.find(l => l.id === id), status } as LeaveRequest;
      return new Promise(resolve => setTimeout(() => resolve(updated), 300));
    },
  },
  notifications: {
    getAll: async (): Promise<Notification[]> => {
      return new Promise(resolve => setTimeout(() => resolve(mockNotifications), 200));
    },
  },
  // Subscription check - will be called on app init
  subscription: {
    checkStatus: async () => {
      // TODO: Call your server to verify subscription
      return { valid: true, plan: 'enterprise', expiresAt: '2027-12-31' };
    },
  },
  // License validation for Electron wrapper
  license: {
    validate: async (key: string) => {
      // TODO: Validate license key against your server
      return { valid: true, type: 'host', maxUsers: 100 };
    },
  },
};
