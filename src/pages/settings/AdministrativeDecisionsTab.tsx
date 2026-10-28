// @ts-nocheck
import { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';

export default function AdministrativeDecisionsTab() {
  const [decisions, setDecisions] = useState([]);
  const [newDecisionName, setNewDecisionName] = useState('');
  const [allowDiscontinuance, setAllowDiscontinuance] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('phoenix-hr-administrative-decisions');
    if (stored) {
      setDecisions(JSON.parse(stored));
    } else {
      const defaultDecisions = [
        { id: '1', name: 'Exit clearance form', discontinuanceDecision: false, isDefault: true },
        { id: '2', name: 'Rehire decision', discontinuanceDecision: false, isDefault: true },
        { id: '3', name: 'Probationary period: Successful', discontinuanceDecision: false, isDefault: true },
        { id: '4', name: 'Probationary period: Unsuccessful', discontinuanceDecision: false, isDefault: true },
        { id: '5', name: 'Probationary period evaluation form', discontinuanceDecision: false, isDefault: true },
      ];
      setDecisions(defaultDecisions);
      localStorage.setItem('phoenix-hr-administrative-decisions', JSON.stringify(defaultDecisions));
    }
  }, []);

  const handleNameChange = (value) => {
    const filtered = value.replace(/[^a-zA-Z0-9\s'éèàï-]/g, '');
    setNewDecisionName(filtered);
  };

  const isFormValid = newDecisionName.trim() !== '';

  const handleAddDecision = () => {
    if (!isFormValid) return;
    if (editingId) {
      const updated = decisions.map(d => d.id === editingId ? { ...d, name: newDecisionName, discontinuanceDecision: allowDiscontinuance } : d);
      setDecisions(updated);
      localStorage.setItem('phoenix-hr-administrative-decisions', JSON.stringify(updated));
      setEditingId(null);
    } else {
      const newDecision = { id: Date.now().toString(), name: newDecisionName, discontinuanceDecision: allowDiscontinuance, isDefault: false };
      const updated = [...decisions, newDecision];
      setDecisions(updated);
      localStorage.setItem('phoenix-hr-administrative-decisions', JSON.stringify(updated));
    }
    setNewDecisionName('');
    setAllowDiscontinuance(false);
  };

  const handleEdit = (decision) => {
    setEditingId(decision.id);
    setNewDecisionName(decision.name);
    setAllowDiscontinuance(decision.discontinuanceDecision);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewDecisionName('');
    setAllowDiscontinuance(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 h-full">
        <div className="glass-card overflow-hidden h-full">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Administrative decision label</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Discontinuance decision</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Edit</th>
                </tr>
              </thead>
              <tbody>
                {decisions.map((decision) => (
                  <tr key={decision.id} className="transition-colors hover:bg-[var(--bg-tertiary)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>{decision.name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{decision.discontinuanceDecision ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleEdit(decision)} disabled={decision.isDefault} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100" style={{ background: 'rgba(59, 130, 246, 0.1)' }} title={decision.isDefault ? 'This decision cannot be edited' : 'Edit'}>
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="h-full">
        <div className="glass-card p-6 sticky top-6 h-full">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{editingId ? 'Edit decision' : 'Add new decision'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>New administrative decision <span className="text-red-500">*</span></label>
              <input type="text" value={newDecisionName} onChange={(e) => handleNameChange(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" id="allowDiscontinuance" checked={allowDiscontinuance} onChange={(e) => setAllowDiscontinuance(e.target.checked)} className="mt-1 w-4 h-4 rounded" style={{ accentColor: 'var(--phoenix-500)' }} />
              <label htmlFor="allowDiscontinuance" className="text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>User will be able to issue a discontinuance decision later for this decision</label>
            </div>
            <div className="flex gap-2">
              {editingId && <button onClick={handleCancelEdit} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Cancel</button>}
              <button onClick={handleAddDecision} disabled={!isFormValid} className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" style={{ background: 'var(--gradient-primary)' }}>{editingId ? 'Save modifications' : 'Add new decision'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
