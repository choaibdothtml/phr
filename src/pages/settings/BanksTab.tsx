// @ts-nocheck
import { useState, useEffect } from 'react';
import { Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BanksTab() {
  const [bankName, setBankName] = useState('');
  const [banks, setBanks] = useState([]);
  const [editingBank, setEditingBank] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [bankToRemove, setBankToRemove] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('phoenix-hr-banks');
    if (stored) setBanks(JSON.parse(stored));
  }, []);

  const handleBankNameChange = (value) => {
    const filtered = value.replace(/[^a-zA-Z\s]/g, '');
    const capitalized = filtered.replace(/\b\w/g, l => l.toUpperCase());
    setBankName(capitalized);
  };

  const isFormValid = bankName.trim() !== '';

  const handleSubmit = () => {
    if (!isFormValid) return;
    if (editingBank) {
      const updated = banks.map(b => b.id === editingBank.id ? { ...b, name: bankName } : b);
      setBanks(updated);
      localStorage.setItem('phoenix-hr-banks', JSON.stringify(updated));
      setEditingBank(null);
    } else {
      const newBank = { id: Date.now().toString(), number: banks.length + 1, name: bankName };
      const updated = [...banks, newBank];
      setBanks(updated);
      localStorage.setItem('phoenix-hr-banks', JSON.stringify(updated));
    }
    setBankName('');
  };

  const handleEdit = (bank) => {
    setEditingBank(bank);
    setBankName(bank.name);
  };

  const handleCancel = () => {
    setEditingBank(null);
    setBankName('');
  };

  const handleRemove = (bank) => {
    setBankToRemove(bank);
    setShowRemoveModal(true);
  };

  const confirmRemove = () => {
    if (bankToRemove) {
      const updated = banks.filter(b => b.id !== bankToRemove.id).map((b, idx) => ({ ...b, number: idx + 1 }));
      setBanks(updated);
      localStorage.setItem('phoenix-hr-banks', JSON.stringify(updated));
      setShowRemoveModal(false);
      setBankToRemove(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 h-full">
        <div className="glass-card overflow-hidden h-full">
          {banks.length === 0 ? (<div className="p-12 text-center"><p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No banks yet. Add your first bank using the form.</p></div>) : (<div className="overflow-x-auto"><table className="w-full"><thead><tr style={{ background: 'var(--bg-tertiary)' }}><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>N°</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Bank name</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider w-32" style={{ color: 'var(--text-tertiary)' }}>Actions</th></tr></thead><tbody>{banks.map((bank) => (<tr key={bank.id} className="transition-colors hover:bg-[var(--bg-tertiary)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}><td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{bank.number}</td><td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>{bank.name}</td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button onClick={() => handleEdit(bank)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ background: 'rgba(59, 130, 246, 0.1)' }} title="Edit"><Edit2 className="w-4 h-4 text-blue-500" /></button><button onClick={() => handleRemove(bank)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ background: 'rgba(239, 68, 68, 0.1)' }} title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button></div></td></tr>))}</tbody></table></div>)}
        </div>
      </div>
      <div className="h-full">
        <div className="glass-card p-6 sticky top-6 h-full">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{editingBank ? 'Edit bank' : 'Add new bank'}</h3>
          <div className="space-y-4">
            <div><label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Bank's name <span className="text-red-500">*</span></label><input type="text" value={bankName} onChange={(e) => handleBankNameChange(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} /></div>
            <div className="flex gap-2">{editingBank && <button onClick={handleCancel} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Cancel</button>}<button onClick={handleSubmit} disabled={!isFormValid} className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" style={{ background: 'var(--gradient-primary)' }}>{editingBank ? 'Save modifications' : 'Add bank'}</button></div>
          </div>
        </div>
      </div>
      <AnimatePresence>{showRemoveModal && bankToRemove && (<><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }} className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="glass-card p-6 max-w-md w-full" style={{ background: 'var(--bg-card)' }}><div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Confirm removal</h3><button onClick={() => setShowRemoveModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-tertiary)]"><X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /></button></div><p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Are you sure you want to remove the bank <strong>"{bankToRemove.name}"</strong>? This action cannot be undone.</p><div className="flex gap-3"><button onClick={() => setShowRemoveModal(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Cancel</button><button onClick={confirmRemove} className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105" style={{ background: '#ef4444' }}>Remove</button></div></div></motion.div></>)}
      </AnimatePresence>
    </div>
  );
}
