import { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';

interface SalaryData {
  [key: string]: string; // key format: "classification-degree", value: salary amount
}

export default function BasicSalariesTab() {
  const [highestClassification, setHighestClassification] = useState(0);
  const [lowestDegree, setLowestDegree] = useState(0);
  const [highestDegree, setHighestDegree] = useState(0);
  const [salaryData, setSalaryData] = useState<SalaryData>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingCell, setEditingCell] = useState<string | null>(null);

  // Load settings and salary data from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('phoenix-hr-classification-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setHighestClassification(settings.highestClassification || 0);
      setLowestDegree(settings.lowestDegree || 0);
      setHighestDegree(settings.highestDegree || 0);
    }

    const savedSalaries = localStorage.getItem('phoenix-hr-basic-salaries');
    if (savedSalaries) {
      setSalaryData(JSON.parse(savedSalaries));
    }
  }, []);

  // Format number with thousands separator (xx xxx format)
  const formatSalary = (value: string): string => {
    if (!value || value === '') return '';
    
    // Remove any non-digit characters except decimal point
    const numStr = value.replace(/[^\d.]/g, '');
    const parts = numStr.split('.');
    
    // Add thousands separator to integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    
    return parts.join('.');
  };

  // Handle cell input change
  const handleCellChange = (classification: number, degree: number, value: string) => {
    const key = `${classification}-${degree}`;
    
    // Allow empty string or valid decimal numbers
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setSalaryData(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  // Handle cell blur (exit editing mode and format)
  const handleCellBlur = (classification: number, degree: number) => {
    const key = `${classification}-${degree}`;
    const value = salaryData[key];
    
    // Format the value when exiting edit mode
    if (value && value !== '') {
      const formatted = formatSalary(value);
      setSalaryData(prev => ({
        ...prev,
        [key]: formatted
      }));
    }
    
    setEditingCell(null);
  };

  // Handle cell click (enter editing mode)
  const handleCellClick = (classification: number, degree: number) => {
    setEditingCell(`${classification}-${degree}`);
  };

  // Save salary data
  const handleSave = () => {
    localStorage.setItem('phoenix-hr-basic-salaries', JSON.stringify(salaryData));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Get salary value for a cell
  const getSalaryValue = (classification: number, degree: number): string => {
    const key = `${classification}-${degree}`;
    return salaryData[key] || '';
  };

  // Check if settings are configured
  const hasSettings = highestClassification > 0 && highestDegree > lowestDegree;

  if (!hasSettings) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Please configure classification settings in the "Groups and classifications" tab first.
        </p>
      </div>
    );
  }

  // Generate degree numbers (columns)
  const degrees = Array.from(
    { length: highestDegree - lowestDegree + 1 },
    (_, i) => lowestDegree + i
  );

  // Generate classification numbers (rows)
  const classifications = Array.from(
    { length: highestClassification },
    (_, i) => i + 1
  );

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {/* Top-left corner cell */}
                <th
                  className="sticky left-0 z-20 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                  style={{
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-tertiary)',
                    borderRight: '2px solid var(--border-color)',
                    borderBottom: '2px solid var(--border-color)',
                    minWidth: '120px'
                  }}
                >
                  Classification / degree
                </th>
                
                {/* Degree headers */}
                {degrees.map(degree => (
                  <th
                    key={degree}
                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-tertiary)',
                      borderBottom: '2px solid var(--border-color)',
                      minWidth: '100px'
                    }}
                  >
                    Degree {degree}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classifications.map(classification => (
                <tr key={classification}>
                  {/* Classification header (left column) */}
                  <td
                    className="sticky left-0 z-10 px-4 py-3 text-center text-sm font-semibold"
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      borderRight: '2px solid var(--border-color)',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                  >
                    Classification {classification}
                  </td>
                  
                  {/* Salary cells */}
                  {degrees.map(degree => {
                    const cellKey = `${classification}-${degree}`;
                    const isEditing = editingCell === cellKey;
                    const value = getSalaryValue(classification, degree);
                    
                    return (
                      <td
                        key={degree}
                        className="px-2 py-2 text-center"
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          background: isEditing ? 'var(--bg-primary)' : 'transparent'
                        }}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleCellChange(classification, degree, e.target.value)}
                            onBlur={() => handleCellBlur(classification, degree)}
                            autoFocus
                            className="w-full px-2 py-1.5 text-sm text-center outline-none rounded-lg"
                            style={{
                              background: 'var(--bg-tertiary)',
                              border: '2px solid var(--phoenix-500)',
                              color: 'var(--text-primary)'
                            }}
                          />
                        ) : (
                          <div
                            onClick={() => handleCellClick(classification, degree)}
                            className="w-full px-2 py-1.5 text-sm cursor-pointer rounded-lg transition-all hover:bg-[var(--bg-tertiary)]"
                            style={{
                              color: value ? 'var(--text-primary)' : 'var(--text-tertiary)',
                              minHeight: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {value ? `${value} DA` : ''}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:scale-105 hover:shadow-lg"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <Save className="w-4 h-4" />
          Save salaries
        </button>
        
        {saveSuccess && (
          <div className="flex items-center gap-1.5 text-emerald-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Saved successfully</span>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="glass-card p-4">
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          <strong>Instructions:</strong> Click on any cell to enter a basic salary amount. 
          You can enter decimal numbers (e.g., 1500.50). 
          You don't need to fill all cells at once - you can save your progress and continue later.
        </p>
      </div>
    </div>
  );
}
