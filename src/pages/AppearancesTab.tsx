import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface ColorOption {
  id: string;
  name: string;
  value: string;
  gradient?: string;
  isDefault?: boolean;
}

// Primary colors - vibrant colors for buttons and labels
const primaryColors: ColorOption[] = [
  { id: 'phoenix', name: 'Phoenix Orange', value: '#f97316', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
  { id: 'royal-blue', name: 'Royal Blue', value: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  { id: 'emerald', name: 'Emerald', value: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  { id: 'violet', name: 'Violet', value: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  { id: 'scarlet', name: 'Scarlet', value: '#FF3300', gradient: 'linear-gradient(135deg, #FF3300, #CC2900)' },
  { id: 'cyan', name: 'Cyan', value: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
  { id: 'amber', name: 'Amber', value: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { id: 'teal', name: 'Teal', value: '#14b8a6', gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)' },
  { id: 'indigo', name: 'Indigo', value: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
  { id: 'crimson', name: 'Crimson', value: '#dc2626', gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)' },
];

// Sidebar colors - subtle background colors
const sidebarColors: ColorOption[] = [
  { id: 'default', name: 'Default', value: '', isDefault: true },
  { id: 'snow', name: 'Snow', value: '#ffffff' },
  { id: 'mist', name: 'Mist', value: '#f4f6f9' },
  { id: 'pearl', name: 'Pearl', value: '#f1f5f9' },
  { id: 'lavender', name: 'Lavender', value: '#f5f3ff' },
  { id: 'sky', name: 'Sky', value: '#f0f9ff' },
  { id: 'mint', name: 'Mint', value: '#f0fdfa' },
  { id: 'blush', name: 'Blush', value: '#fef2f2' },
  { id: 'cream', name: 'Cream', value: '#fffbeb' },
  { id: 'slate', name: 'Slate', value: '#f8fafc' },
];

// Dark mode sidebar colors
const sidebarColorsDark: Record<string, string> = {
  'default': '',
  'snow': '#0f1629',
  'mist': '#111827',
  'pearl': '#0a0e1a',
  'lavender': '#1a1625',
  'sky': '#0c1929',
  'mint': '#0a1f1d',
  'blush': '#1f0f10',
  'cream': '#1a1508',
  'slate': '#0f172a',
};

export default function AppearancesTab() {
  const [selectedPrimary, setSelectedPrimary] = useState('phoenix');
  const [selectedSidebar, setSelectedSidebar] = useState('blush');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dateFormat, setDateFormat] = useState('full');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [hourlyPercentages, setHourlyPercentages] = useState<number[]>([]);
  const [percentageInput, setPercentageInput] = useState('');
  const [tempPercentages, setTempPercentages] = useState<number[]>([]);

  // Load saved preferences
  useEffect(() => {
    const savedPrimary = localStorage.getItem('phoenix-hr-primary-color');
    const savedSidebar = localStorage.getItem('phoenix-hr-sidebar-color');
    const savedDateFormat = localStorage.getItem('phoenix-hr-date-format');
    const savedTimeFormat = localStorage.getItem('phoenix-hr-time-format');
    const savedPercentages = localStorage.getItem('phoenix-hr-hourly-percentages');
    
    if (savedPrimary) setSelectedPrimary(savedPrimary);
    if (savedSidebar) setSelectedSidebar(savedSidebar);
    if (savedDateFormat) setDateFormat(savedDateFormat);
    if (savedTimeFormat) setTimeFormat(savedTimeFormat);
    if (savedPercentages) {
      const percentages = JSON.parse(savedPercentages);
      setHourlyPercentages(percentages);
      setTempPercentages(percentages);
    }
    
    // Check if dark mode is active
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    // Observe dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Apply colors to the app
  useEffect(() => {
    const primary = primaryColors.find(c => c.id === selectedPrimary);
    if (!primary) return;

    const root = document.documentElement;
    
    // Convert hex to RGB
    const hex = primary.value.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Apply primary color
    root.style.setProperty('--phoenix-500', primary.value);
    root.style.setProperty('--primary-color-rgb', `${r}, ${g}, ${b}`);
    root.style.setProperty('--gradient-primary', primary.gradient || `linear-gradient(135deg, ${primary.value}, ${primary.value})`);
    root.style.setProperty('--gradient-accent', `linear-gradient(135deg, ${primary.value}, #d946ef)`);
    
    // Save to localStorage
    localStorage.setItem('phoenix-hr-primary-color', selectedPrimary);
  }, [selectedPrimary]);

  useEffect(() => {
    const root = document.documentElement;
    
    if (selectedSidebar === 'default') {
      root.style.removeProperty('--bg-sidebar');
    } else {
      const color = isDarkMode 
        ? (sidebarColorsDark[selectedSidebar] || '')
        : sidebarColors.find(c => c.id === selectedSidebar)?.value || '';
      
      if (color) {
        root.style.setProperty('--bg-sidebar', color);
      }
    }
    
    localStorage.setItem('phoenix-hr-sidebar-color', selectedSidebar);
  }, [selectedSidebar, isDarkMode]);

  // Save date format preference
  useEffect(() => {
    localStorage.setItem('phoenix-hr-date-format', dateFormat);
  }, [dateFormat]);

  // Save time format preference
  useEffect(() => {
    localStorage.setItem('phoenix-hr-time-format', timeFormat);
  }, [timeFormat]);

  // Handle primary color selection
  const handlePrimarySelect = (colorId: string) => {
    // Can't select same color as sidebar (only if sidebar isn't default)
    if (selectedSidebar !== 'default' && colorId === selectedSidebar) {
      return;
    }
    setSelectedPrimary(colorId);
  };

  // Handle sidebar color selection
  const handleSidebarSelect = (colorId: string) => {
    // Can't select same color as primary
    if (colorId === selectedPrimary) {
      return;
    }
    setSelectedSidebar(colorId);
  };

  // Reset to defaults
  const handleReset = () => {
    setSelectedPrimary('phoenix');
    setSelectedSidebar('blush');
    document.documentElement.style.removeProperty('--phoenix-500');
    document.documentElement.style.removeProperty('--gradient-primary');
    document.documentElement.style.removeProperty('--gradient-accent');
    document.documentElement.style.removeProperty('--bg-sidebar');
    localStorage.removeItem('phoenix-hr-primary-color');
    localStorage.removeItem('phoenix-hr-sidebar-color');
  };

  // Handle percentage input
  const handlePercentageInput = (value: string) => {
    // Only allow numbers, max 2 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 2);
    setPercentageInput(cleaned);
    
    // If valid (50-99), add to list and clear input
    const num = parseInt(cleaned);
    if (cleaned.length === 2 && num >= 50 && num <= 99) {
      if (!tempPercentages.includes(num)) {
        setTempPercentages([...tempPercentages, num].sort((a, b) => a - b));
      }
      setPercentageInput('');
    }
  };

  // Remove percentage from list
  const handleRemovePercentage = (percentage: number) => {
    setTempPercentages(tempPercentages.filter(p => p !== percentage));
  };

  // Save percentages
  const handleSavePercentages = () => {
    setHourlyPercentages(tempPercentages);
    localStorage.setItem('phoenix-hr-hourly-percentages', JSON.stringify(tempPercentages));
  };

  // Cancel changes
  const handleCancelPercentages = () => {
    setTempPercentages(hourlyPercentages);
    setPercentageInput('');
  };

  // Get display color for sidebar preview
  const getSidebarPreviewColor = (color: ColorOption) => {
    if (color.isDefault) return isDarkMode ? '#0f1629' : '#f4f6f9';
    return isDarkMode ? (sidebarColorsDark[color.id] || color.value) : color.value;
  };

  return (
    <div className="space-y-6">
      {/* Row 1: Primary Color and Sidebar Color */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Color Section */}
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Primary color
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
            Used for buttons, active states, and section highlights
          </p>

          <div className="grid grid-cols-5 gap-3">
            {primaryColors.map(color => {
              const isSelected = selectedPrimary === color.id;
              const isDisabled = selectedSidebar !== 'default' && color.id === selectedSidebar;
              
              return (
                <button
                  key={color.id}
                  onClick={() => handlePrimarySelect(color.id)}
                  disabled={isDisabled}
                  className="group relative flex flex-col items-center gap-1.5"
                  title={color.name}
                >
                  <div
                    className={`w-12 h-12 rounded-xl transition-all ${
                      isSelected ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105'
                    } ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ 
                      background: color.gradient || color.value,
                      boxShadow: isSelected ? `0 0 20px ${color.value}40` : 'none'
                    }}
                  >
                    {isSelected && (
                      <div className="w-full h-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-center leading-tight" style={{ color: 'var(--text-tertiary)' }}>
                    {color.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Color Section */}
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Sidebar color
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
            Background color of the main navigation sidebar
          </p>

          <div className="grid grid-cols-5 gap-3">
            {sidebarColors.map(color => {
              const isSelected = selectedSidebar === color.id;
              const isDisabled = color.id === selectedPrimary;
              const previewColor = getSidebarPreviewColor(color);
              
              return (
                <button
                  key={color.id}
                  onClick={() => handleSidebarSelect(color.id)}
                  disabled={isDisabled}
                  className="group relative flex flex-col items-center gap-1.5"
                  title={color.name}
                >
                  <div
                    className={`w-12 h-12 rounded-xl transition-all flex items-center justify-center ${
                      isSelected ? 'ring-2 ring-offset-2 ring-phoenix-500 scale-110' : 'hover:scale-105'
                    } ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ 
                      background: previewColor,
                      border: color.isDefault ? '2px dashed var(--border-color)' : '1px solid var(--border-color)'
                    }}
                  >
                    {isSelected && (
                      <Check className="w-5 h-5" strokeWidth={3} style={{ 
                        color: isDarkMode ? '#f1f5f9' : '#0f172a' 
                      }} />
                    )}
                    {color.isDefault && !isSelected && (
                      <span className="text-[10px] font-bold" style={{ color: 'var(--text-tertiary)' }}>
                        Def
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-center leading-tight" style={{ color: 'var(--text-tertiary)' }}>
                    {color.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Date and Time, Hourly Percentages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Date and Time Section */}
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Date and time
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
            Choose how dates and times are displayed
          </p>

          <div className="space-y-4">
            {/* Date Format */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Date format
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer transition-all focus:ring-2 focus:ring-orange-500/30"
                style={{ 
                  background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-primary)' 
                }}
              >
                <option value="full">Full date</option>
                <option value="dd/mm/yyyy">dd/mm/yyyy</option>
                <option value="dd/mm/yy">dd/mm/yy</option>
                <option value="mm/dd/yyyy">mm/dd/yyyy</option>
                <option value="mm/dd/yy">mm/dd/yy</option>
              </select>
            </div>

            {/* Time Format */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Time format
              </label>
              <select
                value={timeFormat}
                onChange={(e) => setTimeFormat(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer transition-all focus:ring-2 focus:ring-orange-500/30"
                style={{ 
                  background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-primary)' 
                }}
              >
                <option value="12h">12h format</option>
                <option value="24h">24h format</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hourly Percentages Section */}
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Hourly pay percentages
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
            For employees whose pay basis is Hourly, please enter the percentages that you are willing to apply
          </p>

          <div className="space-y-4">
            {/* Input for adding percentages */}
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Add percentage (50-99)
                </label>
                <input
                  type="text"
                  value={percentageInput}
                  onChange={(e) => handlePercentageInput(e.target.value)}
                  placeholder="50-99"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/30"
                  style={{ 
                    background: 'var(--bg-tertiary)', 
                    border: '1px solid var(--border-color)', 
                    color: 'var(--text-primary)' 
                  }}
                />
              </div>
            </div>

            {/* Display added percentages */}
            {tempPercentages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tempPercentages.map(percentage => (
                  <div
                    key={percentage}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                    style={{ 
                      background: 'rgba(var(--primary-color-rgb), 0.1)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <span>{percentage}%</span>
                    <button
                      onClick={() => handleRemovePercentage(percentage)}
                      className="hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Save and Cancel buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCancelPercentages}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                style={{ 
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePercentages}
                className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg"
                style={{ background: 'var(--gradient-primary)' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
