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
  bankName?: string;
  accountNumber?: string;
  currentContractStartDate?: string;
  currentContractEndDate?: string;
  contractDuration?: string;
  contractDurationUnit?: string;
  payBasis?: string;
  contractualStatus?: string;
  employmentType?: string;
  hoursWorkedPerDay?: string;
  probationaryPeriod?: string;
  probationaryPeriodUnit?: string;
  confirmationDate?: string;
  unsuccessfulProbationNotice?: string;
  resignationNotice?: string;
  appointmentPurpose?: string;
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
export const mockEmployees: Employee[] = [];

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
