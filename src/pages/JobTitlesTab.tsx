import { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';

interface JobTitle {
  id: string;
  number: number;
  title: string;
  classification: number;
}

export default function JobTitlesTab() {
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newClassification, setNewClassification] = useState('');
  const [editingJob, setEditingJob] = useState<JobTitle | null>(null);
  const [maxClassification, setMaxClassification] = useState(0);

  useEffect(() => {
    // Load job titles from localStorage
    const stored = localStorage.getItem('phoenix-hr-job-titles');
    if (stored) {
      setJobTitles(JSON.parse(stored));
    }

    // Load max classification from settings
    const settings = localStorage.getItem('phoenix-hr-classification-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setMaxClassification(parsed.highestClassification || 0);
    }
  }, []);

  // Validate job title (Latin letters only)
  const handleTitleChange = (value: string) => {
    const filtered = value.replace(/[^a-zA-Z\s]/g, '');
    setNewTitle(filtered);
  };

  // Check if form is valid
  const isFormValid = newTitle.trim() !== '' && newClassification !== '';

  // Add or update job title
  const handleSubmit = () => {
    if (!isFormValid) return;

    if (editingJob) {
      // Update classification only
      const updated = jobTitles.map(job =>
        job.id === editingJob.id
          ? { ...job, classification: parseInt(newClassification) }
          : job
      );
      setJobTitles(updated);
      localStorage.setItem('phoenix-hr-job-titles', JSON.stringify(updated));
      setEditingJob(null);
    } else {
      // Add new job title
      const newJob: JobTitle = {
        id: Date.now().toString(),
        number: jobTitles.length + 1,
        title: newTitle.trim(),
        classification: parseInt(newClassification),
      };
      const updated = [...jobTitles, newJob];
      setJobTitles(updated);
      localStorage.setItem('phoenix-hr-job-titles', JSON.stringify(updated));
    }

    // Reset form
    setNewTitle('');
    setNewClassification('');
  };

  // Edit job title
  const handleEdit = (job: JobTitle) => {
    setEditingJob(job);
    setNewTitle(job.title);
    setNewClassification(job.classification.toString());
  };

  // Cancel edit
  const handleCancel = () => {
    setEditingJob(null);
    setNewTitle('');
    setNewClassification('');
  };

  // Generate classification options
  const classificationOptions = Array.from(
    { length: maxClassification },
    (_, i) => i + 1
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Job Titles List - Left Side */}
      <div className="lg:col-span-2 h-full">
        <div className="glass-card overflow-hidden h-full">
          {jobTitles.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                No job titles yet. Add your first job title using the form.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)' }}>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      N°
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      Job Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      Classification
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobTitles.map((job) => (
                    <tr
                      key={job.id}
                      className="transition-colors hover:bg-[var(--bg-tertiary)]"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {job.number}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                        {job.title}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {job.classification}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEdit(job)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Form - Right Side */}
      <div className="h-full">
        <div className="glass-card p-6 sticky top-6 h-full">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {editingJob ? 'Edit Job Title' : 'Add New Job Title'}
          </h3>

          <div className="space-y-4">
            {/* Job Title */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                disabled={editingJob !== null}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Classification */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Classification <span className="text-red-500">*</span>
              </label>
              <select
                value={newClassification}
                onChange={(e) => setNewClassification(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer focus:ring-2 focus:ring-phoenix-500/30"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="">Select classification</option>
                {classificationOptions.map(num => (
                  <option key={num} value={num.toString()}>
                    {num}
                  </option>
                ))}
              </select>
              {maxClassification === 0 && (
                <p className="text-[10px] mt-1 text-amber-500">
                  Please set the highest classification in "Groups and classifications" tab first
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {editingJob && (
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={{
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || maxClassification === 0}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {editingJob ? 'Save Modifications' : 'Add Job Title'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
