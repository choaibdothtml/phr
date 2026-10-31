// @ts-nocheck
import { useState, useEffect } from 'react';
import { Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JobTitlesTab() {
  const [jobTitles, setJobTitles] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newClassification, setNewClassification] = useState('');
  const [editingJob, setEditingJob] = useState(null);
  const [maxClassification, setMaxClassification] = useState(0);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [jobToRemove, setJobToRemove] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('phoenix-hr-job-titles');
    if (stored) setJobTitles(JSON.parse(stored));
    const settings = localStorage.getItem('phoenix-hr-classification-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setMaxClassification(parsed.highestClassification || 0);
    }
  }, []);

  const handleTitleChange = (value) => {
    const filtered = value.replace(/[^a-zA-Z\s]/g, '');
    const capitalized = filtered.charAt(0).toUpperCase() + filtered.slice(1);
    setNewTitle(capitalized);
  };

  const isFormValid = newTitle.trim() !== '' && newClassification !== '';

  const handleSubmit = () => {
    if (!isFormValid) return;
    if (editingJob) {
      const updated = jobTitles.map(job => job.id === editingJob.id ? { ...job, classification: parseInt(newClassification) } : job);
      setJobTitles(updated);
      localStorage.setItem('phoenix-hr-job-titles', JSON.stringify(updated));
      setEditingJob(null);
    } else {
      const newJob = { id: Date.now().toString(), number: jobTitles.length + 1, title: newTitle.trim(), classification: parseInt(newClassification) };
      const updated = [...jobTitles, newJob];
      setJobTitles(updated);
      localStorage.setItem('phoenix-hr-job-titles', JSON.stringify(updated));
    }
    setNewTitle('');
    setNewClassification('');
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setNewTitle(job.title);
    setNewClassification(job.classification.toString());
  };

  const handleCancel = () => {
    setEditingJob(null);
    setNewTitle('');
    setNewClassification('');
  };

  const handleRemove = (job) => {
    setJobToRemove(job);
    setShowRemoveModal(true);
  };

  const confirmRemove = () => {
    if (jobToRemove) {
      const updated = jobTitles.filter(j => j.id !== jobToRemove.id).map((j, idx) => ({ ...j, number: idx + 1 }));
      setJobTitles(updated);
      localStorage.setItem('phoenix-hr-job-titles', JSON.stringify(updated));
      setShowRemoveModal(false);
      setJobToRemove(null);
    }
  };

  const classificationOptions = Array.from({ length: maxClassification }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 h-full">
        <div className="glass-card overflow-hidden h-full">
          {jobTitles.length === 0 ? (<div className="p-12 text-center"><p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No job titles yet. Add your first job title using the form.</p></div>) : (<div className="overflow-x-auto"><table className="w-full"><thead><tr style={{ background: 'var(--bg-tertiary)' }}><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>N°</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Job title</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Classification</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider w-32" style={{ color: 'var(--text-tertiary)' }}>Actions</th></tr></thead><tbody>{jobTitles.map((job) => (<tr key={job.id} className="transition-colors hover:bg-[var(--bg-tertiary)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}><td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{job.number}</td><td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>{job.title}</td><td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{job.classification}</td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button onClick={() => handleEdit(job)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ background: 'rgba(59, 130, 246, 0.1)' }} title="Edit"><Edit2 className="w-4 h-4 text-blue-500" /></button><button onClick={() => handleRemove(job)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ background: 'rgba(239, 68, 68, 0.1)' }} title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button></div></td></tr>))}</tbody></table></div>)}
        </div>
      </div>
      <div className="h-full">
        <div className="glass-card p-6 sticky top-6 h-full">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{editingJob ? 'Edit job title' : 'Add new job title'}</h3>
          <div className="space-y-4">
            <div><label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Job title <span className="text-red-500">*</span></label><input type="text" value={newTitle} onChange={(e) => handleTitleChange(e.target.value)} disabled={editingJob !== null} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} /></div>
            <div><label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Classification <span className="text-red-500">*</span></label><select value={newClassification} onChange={(e) => setNewClassification(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer focus:ring-2 focus:ring-phoenix-500/30" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}><option value="">Select classification</option>{classificationOptions.map(num => (<option key={num} value={num.toString()}>{num}</option>))}</select>{maxClassification === 0 && <p className="text-[10px] mt-1 text-amber-500">Please set the highest classification in "Groups and classifications" tab first</p>}</div>
            <div className="flex gap-2">{editingJob && <button onClick={handleCancel} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Cancel</button>}<button onClick={handleSubmit} disabled={!isFormValid || maxClassification === 0} className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" style={{ background: 'var(--gradient-primary)' }}>{editingJob ? 'Save modifications' : 'Add job title'}</button></div>
          </div>
        </div>
      </div>
      <AnimatePresence>{showRemoveModal && jobToRemove && (<><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }} className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="glass-card p-6 max-w-md w-full" style={{ background: 'var(--bg-card)' }}><div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Confirm removal</h3><button onClick={() => setShowRemoveModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-tertiary)]"><X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /></button></div><p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Are you sure you want to remove the job title <strong>"{jobToRemove.title}"</strong>? This action cannot be undone.</p><div className="flex gap-3"><button onClick={() => setShowRemoveModal(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Cancel</button><button onClick={confirmRemove} className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105" style={{ background: '#ef4444' }}>Remove</button></div></div></motion.div></>)}
      </AnimatePresence>
    </div>
  );
}
