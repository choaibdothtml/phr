// @ts-nocheck
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { OnboardingReport, onboardingReportStorage } from '../utils/storage';
import { Employee } from '../services/api';

interface OnboardingReportFormProps {
  employee: Employee;
  report?: OnboardingReport | null;
  onClose: () => void;
  onSave: (report: OnboardingReport) => void;
}

export default function OnboardingReportForm({ employee, report, onClose, onSave }: OnboardingReportFormProps) {
  const [formData, setFormData] = useState({ referenceCode: '' });
  const [errors, setErrors] = useState({});
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (report) setFormData({ referenceCode: report.referenceCode });
  }, [report]);

  const getEntryDate = () => {
    const contracts = JSON.parse(localStorage.getItem('phoenix-hr-contracts') || '{}');
    const employeeContracts = contracts[employee.employeeNumber] || [];
    if (employeeContracts.length === 0) return '';
    const sortedContracts = [...employeeContracts].sort((a, b) => new Date(a.startDate.split('/').reverse().join('-')).getTime() - new Date(b.startDate.split('/').reverse().join('-')).getTime());
    return sortedContracts[0].startDate;
  };

  const entryDate = getEntryDate();
  const dateInLetters = onboardingReportStorage.dateToLetters(entryDate);

  const handleReferenceCodeChange = (value) => {
    const filtered = value.replace(/[^a-zA-Z0-9\s'éèàï\-/_]/g, '');
    setFormData({ referenceCode: filtered });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.referenceCode.trim()) newErrors.referenceCode = 'Reference code is required';
    else if (!/^[a-zA-Z0-9\s'éèàï\-/_]+$/.test(formData.referenceCode)) newErrors.referenceCode = 'Invalid characters in reference code';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) return;
    const newReport = {
      id: report?.id || Date.now().toString(), employeeNumber: employee.employeeNumber, referenceCode: formData.referenceCode,
      entryDate: entryDate, dateInLetters: dateInLetters,
    };
    setIsClosing(true);
    setTimeout(() => { onSave(newReport); }, 300);
  };

  const handleCancel = () => {
    setIsClosing(true);
    setTimeout(() => { onClose(); }, 300);
  };

  return createPortal(
    <AnimatePresence>
      {!isClosing && (<><motion.div key="onboarding-form-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-[9998] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}><motion.div key="onboarding-form-modal" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ duration: 0.3, ease: "easeOut" }} className="glass-card p-6 max-w-2xl w-full" style={{ background: 'var(--bg-popup)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{report ? 'Edit onboarding report' : 'Add onboarding report'}</h3><button onClick={handleCancel} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-colors"><X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /></button></div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Reference code <span className="text-red-500">*</span></label><input type="text" value={formData.referenceCode} onChange={(e) => handleReferenceCodeChange(e.target.value)} disabled={!!report} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: 'var(--bg-tertiary)', border: errors.referenceCode ? '1px solid #ef4444' : '1px solid var(--border-color)', color: 'var(--text-primary)' }} />{errors.referenceCode && <p className="text-xs text-red-500 mt-1">{errors.referenceCode}</p>}</div>
            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Entry date</label><input type="text" value={entryDate} readOnly className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-not-allowed opacity-60" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Entry date in letters</label><input type="text" value={dateInLetters} readOnly className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-not-allowed opacity-60" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} /></div>
        </div>
        <div className="flex gap-3 mt-6"><button onClick={handleCancel} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Cancel</button><button onClick={handleAdd} className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg" style={{ background: 'var(--gradient-primary)' }}>{report ? 'Save' : 'Add'}</button></div>
      </motion.div></motion.div><motion.div key="onboarding-form-overlay-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-[9997]" style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }} /></>)}</AnimatePresence>,
    document.body
  );
}
