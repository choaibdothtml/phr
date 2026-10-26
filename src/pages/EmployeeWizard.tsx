// @ts-nocheck
import { useState, useEffect } from 'react';
import { X, Check, AlertCircle, User, MapPin, Phone, FileText, CreditCard, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';

interface FormData {
  employeeNumber: string;
  lastName: string;
  firstName: string;
  gender: string;
  dateOfBirth: string;
  age: string;
  provinceOfBirth: string;
  municipalityOfBirth: string;
  phoneNumber: string;
  email: string;
  situation: string;
  numberOfKids: string;
  homeAddress: string;
  provinceOfResidency: string;
  municipalityOfResidency: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  bloodType: string;
  chronicDiseases: string;
  entryDate: string;
  job: string;
  classification: string;
  degree: string;
  group: string;
  department: string;
  nationalIdNumber: string;
  idNumber: string;
  idIssuingDate: string;
  idIssuingProvince: string;
  idIssuingMunicipality: string;
  driverLicenseNumber: string;
  driverLicenseIssuingDate: string;
  driverLicenseIssuingProvince: string;
  driverLicenseIssuingMunicipality: string;
  socialSecurityNumber: string;
  bankName: string;
  accountNumber: string;
}

interface FormErrors {
  [key: string]: string;
}

const steps = [
  { id: 'personal', label: 'Personal info', icon: User },
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'emergency', label: 'Emergency', icon: Phone },
  { id: 'job', label: 'Job details', icon: FileText },
  { id: 'identification', label: 'Identification', icon: CreditCard },
  { id: 'payment', label: 'Payment', icon: Building2 },
];

// Helper components - defined outside to prevent re-creation on every render
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
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-hover:text-orange-500">
      <svg className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default function EmployeeWizard() {
  const { jobTitles, departments } = useSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [banks, setBanks] = useState<Array<{ id: string; name: string }>>([]);
  
  const [formData, setFormData] = useState<FormData>({
    employeeNumber: '',
    lastName: '',
    firstName: '',
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
    entryDate: '',
    job: '',
    classification: '',
    degree: '',
    group: '',
    department: '',
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
  });

  useEffect(() => {
    const savedBanks = localStorage.getItem('phoenix-hr-banks');
    if (savedBanks) {
      setBanks(JSON.parse(savedBanks));
    }
    
    const savedEmployees = localStorage.getItem('phoenix-hr-employees');
    const employees = savedEmployees ? JSON.parse(savedEmployees) : [];
    const nextNumber = employees.length + 1;
    setFormData(prev => ({
      ...prev,
      employeeNumber: String(nextNumber).padStart(4, '0'),
    }));
  }, []);

  const calculateAge = (dateString: string) => {
    if (!dateString) return '';
    
    // Parse dd/mm/yyyy format
    const parts = dateString.split('/');
    if (parts.length !== 3) return '';
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JavaScript
    const year = parseInt(parts[2], 10);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
    
    const birth = new Date(year, month, day);
    const today = new Date();
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return `${age} years old`;
  };

  // Calculate age when dateOfBirth changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const ageText = calculateAge(formData.dateOfBirth);
      if (ageText) {
        const ageNum = parseInt(ageText);
        if (ageNum < 18) {
          setErrors(prev => ({ ...prev, dateOfBirth: 'Employee must be at least 18 years old' }));
          setFormData(prev => ({ ...prev, age: '' }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.dateOfBirth;
            return newErrors;
          });
          setFormData(prev => ({ ...prev, age: ageText }));
        }
      }
    } else {
      setFormData(prev => ({ ...prev, age: '' }));
    }
  }, [formData.dateOfBirth]);

  useEffect(() => {
    if (formData.classification) {
      const classificationNum = parseInt(formData.classification);
      const savedGroups = localStorage.getItem('phoenix-hr-groups-custom');
      if (savedGroups) {
        const groupsList = JSON.parse(savedGroups);
        const matchingGroup = groupsList.find((g: any) => 
          classificationNum >= g.lowestClassification && 
          classificationNum <= g.highestClassification
        );
        if (matchingGroup) {
          setFormData(prev => ({ ...prev, group: matchingGroup.name }));
        }
      }
    }
  }, [formData.classification]);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    if (numbers.length <= 6) return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 6)} ${numbers.slice(6)}`;
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 6)} ${numbers.slice(6, 8)} ${numbers.slice(8, 10)}`;
  };

  const formatSocialSecurityNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6)}`;
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 10)} ${numbers.slice(10, 12)}`;
  };

  const formatAccountNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 8) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 8)} ${numbers.slice(8, 20)}`;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    let processedValue = value;
    
    if (field === 'lastName' || field === 'firstName' || field === 'emergencyContactName') {
      processedValue = value.replace(/[^a-zA-Z\s'éèàï-]/g, '').toLowerCase();
      processedValue = processedValue.replace(/\b\w/g, l => l.toUpperCase());
    } else if (field === 'email') {
      processedValue = value.toLowerCase();
    } else if (field === 'phoneNumber' || field === 'emergencyContactPhone') {
      processedValue = formatPhoneNumber(value);
    } else if (field === 'socialSecurityNumber') {
      processedValue = formatSocialSecurityNumber(value);
    } else if (field === 'accountNumber') {
      processedValue = formatAccountNumber(value);
    } else if (field === 'homeAddress' || field === 'chronicDiseases') {
      processedValue = value.charAt(0).toUpperCase() + value.slice(1);
    } else if (field === 'driverLicenseNumber') {
      processedValue = value.toUpperCase();
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateField = (field: keyof FormData, value: string): string => {
    if (field === 'phoneNumber' || field === 'emergencyContactPhone') {
      const numbers = value.replace(/\s/g, '');
      if (numbers.length !== 10) return 'Phone number must be 10 digits';
      if (!numbers.startsWith('05') && !numbers.startsWith('06') && !numbers.startsWith('07')) {
        return 'Phone number must start with 05, 06, or 07';
      }
    }
    
    if (field === 'nationalIdNumber') {
      const numbers = value.replace(/\s/g, '');
      if (numbers.length !== 18) return 'National ID must be 18 digits';
    }
    
    if (field === 'socialSecurityNumber' && value.trim() !== '') {
      const numbers = value.replace(/\s/g, '');
      if (numbers.length !== 12) return 'Social security number must be 12 digits';
      
      if (formData.dateOfBirth) {
        const birthYear = new Date(formData.dateOfBirth).getFullYear();
        const yearDigits = String(birthYear).slice(-2);
        if (!numbers.startsWith(yearDigits)) {
          return `First 2 digits must be ${yearDigits} (from birth year)`;
        }
      }
    }
    
    if (field === 'accountNumber') {
      const numbers = value.replace(/\s/g, '');
      if (numbers.length !== 20) return 'Account number must be 20 digits';
    }
    
    if (field === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Invalid email format';
    }
    
    if (field === 'driverLicenseNumber' && value) {
      const hasLetters = /[A-Z]/.test(value);
      const hasNumbers = /[0-9]/.test(value);
      if (!hasNumbers && hasLetters) return 'Driver license must contain at least some numbers';
    }
    
    return '';
  };

  const handleBlur = (field: keyof FormData) => {
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: FormErrors = {};
    const step = steps[currentStep].id;
    
    if (step === 'personal') {
      if (!formData.lastName) newErrors.lastName = 'Required';
      if (!formData.firstName) newErrors.firstName = 'Required';
      if (!formData.gender) newErrors.gender = 'Required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Required';
      if (!formData.provinceOfBirth) newErrors.provinceOfBirth = 'Required';
      if (!formData.municipalityOfBirth) newErrors.municipalityOfBirth = 'Required';
      if (!formData.phoneNumber) newErrors.phoneNumber = 'Required';
      else {
        const error = validateField('phoneNumber', formData.phoneNumber);
        if (error) newErrors.phoneNumber = error;
      }
      if (formData.email) {
        const error = validateField('email', formData.email);
        if (error) newErrors.email = error;
      }
      if (!formData.situation) newErrors.situation = 'Required';
      if (formData.situation !== 'Single' && !formData.numberOfKids) {
        newErrors.numberOfKids = 'Required';
      }
    } else if (step === 'address') {
      if (!formData.homeAddress) newErrors.homeAddress = 'Required';
      if (!formData.provinceOfResidency) newErrors.provinceOfResidency = 'Required';
      if (!formData.municipalityOfResidency) newErrors.municipalityOfResidency = 'Required';
    } else if (step === 'emergency') {
      if (!formData.emergencyContactName) newErrors.emergencyContactName = 'Required';
      if (!formData.emergencyContactPhone) newErrors.emergencyContactPhone = 'Required';
      else {
        const error = validateField('emergencyContactPhone', formData.emergencyContactPhone);
        if (error) newErrors.emergencyContactPhone = error;
      }
      if (!formData.emergencyContactRelationship) newErrors.emergencyContactRelationship = 'Required';
      if (!formData.bloodType) newErrors.bloodType = 'Required';
    } else if (step === 'job') {
      if (!formData.entryDate) newErrors.entryDate = 'Required';
      if (!formData.job) newErrors.job = 'Required';
      if (!formData.degree) newErrors.degree = 'Required';
      if (!formData.department) newErrors.department = 'Required';
    } else if (step === 'identification') {
      if (!formData.nationalIdNumber) newErrors.nationalIdNumber = 'Required';
      else {
        const error = validateField('nationalIdNumber', formData.nationalIdNumber);
        if (error) newErrors.nationalIdNumber = error;
      }
      
      const hasId = !!formData.idNumber;
      const hasLicense = !!formData.driverLicenseNumber;
      
      if (!hasId && !hasLicense) {
        newErrors.idNumber = 'ID or Driver License is required';
      }
      
      if (hasId) {
        if (!formData.idIssuingDate) newErrors.idIssuingDate = 'Required';
        if (!formData.idIssuingProvince) newErrors.idIssuingProvince = 'Required';
        if (!formData.idIssuingMunicipality) newErrors.idIssuingMunicipality = 'Required';
      }
      
      if (hasLicense) {
        if (!formData.driverLicenseIssuingDate) newErrors.driverLicenseIssuingDate = 'Required';
        if (!formData.driverLicenseIssuingProvince) newErrors.driverLicenseIssuingProvince = 'Required';
        if (!formData.driverLicenseIssuingMunicipality) newErrors.driverLicenseIssuingMunicipality = 'Required';
        
        const error = validateField('driverLicenseNumber', formData.driverLicenseNumber);
        if (error) newErrors.driverLicenseNumber = error;
      }
      
      if (formData.socialSecurityNumber) {
        const error = validateField('socialSecurityNumber', formData.socialSecurityNumber);
        if (error) newErrors.socialSecurityNumber = error;
      }
    } else if (step === 'payment') {
      if (!formData.bankName) newErrors.bankName = 'Required';
      if (!formData.accountNumber) newErrors.accountNumber = 'Required';
      else {
        const error = validateField('accountNumber', formData.accountNumber);
        if (error) newErrors.accountNumber = error;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      const savedEmployees = localStorage.getItem('phoenix-hr-employees');
      const employees = savedEmployees ? JSON.parse(savedEmployees) : [];
      employees.push(formData);
      localStorage.setItem('phoenix-hr-employees', JSON.stringify(employees));
      
      setShowSuccessModal(true);
    }
  };

  const handleReset = () => {
    setFormData({
      employeeNumber: formData.employeeNumber,
      lastName: '',
      firstName: '',
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
      entryDate: '',
      job: '',
      classification: '',
      degree: '',
      group: '',
      department: '',
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
    });
    setErrors({});
    setCurrentStep(0);
  };

  const renderStepContent = () => {
    const step = steps[currentStep].id;
    
    if (step === 'personal') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <FormField label="Employee number">
              <Input value={formData.employeeNumber} readOnly className="cursor-not-allowed opacity-60" />
            </FormField>
            <FormField label="Gender" required error={errors.gender}>
              <Select value={formData.gender} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('gender', e.target.value)} error={errors.gender}>
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
                onBlur={() => {
                  if (!formData.lastName) {
                    setErrors(prev => ({ ...prev, lastName: 'Required' }));
                  }
                }}
                error={errors.lastName}
              />
            </FormField>
            <FormField label="Name" required error={errors.firstName}>
              <Input
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                onBlur={() => {
                  if (!formData.firstName) {
                    setErrors(prev => ({ ...prev, firstName: 'Required' }));
                  }
                }}
                error={errors.firstName}
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
                onBlur={() => {
                  if (!formData.dateOfBirth) {
                    setErrors(prev => ({ ...prev, dateOfBirth: 'Required' }));
                  } else {
                    // Validate date format (dd/mm/yyyy)
                    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
                    if (!dateRegex.test(formData.dateOfBirth)) {
                      setErrors(prev => ({ ...prev, dateOfBirth: 'Invalid date format. Use dd/mm/yyyy' }));
                    }
                  }
                }}
                error={errors.dateOfBirth}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                If employee doesn't have a date of birth, please type 01/01/XXXX
              </p>
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
                onBlur={() => {
                  if (!formData.provinceOfBirth) {
                    setErrors(prev => ({ ...prev, provinceOfBirth: 'Required' }));
                  }
                }}
                error={errors.provinceOfBirth}
              />
            </FormField>
            <FormField label="Municipality of birth" required error={errors.municipalityOfBirth}>
              <Input
                value={formData.municipalityOfBirth}
                onChange={(e) => handleInputChange('municipalityOfBirth', e.target.value)}
                onBlur={() => {
                  if (!formData.municipalityOfBirth) {
                    setErrors(prev => ({ ...prev, municipalityOfBirth: 'Required' }));
                  }
                }}
                error={errors.municipalityOfBirth}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <FormField label="Phone number" required error={errors.phoneNumber}>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                onBlur={() => {
                  if (!formData.phoneNumber) {
                    setErrors(prev => ({ ...prev, phoneNumber: 'Required' }));
                  } else {
                    handleBlur('phoneNumber');
                  }
                }}
                placeholder="xx xx xx xx xx"
                error={errors.phoneNumber}
              />
            </FormField>
            <FormField label="Email address" error={errors.email}>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                error={errors.email}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <FormField label="Situation" required error={errors.situation}>
              <Select 
                value={formData.situation} 
                onChange={(e) => handleInputChange('situation', e.target.value)}
                onBlur={() => {
                  if (!formData.situation) {
                    setErrors(prev => ({ ...prev, situation: 'Required' }));
                  }
                }}
                error={errors.situation}
              >
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
                onBlur={() => {
                  if (formData.situation !== 'Single' && !formData.numberOfKids) {
                    setErrors(prev => ({ ...prev, numberOfKids: 'Required' }));
                  }
                }}
                disabled={!formData.situation || formData.situation === 'Single'}
                max="99"
                error={errors.numberOfKids}
                className={!formData.situation || formData.situation === 'Single' ? 'cursor-not-allowed opacity-60' : ''}
              />
            </FormField>
          </div>
        </div>
      );
    }
    
    if (step === 'address') {
      return (
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
      );
    }
    
    if (step === 'emergency') {
      return (
        <div className="space-y-6">
          <FormField label="Person to contact in case of emergency" required error={errors.emergencyContactName}>
            <Input
              value={formData.emergencyContactName}
              onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
              onBlur={() => {
                if (!formData.emergencyContactName) {
                  setErrors(prev => ({ ...prev, emergencyContactName: 'Required' }));
                }
              }}
              error={errors.emergencyContactName}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-6">
            <FormField label="Phone number to call" required error={errors.emergencyContactPhone}>
              <Input
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                onBlur={() => handleBlur('emergencyContactPhone')}
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
      );
    }
    
    if (step === 'job') {
      const savedSettings = localStorage.getItem('phoenix-hr-classification-settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : null;
      const lowestDegree = settings?.lowestDegree || 0;
      const highestDegree = settings?.highestDegree || 5;
      const degrees = Array.from({ length: highestDegree - lowestDegree + 1 }, (_, i) => lowestDegree + i);
      
      return (
        <div className="space-y-6">
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
            <Select value={formData.job} onChange={(e) => handleInputChange('job', e.target.value)} error={errors.job}>
              <option value="">Select job</option>
              {jobTitles.map(title => (
                <option key={title} value={title}>{title}</option>
              ))}
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-6">
            <FormField label="Classification">
              <Input
                value={formData.classification}
                onChange={(e) => handleInputChange('classification', e.target.value)}
              />
            </FormField>
            <FormField label="Degree" required error={errors.degree}>
              <Select value={formData.degree} onChange={(e) => handleInputChange('degree', e.target.value)} error={errors.degree}>
                <option value="">Select degree</option>
                {degrees.map(d => (
                  <option key={d} value={String(d)}>{d}</option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Group">
            <Input value={formData.group} readOnly className="cursor-not-allowed opacity-60" />
          </FormField>

          <FormField label="Department" required error={errors.department}>
            <Select value={formData.department} onChange={(e) => handleInputChange('department', e.target.value)} error={errors.department}>
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </Select>
          </FormField>
        </div>
      );
    }
    
    if (step === 'identification') {
      return (
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
              onBlur={() => handleBlur('nationalIdNumber')}
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
                onBlur={() => handleBlur('driverLicenseNumber')}
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
                onBlur={() => {
                  if (formData.socialSecurityNumber) {
                    handleBlur('socialSecurityNumber');
                  } else {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.socialSecurityNumber;
                      return newErrors;
                    });
                  }
                }}
                disabled={!formData.dateOfBirth}
                placeholder="xx xxxx xxxx xx"
                maxLength={14}
                error={errors.socialSecurityNumber}
                className={!formData.dateOfBirth ? 'cursor-not-allowed opacity-60' : ''}
              />
            </FormField>
          </div>
        </div>
      );
    }
    
    if (step === 'payment') {
      return (
        <div className="space-y-6">
          <FormField label="Bank name" required error={errors.bankName}>
            <Select value={formData.bankName} onChange={(e) => handleInputChange('bankName', e.target.value)} error={errors.bankName}>
              <option value="">Select bank</option>
              {banks.map(bank => (
                <option key={bank.id} value={bank.name}>{bank.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Account number" required error={errors.accountNumber}>
            <Input
              value={formData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              onBlur={() => handleBlur('accountNumber')}
              disabled={!formData.bankName}
              placeholder="xxx xxxxx xxxxxxxxxxxx"
              maxLength={23}
              error={errors.accountNumber}
              className={!formData.bankName ? 'cursor-not-allowed opacity-60' : ''}
            />
          </FormField>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex gap-6">
          {/* Step Navigation - Left of Form */}
          <div className="w-64 flex-shrink-0 space-y-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === index;
              const isCompleted = index < currentStep;
              
              return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all wizard-step-btn ${
                  isActive ? 'wizard-step-active' : ''
                }`}
                style={{
                  background: isActive ? 'rgba(var(--primary-color-rgb), 0.1)' : 'transparent',
                }}
              >                  <div
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

          {/* Form Content - Right Side */}
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
                  {renderStepContent()}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                  onClick={handleReset}
                  className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={{ 
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Reset Fields
                </button>
                
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={Object.keys(errors).length > 0}
                    title={Object.keys(errors).length > 0 ? 'Please fix all the highlighted errors first' : ''}
                    className="px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    Add Employee
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-card p-8 max-w-md w-full" style={{ background: 'var(--bg-card)' }}>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-tertiary)]"
                >
                  <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                </button>
                
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: '#10b981' }}>
                    <Check className="w-10 h-10 text-white" strokeWidth={3} />
                  </div>
                  <h3 className="font-semibold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
                    Employee Added Successfully
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    The new employee has been added to the system.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
