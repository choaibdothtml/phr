// Termination Certificate Form Component
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TerminationCertificate } from '../utils/terminationCertificateStorage';
import { Employee } from '../services/api';
import { EmploymentStatusChange, employmentStatusStorage } from '../utils/storage';

interface TerminationCertificateFormProps {
  employee: Employee;
  certificate?: TerminationCertificate | null;
  onClose: () => void;
  onSave: (certificate: TerminationCertificate) => void;
}

interface JobHistory {
  jobTitle: string;
  startDate: string;
  endDate: string;
}

export default function TerminationCertificateForm({ employee, certificate, onClose, onSave }: TerminationCertificateFormProps) {
  const [formData, setFormData] = useState({
    referenceCode: '',
    dateOfIssue: '',
    includeAllJobs: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isClosing, setIsClosing] = useState(false);
  const [jobHistory, setJobHistory] = useState<JobHistory[]>([]);

  useEffect(() => {
    if (certificate) {
      setFormData({
        referenceCode: certificate.referenceCode,
        dateOfIssue: certificate.dateOfIssue,
        includeAllJobs: certificate.includeAllJobs
      });
    } else {
      setFormData({
        referenceCode: '',
        dateOfIssue: '',
        includeAllJobs: false
      });
    }
  }, [certificate]);

  useEffect(() => {
    // Build job history from employment status changes
    const statusChanges = employmentStatusStorage.getStatusChanges(employee.employeeNumber);
    
    if (statusChanges.length === 0) {
      // If no status changes, just show the original job
      setJobHistory([{
        jobTitle: employee.position,
        startDate: employee.joinDate,
        endDate: employee.dateOfLeavingWork || ''
      }]);
    } else {
      // Build history from status changes
      const history: JobHistory[] = [];
      
      // First job (from entry date to first status change)
      const firstChange = statusChanges[0];
      history.push({
        jobTitle: firstChange.currentJob,
        startDate: employee.joinDate,
        endDate: calculateEndDate(firstChange.dateOfIssue, firstChange.takesEffect)
      });
      
      // Middle jobs
      for (let i = 0; i < statusChanges.length; i++) {
        const change = statusChanges[i];
        const nextChange = statusChanges[i + 1];
        
        history.push({
          jobTitle: change.newJob,
          startDate: change.takesEffect,
          endDate: nextChange ? calculateEndDate(nextChange.dateOfIssue, nextChange.takesEffect) : (employee.dateOfLeavingWork || '')
        });
      }
      
      setJobHistory(history);
    }
  }, [employee]);

  const calculateEndDate = (issueDate: string, takesEffect: string): string => {
    // End date is the day before takesEffect
    const [day, month, year] = takesEffect.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() - 1);
    
    const endDay = String(date.getDate()).padStart(2, '0');
    const endMonth = String(date.getMonth() + 1).padStart(2, '0');
    const endYear = date.getFullYear();
    
    return `${endDay}/${endMonth}/${endYear}`;
  };

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

  const handleIncludeAllJobsChange = (value: boolean) => {
    setFormData(prev => ({ ...prev, includeAllJobs: value }));
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOk = () => {
    if (!validateForm()) return;

    const newCertificate: TerminationCertificate = {
      id: certificate?.id || `tc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      employeeNumber: employee.employeeNumber,
      referenceCode: formData.referenceCode,
      dateOfIssue: formData.dateOfIssue,
      includeAllJobs: formData.includeAllJobs
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
      includeAllJobs: false
    });
    setErrors({});
  };

  const handleCancel = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <AnimatePresence>
      {!isClosing && (
        <>
          <motion.div
            key="termination-cert-form-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
          >
            <motion.div
              key="termination-cert-form-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="glass-card p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              style={{ background: 'var(--bg-popup)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {certificate ? 'Edit termination certificate' : 'New termination certificate'}
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
                      placeholder="Enter reference code"
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
                </div>

                {/* Employment Period */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    Was employed from
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={employee.joinDate}
                      readOnly
                      className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none cursor-not-allowed opacity-60"
                      style={{ 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-color)', 
                        color: 'var(--text-primary)' 
                      }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>to</span>
                    <input
                      type="text"
                      value={employee.dateOfLeavingWork || ''}
                      readOnly
                      className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none cursor-not-allowed opacity-60"
                      style={{ 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-color)', 
                        color: 'var(--text-primary)' 
                      }}
                    />
                  </div>
                </div>

                {/* Job History Table */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    Job history
                  </label>
                  <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: 'var(--bg-tertiary)' }}>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                            Job title
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                            Start date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                            End date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobHistory.map((job, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td className="px-4 py-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                              {job.jobTitle}
                            </td>
                            <td className="px-4 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {job.startDate}
                            </td>
                            <td className="px-4 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {job.endDate || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Include Options */}
                <div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="includeJobs"
                        checked={!formData.includeAllJobs}
                        onChange={() => handleIncludeAllJobsChange(false)}
                        disabled={!!certificate}
                        className="w-4 h-4"
                        style={{ accentColor: 'var(--phoenix-500)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        Include only the latest job title in the certificate
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="includeJobs"
                        checked={formData.includeAllJobs}
                        onChange={() => handleIncludeAllJobsChange(true)}
                        disabled={!!certificate}
                        className="w-4 h-4"
                        style={{ accentColor: 'var(--phoenix-500)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        Include all job titles in the certificate
                      </span>
                    </label>
                  </div>
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
                  disabled={!!certificate}
                  className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  Ok
                </button>
              </div>
            </motion.div>
          </motion.div>
          <motion.div
            key="termination-cert-form-overlay-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9997]"
            style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
