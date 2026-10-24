import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import { api, Employee } from '../services/api';

export default function DepartmentsTab() {
  const { departments, addDepartment, updateDepartment, removeDepartment } = useSettings();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  
  // Form state
  const [deptName, setDeptName] = useState('');
  const [managerEmployeeNumber, setManagerEmployeeNumber] = useState('');
  const [managerName, setManagerName] = useState('');
  const [errors, setErrors] = useState<{ deptName?: string; managerName?: string }>({});

  useEffect(() => {
    api.employees.getAll().then(setEmployees);
  }, []);

  // Validation
  const validateDeptName = (value: string) => {
    if (!value.trim()) return 'Department name is required';
    if (!/^[a-zA-Z0-9\s]+$/.test(value)) return 'Only Latin letters and numbers allowed';
    return '';
  };

  const validateManagerName = (value: string) => {
    if (!value.trim()) return 'Manager name is required';
    if (!/^[a-zA-Z\s]+$/.test(value)) return 'Only Latin letters allowed';
    return '';
  };

  // Handle employee number selection
  const handleEmployeeNumberChange = (empNumber: string) => {
    setManagerEmployeeNumber(empNumber);
    
    if (empNumber === '') {
      setManagerName('');
    } else {
      const employee = employees.find(e => e.employeeNumber === empNumber);
      if (employee) {
        setManagerName(`${employee.firstName} ${employee.lastName}`);
      }
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    const deptNameError = validateDeptName(deptName);
    const managerNameError = managerEmployeeNumber === '' ? validateManagerName(managerName) : '';
    
    if (deptNameError || managerNameError) {
      setErrors({ deptName: deptNameError, managerName: managerNameError });
      return;
    }

    const finalManagerName = managerEmployeeNumber === '' 
      ? managerName 
      : employees.find(e => e.employeeNumber === managerEmployeeNumber)?.firstName + ' ' + 
        employees.find(e => e.employeeNumber === managerEmployeeNumber)?.lastName;

    if (editingId) {
      updateDepartment(editingId, {
        id: editingId,
        name: deptName,
        managerName: finalManagerName || '',
        managerEmployeeNumber,
      });
      setEditingId(null);
    } else {
      addDepartment({
        id: Date.now().toString(),
        name: deptName,
        managerName: finalManagerName || '',
        managerEmployeeNumber,
      });
    }

    resetForm();
  };

  // Handle edit
  const handleEdit = (dept: typeof departments[0]) => {
    setEditingId(dept.id);
    setDeptName(dept.name);
    setManagerEmployeeNumber(dept.managerEmployeeNumber);
    setManagerName(dept.managerName);
    setErrors({});
  };

  // Handle delete
  const handleDelete = () => {
    if (showDeleteModal) {
      removeDepartment(showDeleteModal);
      setShowDeleteModal(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setDeptName('');
    setManagerEmployeeNumber('');
    setManagerName('');
    setErrors({});
    setEditingId(null);
  };

  // Check if form is valid
  const isFormValid = () => {
    const hasDeptName = deptName.trim() && !validateDeptName(deptName);
    const hasManager = managerEmployeeNumber 
      ? true 
      : managerName.trim() && !validateManagerName(managerName);
    return hasDeptName && hasManager;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Departments List */}
      <div className="lg:col-span-2 glass-card overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Departments List ({departments.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)' }}>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  N°
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  Department's Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  Department's Manager
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, index) => (
                <tr key={dept.id} className="employee-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {dept.name}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {dept.managerName}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="p-2 rounded-lg transition-all hover:scale-110"
                        style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(dept.id)}
                        className="p-2 rounded-lg transition-all hover:scale-110"
                        style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    No departments yet. Add your first department using the form.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Add/Edit Form */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {editingId ? 'Edit Department' : 'Add New Department'}
        </h3>

        <div className="space-y-4">
          {/* Department Name */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Department's Name *
            </label>
            <input
              type="text"
              value={deptName}
              onChange={(e) => {
                setDeptName(e.target.value);
                setErrors({ ...errors, deptName: validateDeptName(e.target.value) });
              }}
              placeholder="e.g., Engineering"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
              style={{ 
                background: 'var(--bg-tertiary)', 
                border: `1px solid ${errors.deptName ? '#ef4444' : 'var(--border-color)'}`,
                color: 'var(--text-primary)' 
              }}
            />
            {errors.deptName && (
              <p className="text-xs text-red-500 mt-1">{errors.deptName}</p>
            )}
          </div>

          {/* Manager Employee Number */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Manager Employee Number
            </label>
            <select
              value={managerEmployeeNumber}
              onChange={(e) => handleEmployeeNumberChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer focus:ring-2 focus:ring-phoenix-500/30"
              style={{ 
                background: 'var(--bg-tertiary)', 
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)' 
              }}
            >
              <option value="">No ID</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.employeeNumber}>
                  {emp.employeeNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Manager Name */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Manager's Name {managerEmployeeNumber === '' && '*'}
            </label>
            <input
              type="text"
              value={managerName}
              onChange={(e) => {
                setManagerName(e.target.value);
                if (managerEmployeeNumber === '') {
                  setErrors({ ...errors, managerName: validateManagerName(e.target.value) });
                }
              }}
              readOnly={managerEmployeeNumber !== ''}
              placeholder={managerEmployeeNumber === '' ? "e.g., John Smith" : "Auto-filled from employee"}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
              style={{ 
                background: managerEmployeeNumber !== '' ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                border: `1px solid ${errors.managerName ? '#ef4444' : 'var(--border-color)'}`,
                color: 'var(--text-primary)',
                cursor: managerEmployeeNumber !== '' ? 'not-allowed' : 'text',
                opacity: managerEmployeeNumber !== '' ? 0.7 : 1,
              }}
            />
            {errors.managerName && managerEmployeeNumber === '' && (
              <p className="text-xs text-red-500 mt-1">{errors.managerName}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {editingId ? 'Save Modifications' : 'Add Department'}
          </button>

          {editingId && (
            <button
              onClick={resetForm}
              className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
              style={{ 
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)'
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
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
              <div className="glass-card p-6 max-w-md w-full" style={{ background: 'var(--bg-popup)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                    Confirm Deletion
                  </h3>
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="p-1 rounded-lg hover:bg-[var(--bg-tertiary)]"
                  >
                    <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Are you sure you want to remove this department? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
                    style={{ 
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-[1.02]"
                    style={{ background: '#ef4444' }}
                  >
                    Delete
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
