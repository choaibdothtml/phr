// @ts-nocheck
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Contract, contractStorage } from '../utils/storage';
import { Employee } from '../services/api';

interface ContractFormProps {
  employee: Employee;
  contract?: Contract | null;
  onClose: () => void;
  onSave: (contract: Contract) => void;
}

export default function ContractForm({ employee, contract, onClose, onSave }: ContractFormProps) {
  const [formData, setFormData] = useState({
    referenceCode: '', dateOfIssue: '', startDate: '', duration: '', durationUnit: 'days', endDate: '', purposeOfAppointment: '',
  });
  const [errors, setErrors] = useState({});
  const [isClosing, setIsClosing] = useState(false);
  const [showOverlapError, setShowOverlapError] = useState(false);

  useEffect(() => {
    if (contract) {
      setFormData({
        referenceCode: contract.referenceCode, dateOfIssue: contract.dateOfIssue, startDate: contract.startDate,
        duration: contract.duration, durationUnit: contract.durationUnit, endDate: contract.endDate,
        purposeOfAppointment: contract.purposeOfAppointment,
      });
    } else {
      setFormData(prev => ({ ...prev, purposeOfAppointment: employee.appointmentPurpose || '' }));
    }
  }, [contract, employee]);

  useEffect(() => {
    if (formData.startDate && formData.duration && formData.durationUnit) {
      const parts = formData.startDate.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10); const month = parseInt(parts[1], 10) - 1; const year = parseInt(parts[2], 10);
        const dur = parseInt(formData.duration, 10);
        const start = new Date(year, month, day);
        const end = new Date(start);
        switch (formData.durationUnit) {
          case 'days': end.setDate(end.getDate() + dur - 1); break;
          case 'months': end.setMonth(end.getMonth() + dur); end.setDate(end.getDate() - 1); break;
          case 'years': end.setFullYear(end.getFullYear() + dur); end.setDate(end.getDate() - 1); break;
        }
        const endDay = String(end.getDate()).padStart(2, '0'); const endMonth = String(end.getMonth() + 1).padStart(2, '0'); const endYear = end.getFullYear();
        setFormData(prev => ({ ...prev, endDate: `${endDay}/${endMonth}/${endYear}` }));
      }
    }
  }, [formData.startDate, formData.duration, formData.durationUnit]);

  const handleReferenceCodeChange = (value) => {
    const filtered = value.replace(/[^a-zA-Z0-9\s'éèàï\-/_]/g, '');
    setFormData(prev => ({ ...prev, referenceCode: filtered }));
  };

  const handlePurposeChange = (value) => {
    const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    setFormData(prev => ({ ...prev, purposeOfAppointment: capitalized }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.referenceCode.trim()) newErrors.referenceCode = 'Reference code is required';
    if (!formData.dateOfIssue) newErrors.dateOfIssue = 'Date of issue is required';
    else {
      const parts = formData.dateOfIssue.split('/');
      if (parts.length !== 3) newErrors.dateOfIssue = 'Invalid date format';
    }
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    else {
      const parts = formData.startDate.split('/');
      if (parts.length !== 3) newErrors.startDate = 'Invalid date format';
      else {
        if (contract?.isFirstContract) {
          if (formData.startDate !== employee.joinDate) newErrors.startDate = 'First contract start date must match entry date';
        } else {
          const latestEndDate = contractStorage.getLatestEndDate(employee.employeeNumber);
          if (latestEndDate && formData.startDate <= latestEndDate) newErrors.startDate = 'Start date must be after the latest contract end date';
        }
      }
    }
    if (!formData.duration) newErrors.duration = 'Duration is required';
    else {
      const dur = parseInt(formData.duration, 10);
      if (isNaN(dur) || dur < 1 || dur > 99) newErrors.duration = 'Duration must be between 1 and 99';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) return;
    if (!contract && contractStorage.hasOverlap(employee.employeeNumber, formData.startDate, formData.endDate, contract?.id)) {
      setShowOverlapError(true);
      return;
    }
    const newContract = {
      id: contract?.id || Date.now().toString(), employeeNumber: employee.employeeNumber, referenceCode: formData.referenceCode,
      dateOfIssue: formData.dateOfIssue, startDate: formData.startDate, duration: formData.duration,
      durationUnit: formData.durationUnit, endDate: formData.endDate, purposeOfAppointment: formData.purposeOfAppointment,
      isExpired: contractStorage.isContractExpired(formData.endDate), isFirstContract: contract?.isFirstContract || contractStorage.getContracts(employee.employeeNumber).length === 0,
    };
    setIsClosing(true);
    setTimeout(() => { onSave(newContract); }, 300);
  };

  const handleReset = () => {
    setFormData({ referenceCode: formData.referenceCode, dateOfIssue: '', startDate: '', duration: '', durationUnit: 'days', endDate: '', purposeOfAppointment: employee.appointmentPurpose || '' });
    setErrors({});
  };

  const handleCancel = () => {
    setIsClosing(true);
    setTimeout(() => { onClose(); }, 300);
  };

  return createPortal(
    <AnimatePresence>
      {!isClosing && (<><motion.div key="contract-form-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-[9998] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}><motion.div key="contract-form-modal" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ duration: 0.3, ease: "easeOut" }} className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-popup)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{contract ? 'Edit contract' : 'Add new contract'}</h3><button onClick={handleCancel} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-colors"><X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /></button></div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Reference code <span className="text-red-500">*</span></label><input type="text" value={formData.referenceCode} onChange={(e) => handleReferenceCodeChange(e.target.value)} disabled={!!contract} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: 'var(--bg-tertiary)', border: errors.referenceCode ? '1px solid #ef4444' : '1px solid var(--border-color)', color: 'var(--text-primary)' }} />{errors.referenceCode && <p className="text-xs text-red-500 mt-1">{errors.referenceCode}</p>}</div>
            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Date of issue <span className="text-red-500">*</span></label><input type="text" value={formData.dateOfIssue} onChange={(e) => setFormData(prev => ({ ...prev, dateOfIssue: e.target.value }))} placeholder="xx/xx/xxxx" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/30" style={{ background: 'var(--bg-tertiary)', border: errors.dateOfIssue ? '1px solid #ef4444' : '1px solid var(--border-color)', color: 'var(--text-primary)' }} />{errors.dateOfIssue && <p className="text-xs text-red-500 mt-1">{errors.dateOfIssue}</p>}</div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Contract start day <span className="text-red-500">*</span></label><input type="text" value={formData.startDate} onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))} placeholder="xx/xx/xxxx" disabled={contract?.isFirstContract} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: 'var(--bg-tertiary)', border: errors.startDate ? '1px solid #ef4444' : '1px solid var(--border-color)', color: 'var(--text-primary)' }} />{errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}</div>
            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Contract duration <span className="text-red-500">*</span></label><input type="number" min="1" max="99" value={formData.duration} onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/30" style={{ background: 'var(--bg-tertiary)', border: errors.duration ? '1px solid #ef4444' : '1px solid var(--border-color)', color: 'var(--text-primary)' }} />{errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration}</p>}</div>
            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Unit</label><select value={formData.durationUnit} onChange={(e) => setFormData(prev => ({ ...prev, durationUnit: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer transition-all focus:ring-2 focus:ring-orange-500/30" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}><option value="days">Days</option><option value="months">Months</option><option value="years">Years</option></select></div>
            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Contract end date</label><input type="text" value={formData.endDate} readOnly className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-not-allowed opacity-60" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Purpose of the appointment</label><textarea value={formData.purposeOfAppointment} onChange={(e) => handlePurposeChange(e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/30 resize-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} /></div>
        </div>
        <div className="flex gap-3 mt-6"><button onClick={handleCancel} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Cancel</button><button onClick={handleReset} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Reset</button><button onClick={handleAdd} className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg" style={{ background: 'var(--gradient-primary)' }}>{contract ? 'Save' : 'Add'}</button></div>
      </motion.div></motion.div><motion.div key="contract-form-overlay-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-[9997]" style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }} /></>)}</AnimatePresence>,
    document.body
  );
}
