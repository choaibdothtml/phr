import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, Employee } from '../services/api';

interface Department {
  id: string;
  number: number;
  name: string;
  managerEmployeeNumber: string;
  managerName: string;
}

export default function DepartmentsTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentName, setDepartmentName] = useState('');
  const [selectedEmployeeNumber, setSelectedEmployeeNumber] = useState('');
  const [managerName, setManagerName] = useState('');
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [departmentToRemove, setDepartmentToRemove] = useState<Department | null>(null);

  useEffect(() => {
    api.employees.getAll().then(setEmployees);
    // Load departments from localStorage
    const stored = localStorage.getItem('phoenix-hr-departments-custom');
    if (stored) {
      setDepartments(JSON.parse(stored));
    }
  }, []);

  // Update manager name when employee number changes
  useEffect(() => {
    if (selectedEmployeeNumber === 'no-id') {
      setManagerName('');
    } else if (selectedEmployeeNumber) {
      const employee = employees.find(e => e.employeeNumber === selectedEmployeeNumber);
      if (employee) {
        setManagerName(`${employee.lastName} ${employee.firstName}`);
      }
    }
  }, [selectedEmployeeNumber, employees]);

  // Validate department name (Latin letters and numbers only, capitalize first letter of each word)
  const handleDepartmentNameChange = (value: string) => {
    const filtered = value.replace(/[^a-zA-Z0-9\s]/g, '');
    // Capitalize first letter of each word
    const capitalized = filtered.replace(/\b\w/g, l => l.toUpperCase());
    setDepartmentName(capitalized);
  };

  // Validate manager name (Latin letters only when editable, capitalize first letter of each word)
  const handleManagerNameChange = (value: string) => {
    if (selectedEmployeeNumber === 'no-id') {
      const filtered = value.replace(/[^a-zA-Z\s]/g, '');
      // Capitalize first letter of each word
      const capitalized = filtered.replace(/\b\w/g, l => l.toUpperCase());
      setManagerName(capitalized);
    }
  };

  // Check if form is valid
  const isFormValid = departmentName.trim() !== '' && managerName.trim() !== '';

  // Add or update department
  const handleSubmit = () => {
    if (!isFormValid) return;

    if (editingDepartment) {
      // Update existing department
      const updated = departments.map(d => 
        d.id === editingDepartment.id 
          ? { 
              ...d, 
              name: departmentName, 
              managerEmployeeNumber: selectedEmployeeNumber === 'no-id' ? '' : selectedEmployeeNumber,
              managerName 
            }
          : d
      );
      setDepartments(updated);
      localStorage.setItem('phoenix-hr-departments-custom', JSON.stringify(updated));
      setEditingDepartment(null);
    } else {
      // Add new department
      const newDepartment: Department = {
        id: Date.now().toString(),
        number: departments.length + 1,
        name: departmentName,
        managerEmployeeNumber: selectedEmployeeNumber === 'no-id' ? '' : selectedEmployeeNumber,
        managerName,
      };
      const updated = [...departments, newDepartment];
      setDepartments(updated);
      localStorage.setItem('phoenix-hr-departments-custom', JSON.stringify(updated));
    }

    // Reset form
    setDepartmentName('');
    setSelectedEmployeeNumber('');
    setManagerName('');
  };

  // Edit department
  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setDepartmentName(department.name);
    setSelectedEmployeeNumber(department.managerEmployeeNumber || 'no-id');
    setManagerName(department.managerName);
  };

  // Remove department
  const handleRemove = (department: Department) => {
    setDepartmentToRemove(department);
    setShowRemoveModal(true);
  };

  // Confirm remove
  const confirmRemove = () => {
    if (departmentToRemove) {
      const updated = departments
        .filter(d => d.id !== departmentToRemove.id)
        .map((d, idx) => ({ ...d, number: idx + 1 }));
      setDepartments(updated);
      localStorage.setItem('phoenix-hr-departments-custom', JSON.stringify(updated));
      setShowRemoveModal(false);
      setDepartmentToRemove(null);
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setEditingDepartment(null);
    setDepartmentName('');
    setSelectedEmployeeNumber('');
    setManagerName('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Departments List - Left Side */}
      <div className="lg:col-span-2 h-full">
        <div className="glass-card overflow-hidden h-full">
          {departments.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                No departments yet. Add your first department using the form.
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
                      Department name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      Manager
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept, idx) => (
                    <tr 
                      key={dept.id} 
                      className="transition-colors hover:bg-[var(--bg-tertiary)]"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {dept.number}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                        {dept.name}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {dept.managerName}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(dept)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleRemove(dept)}
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

      {/* Add/Edit Form - Right Side */}
      <div className="h-full">
        <div className="glass-card p-6 sticky top-6 h-full">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {editingDepartment ? 'Edit department' : 'Add new department'}
          </h3>

          <div className="space-y-4">
            {/* Department Name */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Department's name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={departmentName}
                onChange={(e) => handleDepartmentNameChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                style={{ 
                  background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-primary)' 
                }}
              />
            </div>

            {/* Employee Number Dropdown */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Manager employee number
              </label>
              <select
                value={selectedEmployeeNumber}
                onChange={(e) => setSelectedEmployeeNumber(e.target.value)}
                className="w-32 px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer focus:ring-2 focus:ring-phoenix-500/30"
                style={{ 
                  background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-primary)' 
                }}
              >
                <option value="">Select...</option>
                <option value="no-id">No ID</option>
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
                Manager's name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => handleManagerNameChange(e.target.value)}
                readOnly={selectedEmployeeNumber !== 'no-id' && selectedEmployeeNumber !== ''}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ 
                  background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-primary)' 
                }}
                disabled={selectedEmployeeNumber !== 'no-id' && selectedEmployeeNumber !== ''}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {editingDepartment && (
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
                disabled={!isFormValid}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {editingDepartment ? 'Save modifications' : 'Add department'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      <AnimatePresence>
        {showRemoveModal && departmentToRemove && (
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
                    Confirm removal
                  </h3>
                  <button
                    onClick={() => setShowRemoveModal(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-tertiary)]"
                  >
                    <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Are you sure you want to remove the department <strong>"{departmentToRemove.name}"</strong>? 
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
