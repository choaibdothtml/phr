// Work Certificate Form Component
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { WorkCertificate } from '../utils/storage';
import { workCertificateStorage } from '../utils/workCertificateStorage';
import { Employee } from '../services/api';

interface WorkCertificateFormProps {
  employee: Employee;
  certificate?: WorkCertificate | null;
  onClose: () => void;
  onSave: (certificate: WorkCertificate) => void;
}

export default function WorkCertificateForm({ employee, certificate, onClose, onSave }: WorkCertificateFormProps) {
  const [formData, setFormData] = useState({
    referenceCode: '',
    dateOfIssue: '',
    usedFor: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (certificate) {
      setFormData({
        referenceCode: certificate.referenceCode,
        dateOfIssue: certificate.dateOfIssue,
        usedFor: certificate.usedFor
      });
    }
  }, [certificate]);

  const validateReferenceCode = (value: string): boolean => {
    // Allow Latin letters, numbers, and special characters: é è à ï - / _
    const regex = /^[a-zA-Z0-9éèàï\-\/_\s]*$/;
    return regex.test(value);
  };

  const validateDateOfIssue = (dateStr: string): boolean => {
    if (!dateStr || !employee.joinDate) return false;
    
    // Parse dd/mm/yyyy format
    const [day, month, year] = dateStr.split('/').map(Number);
    const issueDate = new Date(year, month - 1, day);
    
    // Parse entry date (also dd/mm/yyyy)
    const [entryDay, entryMonth, entryYear] = employee.joinDate.split('/').map(Number);
    const entryDate = new Date(entryYear, entryMonth - 1, entryDay);
    
    // Issue date must be later than entry date
    return issueDate > entryDate;
  };

  const handleReferenceCodeChange = (value: string) => {
    if (validateReferenceCode(value)) {
      setFormData(prev => ({ ...prev, referenceCode: value }));
      if (errors.referenceCode) {
        setErrors(prev => ({ ...prev, referenceCode: '' }));
      }
    }
  };

  const handleDateOfIssueChange = (value: string) => {
    setFormData(prev => ({ ...prev, dateOfIssue: value }));
    
    if (value && !validateDateOfIssue(value)) {
      setErrors(prev => ({ ...prev, dateOfIssue: 'Date must be later than entry date' }));
    } else {
      setErrors(prev => ({ ...prev, dateOfIssue: '' }));
    }
  };

  const handleUsedForChange = (value: string) => {
    setFormData(prev => ({ ...prev, usedFor: value }));
    if (errors.usedFor) {
      setErrors(prev => ({ ...prev, usedFor: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.referenceCode.trim()) {
      newErrors.referenceCode = 'Reference code is required';
    }

    if (!formData.dateOfIssue) {
      newErrors.dateOfIssue = 'Date of issue is required';
    } else if (!validateDateOfIssue(formData.dateOfIssue)) {
      newErrors.dateOfIssue = 'Date must be later than entry date';
    }

    if (!formData.usedFor) {
      newErrors.usedFor = 'Please select a purpose';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOk = () => {
    if (!validateForm()) return;

    const workCertificate: WorkCertificate = {
      id: certificate?.id || workCertificateStorage.generateId(),
      employeeNumber: employee.employeeNumber,
      referenceCode: formData.referenceCode,
      dateOfIssue: formData.dateOfIssue,
      usedFor: formData.usedFor as 'Administrative documents' | 'Passport' | 'Bank account'
    };

    setIsClosing(true);
    setTimeout(() => {
      onSave(workCertificate);
    }, 300);
  };

  const handleReset = () => {
    setFormData({
      referenceCode: formData.referenceCode,
      dateOfIssue: '',
      usedFor: ''
    });
    setErrors({});
  };

  const handleCancel = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const isFormComplete = formData.referenceCode.trim() && formData.dateOfIssue && formData.usedFor && Object.keys(errors).length === 0;

  return (
    <AnimatePresence>
      {!isClosing && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={handleCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 flex items-center justify-center p-4 z-[9999] pointer-events-none"
          >
            <div className="glass-card p-6 max-w-2xl w-full pointer-events-auto" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {certificate ? 'Edit Work Certificate' : 'New Work Certificate'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-tertiary)]"
                >
                  <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Reference Code */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    Reference code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.referenceCode}
                    onChange={(e) => handleReferenceCodeChange(e.target.value)}
                    disabled={!!certificate}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ 
                      background: 'var(--bg-tertiary)', 
                      border: errors.referenceCode ? '1px solid #ef4444' : '1px solid var(--border-color)', 
                      color: 'var(--text-primary)' 
                    }}
                    placeholder="Enter reference code"
                  />
                  {errors.referenceCode && (
                    <p className="text-xs text-red-500 mt-1">{errors.referenceCode}</p>
                  )}
                </div>

                {/* Date of Issue */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    Date of issue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.dateOfIssue}
                    onChange={(e) => handleDateOfIssueChange(e.target.value)}
                    disabled={!!certificate}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ 
                      background: 'var(--bg-tertiary)', 
                      border: errors.dateOfIssue ? '1px solid #ef4444' : '1px solid var(--border-color)', 
                      color: 'var(--text-primary)' 
                    }}
                    placeholder="xx/xx/xxxx"
                  />
                  {errors.dateOfIssue && (
                    <p className="text-xs text-red-500 mt-1">{errors.dateOfIssue}</p>
                  )}
                </div>

                {/* Used For */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    Used for <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.usedFor}
                    onChange={(e) => handleUsedForChange(e.target.value)}
                    disabled={!!certificate}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer transition-all focus:ring-2 focus:ring-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ 
                      background: 'var(--bg-tertiary)', 
                      border: errors.usedFor ? '1px solid #ef4444' : '1px solid var(--border-color)', 
                      color: 'var(--text-primary)' 
                    }}
                  >
                    <option value="">Select purpose</option>
                    <option value="Administrative documents">Administrative documents</option>
                    <option value="Passport">Passport</option>
                    <option value="Bank account">Bank account</option>
                  </select>
                  {errors.usedFor && (
                    <p className="text-xs text-red-500 mt-1">{errors.usedFor}</p>
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
                  disabled={!!certificate}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: 'var(--bg-tertiary)', 
                    border: '1px solid var(--border-color)', 
                    color: 'var(--text-secondary)' 
                  }}
                >
                  Reset
                </button>
                <button
                  onClick={handleOk}
                  disabled={!isFormComplete}
                  className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  Ok
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
