import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { EmploymentStatusChange, employmentStatusStorage } from '../utils/employmentStatusStorage';
import { Employee } from './WorkCertificateForm';

// @ts-nocheck

interface EmploymentStatusFormProps {
  employee: Employee;
  statusChange?: EmploymentStatusChange | null;
  onClose: () => void;
  onSave: (change: EmploymentStatusChange) => void;
}

export default function EmploymentStatusForm({ employee, statusChange, onClose, onSave }: EmploymentStatusFormProps) {
  const [formData, setFormData] = useState({
    referenceCode: '',
    dateOfIssue: '',
    takesEffect: '',
    newJob: '',
    newDepartment: '',
    newClassification: '',
    newDegree: '',
    newGroup: '',
    newBasicSalary: '',
    newContractualStatus: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isClosing, setIsClosing] = useState(false);

  // Get current employee data
  const currentJob = employee.position || '';
  const currentDepartment = employee.department || '';
  const currentClassification = employee.classification || '';
  const currentDegree = employee.degree || '';
  const currentGroup = employee.group || '';
  const currentBasicSalary = employee.basicSalary || '0';
  const currentContractualStatus = employee.contractualStatus || '';

  // Get contract dates for validation
  const contractStartDate = employee.currentContractStartDate || '';
  const contractEndDate = employee.currentContractEndDate || '';

  // Get job titles from settings
  const jobTitles = JSON.parse(localStorage.getItem('phoenix-hr-job-titles') || '[]');
  
  // Get departments from settings
  const departments = JSON.parse(localStorage.getItem('phoenix-hr-departments-custom') || '[]');
  
  // Get classification settings
  const classificationSettings = JSON.parse(localStorage.getItem('phoenix-hr-classification-settings') || '{}');
  const lowestDegree = classificationSettings.lowestDegree || 0;
  const highestDegree = classificationSettings.highestDegree || 5;
  const degrees = Array.from({ length: highestDegree - lowestDegree + 1 }, (_, i) => lowestDegree + i);
  
  // Get groups from settings
  const groups = JSON.parse(localStorage.getItem('phoenix-hr-groups-custom') || '[]');
  
  // Get basic salaries from settings
  const basicSalaries = JSON.parse(localStorage.getItem('phoenix-hr-basic-salaries') || '{}');

  useEffect(() => {
    // If editing, populate form with status change data
    if (statusChange) {
      setFormData({
        referenceCode: statusChange.referenceCode,
        dateOfIssue: statusChange.dateOfIssue,
        takesEffect: statusChange.takesEffect,
        newJob: statusChange.newJob,
        newDepartment: statusChange.newDepartment,
        newClassification: statusChange.newClassification,
        newDegree: statusChange.newDegree,
        newGroup: statusChange.newGroup,
        newBasicSalary: statusChange.newBasicSalary,
        newContractualStatus: statusChange.newContractualStatus,
      });
    }
  }, [statusChange]);

  // Auto-fill new group when classification changes
  useEffect(() => {
    if (formData.newClassification) {
      const classificationNum = parseInt(formData.newClassification);
      const matchingGroup = groups.find((g: any) => 
        classificationNum >= g.lowestClassification && 
        classificationNum <= g.highestClassification
      );
      if (matchingGroup) {
        setFormData(prev => ({ ...prev, newGroup: matchingGroup.name }));
      }
    }
  }, [formData.newClassification, groups]);

  // Auto-fill new basic salary when classification and degree change
  useEffect(() => {
    if (formData.newClassification && formData.newDegree) {
      const key = `${formData.newClassification}-${formData.newDegree}`;
      const salary = basicSalaries[key];
      if (salary) {
        setFormData(prev => ({ ...prev, newBasicSalary: salary }));
      } else {
        setFormData(prev => ({ ...prev, newBasicSalary: '0' }));
      }
    }
  }, [formData.newClassification, formData.newDegree, basicSalaries]);

  const handleReferenceCodeChange = (value: string) => {
    // Allow only Latin letters, numbers, and special characters: é è à ï - / _
    const filtered = value.replace(/[^a-zA-Z0-9\s'éèàï\-/_]/g, '');
    setFormData({ ...formData, referenceCode: filtered });
  };

  const handleDateChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Validate date is within contract period
    if (value) {
      const dateParts = value.split('/');
      if (dateParts.length === 3) {
        const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        const startDate = new Date(contractStartDate.split('/').reverse().join('-'));
        const endDate = new Date(contractEndDate.split('/').reverse().join('-'));
        
        if (date < startDate || date > endDate) {
          setErrors({ ...errors, [field]: `Date must be between ${contractStartDate} and ${contractEndDate}` });
        } else {
          const newErrors = { ...errors };
          delete newErrors[field];
          setErrors(newErrors);
        }
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.referenceCode.trim()) {
      newErrors.referenceCode = 'Reference code is required';
    }

    if (!formData.dateOfIssue) {
      newErrors.dateOfIssue = 'Date of issue is required';
    } else {
      const dateParts = formData.dateOfIssue.split('/');
      if (dateParts.length === 3) {
        const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        const startDate = new Date(contractStartDate.split('/').reverse().join('-'));
        const endDate = new Date(contractEndDate.split('/').reverse().join('-'));
        
        if (date < startDate || date > endDate) {
          newErrors.dateOfIssue = `Date must be between ${contractStartDate} and ${contractEndDate}`;
        }
      }
    }

    if (!formData.takesEffect) {
      newErrors.takesEffect = 'Takes effect date is required';
    } else {
      const dateParts = formData.takesEffect.split('/');
      if (dateParts.length === 3) {
        const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        const startDate = new Date(contractStartDate.split('/').reverse().join('-'));
        const endDate = new Date(contractEndDate.split('/').reverse().join('-'));
        
        if (date < startDate || date > endDate) {
          newErrors.takesEffect = `Date must be between ${contractStartDate} and ${contractEndDate}`;
        }
      }
    }

    if (!formData.newJob) newErrors.newJob = 'New job title is required';
    if (!formData.newDepartment) newErrors.newDepartment = 'New department is required';
    if (!formData.newDegree) newErrors.newDegree = 'New degree is required';
    if (!formData.newContractualStatus) newErrors.newContractualStatus = 'New contractual status is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) return;

    const newChange: EmploymentStatusChange = {
      id: statusChange?.id || Date.now().toString(),
      employeeNumber: employee.employeeNumber,
      referenceCode: formData.referenceCode,
      dateOfIssue: formData.dateOfIssue,
      takesEffect: formData.takesEffect,
      currentJob,
      currentDepartment,
      currentClassification,
      currentDegree,
      currentGroup,
      currentBasicSalary,
      currentContractualStatus,
      newJob: formData.newJob,
      newDepartment: formData.newDepartment,
      newClassification: formData.newClassification,
      newDegree: formData.newDegree,
      newGroup: formData.newGroup || '',
      newBasicSalary: formData.newBasicSalary || '0',
      newContractualStatus: formData.newContractualStatus,
    };

    setIsClosing(true);
    setTimeout(() => {
      onSave(newChange);
    }, 300);
  };

  const handleReset = () => {
    setFormData({
      referenceCode: formData.referenceCode,
      dateOfIssue: '',
      takesEffect: '',
      newJob: '',
      newDepartment: '',
      newClassification: '',
      newDegree: '',
      newGroup: '',
      newBasicSalary: '',
      newContractualStatus: '',
    });
    setErrors({});
  };

  const handleCancel = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return createPortal(
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          key="employment-status-form-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
        >
          <motion.div
            key="employment-status-form-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="glass-card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--bg-popup)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {statusChange ? 'Edit employment status change' : 'Add employment status change'}
              </h3>
              <button
                onClick={handleCancel}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Reference Code and Date of Issue */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    Reference code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.referenceCode}
                    onChange={(e) => handleReferenceCodeChange(e.target.value)}
                    disabled={!!statusChange}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ 
                      background: 'var(--bg-tertiary)', 
                      border: errors.referenceCode ? '1px solid #ef4444' : '1px solid var(--border-color)', 
                      color: 'var(--text-primary)' 
                    }}
                  />
                  {errors.referenceCode && (
                    <p className="text-xs text-red-500 mt-1">{errors.referenceCode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    Date of issue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.dateOfIssue}
                    onChange={(e) => handleDateChange('dateOfIssue', e.target.value)}
                    placeholder="xx/xx/xxxx"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/30"
                    style={{ 
                      background: 'var(--bg-tertiary)', 
                      border: errors.dateOfIssue ? '1px solid #ef4444' : '1px solid var(--border-color)', 
                      color: 'var(--text-primary)' 
                    }}
                  />
                  {errors.dateOfIssue && (
                    <p className="text-xs text-red-500 mt-1">{errors.dateOfIssue}</p>
                  )}
                </div>
              </div>

              {/* Current Status */}
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Current status:
                </label>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Job</label>
                    <input
                      type="text"
                      value={currentJob}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none cursor-not-allowed opacity-60"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Department</label>
                    <input
                      type="text"
                      value={currentDepartment}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none cursor-not-allowed opacity-60"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Classification</label>
                    <input
                      type="text"
                      value={currentClassification}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none cursor-not-allowed opacity-60"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Degree</label>
                    <input
                      type="text"
                      value={currentDegree}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none cursor-not-allowed opacity-60"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Group</label>
                    <input
                      type="text"
                      value={currentGroup}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none cursor-not-allowed opacity-60"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Basic salary</label>
                    <input
                      type="text"
                      value={currentBasicSalary}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none cursor-not-allowed opacity-60"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Contractual status</label>
                    <input
                      type="text"
                      value={currentContractualStatus}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none cursor-not-allowed opacity-60"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              </div>

              {/* New Status */}
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  New status:
                </label>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      New job title <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.newJob}
                      onChange={(e) => setFormData({ ...formData, newJob: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none cursor-pointer transition-all focus:ring-2 focus:ring-orange-500/30"
                      style={{ 
                        background: 'var(--bg-tertiary)', 
                        border: errors.newJob ? '1px solid #ef4444' : '1px solid var(--border-color)', 
                        color: 'var(--text-primary)' 
                      }}
                    >
                      <option value="">Select job title</option>
                      {jobTitles.map((title: string) => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                    </select>
                    {errors.newJob && (
                      <p className="text-xs text-red-500 mt-1">{errors.newJob}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      New department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.newDepartment}
                      onChange={(e) => setFormData({ ...formData, newDepartment: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none cursor-pointer transition-all focus:ring-2 focus:ring-orange-500/30"
                      style={{ 
                        background: 'var(--bg-tertiary)', 
                        border: errors.newDepartment ? '1px solid #ef4444' : '1px solid var(--border-color)', 
                        color: 'var(--text-primary)' 
                      }}
                    >
                      <option value="">Select department</option>
                      {departments.map((dept: any) => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                    {errors.newDepartment && (
                      <p className="text-xs text-red-500 mt-1">{errors.newDepartment}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      New classification
                    </label>
                    <input
                      type="text"
                      value={formData.newClassification}
                      onChange={(e) => setFormData({ ...formData, newClassification: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/30"
                      style={{ 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-color)', 
                        color: 'var(--text-primary)' 
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      New degree <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.newDegree}
                      onChange={(e) => setFormData({ ...formData, newDegree: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none cursor-pointer transition-all focus:ring-2 focus:ring-orange-500/30"
                      style={{ 
                        background: 'var(--bg-tertiary)', 
                        border: errors.newDegree ? '1px solid #ef4444' : '1px solid var(--border-color)', 
                        color: 'var(--text-primary)' 
                      }}
                    >
                      <option value="">Select degree</option>
                      {degrees.map((d: number) => (
                        <option key={d} value={d.toString()}>{d}</option>
                      ))}
                    </select>
                    {errors.newDegree && (
                      <p className="text-xs text-red-500 mt-1">{errors.newDegree}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      New group
                    </label>
                    <input
                      type="text"
                      value={formData.newGroup || ''}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none cursor-not-allowed opacity-60"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      New basic salary
                    </label>
                    <input
                      type="text"
                      value={formData.newBasicSalary || '0'}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none cursor-not-allowed opacity-60"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      New contractual status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.newContractualStatus}
                      onChange={(e) => setFormData({ ...formData, newContractualStatus: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none cursor-pointer transition-all focus:ring-2 focus:ring-orange-500/30"
                      style={{ 
                        background: 'var(--bg-tertiary)', 
                        border: errors.newContractualStatus ? '1px solid #ef4444' : '1px solid var(--border-color)', 
                        color: 'var(--text-primary)' 
                      }}
                    >
                      <option value="">Select status</option>
                      <option value="Fixed-term">Fixed-term</option>
                      <option value="Permanent">Permanent</option>
                    </select>
                    {errors.newContractualStatus && (
                      <p className="text-xs text-red-500 mt-1">{errors.newContractualStatus}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Takes Effect */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Takes effect on <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.takesEffect}
                  onChange={(e) => handleDateChange('takesEffect', e.target.value)}
                  placeholder="xx/xx/xxxx"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/30"
                  style={{ 
                    background: 'var(--bg-tertiary)', 
                    border: errors.takesEffect ? '1px solid #ef4444' : '1px solid var(--border-color)', 
                    color: 'var(--text-primary)' 
                  }}
                />
                {errors.takesEffect && (
                  <p className="text-xs text-red-500 mt-1">{errors.takesEffect}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{ 
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{ 
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
              >
                Reset
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {statusChange ? 'Save' : 'Change status'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
