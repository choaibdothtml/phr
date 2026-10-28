import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkCertificate, workCertificateStorage } from '../utils/workCertificateStorage';

export interface Employee {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  joinDate: string;
  status: 'active' | 'terminated' | 'on-leave';
}

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
    usedFor: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (certificate) {
      setFormData({
        referenceCode: certificate.referenceCode,
        dateOfIssue: certificate.dateOfIssue,
        usedFor: certificate.usedFor,
      });
    }
  }, [certificate]);

  const handleReferenceCodeChange = (value: string) => {
    // Allow only Latin letters, numbers, and special characters: é è à ï - / _
    const filtered = value.replace(/[^a-zA-Z0-9\s'éèàï\-/_]/g, '');
    setFormData(prev => ({ ...prev, referenceCode: filtered }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.referenceCode.trim()) {
      newErrors.referenceCode = 'Reference code is required';
    }

    if (!formData.dateOfIssue) {
      newErrors.dateOfIssue = 'Date of issue is required';
    } else if (!workCertificateStorage.isDateAfterEntryDate(formData.dateOfIssue, employee.joinDate)) {
      newErrors.dateOfIssue = 'Date must be after entry date';
    }

    if (!formData.usedFor) {
      newErrors.usedFor = 'Used for is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOk = () => {
    if (!validateForm()) return;

    const newCertificate: WorkCertificate = {
      id: certificate?.id || Date.now().toString(),
      employeeNumber: employee.employeeNumber,
      referenceCode: formData.referenceCode,
      dateOfIssue: formData.dateOfIssue,
      usedFor: formData.usedFor as 'Administrative documents' | 'Passport' | 'Bank account',
    };

    setIsClosing(true);
    setTimeout(() => {
      onSave(newCertificate);
    }, 300);
  };

  const handleReset = () => {
    setFormData({
      referenceCode: formData.referenceCode,
      dateOfIssue: '',
      usedFor: '',
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
          key="work-certificate-form-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
        >
          <motion.div
            key="work-certificate-form-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="glass-card p-6 max-w-2xl w-full"
            style={{ background: 'var(--bg-popup)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {certificate ? 'Edit work certificate' : 'Add work certificate'}
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
                    disabled={!!certificate}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfIssue: e.target.value }))}
                    placeholder="xx/xx/xxxx"
                    disabled={!!certificate}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
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

              {/* Used For */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Used for <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.usedFor}
                  onChange={(e) => setFormData(prev => ({ ...prev, usedFor: e.target.value }))}
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
                onClick={handleOk}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg"
                style={{ background: 'var(--gradient-primary)' }}
              >
                Ok
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
