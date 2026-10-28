# Phoenix HR - Recovery Context

## Quick Start Guide

**Project Status**: Core infrastructure rebuilt, complex pages need reconstruction  
**Last Updated**: 2026-02-03  
**Build Status**: ✅ SUCCESS

---

## What's Working Now

✅ Login page with demo credentials  
✅ Theme system (light/dark)  
✅ Collapsible sidebar  
✅ Dashboard with stat cards  
✅ Settings page structure  
✅ All storage utilities  
✅ Routing system  
✅ Notifications dropdown  
✅ Real-time clock  

## What Needs Reconstruction

❌ EmployeeWizard (7-step form, 50+ fields)  
❌ EmployeeEdit (with navigation, termination)  
❌ EmployeesList (table, sort, filter, export)  
❌ EmployeesProfiles (sidebar, forms, modals)  
❌ Settings tabs (all 9 tabs need full implementation)  

---

## File Structure

```
src/
├── App.tsx                    ✅ Complete (routing)
├── main.tsx                   ✅ Complete
├── index.css                  ✅ Complete (all styles)
├── components/
│   ├── Layout.tsx             ✅ Complete
│   ├── Sidebar.tsx            ✅ Complete (all features)
│   └── ProfileSidebar.tsx     ✅ Complete (all sections)
├── contexts/
│   ├── ThemeContext.tsx        ✅ Complete
│   ├── AuthContext.tsx         ✅ Complete
│   └── SettingsContext.tsx     ✅ Complete
├── pages/
│   ├── LoginPage.tsx          ✅ Complete
│   ├── Dashboard.tsx          ✅ Complete
│   ├── EmployeeWizard.tsx     ❌ Placeholder
│   ├── EmployeeEdit.tsx       ❌ Placeholder
│   ├── EmployeesList.tsx      ❌ Placeholder
│   ├── EmployeesProfiles.tsx  ❌ Placeholder
│   ├── Attendance.tsx         ✅ Placeholder (intentional)
│   ├── RestEntitlements.tsx   ✅ Placeholder (intentional)
│   ├── Payroll.tsx            ✅ Placeholder (intentional)
│   └── Settings.tsx           ⚠️ Structure only
├── utils/
│   └── storage.ts             ✅ Complete (all utilities)
└── services/
    └── api.ts                 ✅ Complete (Employee interface)
```

---

## Key Implementation Details

### Employee Number Format
```typescript
// Auto-generate: 4 digits, zero-padded
const nextNumber = employees.length + 1;
const employeeNumber = String(nextNumber).padStart(4, '0'); // "0001"
```

### Age Calculation
```typescript
// Calculate from date of birth, update daily
const calculateAge = (dateOfBirth: string): number => {
  const parts = dateOfBirth.split('/');
  const birth = new Date(+parts[2], +parts[1]-1, +parts[0]);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};
```

### Contract End Date Calculation
```typescript
// Start date + duration + unit - 1 day
const calculateEndDate = (startDate: string, duration: string, unit: string): string => {
  const parts = startDate.split('/');
  const start = new Date(+parts[2], +parts[1]-1, +parts[0]);
  const end = new Date(start);
  
  switch (unit) {
    case 'days': end.setDate(end.getDate() + parseInt(duration) - 1); break;
    case 'months': end.setMonth(end.getMonth() + parseInt(duration)); end.setDate(end.getDate() - 1); break;
    case 'years': end.setFullYear(end.getFullYear() + parseInt(duration)); end.setDate(end.getDate() - 1); break;
  }
  
  return `${String(end.getDate()).padStart(2,'0')}/${String(end.getMonth()+1).padStart(2,'0')}/${end.getFullYear()}`;
};
```

### Basic Salary Auto-fill
```typescript
// Look up from Settings > Basic salaries
const getBasicSalary = (classification: string, degree: string): string => {
  const salaries = JSON.parse(localStorage.getItem('phoenix-hr-basic-salaries') || '{}');
  const key = `${classification}-${degree}`;
  const salary = salaries[key];
  if (salary && salary !== '') {
    // Format: "X XXX DA"
    const numStr = salary.replace(/[^\d.]/g, '');
    const parts = numStr.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${parts.join('.')} DA`;
  }
  return '0 DA';
};
```

### Phone Number Formatting
```typescript
// Format: "xx xx xx xx xx" (10 digits)
const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 4) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
  if (numbers.length <= 6) return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 6)} ${numbers.slice(6)}`;
  return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 6)} ${numbers.slice(6, 8)} ${numbers.slice(8, 10)}`;
};
```

### Social Security Number
```typescript
// Format: "xx xxxx xxxx xx" (12 digits)
// First 2 digits = birth year last 2 digits
const formatSSN = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6)}`;
  return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 10)} ${numbers.slice(10, 12)}`;
};

const validateSSN = (ssn: string, birthDate: string): boolean => {
  const numbers = ssn.replace(/\s/g, '');
  const birthYear = parseInt(birthDate.split('/')[2]);
  const yearDigits = String(birthYear).slice(-2);
  return numbers.startsWith(yearDigits);
};
```

### Date to Letters Conversion
```typescript
// "10/11/2025" → "The 10th of November, two thousand and twenty-five"
const dateToLetters = (dateStr: string): string => {
  const parts = dateStr.split('/');
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const year = parseInt(parts[2]);
  
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const suffix = (n: number) => { const s = ['th','st','nd','rd']; const v = n % 100; return s[(v-20)%10] || s[v] || s[0]; };
  
  const yearInWords = (y: number): string => {
    const yearStr = y.toString();
    const first = parseInt(yearStr.substring(0, 2));
    const second = parseInt(yearStr.substring(2, 4));
    // ... complex logic to convert year to words
    return 'two thousand and twenty-five'; // simplified
  };
  
  return `The ${day}${suffix(day)} of ${months[month]}, ${yearInWords(year)}`;
};
```

---

## localStorage Keys

```typescript
// User & Theme
'phoenix-hr-theme'              // 'light' | 'dark'
'phoenix-hr-user'               // Current user object
'phoenix-hr-primary-color'      // Selected primary color ID
'phoenix-hr-sidebar-color'      // Selected sidebar color ID
'phoenix-hr-date-format'        // 'full' | 'dd/mm/yyyy' | etc.
'phoenix-hr-time-format'        // '12h' | '24h'

// Employee Data
'phoenix-hr-employees'          // Array of all employees
'phoenix-hr-contracts'          // Object: { employeeNumber: Contract[] }
'phoenix-hr-onboarding-reports' // Object: { employeeNumber: OnboardingReport }
'phoenix-hr-personnel-records'  // Object: { employeeNumber: PersonnelRecord }
'phoenix-hr-employment-status-changes' // Object: { employeeNumber: EmploymentStatusChange[] }

// Settings
'phoenix-hr-job-titles'         // Array of job title strings
'phoenix-hr-departments-custom' // Array of Department objects
'phoenix-hr-groups-custom'      // Array of Group objects
'phoenix-hr-classification-settings' // { highestClassification, lowestDegree, highestDegree }
'phoenix-hr-basic-salaries'     // Object: { "classification-degree": salary }
'phoenix-hr-banks'              // Array of Bank objects
'phoenix-hr-administrative-decisions' // Array of Decision objects
'phoenix-hr-hourly-percentages' // Array of percentage numbers
```

---

## Critical Validation Rules

### Employee Wizard
- Age must be 18+
- Phone: 10 digits, starts with 05/06/07
- SSN: 12 digits, first 2 = birth year last 2
- Account: 20 digits
- NIN: 18 digits
- ID/License issuing date: cannot be future, cannot be 10+ years old
- Contract start date: must be after latest contract end date
- Date of issue/takes effect: must be within contract period

### Character Restrictions
- Names: Latin letters + é è à ï - (space allowed)
- Reference codes: Latin letters + numbers + é è à ï - / _
- Phone/SSN/Account/NIN: numbers only
- Email: standard email validation

### Auto-formatting
- Names: capitalize first letter of each word
- Addresses: capitalize first letter only
- Job titles: capitalize first letter of first word only
- Phone: "xx xx xx xx xx"
- SSN: "xx xxxx xxxx xx"
- Account: "xxx xxxxx xxxxxxxxxxxx"
- Basic salary: "X XXX DA"

---

## Next Steps

### Priority 1: EmployeeWizard
Reconstruct the 7-step employee wizard with:
- All 50+ fields with proper validation
- Auto-calculations (age, contract dates, basic salary)
- Auto-formatting (phone, SSN, account)
- Success modal with animations
- Auto-create contract and personnel record

### Priority 2: EmployeesList
Reconstruct the employee list with:
- Table with 50+ columns
- Sticky first 3 columns
- Sort functionality
- Filter modal
- Export to Excel/PDF
- Print functionality

### Priority 3: EmployeesProfiles
Reconstruct employee profiles with:
- Search by number/name
- Profile sidebar with 4 sections
- All forms (contract, onboarding, status change)
- Action buttons with conditional states
- All confirmation modals

### Priority 4: Settings Tabs
Reconstruct all 9 settings tabs with full CRUD operations

---

## Demo Credentials

```
Admin:   admin@phoenixhr.com / admin123
Manager: manager@phoenixhr.com / manager123
Employee: employee@phoenixhr.com / employee123
```

---

## Build Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## Documentation Files

- **PROJECT_SPECIFICATION.md** - Complete feature specifications
- **IMPLEMENTATION_STATUS.md** - Current implementation status
- **CHANGELOG.md** - Change history
- **RECOVERY_CONTEXT.md** - This file (quick reference)

---

**Recovery Completed**: 2026-02-03  
**Recovery Status**: PARTIAL (25% complete)  
**Next Priority**: Implement EmployeeWizard  
**Estimated Remaining Work**: 20-30 hours of focused development
