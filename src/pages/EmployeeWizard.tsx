import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, Employee } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';

interface FormData {
  // Personal Info
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
  
  // Address
  homeAddress: string;
  provinceOfResidency: string;
  municipalityOfResidency: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  bloodType: string;
  chronicDiseases: string;
  
  // Job Details
  entryDate: string;
  job: string;
  classification: string;
  degree: string;
  group: string;
  department: string;
  
  // Identification
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
  
  // Payment
  bankName: string;
  accountNumber: string;
}

interface FormErrors {
  [key: string]: string;
}

const steps = [
  { id: 'personal', label: 'Personal info', icon: 'user' },
  { id: 'address', label: 'Address', icon: 'map' },
  { id: 'emergency', label: 'Emergency contact', icon: 'sos' },
  { id: 'job', label: 'Job details', icon: 'contract' },
  { id: 'identification', label: 'Identification', icon: 'id' },
  { id: 'payment', label: 'Payment', icon: 'bank' },
];

export default function EmployeeWizard() {
  const navigate = useNavigate();
  const { jobTitles, departments, groups, maxClassification } = useSettings();
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
    // Load banks from localStorage
    const savedBanks = localStorage.getItem('phoenix-hr-banks');
    if (savedBanks) {
      setBanks(JSON.parse(savedBanks));
    }
    
    // Load classification settings
    const savedSettings = localStorage.getItem('phoenix-hr-classification-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      // Generate employee number
      const savedEmployees = localStorage.getItem('phoenix-hr-employees');
      const employees = savedEmployees ? JSON.parse(savedEmployees) : [];
      const nextNumber = employees.length + 1;
      setFormData(prev => ({
        ...prev,
        employeeNumber: String(nextNumber).padStart(4, '0'),
      }));
    }
  }, []);

  // Calculate age from date of birth
  useEffect(() => {
    if (formData.dateOfBirth) {
      const today = new Date();
      const birth = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      if (age < 18) {
        setErrors(prev => ({ ...prev, dateOfBirth: 'Employee must be at least 18 years old' }));
        setFormData(prev => ({ ...prev, age: '' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.dateOfBirth;
          return newErrors;
        });
        setFormData(prev => ({ ...prev, age: `${age} years old` }));
      }
    }
  }, [formData.dateOfBirth]);

  // Auto-fill group based on classification
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

  // Format phone number
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    if (numbers.length <= 6) return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 6)} ${numbers.slice(6)}`;
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 6)} ${numbers.slice(6, 8)} ${numbers.slice(8, 10)}`;
  };

  // Format social security number
  const formatSocialSecurityNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6)}`;
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 10)} ${numbers.slice(10, 12)}`;
  };

  // Format account number
  const formatAccountNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 8) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 8)} ${numbers.slice(8, 20)}`;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    let processedValue = value;
    
    // Field-specific processing
    if (field === 'lastName' || field === 'firstName') {
      processedValue = value.replace(/[^a-zA-Z\s]/g, '').toLowerCase();
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
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateField = (field: keyof FormData, value: string): string => {
    // Phone number validation
    if (field === 'phoneNumber' || field === 'emergencyContactPhone') {
      const numbers = value.replace(/\s/g, '');
      if (numbers.length !== 10) return 'Phone number must be 10 digits';
      if (!numbers.startsWith('05') && !numbers.startsWith('06') && !numbers.startsWith('07')) {
        return 'Phone number must start with 05, 06, or 07';
      }
    }
    
    // National ID validation
    if (field === 'nationalIdNumber') {
      const numbers = value.replace(/\s/g, '');
      if (numbers.length !== 18) return 'National ID must be 18 digits';
    }
    
    // Social security number validation
    if (field === 'socialSecurityNumber') {
      const numbers = value.replace(/\s/g, '');
      if (numbers.length !== 12) return 'Social security number must be 12 digits';
      
      // Check if first 2 digits match birth year
      if (formData.dateOfBirth) {
        const birthYear = new Date(formData.dateOfBirth).getFullYear();
        const yearDigits = String(birthYear).slice(-2);
        if (!numbers.startsWith(yearDigits)) {
          return `First 2 digits must be ${yearDigits} (from birth year)`;
        }
      }
    }
    
    // Account number validation
    if (field === 'accountNumber') {
      const numbers = value.replace(/\s/g, '');
      if (numbers.length !== 20) return 'Account number must be 20 digits';
    }
    
    // Email validation
    if (field === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Invalid email format';
    }
    
    // Driver license validation
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
      
      // Validate ID or driver license
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
      
      if (!formData.socialSecurityNumber) newErrors.socialSecurityNumber = 'Required';
      else {
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
      // Save employee
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

  const renderStepIcon = (icon: string) => {
    switch (icon) {
      case 'user':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'map':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'sos':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'contract':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'id':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
        );
      case 'bank':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep].id;
    
    if (step === 'personal') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Employee Number</label>
            <input
              type="text"
              value={formData.employeeNumber}
              readOnly
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Family Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Gender *</label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${errors.gender ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date of Birth *</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              <p className="text-xs text-gray-500 mt-1">If employee doesn't have a date of birth, please type 01/01/XXXX</p>
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Age</label>
              <input
                type="text"
                value={formData.age}
                readOnly
                className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Province of Birth *</label>
              <input
                type="text"
                value={formData.provinceOfBirth}
                onChange={(e) => handleInputChange('provinceOfBirth', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${errors.provinceOfBirth ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.provinceOfBirth && <p className="text-red-500 text-xs mt-1">{errors.provinceOfBirth}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Municipality of Birth *</label>
              <input
                type="text"
                value={formData.municipalityOfBirth}
                onChange={(e) => handleInputChange('municipalityOfBirth', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${errors.municipalityOfBirth ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.municipalityOfBirth && <p className="text-red-500 text-xs mt-1">{errors.municipalityOfBirth}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                onBlur={() => handleBlur('phoneNumber')}
                placeholder="05 06 07 08 09"
                className={`w-full px-4 py-2 rounded-lg border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full px-4 py-2 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Situation *</label>
              <select
                value={formData.situation}
                onChange={(e) => handleInputChange('situation', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${errors.situation ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              >
                <option value="">Select situation</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
              {errors.situation && <p className="text-red-500 text-xs mt-1">{errors.situation}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Number of Kids *</label>
              <input
                type="number"
                value={formData.numberOfKids}
                onChange={(e) => handleInputChange('numberOfKids', e.target.value)}
                disabled={formData.situation === 'Single'}
                max="99"
                className={`w-full px-4 py-2 rounded-lg border ${errors.numberOfKids ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${formData.situation === 'Single' ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
              />
              {errors.numberOfKids && <p className="text-red-500 text-xs mt-1">{errors.numberOfKids}</p>}
            </div>
          </div>
        </div>
      );
    }
    
    if (step === 'address') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Home Address *</label>
            <textarea
              value={formData.homeAddress}
              onChange={(e) => handleInputChange('homeAddress', e.target.value)}
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border ${errors.homeAddress ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors.homeAddress && <p className="text-red-500 text-xs mt-1">{errors.homeAddress}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Province of Residency *</label>
              <input
                type="text"
                value={formData.provinceOfResidency}
                onChange={(e) => handleInputChange('provinceOfResidency', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${errors.provinceOfResidency ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.provinceOfResidency && <p className="text-red-500 text-xs mt-1">{errors.provinceOfResidency}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Municipality of Residency *</label>
              <input
                type="text"
                value={formData.municipalityOfResidency}
                onChange={(e) => handleInputChange('municipalityOfResidency', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${errors.municipalityOfResidency ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.municipalityOfResidency && <p className="text-red-500 text-xs mt-1">{errors.municipalityOfResidency}</p>}
            </div>
          </div>
        </div>
      );
    }
    
    if (step === 'emergency') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Person to Contact in Case of Emergency *</label>
            <input
              type="text"
              value={formData.emergencyContactName}
              onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${errors.emergencyContactName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors.emergencyContactName && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number to Call *</label>
              <input
                type="text"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                onBlur={() => handleBlur('emergencyContactPhone')}
                placeholder="05 06 07 08 09"
                className={`w-full px-4 py-2 rounded-lg border ${errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.emergencyContactPhone && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactPhone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Relationship *</label>
              <select
                value={formData.emergencyContactRelationship}
                onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${errors.emergencyContactRelationship ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              >
                <option value="">Select relationship</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Wife">Wife</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Other">Other</option>
              </select>
              {errors.emergencyContactRelationship && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactRelationship}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Blood Type *</label>
              <select
                value={formData.bloodType}
                onChange={(e) => handleInputChange('bloodType', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${errors.bloodType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              {errors.bloodType && <p className="text-red-500 text-xs mt-1">{errors.bloodType}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Chronic Diseases</label>
            <textarea
              value={formData.chronicDiseases}
              onChange={(e) => handleInputChange('chronicDiseases', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
            />
          </div>
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Entry Date *</label>
            <input
              type="date"
              value={formData.entryDate}
              onChange={(e) => handleInputChange('entryDate', e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${errors.entryDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors.entryDate && <p className="text-red-500 text-xs mt-1">{errors.entryDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Job *</label>
            <select
              value={formData.job}
              onChange={(e) => handleInputChange('job', e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${errors.job ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            >
              <option value="">Select job</option>
              {jobTitles.map(title => (
                <option key={title} value={title}>{title}</option>
              ))}
            </select>
            {errors.job && <p className="text-red-500 text-xs mt-1">{errors.job}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Classification</label>
              <input
                type="text"
                value={formData.classification}
                onChange={(e) => handleInputChange('classification', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Degree *</label>
              <select
                value={formData.degree}
                onChange={(e) => handleInputChange('degree', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${errors.degree ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              >
                <option value="">Select degree</option>
                {degrees.map(d => (
                  <option key={d} value={String(d)}>{d}</option>
                ))}
              </select>
              {errors.degree && <p className="text-red-500 text-xs mt-1">{errors.degree}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Group</label>
            <input
              type="text"
              value={formData.group}
              readOnly
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Department *</label>
            <select
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${errors.department ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
            {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
          </div>
        </div>
      );
    }
    
    if (step === 'identification') {
      return (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              You may enter either an ID card only or a driving license or both together. Both NIN and social security number are mandatory.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">National ID Number (NIN) *</label>
            <input
              type="text"
              value={formData.nationalIdNumber}
              onChange={(e) => handleInputChange('nationalIdNumber', e.target.value)}
              onBlur={() => handleBlur('nationalIdNumber')}
              maxLength={18}
              className={`w-full px-4 py-2 rounded-lg border ${errors.nationalIdNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors.nationalIdNumber && <p className="text-red-500 text-xs mt-1">{errors.nationalIdNumber}</p>}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">ID Number</label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => handleInputChange('idNumber', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${errors.idNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.idNumber && <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>}
            </div>

            {formData.idNumber && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ID Issuing Date *</label>
                  <input
                    type="date"
                    value={formData.idIssuingDate}
                    onChange={(e) => handleInputChange('idIssuingDate', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.idIssuingDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  />
                  {errors.idIssuingDate && <p className="text-red-500 text-xs mt-1">{errors.idIssuingDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ID Issuing Province *</label>
                  <input
                    type="text"
                    value={formData.idIssuingProvince}
                    onChange={(e) => handleInputChange('idIssuingProvince', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.idIssuingProvince ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  />
                  {errors.idIssuingProvince && <p className="text-red-500 text-xs mt-1">{errors.idIssuingProvince}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ID Issuing Municipality *</label>
                  <input
                    type="text"
                    value={formData.idIssuingMunicipality}
                    onChange={(e) => handleInputChange('idIssuingMunicipality', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.idIssuingMunicipality ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  />
                  {errors.idIssuingMunicipality && <p className="text-red-500 text-xs mt-1">{errors.idIssuingMunicipality}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Driver License Number</label>
              <input
                type="text"
                value={formData.driverLicenseNumber}
                onChange={(e) => handleInputChange('driverLicenseNumber', e.target.value)}
                onBlur={() => handleBlur('driverLicenseNumber')}
                className={`w-full px-4 py-2 rounded-lg border ${errors.driverLicenseNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.driverLicenseNumber && <p className="text-red-500 text-xs mt-1">{errors.driverLicenseNumber}</p>}
            </div>

            {formData.driverLicenseNumber && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Driver License Issuing Date *</label>
                  <input
                    type="date"
                    value={formData.driverLicenseIssuingDate}
                    onChange={(e) => handleInputChange('driverLicenseIssuingDate', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.driverLicenseIssuingDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  />
                  {errors.driverLicenseIssuingDate && <p className="text-red-500 text-xs mt-1">{errors.driverLicenseIssuingDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Driver License Issuing Province *</label>
                  <input
                    type="text"
                    value={formData.driverLicenseIssuingProvince}
                    onChange={(e) => handleInputChange('driverLicenseIssuingProvince', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.driverLicenseIssuingProvince ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  />
                  {errors.driverLicenseIssuingProvince && <p className="text-red-500 text-xs mt-1">{errors.driverLicenseIssuingProvince}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Driver License Issuing Municipality *</label>
                  <input
                    type="text"
                    value={formData.driverLicenseIssuingMunicipality}
                    onChange={(e) => handleInputChange('driverLicenseIssuingMunicipality', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.driverLicenseIssuingMunicipality ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  />
                  {errors.driverLicenseIssuingMunicipality && <p className="text-red-500 text-xs mt-1">{errors.driverLicenseIssuingMunicipality}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label className="block text-sm font-medium mb-2">Social Security Number *</label>
            <input
              type="text"
              value={formData.socialSecurityNumber}
              onChange={(e) => handleInputChange('socialSecurityNumber', e.target.value)}
              onBlur={() => handleBlur('socialSecurityNumber')}
              placeholder="95 1234 5678 90"
              maxLength={14}
              className={`w-full px-4 py-2 rounded-lg border ${errors.socialSecurityNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors.socialSecurityNumber && <p className="text-red-500 text-xs mt-1">{errors.socialSecurityNumber}</p>}
          </div>
        </div>
      );
    }
    
    if (step === 'payment') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Bank Name *</label>
            <select
              value={formData.bankName}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${errors.bankName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            >
              <option value="">Select bank</option>
              {banks.map(bank => (
                <option key={bank.id} value={bank.name}>{bank.name}</option>
              ))}
            </select>
            {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Account Number *</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              onBlur={() => handleBlur('accountNumber')}
              disabled={!formData.bankName}
              placeholder="123 45678 123456789012"
              maxLength={23}
              className={`w-full px-4 py-2 rounded-lg border ${errors.accountNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${!formData.bankName ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
            />
            {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Step Navigation */}
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold mb-6">Add New Employee</h2>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(index)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                currentStep === index
                  ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                currentStep === index
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {renderStepIcon(step.icon)}
              </div>
              <span className="text-sm font-medium">{step.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Content - Form */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-6">{steps[currentStep].label}</h3>
          
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50"
            >
              Previous
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
              >
                Reset Fields
              </button>
              
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                >
                  Add Employee
                </button>
              )}
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowSuccessModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-2xl p-8 z-50 max-w-md w-full mx-4"
            >
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Employee Added Successfully</h3>
                <p className="text-gray-600 dark:text-gray-400">The new employee has been added to the system.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
