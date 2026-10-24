import { useState, useEffect } from 'react';
import { Edit2, Trash2, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Group {
  id: string;
  number: number;
  name: string;
  lowestClassification: number;
  highestClassification: number;
}

export default function GroupsClassificationsTab() {
  // Classification settings
  const [highestClassification, setHighestClassification] = useState('');
  const [lowestDegree, setLowestDegree] = useState('');
  const [highestDegree, setHighestDegree] = useState('');
  const [degreeError, setDegreeError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Group form
  const [groupName, setGroupName] = useState('');
  const [groupLowestClass, setGroupLowestClass] = useState('');
  const [groupHighestClass, setGroupHighestClass] = useState('');
  const [groupError, setGroupError] = useState('');

  // Groups list
  const [groups, setGroups] = useState<Group[]>([]);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [groupToRemove, setGroupToRemove] = useState<Group | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('phoenix-hr-classification-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setHighestClassification(settings.highestClassification || '');
      setLowestDegree(settings.lowestDegree || '');
      setHighestDegree(settings.highestDegree || '');
    }

    const savedGroups = localStorage.getItem('phoenix-hr-groups-custom');
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    }
  }, []);

  // Validate degrees
  useEffect(() => {
    const lowest = parseInt(lowestDegree);
    const highest = parseInt(highestDegree);

    if (lowestDegree && highestDegree) {
      if (lowest >= highest) {
        setDegreeError('Lowest and highest degree cannot be equal. Highest must be greater than lowest.');
      } else {
        setDegreeError('');
      }
    } else {
      setDegreeError('');
    }
  }, [lowestDegree, highestDegree]);

  // Calculate next available classification for new group
  const getNextAvailableClassification = () => {
    if (groups.length === 0) return 0;
    const maxClassification = Math.max(...groups.map(g => g.highestClassification));
    return maxClassification + 1;
  };

  // Save classification settings
  const handleSaveSettings = () => {
    if (degreeError) return;

    const settings = {
      highestClassification: parseInt(highestClassification),
      lowestDegree: parseInt(lowestDegree),
      highestDegree: parseInt(highestDegree),
    };

    localStorage.setItem('phoenix-hr-classification-settings', JSON.stringify(settings));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Validate group name (Latin letters and numbers only)
  const handleGroupNameChange = (value: string) => {
    const filtered = value.replace(/[^a-zA-Z0-9\s]/g, '');
    setGroupName(filtered);
  };

  // Validate group classifications
  const validateGroupClassifications = () => {
    const lowest = parseInt(groupLowestClass);
    const highest = parseInt(groupHighestClass);
    const maxAllowed = parseInt(highestClassification);

    if (!groupLowestClass || !groupHighestClass) {
      return 'Please fill in both classification fields';
    }

    if (lowest > highest) {
      return 'Highest classification cannot be less than lowest classification';
    }

    if (highest > maxAllowed) {
      return `Classification cannot exceed ${maxAllowed}. Please update the highest classification setting above.`;
    }

    // Check if classifications overlap with existing groups
    const overlappingGroup = groups.find(g => {
      if (editingGroup && g.id === editingGroup.id) return false;
      return (lowest >= g.lowestClassification && lowest <= g.highestClassification) ||
             (highest >= g.lowestClassification && highest <= g.highestClassification) ||
             (lowest <= g.lowestClassification && highest >= g.highestClassification);
    });

    if (overlappingGroup) {
      return `Classification range overlaps with group "${overlappingGroup.name}"`;
    }

    return '';
  };

  // Add or update group
  const handleAddGroup = () => {
    const error = validateGroupClassifications();
    if (error) {
      setGroupError(error);
      return;
    }

    setGroupError('');

    if (editingGroup) {
      // Update existing group
      const updated = groups.map(g =>
        g.id === editingGroup.id
          ? {
              ...g,
              name: groupName,
              lowestClassification: parseInt(groupLowestClass),
              highestClassification: parseInt(groupHighestClass),
            }
          : g
      );
      setGroups(updated);
      localStorage.setItem('phoenix-hr-groups-custom', JSON.stringify(updated));
      setEditingGroup(null);
    } else {
      // Add new group
      const newGroup: Group = {
        id: Date.now().toString(),
        number: groups.length + 1,
        name: groupName,
        lowestClassification: parseInt(groupLowestClass),
        highestClassification: parseInt(groupHighestClass),
      };
      const updated = [...groups, newGroup].sort((a, b) => a.lowestClassification - b.lowestClassification);
      // Renumber after sorting
      const renumbered = updated.map((g, idx) => ({ ...g, number: idx + 1 }));
      setGroups(renumbered);
      localStorage.setItem('phoenix-hr-groups-custom', JSON.stringify(renumbered));
    }

    // Reset form
    setGroupName('');
    setGroupLowestClass('');
    setGroupHighestClass('');
  };

  // Edit group
  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupLowestClass(group.lowestClassification.toString());
    setGroupHighestClass(group.highestClassification.toString());
  };

  // Remove group
  const handleRemove = (group: Group) => {
    setGroupToRemove(group);
    setShowRemoveModal(true);
  };

  // Confirm remove
  const confirmRemove = () => {
    if (groupToRemove) {
      const updated = groups
        .filter(g => g.id !== groupToRemove.id)
        .sort((a, b) => a.lowestClassification - b.lowestClassification);
      // Renumber after removing
      const renumbered = updated.map((g, idx) => ({ ...g, number: idx + 1 }));
      setGroups(renumbered);
      localStorage.setItem('phoenix-hr-groups-custom', JSON.stringify(renumbered));
      setShowRemoveModal(false);
      setGroupToRemove(null);
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setEditingGroup(null);
    setGroupName('');
    setGroupLowestClass('');
    setGroupHighestClass('');
    setGroupError('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Groups List - Left Side */}
      <div className="lg:col-span-2 h-full">
        <div className="glass-card overflow-hidden h-full">
          {groups.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                No groups yet. Add your first group using the form.
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
                      Group Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      Lowest Classification
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      Highest Classification
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr
                      key={group.id}
                      className="transition-colors hover:bg-[var(--bg-tertiary)]"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {group.number}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                        {group.name}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {group.lowestClassification}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {group.highestClassification}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(group)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleRemove(group)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Form - Right Side */}
      <div className="h-full">
        <div className="glass-card p-6 sticky top-6 h-full overflow-y-auto">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Classification Settings
          </h3>

          <div className="space-y-4">
            {/* Highest Classification */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                What is the highest classification do you have in your company? <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={highestClassification}
                onChange={(e) => setHighestClassification(e.target.value)}
                placeholder="1-99"
                className="w-32 px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Lowest Degree */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                What's the lowest degree do you have in your company? <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="99"
                value={lowestDegree}
                onChange={(e) => setLowestDegree(e.target.value)}
                placeholder="0-99"
                className="w-32 px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Highest Degree */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                What's the highest degree do you have in your company? <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={lowestDegree ? parseInt(lowestDegree) + 1 : 0}
                max="99"
                value={highestDegree}
                onChange={(e) => setHighestDegree(e.target.value)}
                placeholder={lowestDegree ? `${parseInt(lowestDegree) + 1}-99` : '0-99'}
                className="w-32 px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: `1px solid ${degreeError ? '#ef4444' : 'var(--border-color)'}`,
                  color: 'var(--text-primary)'
                }}
              />
              {degreeError && (
                <p className="text-xs mt-1 text-red-500">{degreeError}</p>
              )}
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveSettings}
                disabled={!highestClassification || !lowestDegree || !highestDegree || !!degreeError}
                className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: 'var(--gradient-primary)' }}
              >
                Save
              </button>
              {saveSuccess && (
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Saved successfully</span>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Please add the employees' groups' names:
              </h3>

              <div className="space-y-4">
                {/* Group Name */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Group Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => handleGroupNameChange(e.target.value)}
                    placeholder="e.g., Management"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    Latin letters and numbers only
                  </p>
                </div>

                {/* Lowest Classification */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Lowest classification in this group <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={groupLowestClass}
                    onChange={(e) => setGroupLowestClass(e.target.value)}
                    placeholder={getNextAvailableClassification().toString()}
                    className="w-32 px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                {/* Highest Classification */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Highest classification in this group <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={groupLowestClass || 0}
                    max="99"
                    value={groupHighestClass}
                    onChange={(e) => setGroupHighestClass(e.target.value)}
                    placeholder="0-99"
                    className="w-32 px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                {/* Error Message */}
                {groupError && (
                  <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                    {groupError}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {editingGroup && (
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
                    onClick={handleAddGroup}
                    disabled={!groupName || !groupLowestClass || !groupHighestClass}
                    className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    {editingGroup ? 'Save Modifications' : 'Add Group'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      <AnimatePresence>
        {showRemoveModal && groupToRemove && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-card p-6 max-w-md w-full" style={{ background: 'var(--bg-card)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                    Confirm Removal
                  </h3>
                  <button
                    onClick={() => setShowRemoveModal(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-tertiary)]"
                  >
                    <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Are you sure you want to remove the group <strong>"{groupToRemove.name}"</strong>?
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRemoveModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRemove}
                    className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: '#ef4444' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
