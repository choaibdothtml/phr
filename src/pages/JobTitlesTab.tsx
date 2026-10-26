import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export default function JobTitlesTab() {
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('phoenix-hr-job-titles');
    if (stored) {
      setJobTitles(JSON.parse(stored));
    }
  }, []);

  const saveToStorage = (titles: string[]) => {
    localStorage.setItem('phoenix-hr-job-titles', JSON.stringify(titles));
    setJobTitles(titles);
  };

  const handleAdd = () => {
    if (newTitle.trim() && !jobTitles.includes(newTitle.trim())) {
      saveToStorage([...jobTitles, newTitle.trim()]);
      setNewTitle('');
    }
  };

  const handleRemove = (index: number) => {
    const updated = jobTitles.filter((_, i) => i !== index);
    saveToStorage(updated);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(jobTitles[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const updated = [...jobTitles];
      updated[editingIndex] = editValue.trim();
      saveToStorage(updated);
      setEditingIndex(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  return (
    <div className="space-y-6">
      {/* Add new job title */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Add Job Title
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Enter job title..."
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/30"
            style={{ 
              background: 'var(--bg-tertiary)', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-primary)' 
            }}
          />
          <button
            onClick={handleAdd}
            disabled={!newTitle.trim()}
            className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add
          </button>
        </div>
      </div>

      {/* Job titles list */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Job Titles ({jobTitles.length})
        </h3>
        {jobTitles.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
            No job titles added yet. Add your first job title above.
          </p>
        ) : (
          <div className="space-y-2">
            {jobTitles.map((title, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl transition-all hover:bg-[var(--bg-tertiary)]"
                style={{ 
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {editingIndex === index ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                      className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
                      style={{ 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-color)', 
                        color: 'var(--text-primary)' 
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="p-2 rounded-lg transition-all hover:scale-110"
                      style={{ background: 'rgba(16, 185, 129, 0.1)' }}
                    >
                      <Check className="w-4 h-4 text-emerald-500" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 rounded-lg transition-all hover:scale-110"
                      style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {title}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(index)}
                        className="p-2 rounded-lg transition-all hover:scale-110"
                        style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleRemove(index)}
                        className="p-2 rounded-lg transition-all hover:scale-110"
                        style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
