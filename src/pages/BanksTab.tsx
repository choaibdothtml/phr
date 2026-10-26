import { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';

interface Bank {
  id: string;
  number: number;
  name: string;
}

export default function BanksTab() {
  const [bankName, setBankName] = useState('');
  const [banks, setBanks] = useState<Bank[]>([]);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);

  // Load banks from localStorage
  useEffect(() => {
    const savedBanks = localStorage.getItem('phoenix-hr-banks');
    if (savedBanks) {
      setBanks(JSON.parse(savedBanks));
    }
  }, []);

  // Validate bank name (Latin letters only, capitalize first letter of each word)
  const handleBankNameChange = (value: string) => {
    const filtered = value.replace(/[^a-zA-Z\s]/g, '');
    // Capitalize first letter of each word
    const capitalized = filtered.replace(/\b\w/g, l => l.toUpperCase());
    setBankName(capitalized);
  };

  // Check if form is valid
  const isFormValid = bankName.trim() !== '';

  // Add or update bank
  const handleSubmit = () => {
    if (!isFormValid) return;

    if (editingBank) {
      // Update existing bank
      const updated = banks.map(b =>
        b.id === editingBank.id
          ? { ...b, name: bankName }
          : b
      );
      setBanks(updated);
      localStorage.setItem('phoenix-hr-banks', JSON.stringify(updated));
      setEditingBank(null);
    } else {
      // Add new bank
      const newBank: Bank = {
        id: Date.now().toString(),
        number: banks.length + 1,
        name: bankName,
      };
      const updated = [...banks, newBank];
      setBanks(updated);
      localStorage.setItem('phoenix-hr-banks', JSON.stringify(updated));
    }

    // Reset form
    setBankName('');
  };

  // Edit bank
  const handleEdit = (bank: Bank) => {
    setEditingBank(bank);
    setBankName(bank.name);
  };

  // Cancel edit
  const handleCancel = () => {
    setEditingBank(null);
    setBankName('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Banks List - Left Side */}
      <div className="lg:col-span-2 h-full">
        <div className="glass-card overflow-hidden h-full">
          {banks.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                No banks yet. Add your first bank using the form.
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
                      Bank name
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {banks.map((bank) => (
                    <tr
                      key={bank.id}
                      className="transition-colors hover:bg-[var(--bg-tertiary)]"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {bank.number}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                        {bank.name}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEdit(bank)}
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
            {editingBank ? 'Edit bank' : 'Add new bank'}
          </h3>

          <div className="space-y-4">
            {/* Bank Name */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Bank's name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => handleBankNameChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {editingBank && (
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
                {editingBank ? 'Save modifications' : 'Add bank'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
