// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, AlertCircle, User, MapPin, Phone, FileText, CreditCard, Building2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, FileX, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import { Employee } from '../services/api';

// Helper components - same as EmployeeWizard
const FormField = ({ label, required = false, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
);

const Input = ({ error, ...props }: { error?: string; [key: string]: any }) => (
  <input
    {...props}
    className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-phoenix-500/30 ${
      error ? 'border-red-500' : ''
    }`}
    style={{ 
      background: 'var(--bg-tertiary)', 
      border: `1px solid ${error ? '#ef4444' : 'var(--border-color)'}`, 
      color: 'var(--text-primary)' 
    }}
  />
);

const Select = ({ error, children, ...props }: { error?: string; children: React.ReactNode; [key: string]: any }) => (
  <div className="relative group">
    <select
      {...props}
      className={`w-full px-4 py-2.5 pr-10 rounded-xl text-sm outline-none cursor-pointer transition-all appearance-none focus:ring-2 focus:ring-orange-500/30 ${
        error ? 'border-red-500' : 'hover:border-orange-300'
      } ${props.disabled ? 'cursor-not-allowed opacity-50 bg-gray-100 dark:bg-gray-800' : ''}`}
      style={{ 
        background: props.disabled ? undefined : 'var(--bg-tertiary)', 
        border: `1px solid ${error ? '#ef4444' : 'var(--border-color)'}`, 
        color: 'var(--text-primary)' 
      }}
    >
      {children}
    </select>
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors">
      <svg className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);

const Textarea = ({ error, ...props }: { error?: string; [key: string]: any }) => (
  <textarea
    {...props}
    className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-phoenix-500/30 resize-none ${
      error ? 'border-red-500' : ''
    }`}
    style={{ 
      background: 'var(--bg-tertiary)', 
      border: `1px solid ${error ? '#ef4444' : 'var(--border-color)'}`, 
      color: 'var(--text-primary)' 
    }}
  />
);

export default function EmployeeEdit() {
  const navigate = useNavigate();
  const { jobTitles, departments } = useSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [banks, setBanks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editTerminated, setEditTerminated] = useState(false);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [selectorSortBy, setSelectorSortBy] = useState('number');
  const [selectorSelectedIndex, setSelectorSelectedIndex] = useState(0);
  const [hasModifications, setHasModifications] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelTerminationConfirm, setShowCancelTerminationConfirm] = useState(false);
  const [showCancelTerminationWarning, setShowCancelTerminationWarning] = useState(false);
  const selectorListRef = useRef(null);
  
  const [formData, setFormData] = useState({
    employeeNumber: '',
    lastName: '',
    firstName: '',
    fatherName: '',
    motherLastName: '',
    motherFirstName: '',
    gender: '',
    dateOfBirth: '',
    age: '',
    provinceOfBirth: '',
    municipalityOfBirth: '',
    phoneNumber: '',
    email: '',
    situation: '',
    numberOfKids: '',
    homeAddress: '',
    provinceOfResidency: '',
    municipalityOfResidency: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    bloodType: '',
    chronicDiseases: '',
    studyDegree: '',
    studyField: '',
    studyInstitution: '',
    studyDate: '',
    entryDate: '',
    job: '',
    classification: '',
    degree: '',
    group: '',
    department: '',
    payBasis: 'Salaried',
    contractualStatus: 'Fixed-term',
    employmentType: 'Full-time',
    hoursWorkedPerDay: '',
    contractDuration: '',
    contractDurationUnit: 'days',
    probationaryPeriod: '',
    probationaryPeriodUnit: 'days',
    unsuccessfulProbationNotice: '',
    resignationNotice: '',
    appointmentPurpose: '',
    nationalIdNumber: '',
    idNumber: '',
    idIssuingDate: '',
    idIssuingProvince: '',
    idIssuingMunicipality: '',
    driverLicenseNumber: '',
    driverLicenseIssuingDate: '',
    driverLicenseIssuingProvince: '',
    driverLicenseIssuingMunicipality: '',
    socialSecurityNumber: '',
    bankName: '',
    accountNumber: '',
    terminationDate: '',
    terminationReason: '',
  });

  const [originalData, setOriginalData] = useState(formData);

  // Load employees and banks
  useEffect(() => {
    const savedBanks = localStorage.getItem('phoenix-hr-banks');
    if (savedBanks) {
      setBanks(JSON.parse(savedBanks));
    }
    
    const savedEmployees = localStorage.getItem('phoenix-hr-employees');
    if (savedEmployees) {
      const empList = JSON.parse(savedEmployees);
      setEmployees(empList);
      
      // Load first non-terminated employee
      const firstActiveIndex = empList.findIndex(e => e.status !== 'terminated');
      if (firstActiveIndex !== -1) {
        loadEmployee(empList[firstActiveIndex]);
        setCurrentIndex(firstActiveIndex);
      }
    }
  }, []);

  // Calculate age when date of birth changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const parts = formData.dateOfBirth.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        
        const today = new Date();
        const birth = new Date(year, month, day);
        
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        
        setFormData(prev => ({ ...prev, age: `${age} years old` }));
      }
    }
  }, [formData.dateOfBirth]);

  // Track modifications
  useEffect(() => {
    const isModified = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasModifications(isModified);
  }, [formData, originalData]);

  const loadEmployee = (employee) => {
    const employeeData = {
      employeeNumber: employee.employeeNumber || '',
      lastName: employee.lastName || '',
      firstName: employee.firstName || '',
      fatherName: employee.fatherName || '',
      motherLastName: employee.motherLastName || '',
      motherFirstName: employee.motherFirstName || '',
      gender: employee.gender || '',
      dateOfBirth: employee.dateOfBirth || '',
      age: '',
      provinceOfBirth: employee.provinceOfBirth || '',
      municipalityOfBirth: employee.municipalityOfBirth || '',
      phoneNumber: employee.phone || '',
      email: employee.email || '',
      situation: employee.situation || '',
      numberOfKids: employee.numberOfKids?.toString() || '',
      homeAddress: employee.address || '',
      provinceOfResidency: employee.provinceOfResidency || '',
      municipalityOfResidency: employee.municipalityOfResidency || '',
      emergencyContactName: employee.emergencyContactName || '',
      emergencyContactPhone: employee.emergencyContactPhone || '',
      emergencyContactRelationship: employee.emergencyContactRelationship || '',
      bloodType: employee.bloodType || '',
      chronicDiseases: employee.chronicDiseases || '',
      studyDegree: employee.studyDegree || '',
      studyField: employee.studyField || '',
      studyInstitution: employee.studyInstitution || '',
      studyDate: employee.studyDate || '',
      entryDate: employee.joinDate || '',
      job: employee.position || '',
      classification: employee.classification || '',
      degree: employee.degree || '',
      group: employee.group || '',
      department: employee.department || '',
      payBasis: employee.payBasis || 'Salaried',
      contractualStatus: employee.contractualStatus || 'Fixed-term',
      employmentType: employee.employmentType || 'Full-time',
      hoursWorkedPerDay: employee.hoursWorkedPerDay || '',
      contractDuration: employee.contractDuration || '',
      contractDurationUnit: employee.contractDurationUnit || 'days',
      probationaryPeriod: employee.probationaryPeriod || '',
      probationaryPeriodUnit: employee.probationaryPeriodUnit || 'days',
      unsuccessfulProbationNotice: employee.unsuccessfulProbationNotice || '',
      resignationNotice: employee.resignationNotice || '',
      appointmentPurpose: employee.appointmentPurpose || '',
      nationalIdNumber: employee.nationalIdNumber || '',
      idNumber: employee.idNumber || '',
      idIssuingDate: employee.idIssuingDate || '',
      idIssuingProvince: employee.idIssuingProvince || '',
      idIssuingMunicipality: employee.idIssuingMunicipality || '',
      driverLicenseNumber: employee.driverLicenseNumber || '',
      driverLicenseIssuingDate: employee.driverLicenseIssuingDate || '',
      driverLicenseIssuingProvince: employee.driverLicenseIssuingProvince || '',
      driverLicenseIssuingMunicipality: employee.driverLicenseIssuingMunicipality || '',
      socialSecurityNumber: employee.socialSecurityNumber || '',
      bankName: employee.bankName || '',
      accountNumber: employee.accountNumber || '',
      terminationDate: employee.dateOfLeavingWork || '',
      terminationReason: employee.reasonForLeaving || '',
    };
    
    setFormData(employeeData);
    setOriginalData(employeeData);
    setHasModifications(false);
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    let processedValue = value;
    
    if (field === 'lastName' || field === 'firstName' || field === 'fatherName' || field === 'motherLastName' || field === 'motherFirstName' || field === 'emergencyContactName') {
      processedValue = value.replace(/[^a-zA-Z\s'éèàï-]/g, '').toLowerCase();
      processedValue = processedValue.replace(/\b\w/g, l => l.toUpperCase());
    } else if (field === 'email') {
      processedValue = value.toLowerCase();
    } else if (field === 'phoneNumber' || field === 'emergencyContactPhone') {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length <= 2) processedValue = numbers;
      else if (numbers.length <= 4) processedValue = `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
      else if (numbers.length <= 6) processedValue = `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4)}`;
      else if (numbers.length <= 8) processedValue = `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 6)} ${numbers.slice(6)}`;
      else processedValue = `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 6)} ${numbers.slice(6, 8)} ${numbers.slice(8, 10)}`;
    } else if (field === 'socialSecurityNumber') {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length <= 2) processedValue = numbers;
      else if (numbers.length <= 6) processedValue = `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
      else if (numbers.length <= 10) processedValue = `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6)}`;
      else processedValue = `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 10)} ${numbers.slice(10, 12)}`;
    } else if (field === 'accountNumber') {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length <= 3) processedValue = numbers;
      else if (numbers.length <= 8) processedValue = `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
      else processedValue = `${numbers.slice(0, 3)} ${numbers.slice(3, 8)} ${numbers.slice(8, 20)}`;
    } else if (field === 'homeAddress' || field === 'chronicDiseases' || field === 'appointmentPurpose') {
      processedValue = value.charAt(0).toUpperCase() + value.slice(1);
    } else if (field === 'driverLicenseNumber') {
      processedValue = value.toUpperCase();
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
  };

  const navigateToEmployee = (direction) => {
    const filteredEmployees = editTerminated 
      ? employees 
      : employees.filter(e => e.status !== 'terminated');
    
    if (filteredEmployees.length === 0) return;
    
    let newIndex = currentIndex;
    
    if (direction === 'first') {
      newIndex = 0;
    } else if (direction === 'prev') {
      newIndex = Math.max(0, currentIndex - 1);
    } else if (direction === 'next') {
      newIndex = Math.min(filteredEmployees.length - 1, currentIndex + 1);
    } else if (direction === 'last') {
      newIndex = filteredEmployees.length - 1;
    }
    
    setCurrentIndex(newIndex);
    loadEmployee(filteredEmployees[newIndex]);
  };

  const handleSave = () => {
    // Save to localStorage
    const savedEmployees = localStorage.getItem('phoenix-hr-employees');
    if (savedEmployees) {
      const empList = JSON.parse(savedEmployees);
      const index = empList.findIndex(e => e.employeeNumber === formData.employeeNumber);
      if (index !== -1) {
        empList[index] = {
          ...empList[index],
          lastName: formData.lastName,
          firstName: formData.firstName,
          fatherName: formData.fatherName,
          motherLastName: formData.motherLastName,
          motherFirstName: formData.motherFirstName,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          provinceOfBirth: formData.provinceOfBirth,
          municipalityOfBirth: formData.municipalityOfBirth,
          phone: formData.phoneNumber,
          email: formData.email,
          situation: formData.situation,
          numberOfKids: parseInt(formData.numberOfKids) || 0,
          address: formData.homeAddress,
          provinceOfResidency: formData.provinceOfResidency,
          municipalityOfResidency: formData.municipalityOfResidency,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          emergencyContactRelationship: formData.emergencyContactRelationship,
          bloodType: formData.bloodType,
          chronicDiseases: formData.chronicDiseases,
          studyDegree: formData.studyDegree,
          studyField: formData.studyField,
          studyInstitution: formData.studyInstitution,
          studyDate: formData.studyDate,
          classification: formData.classification,
          group: formData.group,
          payBasis: formData.payBasis,
          contractualStatus: formData.contractualStatus,
          employmentType: formData.employmentType,
          hoursWorkedPerDay: formData.employmentType === 'Part-time' ? formData.hoursWorkedPerDay : '',
          contractDuration: formData.contractualStatus === 'Permanent' ? '' : formData.contractDuration,
          contractDurationUnit: formData.contractualStatus === 'Permanent' ? '' : formData.contractDurationUnit,
          probationaryPeriod: formData.probationaryPeriod,
          probationaryPeriodUnit: formData.probationaryPeriodUnit,
          unsuccessfulProbationNotice: formData.unsuccessfulProbationNotice,
          resignationNotice: formData.resignationNotice,
          appointmentPurpose: formData.appointmentPurpose,
          nationalIdNumber: formData.nationalIdNumber,
          idNumber: formData.idNumber,
          idIssuingDate: formData.idIssuingDate,
          idIssuingProvince: formData.idIssuingProvince,
          idIssuingMunicipality: formData.idIssuingMunicipality,
          driverLicenseNumber: formData.driverLicenseNumber,
          driverLicenseIssuingDate: formData.driverLicenseIssuingDate,
          driverLicenseIssuingProvince: formData.driverLicenseIssuingProvince,
          driverLicenseIssuingMunicipality: formData.driverLicenseIssuingMunicipality,
          socialSecurityNumber: formData.socialSecurityNumber,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          dateOfLeavingWork: formData.terminationDate || undefined,
          reasonForLeaving: formData.terminationReason || undefined,
          status: (formData.terminationDate && formData.terminationReason) ? 'terminated' : 'active',
        };
        localStorage.setItem('phoenix-hr-employees', JSON.stringify(empList));
        setEmployees(empList);
        setOriginalData(formData);
        setHasModifications(false);
        setShowSuccessModal(true);
        
        // If employee was terminated, move to next active employee
        if (empList[index].status === 'terminated') {
          const nextActiveIndex = empList.findIndex((e, i) => i > index && e.status !== 'terminated');
          if (nextActiveIndex !== -1) {
            setTimeout(() => {
              setCurrentIndex(nextActiveIndex);
              loadEmployee(empList[nextActiveIndex]);
              setShowSuccessModal(false);
            }, 2000);
          }
        }
      }
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setHasModifications(false);
    setErrors({});
  };

  const handleCancelTermination = () => {
    // Save to localStorage
    const savedEmployees = localStorage.getItem('phoenix-hr-employees');
    if (savedEmployees) {
      const empList = JSON.parse(savedEmployees);
      const index = empList.findIndex(e => e.employeeNumber === formData.employeeNumber);
      if (index !== -1) {
        empList[index] = {
          ...empList[index],
          dateOfLeavingWork: undefined,
          reasonForLeaving: undefined,
          status: 'active',
        };
        localStorage.setItem('phoenix-hr-employees', JSON.stringify(empList));
        setEmployees(empList);
        
        // Update form data
        setFormData(prev => ({
          ...prev,
          terminationDate: '',
          terminationReason: '',
        }));
        setOriginalData(prev => ({
          ...prev,
          terminationDate: '',
          terminationReason: '',
        }));
        setHasModifications(false);
      }
    }
    
    setShowCancelTerminationConfirm(false);
    setShowCancelTerminationWarning(false);
  };

  const handleDeleteEmployee = () => {
    const savedEmployees = localStorage.getItem('phoenix-hr-employees');
    if (savedEmployees) {
      const empList = JSON.parse(savedEmployees);
      const updatedList = empList.filter(e => e.employeeNumber !== formData.employeeNumber);
      localStorage.setItem('phoenix-hr-employees', JSON.stringify(updatedList));
      setEmployees(updatedList);
      
      // Navigate to previous employee or show message
      if (updatedList.length > 0) {
        const prevIndex = Math.max(0, currentIndex - 1);
        setCurrentIndex(prevIndex);
        loadEmployee(updatedList[prevIndex]);
      } else {
        // No employees left, navigate back to list
        navigate('/employees/list');
      }
    }
  };

  // Check if current employee is the last one (highest employee number)
  const isLastEmployee = () => {
    if (employees.length === 0) return false;
    const sortedEmployees = [...employees].sort((a, b) => 
      parseInt(b.employeeNumber) - parseInt(a.employeeNumber)
    );
    return sortedEmployees[0]?.employeeNumber === formData.employeeNumber;
  };

  const steps = [
    { id: 'personal', label: 'Personal info', icon: User },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'emergency', label: 'Emergency', icon: Phone },
    { id: 'study', label: 'Study', icon: GraduationCap },
    { id: 'job', label: 'Job details', icon: FileText },
    { id: 'identification', label: 'Identification', icon: CreditCard },
    { id: 'payment', label: 'Payment', icon: Building2 },
    { id: 'termination', label: 'Termination', icon: FileX },
  ];

  const filteredEmployees = editTerminated 
    ? employees 
    : employees.filter(e => e.status !== 'terminated');

  const sortedSelectorEmployees = [...filteredEmployees].sort((a, b) => {
    if (selectorSortBy === 'number') {
      return a.employeeNumber.localeCompare(b.employeeNumber);
    } else {
      return a.lastName.localeCompare(b.lastName);
    }
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex gap-6">
          {/* Step Navigation */}
          <div className="w-64 flex-shrink-0 space-y-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === index;
              const isCompleted = index < currentStep;
              
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                    isActive ? 'wizard-step-active' : 'wizard-step-btn'
                  }`}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      background: isActive || isCompleted ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: isActive || isCompleted ? 'white' : 'var(--text-tertiary)' }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {step.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="glass-card p-8">
                  {/* Employee Number with Navigation */}
                  {currentStep === 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={editTerminated}
                            onChange={(e) => setEditTerminated(e.target.checked)}
                            className="rounded"
                          />
                          Edit terminated employees
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <FormField label="Employee number">
                            <Input
                              value={formData.employeeNumber}
                              onChange={(e) => {
                                const num = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setFormData(prev => ({ ...prev, employeeNumber: num }));
                              }}
                              onDoubleClick={() => setShowEmployeeSelector(true)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const emp = employees.find(emp => emp.employeeNumber === formData.employeeNumber);
                                  if (emp && (editTerminated || emp.status !== 'terminated')) {
                                    loadEmployee(emp);
                                  }
                                }
                              }}
                              readOnly
                              className="cursor-pointer"
                            />
                          </FormField>
                        </div>
                        
                        <div className="flex gap-1 pt-6">
                          <button
                            onClick={() => navigateToEmployee('first')}
                            disabled={currentIndex === 0}
                            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ background: 'var(--bg-tertiary)' }}
                          >
                            <ChevronsLeft className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                          </button>
                          <button
                            onClick={() => navigateToEmployee('prev')}
                            disabled={currentIndex === 0}
                            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ background: 'var(--bg-tertiary)' }}
                          >
                            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                          </button>
                          <button
                            onClick={() => navigateToEmployee('next')}
                            disabled={currentIndex === filteredEmployees.length - 1}
                            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ background: 'var(--bg-tertiary)' }}
                          >
                            <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                          </button>
                          <button
                            onClick={() => navigateToEmployee('last')}
                            disabled={currentIndex === filteredEmployees.length - 1}
                            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ background: 'var(--bg-tertiary)' }}
                          >
                            <ChevronsRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Render step content based on currentStep */}
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <FormField label="Employee number">
                          <Input value={formData.employeeNumber} readOnly className="cursor-not-allowed opacity-60" />
                        </FormField>
                        <FormField label="Gender" required error={errors.gender}>
                          <Select value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} error={errors.gender}>
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </Select>
                        </FormField>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <FormField label="Family name" required error={errors.lastName}>
                          <Input
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            error={errors.lastName}
                          />
                        </FormField>
                        <FormField label="Name" required error={errors.firstName}>
                          <Input
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            error={errors.firstName}
                          />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-3 gap-6">
                        <FormField label="Father's name" required error={errors.fatherName}>
                          <Input
                            value={formData.fatherName}
                            onChange={(e) => handleInputChange('fatherName', e.target.value)}
                            error={errors.fatherName}
                          />
                        </FormField>
                        <FormField label="Mother's family name" required error={errors.motherLastName}>
                          <Input
                            value={formData.motherLastName}
                            onChange={(e) => handleInputChange('motherLastName', e.target.value)}
                            error={errors.motherLastName}
                          />
                        </FormField>
                        <FormField label="Mother's name" required error={errors.motherFirstName}>
                          <Input
                            value={formData.motherFirstName}
                            onChange={(e) => handleInputChange('motherFirstName', e.target.value)}
                            error={errors.motherFirstName}
                          />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <FormField label="Date of birth" required error={errors.dateOfBirth}>
                          <Input
                            type="text"
                            placeholder="xx/xx/xxxx"
                            value={formData.dateOfBirth}
                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                            error={errors.dateOfBirth}
                          />
                        </FormField>
                        <FormField label="Age">
                          <Input value={formData.age} readOnly className="cursor-not-allowed opacity-60" />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <FormField label="Province of birth" required error={errors.provinceOfBirth}>
                          <Input
                            value={formData.provinceOfBirth}
                            onChange={(e) => handleInputChange('provinceOfBirth', e.target.value)}
                            error={errors.provinceOfBirth}
                          />
                        </FormField>
                        <FormField label="Municipality of birth" required error={errors.municipalityOfBirth}>
                          <Input
                            value={formData.municipalityOfBirth}
                            onChange={(e) => handleInputChange('municipalityOfBirth', e.target.value)}
                            error={errors.municipalityOfBirth}
                          />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <FormField label="Phone number" required error={errors.phoneNumber}>
                          <Input
                            value={formData.phoneNumber}
                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                            placeholder="xx xx xx xx xx"
                            error={errors.phoneNumber}
                          />
                        </FormField>
                        <FormField label="Email address" error={errors.email}>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            error={errors.email}
                          />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <FormField label="Situation" required error={errors.situation}>
                          <Select value={formData.situation} onChange={(e) => handleInputChange('situation', e.target.value)} error={errors.situation}>
                            <option value="">Select situation</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                          </Select>
                        </FormField>
                        <FormField label="Number of kids" required={formData.situation !== 'Single'} error={errors.numberOfKids}>
                          <Input
                            type="number"
                            value={formData.numberOfKids}
                            onChange={(e) => handleInputChange('numberOfKids', e.target.value)}
                            disabled={formData.situation === 'Single'}
                            max="99"
                            error={errors.numberOfKids}
                            className={formData.situation === 'Single' ? 'cursor-not-allowed opacity-60' : ''}
                          />
                        </FormField>
                      </div>
                    </div>
                  )}

                  {/* Address Step */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <FormField label="Home address" required error={errors.homeAddress}>
                        <Textarea
                          value={formData.homeAddress}
                          onChange={(e) => handleInputChange('homeAddress', e.target.value)}
                          rows={3}
                          error={errors.homeAddress}
                        />
                      </FormField>

                      <div className="grid grid-cols-2 gap-6">
                        <FormField label="Province of residency" required error={errors.provinceOfResidency}>
                          <Input
                            value={formData.provinceOfResidency}
                            onChange={(e) => handleInputChange('provinceOfResidency', e.target.value)}
                            error={errors.provinceOfResidency}
                          />
                        </FormField>
                        <FormField label="Municipality of residency" required error={errors.municipalityOfResidency}>
                          <Input
                            value={formData.municipalityOfResidency}
                            onChange={(e) => handleInputChange('municipalityOfResidency', e.target.value)}
                            error={errors.municipalityOfResidency}
                          />
                        </FormField>
                      </div>
                    </div>
                  )}

                  {/* Emergency Step */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <FormField label="Person to contact in case of emergency" required error={errors.emergencyContactName}>
                        <Input
                          value={formData.emergencyContactName}
                          onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                          error={errors.emergencyContactName}
                        />
                      </FormField>

                      <div className="grid grid-cols-2 gap-6">
                        <FormField label="Phone number to call" required error={errors.emergencyContactPhone}>
                          <Input
                            value={formData.emergencyContactPhone}
                            onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                            placeholder="xx xx xx xx xx"
                            error={errors.emergencyContactPhone}
                          />
                        </FormField>
                        <FormField label="Relationship" required error={errors.emergencyContactRelationship}>
                          <Select value={formData.emergencyContactRelationship} onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)} error={errors.emergencyContactRelationship}>
                            <option value="">Select relationship</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Brother">Brother</option>
                            <option value="Sister">Sister</option>
                            <option value="Wife">Wife</option>
                            <option value="Son">Son</option>
                            <option value="Daughter">Daughter</option>
                            <option value="Other">Other</option>
                          </Select>
                        </FormField>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <FormField label="Blood type" required error={errors.bloodType}>
                          <Select value={formData.bloodType} onChange={(e) => handleInputChange('bloodType', e.target.value)} error={errors.bloodType}>
                            <option value="">Select blood type</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </Select>
                        </FormField>
                      </div>

                      <FormField label="Chronic diseases">
                        <Textarea
                          value={formData.chronicDiseases}
                          onChange={(e) => handleInputChange('chronicDiseases', e.target.value)}
                          rows={3}
                        />
                      </FormField>
                    </div>
                  )}

                  {/* Study Step */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <FormField label="Degree/Certification" required error={errors.studyDegree}>
                          <Select 
                            value={formData.studyDegree} 
                            onChange={(e) => handleInputChange('studyDegree', e.target.value)} 
                            error={errors.studyDegree}
                          >
                            <option value="">Select degree/certification</option>
                            <option value="PhD">PhD</option>
                            <option value="Magister">Magister</option>
                            <option value="Engineer/ Structural engineer">Engineer/ Structural engineer</option>
                            <option value="Master">Master</option>
                            <option value="Bachelor">Bachelor</option>
                            <option value="DEUA">DEUA</option>
                            <option value="Higher technician">Higher technician</option>
                            <option value="High school degree">High school degree</option>
                            <option value="Technician">Technician</option>
                            <option value="CAP">CAP</option>
                            <option value="Secondary school">Secondary school</option>
                            <option value="Middle school">Middle school</option>
                            <option value="None">None</option>
                          </Select>
                        </FormField>

                        <FormField label="Study field" required error={errors.studyField}>
                          <Input
                            value={formData.studyField}
                            onChange={(e) => handleInputChange('studyField', e.target.value)}
                            error={errors.studyField}
                            placeholder="Enter study field"
                          />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <FormField label="Issued by (Institution)" required error={errors.studyInstitution}>
                          <Input
                            value={formData.studyInstitution}
                            onChange={(e) => handleInputChange('studyInstitution', e.target.value)}
                            error={errors.studyInstitution}
                            placeholder="Enter institution name"
                          />
                        </FormField>

                        <FormField label="Issued in (Date)" required error={errors.studyDate}>
                          <Input
                            type="text"
                            value={formData.studyDate}
                            onChange={(e) => handleInputChange('studyDate', e.target.value)}
                            placeholder="xx/xx/xxxx"
                            error={errors.studyDate}
                          />
                        </FormField>
                      </div>
                    </div>
                  )}

                  {/* Job Details Step */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <FormField label="Entry date" required error={errors.entryDate}>
                          <Input
                            type="text"
                            placeholder="xx/xx/xxxx"
                            value={formData.entryDate}
                            onChange={(e) => handleInputChange('entryDate', e.target.value)}
                            error={errors.entryDate}
                          />
                        </FormField>
                        <FormField label="Job" required error={errors.job}>
                          <Input
                            value={formData.job}
                            readOnly
                            className="cursor-not-allowed opacity-60"
                          />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <FormField label="Classification">
                          <Input
                            value={formData.classification}
                            onChange={(e) => handleInputChange('classification', e.target.value)}
                          />
                        </FormField>
                        <FormField label="Degree" required error={errors.degree}>
                          <Input
                            value={formData.degree}
                            readOnly
                            className="cursor-not-allowed opacity-60"
                          />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <FormField label="Group">
                          <Input value={formData.group} readOnly className="cursor-not-allowed opacity-60" />
                        </FormField>
                        <FormField label="Department" required error={errors.department}>
                          <Input
                            value={formData.department}
                            readOnly
                            className="cursor-not-allowed opacity-60"
                          />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <FormField label="Contract start date">
                          <Input
                            value={formData.entryDate}
                            readOnly
                            className="cursor-not-allowed opacity-60"
                          />
                        </FormField>
                        <FormField label="Contract duration" required error={errors.contractDuration}>
                          <Input
                            value={formData.contractDuration}
                            readOnly
                            className="cursor-not-allowed opacity-60"
                          />
                        </FormField>
                        <FormField label="Unit">
                          <Select
                            value={formData.contractDurationUnit}
                            disabled
                          >
                            <option value="days">Days</option>
                            <option value="months">Months</option>
                            <option value="years">Years</option>
                          </Select>
                        </FormField>
                        <FormField label="Contract end date">
                          <Input
                            value=""
                            readOnly
                            className="cursor-not-allowed opacity-60"
                          />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField label="Probationary period" required error={errors.probationaryPeriod}>
                          <Input
                            type="number"
                            min="1"
                            max="99"
                            value={formData.probationaryPeriod}
                            onChange={(e) => handleInputChange('probationaryPeriod', e.target.value)}
                            error={errors.probationaryPeriod}
                          />
                        </FormField>
                        <FormField label="Unit">
                          <Select
                            value={formData.probationaryPeriodUnit}
                            onChange={(e) => handleInputChange('probationaryPeriodUnit', e.target.value)}
                          >
                            <option value="days">Days</option>
                            <option value="months">Months</option>
                          </Select>
                        </FormField>
                        <FormField label="Confirmation date">
                          <Input
                            value=""
                            readOnly
                            className="cursor-not-allowed opacity-60"
                          />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <FormField label="Unsuccessful probation notice period (days)" required error={errors.unsuccessfulProbationNotice}>
                          <Input
                            type="number"
                            min="1"
                            max="999"
                            value={formData.unsuccessfulProbationNotice}
                            onChange={(e) => handleInputChange('unsuccessfulProbationNotice', e.target.value)}
                            error={errors.unsuccessfulProbationNotice}
                          />
                        </FormField>
                        <FormField label="Resignation notice period (days)" required error={errors.resignationNotice}>
                          <Input
                            type="number"
                            min="1"
                            max="999"
                            value={formData.resignationNotice}
                            onChange={(e) => handleInputChange('resignationNotice', e.target.value)}
                            error={errors.resignationNotice}
                          />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <FormField label="Pay basis" required error={errors.payBasis}>
                          <Select
                            value={formData.payBasis}
                            onChange={(e) => handleInputChange('payBasis', e.target.value)}
                            error={errors.payBasis}
                          >
                            <option value="Salaried">Salaried</option>
                            <option value="Hourly">Hourly</option>
                          </Select>
                        </FormField>

                        <FormField label="Contractual status" required error={errors.contractualStatus}>
                          <Select
                            value={formData.contractualStatus}
                            onChange={(e) => {
                              handleInputChange('contractualStatus', e.target.value);
                              // Clear contract duration and end date if Permanent is selected
                              if (e.target.value === 'Permanent') {
                                handleInputChange('contractDuration', '');
                                handleInputChange('contractDurationUnit', 'days');
                              }
                            }}
                            error={errors.contractualStatus}
                          >
                            <option value="Fixed-term">Fixed-term</option>
                            <option value="Permanent">Permanent</option>
                          </Select>
                        </FormField>

                        <FormField label="Employment type" required error={errors.employmentType}>
                          <Select
                            value={formData.employmentType}
                            onChange={(e) => {
                              handleInputChange('employmentType', e.target.value);
                              // Clear hours worked per day if Full-time is selected
                              if (e.target.value === 'Full-time') {
                                handleInputChange('hoursWorkedPerDay', '');
                              }
                            }}
                            error={errors.employmentType}
                          >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                          </Select>
                        </FormField>

                        <FormField label="Hours worked per day" error={errors.hoursWorkedPerDay}>
                          <Input
                            type="number"
                            min="4"
                            max="7"
                            value={formData.hoursWorkedPerDay}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || (parseInt(value) >= 4 && parseInt(value) <= 7)) {
                                handleInputChange('hoursWorkedPerDay', value);
                              }
                            }}
                            disabled={formData.employmentType !== 'Part-time'}
                            error={errors.hoursWorkedPerDay}
                            className={formData.employmentType !== 'Part-time' ? 'cursor-not-allowed opacity-60' : ''}
                            maxLength={1}
                          />
                        </FormField>
                      </div>

                      <FormField label="Purpose of the appointment">
                        <Textarea
                          value={formData.appointmentPurpose}
                          onChange={(e) => handleInputChange('appointmentPurpose', e.target.value)}
                          rows={3}
                        />
                      </FormField>
                    </div>
                  )}

                  {/* Identification Step */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          You may enter either an ID card only, or a driving license only, or both together. NIN is always mandatory.
                        </p>
                      </div>

                      <FormField label="National ID number (NIN)" required error={errors.nationalIdNumber}>
                        <Input
                          value={formData.nationalIdNumber}
                          onChange={(e) => handleInputChange('nationalIdNumber', e.target.value)}
                          placeholder="xxxxxxxxxxxxxxxxxx"
                          maxLength={18}
                          error={errors.nationalIdNumber}
                        />
                      </FormField>

                      <div className="pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <FormField label="ID number" error={errors.idNumber}>
                          <Input
                            value={formData.idNumber}
                            onChange={(e) => handleInputChange('idNumber', e.target.value)}
                            error={errors.idNumber}
                          />
                        </FormField>

                        <div className="grid grid-cols-3 gap-6 mt-6">
                          <FormField label="ID issuing date" required={!!formData.idNumber} error={errors.idIssuingDate}>
                            <Input
                              type="text"
                              placeholder="xx/xx/xxxx"
                              value={formData.idIssuingDate}
                              onChange={(e) => handleInputChange('idIssuingDate', e.target.value)}
                              error={errors.idIssuingDate}
                            />
                          </FormField>
                          <FormField label="ID issuing province" required={!!formData.idNumber} error={errors.idIssuingProvince}>
                            <Input
                              value={formData.idIssuingProvince}
                              onChange={(e) => handleInputChange('idIssuingProvince', e.target.value)}
                              error={errors.idIssuingProvince}
                            />
                          </FormField>
                          <FormField label="ID issuing municipality" required={!!formData.idNumber} error={errors.idIssuingMunicipality}>
                            <Input
                              value={formData.idIssuingMunicipality}
                              onChange={(e) => handleInputChange('idIssuingMunicipality', e.target.value)}
                              error={errors.idIssuingMunicipality}
                            />
                          </FormField>
                        </div>
                      </div>

                      <div className="pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <FormField label="Driver license number" error={errors.driverLicenseNumber}>
                          <Input
                            value={formData.driverLicenseNumber}
                            onChange={(e) => handleInputChange('driverLicenseNumber', e.target.value)}
                            error={errors.driverLicenseNumber}
                          />
                        </FormField>

                        <div className="grid grid-cols-3 gap-6 mt-6">
                          <FormField label="Driver license issuing date" required={!!formData.driverLicenseNumber} error={errors.driverLicenseIssuingDate}>
                            <Input
                              type="text"
                              placeholder="xx/xx/xxxx"
                              value={formData.driverLicenseIssuingDate}
                              onChange={(e) => handleInputChange('driverLicenseIssuingDate', e.target.value)}
                              error={errors.driverLicenseIssuingDate}
                            />
                          </FormField>
                          <FormField label="Driver license issuing province" required={!!formData.driverLicenseNumber} error={errors.driverLicenseIssuingProvince}>
                            <Input
                              value={formData.driverLicenseIssuingProvince}
                              onChange={(e) => handleInputChange('driverLicenseIssuingProvince', e.target.value)}
                              error={errors.driverLicenseIssuingProvince}
                            />
                          </FormField>
                          <FormField label="Driver license issuing municipality" required={!!formData.driverLicenseNumber} error={errors.driverLicenseIssuingMunicipality}>
                            <Input
                              value={formData.driverLicenseIssuingMunicipality}
                              onChange={(e) => handleInputChange('driverLicenseIssuingMunicipality', e.target.value)}
                              error={errors.driverLicenseIssuingMunicipality}
                            />
                          </FormField>
                        </div>
                      </div>

                      <div className="pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <FormField label="Social security number" error={errors.socialSecurityNumber}>
                          <Input
                            value={formData.socialSecurityNumber}
                            onChange={(e) => handleInputChange('socialSecurityNumber', e.target.value)}
                            placeholder="xx xxxx xxxx xx"
                            maxLength={15}
                            error={errors.socialSecurityNumber}
                          />
                        </FormField>
                      </div>
                    </div>
                  )}

                  {/* Payment Step */}
                  {currentStep === 6 && (
                    <div className="space-y-6">
                      <FormField label="Bank name" required error={errors.bankName}>
                        <Select value={formData.bankName} onChange={(e) => handleInputChange('bankName', e.target.value)} error={errors.bankName}>
                          <option value="">Select bank</option>
                          {banks.map((bank) => (
                            <option key={bank.id} value={bank.name}>{bank.name}</option>
                          ))}
                        </Select>
                      </FormField>

                      <FormField label="Account number" required error={errors.accountNumber}>
                        <Input
                          value={formData.accountNumber}
                          onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                          placeholder="xxx xxxxx xxxxxxxxxxxx"
                          maxLength={23}
                          error={errors.accountNumber}
                        />
                      </FormField>
                    </div>
                  )}

                  {/* Termination Step */}
                  {currentStep === 7 && (
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                          Please enter the date of the employee's last working day.
                        </p>
                        <FormField label="Termination date" error={errors.terminationDate}>
                          <Input
                            type="text"
                            placeholder="xx/xx/xxxx"
                            value={formData.terminationDate}
                            onChange={(e) => handleInputChange('terminationDate', e.target.value)}
                            error={errors.terminationDate}
                          />
                        </FormField>
                      </div>

                      <div>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                          Please choose a termination reason from the list below:
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                            {[
                              { value: 'Resignation', label: 'Resignation' },
                              { value: 'Contract expiration', label: 'Contract expiration' },
                              { value: 'Job abandonment', label: 'Job abandonment' },
                              { value: 'Failed probation', label: 'Failed probation' },
                              { value: 'Relocation', label: 'Relocation' },
                            ].map((option) => (
                              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.terminationReason === option.value}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      handleInputChange('terminationReason', option.value);
                                    } else if (formData.terminationReason === option.value) {
                                      handleInputChange('terminationReason', '');
                                    }
                                  }}
                                  disabled={formData.terminationReason !== '' && formData.terminationReason !== option.value}
                                  className="w-4 h-4 rounded"
                                />
                                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                  {option.label}
                                </span>
                              </label>
                            ))}
                          </div>
                          <div className="space-y-3">
                            {[
                              { value: 'Death', label: 'Death' },
                              { value: 'Retirement', label: 'Retirement' },
                              { value: 'Dismissal', label: 'Dismissal' },
                              { value: 'Long-term sickness', label: 'Long-term sickness' },
                              { value: 'Permanent disability', label: 'Permanent disability' },
                              { value: 'Military service leave', label: 'Military service leave' },
                            ].map((option) => (
                              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.terminationReason === option.value}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      handleInputChange('terminationReason', option.value);
                                    } else if (formData.terminationReason === option.value) {
                                      handleInputChange('terminationReason', '');
                                    }
                                  }}
                                  disabled={formData.terminationReason !== '' && formData.terminationReason !== option.value}
                                  className="w-4 h-4 rounded"
                                />
                                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                  {option.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {formData.terminationDate && formData.terminationReason && (
                        <div className="pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                          <button
                            onClick={() => {
                              setShowCancelTerminationConfirm(true);
                            }}
                            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444'
                            }}
                          >
                            Cancel termination
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
              >
                Previous
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={!hasModifications}
                  className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Cancel recent modifications
                </button>
                
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    Next
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={!hasModifications}
                      className="px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'var(--gradient-primary)' }}
                    >
                      Save modifications
                    </button>
                    <button
                      onClick={handleDeleteEmployee}
                      disabled={!isLastEmployee()}
                      className="px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: '#ef4444' }}
                    >
                      Delete employee
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Selector Modal */}
      <AnimatePresence>
        {showEmployeeSelector && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowEmployeeSelector(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-card p-6 max-w-2xl w-full" style={{ background: 'var(--bg-card)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Select Employee
                  </h3>
                  <button
                    onClick={() => setShowEmployeeSelector(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-tertiary)]"
                  >
                    <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>

                <div className="mb-4 flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      checked={selectorSortBy === 'number'}
                      onChange={() => setSelectorSortBy('number')}
                    />
                    Sort by employee's number
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      checked={selectorSortBy === 'name'}
                      onChange={() => setSelectorSortBy('name')}
                    />
                    Sort by family name
                  </label>
                </div>

                <div 
                  ref={selectorListRef}
                  className="border rounded-xl overflow-y-auto mb-4"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    maxHeight: '300px',
                    background: 'var(--bg-tertiary)'
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setSelectorSelectedIndex(Math.min(sortedSelectorEmployees.length - 1, selectorSelectedIndex + 1));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setSelectorSelectedIndex(Math.max(0, selectorSelectedIndex - 1));
                    }
                  }}
                >
                  {sortedSelectorEmployees.map((emp, index) => (
                    <div
                      key={emp.id}
                      onClick={() => setSelectorSelectedIndex(index)}
                      className="px-4 py-3 cursor-pointer transition-colors"
                      style={{ 
                        background: selectorSelectedIndex === index ? 'rgba(var(--primary-color-rgb), 0.1)' : 'transparent',
                        borderBottom: '1px solid var(--border-subtle)'
                      }}
                    >
                      <span className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                        {emp.employeeNumber}
                      </span>
                      <span className="mx-4" style={{ color: 'var(--text-tertiary)' }}>•</span>
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {emp.lastName}
                      </span>
                      <span className="mx-4" style={{ color: 'var(--text-tertiary)' }}>•</span>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {emp.firstName}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowEmployeeSelector(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                    style={{ 
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (sortedSelectorEmployees[selectorSelectedIndex]) {
                        loadEmployee(sortedSelectorEmployees[selectorSelectedIndex]);
                        setShowEmployeeSelector(false);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowSuccessModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-card p-8 max-w-md w-full" style={{ background: 'var(--bg-card)' }}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: '#10b981' }}>
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Employee Updated Successfully
                  </h3>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                    The employee information has been saved.
                  </p>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cancel Termination Confirmation Modal */}
      <AnimatePresence>
        {showCancelTerminationConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60]"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowCancelTerminationConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            >
              <div className="glass-card p-8 max-w-md w-full" style={{ background: 'var(--bg-card)' }}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Cancel Termination
                  </h3>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                    Do you really want to restore this employee?
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setShowCancelTerminationConfirm(false)}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      No
                    </button>
                    <button
                      onClick={() => {
                        setShowCancelTerminationConfirm(false);
                        setShowCancelTerminationWarning(true);
                      }}
                      className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105"
                      style={{ background: '#ef4444' }}
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cancel Termination Warning Modal */}
      <AnimatePresence>
        {showCancelTerminationWarning && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60]"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            >
              <div className="glass-card p-8 max-w-md w-full" style={{ background: 'var(--bg-card)' }}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Important Notice
                  </h3>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                    Please delete any documents that have been prepared after employee's leaving.
                  </p>
                  <button
                    onClick={handleCancelTermination}
                    className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
