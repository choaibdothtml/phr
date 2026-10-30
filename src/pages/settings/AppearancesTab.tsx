// @ts-nocheck
import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

const primaryColors = [
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

const sidebarColors = [
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

const sidebarColorsDark = {
  'default': '', 'snow': '#0f1629', 'mist': '#111827', 'pearl': '#0a0e1a', 'lavender': '#1a1625',
  'sky': '#0c1929', 'mint': '#0a1f1d', 'blush': '#1f0f10', 'cream': '#1a1508', 'slate': '#0f172a',
};

export default function AppearancesTab() {
  const [selectedPrimary, setSelectedPrimary] = useState('phoenix');
  const [selectedSidebar, setSelectedSidebar] = useState('blush');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dateFormat, setDateFormat] = useState('full');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [hourlyPercentages, setHourlyPercentages] = useState([]);
  const [percentageInput, setPercentageInput] = useState('');
  const [tempPercentages, setTempPercentages] = useState([]);
  const [percentagesSaved, setPercentagesSaved] = useState(false);
  
  // New settings
  const [firstDayOfWeek, setFirstDayOfWeek] = useState('Sunday');
  const [firstDayOfMonth, setFirstDayOfMonth] = useState('21');
  const [reintegrationLimit, setReintegrationLimit] = useState('Unlimited');
  const [compensatoryRestWarning, setCompensatoryRestWarning] = useState('0');
  const [additionalHoursCategories, setAdditionalHoursCategories] = useState({ cat1: false, cat2: false, cat3: false });
  const [tempCategories, setTempCategories] = useState({ cat1: false, cat2: false, cat3: false });
  const [categoriesSaved, setCategoriesSaved] = useState(false);
  
  const [attendanceAbbreviations, setAttendanceAbbreviations] = useState({
    present: '', paidRest: '', publicHoliday: '', businessMission: '', training: '',
    weeklyRest: '', suspension: '', unauthorizedAbsence: '', authorizedAbsence: '',
    compensatoryRest: '', annualLeave: '', birthLeave: '', deathLeave: '', unpaidLeave: '',
    sickLeave: '', workplaceAccident: '', nonWorkingDays: '', badWeather: ''
  });
  const [tempAbbreviations, setTempAbbreviations] = useState(attendanceAbbreviations);
  const [abbreviationsEditMode, setAbbreviationsEditMode] = useState(false);
  const [abbreviationsSaved, setAbbreviationsSaved] = useState(false);

  useEffect(() => {
    const savedPrimary = localStorage.getItem('phoenix-hr-primary-color');
    const savedSidebar = localStorage.getItem('phoenix-hr-sidebar-color');
    const savedDateFormat = localStorage.getItem('phoenix-hr-date-format');
    const savedTimeFormat = localStorage.getItem('phoenix-hr-time-format');
    const savedPercentages = localStorage.getItem('phoenix-hr-hourly-percentages');
    const savedFirstDayOfWeek = localStorage.getItem('phoenix-hr-first-day-of-week');
    const savedFirstDayOfMonth = localStorage.getItem('phoenix-hr-first-day-of-month');
    const savedReintegrationLimit = localStorage.getItem('phoenix-hr-reintegration-limit');
    const savedCompensatoryRestWarning = localStorage.getItem('phoenix-hr-compensatory-rest-warning');
    const savedCategories = localStorage.getItem('phoenix-hr-additional-hours-categories');
    const savedAbbreviations = localStorage.getItem('phoenix-hr-attendance-abbreviations');
    
    if (savedPrimary) setSelectedPrimary(savedPrimary);
    if (savedSidebar) setSelectedSidebar(savedSidebar);
    if (savedDateFormat) setDateFormat(savedDateFormat);
    if (savedTimeFormat) setTimeFormat(savedTimeFormat);
    if (savedPercentages) {
      const percentages = JSON.parse(savedPercentages);
      setHourlyPercentages(percentages);
      setTempPercentages(percentages);
    }
    if (savedFirstDayOfWeek) setFirstDayOfWeek(savedFirstDayOfWeek);
    if (savedFirstDayOfMonth) setFirstDayOfMonth(savedFirstDayOfMonth);
    if (savedReintegrationLimit) setReintegrationLimit(savedReintegrationLimit);
    if (savedCompensatoryRestWarning) setCompensatoryRestWarning(savedCompensatoryRestWarning);
    if (savedCategories) {
      const categories = JSON.parse(savedCategories);
      setAdditionalHoursCategories(categories);
      setTempCategories(categories);
      setCategoriesSaved(true);
    }
    if (savedAbbreviations) {
      const abbreviations = JSON.parse(savedAbbreviations);
      setAttendanceAbbreviations(abbreviations);
      setTempAbbreviations(abbreviations);
      setAbbreviationsSaved(true);
    }
    
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => setIsDarkMode(document.documentElement.classList.contains('dark')));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const primary = primaryColors.find(c => c.id === selectedPrimary);
    if (!primary) return;
    const root = document.documentElement;
    const hex = primary.value.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    root.style.setProperty('--phoenix-500', primary.value);
    root.style.setProperty('--primary-color-rgb', `${r}, ${g}, ${b}`);
    root.style.setProperty('--gradient-primary', primary.gradient || `linear-gradient(135deg, ${primary.value}, ${primary.value})`);
    root.style.setProperty('--gradient-accent', `linear-gradient(135deg, ${primary.value}, #d946ef)`);
    localStorage.setItem('phoenix-hr-primary-color', selectedPrimary);
  }, [selectedPrimary]);

  useEffect(() => {
    const root = document.documentElement;
    if (selectedSidebar === 'default') {
      root.style.removeProperty('--bg-sidebar');
    } else {
      const color = isDarkMode ? (sidebarColorsDark[selectedSidebar] || '') : sidebarColors.find(c => c.id === selectedSidebar)?.value || '';
      if (color) root.style.setProperty('--bg-sidebar', color);
    }
    localStorage.setItem('phoenix-hr-sidebar-color', selectedSidebar);
  }, [selectedSidebar, isDarkMode]);

  useEffect(() => { localStorage.setItem('phoenix-hr-date-format', dateFormat); }, [dateFormat]);
  useEffect(() => { localStorage.setItem('phoenix-hr-time-format', timeFormat); }, [timeFormat]);
  useEffect(() => { localStorage.setItem('phoenix-hr-first-day-of-week', firstDayOfWeek); }, [firstDayOfWeek]);
  useEffect(() => { localStorage.setItem('phoenix-hr-first-day-of-month', firstDayOfMonth); }, [firstDayOfMonth]);
  useEffect(() => { localStorage.setItem('phoenix-hr-reintegration-limit', reintegrationLimit); }, [reintegrationLimit]);
  useEffect(() => { localStorage.setItem('phoenix-hr-compensatory-rest-warning', compensatoryRestWarning); }, [compensatoryRestWarning]);

  const handlePrimarySelect = (colorId) => {
    if (selectedSidebar !== 'default' && colorId === selectedSidebar) return;
    setSelectedPrimary(colorId);
  };

  const handleSidebarSelect = (colorId) => {
    if (colorId === selectedPrimary) return;
    setSelectedSidebar(colorId);
  };

  const getSidebarPreviewColor = (color) => {
    if (color.isDefault) return isDarkMode ? '#0f1629' : '#f4f6f9';
    return isDarkMode ? (sidebarColorsDark[color.id] || color.value) : color.value;
  };

  const handlePercentageInput = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 2);
    setPercentageInput(cleaned);
    const num = parseInt(cleaned);
    if (cleaned.length === 2 && num >= 50 && num <= 99) {
      if (!tempPercentages.includes(num)) setTempPercentages([...tempPercentages, num].sort((a, b) => a - b));
      setPercentageInput('');
    }
  };

  const handleRemovePercentage = (percentage) => {
    setTempPercentages(tempPercentages.filter(p => p !== percentage));
  };

  const handleSavePercentages = () => {
    setHourlyPercentages(tempPercentages);
    localStorage.setItem('phoenix-hr-hourly-percentages', JSON.stringify(tempPercentages));
    setPercentagesSaved(true);
    setTimeout(() => setPercentagesSaved(false), 3000);
  };

  const handleCancelPercentages = () => {
    setTempPercentages(hourlyPercentages);
    setPercentageInput('');
  };

  // Additional hours categories handlers
  const handleCategoryChange = (category) => {
    setTempCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSaveCategories = () => {
    setAdditionalHoursCategories(tempCategories);
    localStorage.setItem('phoenix-hr-additional-hours-categories', JSON.stringify(tempCategories));
    setCategoriesSaved(true);
  };

  const handleRestoreCategories = () => {
    setTempCategories(additionalHoursCategories);
  };

  // Attendance abbreviations handlers
  const handleAbbreviationChange = (field, value) => {
    const cleaned = value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3);
    setTempAbbreviations(prev => ({ ...prev, [field]: cleaned }));
  };

  const handleSaveAbbreviations = () => {
    setAttendanceAbbreviations(tempAbbreviations);
    localStorage.setItem('phoenix-hr-attendance-abbreviations', JSON.stringify(tempAbbreviations));
    setAbbreviationsEditMode(false);
    setAbbreviationsSaved(true);
  };

  const handleEditAbbreviations = () => {
    setAbbreviationsEditMode(true);
    setAbbreviationsSaved(false);
  };

  const handleCancelAbbreviations = () => {
    setTempAbbreviations(attendanceAbbreviations);
    setAbbreviationsEditMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Primary color</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>Used for buttons, active states, and section highlights</p>
          <div className="grid grid-cols-5 gap-3">
            {primaryColors.map(color => {
              const isSelected = selectedPrimary === color.id;
              const isDisabled = selectedSidebar !== 'default' && color.id === selectedSidebar;
              return (<button key={color.id} onClick={() => handlePrimarySelect(color.id)} disabled={isDisabled} className="group relative flex flex-col items-center gap-1.5" title={color.name}><div className={`w-12 h-12 rounded-xl transition-all ${isSelected ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105'} ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`} style={{ background: color.gradient || color.value, boxShadow: isSelected ? `0 0 20px ${color.value}40` : 'none' }}>{isSelected && <div className="w-full h-full flex items-center justify-center"><Check className="w-5 h-5 text-white" strokeWidth={3} /></div>}</div><span className="text-[10px] font-medium text-center leading-tight" style={{ color: 'var(--text-tertiary)' }}>{color.name.split(' ')[0]}</span></button>);
            })}
          </div>
        </div>
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Sidebar color</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>Background color of the main navigation sidebar</p>
          <div className="grid grid-cols-5 gap-3">
            {sidebarColors.map(color => {
              const isSelected = selectedSidebar === color.id;
              const isDisabled = color.id === selectedPrimary;
              const previewColor = getSidebarPreviewColor(color);
              return (<button key={color.id} onClick={() => handleSidebarSelect(color.id)} disabled={isDisabled} className="group relative flex flex-col items-center gap-1.5" title={color.name}><div className={`w-12 h-12 rounded-xl transition-all flex items-center justify-center ${isSelected ? 'ring-2 ring-offset-2 ring-phoenix-500 scale-110' : 'hover:scale-105'} ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`} style={{ background: previewColor, border: color.isDefault ? '2px dashed var(--border-color)' : '1px solid var(--border-color)' }}>{isSelected && <Check className="w-5 h-5" strokeWidth={3} style={{ color: isDarkMode ? '#f1f5f9' : '#0f172a' }} />}{color.isDefault && !isSelected && <span className="text-[10px] font-bold" style={{ color: 'var(--text-tertiary)' }}>Def</span>}</div><span className="text-[10px] font-medium text-center leading-tight" style={{ color: 'var(--text-tertiary)' }}>{color.name}</span></button>);
            })}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Date and time</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>Choose how dates and times are displayed</p>
          <div className="space-y-4">
            <div><label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Date format</label><select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer transition-all focus:ring-2 focus:ring-orange-500/30" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}><option value="full">Full date</option><option value="dd/mm/yyyy">dd/mm/yyyy</option><option value="dd/mm/yy">dd/mm/yy</option><option value="mm/dd/yyyy">mm/dd/yyyy</option><option value="mm/dd/yy">mm/dd/yy</option></select></div>
            <div><label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Time format</label><select value={timeFormat} onChange={(e) => setTimeFormat(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer transition-all focus:ring-2 focus:ring-orange-500/30" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}><option value="12h">12h format</option><option value="24h">24h format</option></select></div>
          </div>
        </div>
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Hourly pay percentages</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>For employees whose pay basis is Hourly, please enter the percentages that you are willing to apply (50-99)</p>
          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Add percentage (50-99)</label>
                <input 
                  type="text" 
                  value={percentageInput} 
                  onChange={(e) => handlePercentageInput(e.target.value)} 
                  placeholder="Enter 2-digit number (50-99)"
                  maxLength={2}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/30" 
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} 
                />
              </div>
            </div>
            {tempPercentages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tempPercentages.map(percentage => (
                  <div key={percentage} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: 'rgba(var(--primary-color-rgb), 0.1)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    <span>{percentage}%</span>
                    <button onClick={() => handleRemovePercentage(percentage)} className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3 pt-2 items-center">
              <button onClick={handleCancelPercentages} className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={handleSavePercentages} className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg" style={{ background: 'var(--gradient-primary)' }}>Save</button>
              {percentagesSaved && <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium"><Check className="w-4 h-4" />Saved successfully</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar and Work Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Calendar settings</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>Configure calendar and work week settings</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>What is the first day of the week?</label>
              <select value={firstDayOfWeek} onChange={(e) => setFirstDayOfWeek(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer transition-all focus:ring-2 focus:ring-orange-500/30" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <option value="Sunday">Sunday</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>What's the first day of the month?</label>
              <select value={firstDayOfMonth} onChange={(e) => setFirstDayOfMonth(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer transition-all focus:ring-2 focus:ring-orange-500/30" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day.toString()}>{day}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>HR policies</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>Configure HR policy settings</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>How many times can HR reintegrate an employee after the termination of employment?</label>
              <select value={reintegrationLimit} onChange={(e) => setReintegrationLimit(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer transition-all focus:ring-2 focus:ring-orange-500/30" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="Unlimited">Unlimited</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Show a warning and a red cell whenever an employee's compensatory rest entitlement (days) exceeds:</label>
              <input type="number" min="0" max="999" value={compensatoryRestWarning} onChange={(e) => setCompensatoryRestWarning(e.target.value)} className="w-32 px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/30" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Hours Categories */}
      <div className="glass-card p-4">
        <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Additional hours categories</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>Select the additional hours' categories you want to apply</p>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={tempCategories.cat1} onChange={() => handleCategoryChange('cat1')} className="w-4 h-4 rounded" style={{ accentColor: 'var(--phoenix-500)' }} />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Category 1: +50% of the hourly income</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={tempCategories.cat2} onChange={() => handleCategoryChange('cat2')} className="w-4 h-4 rounded" style={{ accentColor: 'var(--phoenix-500)' }} />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Category 2: +75% of the hourly income</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={tempCategories.cat3} onChange={() => handleCategoryChange('cat3')} className="w-4 h-4 rounded" style={{ accentColor: 'var(--phoenix-500)' }} />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Category 3: +100% of the hourly income</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button onClick={handleRestoreCategories} className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Restore</button>
            <button onClick={handleSaveCategories} className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg" style={{ background: 'var(--gradient-primary)' }}>Save</button>
            {categoriesSaved && <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium"><Check className="w-4 h-4" />Saved successfully</span>}
          </div>
        </div>
      </div>

      {/* Attendance Abbreviations */}
      <div className="glass-card p-4">
        <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Attendance</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>Specify the abbreviations which will be used in the attendance pages</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: 'present', label: 'Present' },
            { key: 'paidRest', label: 'Paid rest' },
            { key: 'publicHoliday', label: 'Public holiday' },
            { key: 'businessMission', label: 'Business mission' },
            { key: 'training', label: 'Training' },
            { key: 'weeklyRest', label: 'Weekly rest' },
            { key: 'suspension', label: 'Suspension' },
            { key: 'unauthorizedAbsence', label: 'Unauthorized absence' },
            { key: 'authorizedAbsence', label: 'Authorized absence' },
            { key: 'compensatoryRest', label: 'Compensatory rest' },
            { key: 'annualLeave', label: 'Annual leave' },
            { key: 'birthLeave', label: 'Birth leave' },
            { key: 'deathLeave', label: 'Death leave' },
            { key: 'unpaidLeave', label: 'Unpaid leave' },
            { key: 'sickLeave', label: 'Sick leave' },
            { key: 'workplaceAccident', label: 'Workplace accident' },
            { key: 'nonWorkingDays', label: 'Non-working days' },
            { key: 'badWeather', label: 'Bad weather' }
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
              <input
                type="text"
                value={tempAbbreviations[key]}
                onChange={(e) => handleAbbreviationChange(key, e.target.value)}
                disabled={!abbreviationsEditMode}
                maxLength={3}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-4 justify-center">
          {!abbreviationsEditMode ? (
            <button onClick={handleEditAbbreviations} className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg" style={{ background: 'var(--gradient-primary)' }}>Edit</button>
          ) : (
            <>
              <button onClick={handleCancelAbbreviations} className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={handleSaveAbbreviations} className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg" style={{ background: 'var(--gradient-primary)' }}>Save</button>
            </>
          )}
          {abbreviationsSaved && !abbreviationsEditMode && <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium"><Check className="w-4 h-4" />Saved successfully</span>}
        </div>
      </div>
    </div>
  );
}
