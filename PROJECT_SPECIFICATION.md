# Phoenix HR - Project Specification

## Project Overview
**Name:** Phoenix HR - Management Suite  
**Purpose:** Comprehensive HR management application for organizations  
**Target Platform:** Web application (future Electron wrapper for Windows desktop)

## Technology Stack
- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Routing:** react-router-dom (HashRouter)
- **Animations:** framer-motion
- **Icons:** lucide-react
- **Charts:** recharts
- **Data Export:** xlsx (Excel), jspdf + jspdf-autotable (PDF)
- **Date Utilities:** date-fns
- **State Management:** React Context API
- **Data Persistence:** localStorage

## Application Architecture

### Core Structure
```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx       # Main layout with sidebar
│   ├── Sidebar.tsx      # App navigation sidebar
│   └── ProfileSidebar.tsx # Employee profile sidebar
├── contexts/            # React Context providers
│   ├── ThemeContext.tsx  # Light/dark theme management
│   ├── AuthContext.tsx   # Authentication state
│   └── SettingsContext.tsx # Shared settings data
├── pages/              # Route components
│   ├── LoginPage.tsx
│   ├── Dashboard.tsx
│   ├── EmployeeWizard.tsx
│   ├── EmployeeEdit.tsx
│   ├── EmployeesList.tsx
│   ├── EmployeesProfiles.tsx
│   ├── Attendance.tsx
│   ├── RestEntitlements.tsx
│   ├── Payroll.tsx
│   └── Settings.tsx
├── utils/              # Utility functions
│   └── storage.ts      # All localStorage utilities
└── services/           # API services
    └── api.ts          # Employee interface & mock API
```

## Feature Specifications

### 1. Authentication System
- Mock authentication with 3 demo users (Admin, Manager, Employee)
- Session persistence via localStorage
- Protected routes with automatic redirect to login

### 2. Theme System
- Light/Dark mode toggle
- CSS custom properties for all colors
- Primary color customization (10 color options)
- Sidebar color customization (10 color options + default)
- Mutual exclusion: primary and sidebar colors cannot match
- Date/time format preferences (5 date formats, 2 time formats)
- Hourly pay percentages configuration (50-99%)
- Real-time theme application without page reload

### 3. Navigation & Layout
- Collapsible sidebar (260px expanded, 72px collapsed)
- Smooth animations for collapse/expand
- Active route highlighting with primary color
- Hover effects using primary color with opacity
- Notifications dropdown with blur backdrop
- User profile dropdown
- Real-time clock display (updates every minute)
- Date/time format follows user preferences

### 4. Dashboard (Home)
- 4 stat cards: Total Employees, Active Today, On Leave, Pending Requests
- Animated cards with gradient icons
- Trend indicators (up/down arrows with percentages)
- Welcome message with user's first name
- Responsive grid layout

### 5. Employee Management

#### 5.1 Add New Employee (7-Step Wizard)
**Step 1: Personal Info**
- Employee number (auto-generated, 4 digits, zero-padded)
- Family name, Name (Latin letters + é è à ï -, auto-capitalize)
- Father's name, Mother's family name, Mother's name
- Gender (Male/Female dropdown)
- Date of birth (dd/mm/yyyy format, auto-calculate age)
- Age validation: must be 18+
- Province/Municipality of birth
- Phone number (10 digits, format: xx xx xx xx xx, must start with 05/06/07)
- Email address (optional, auto-lowercase, validation)
- Situation (Single/Married/Divorced/Widowed)
- Number of kids (disabled if Single, 2 digits max)

**Step 2: Address**
- Home address (auto-capitalize first letter)
- Province/Municipality of residency

**Step 3: Emergency Contact**
- Contact person name (2+ words, Latin letters + special chars)
- Phone number (same format as employee phone)
- Relationship (Father/Mother/Brother/Sister/Wife/Son/Daughter/Other)
- Blood type (A+/A-/B+/B-/AB+/AB-/O+/O-)
- Chronic diseases (optional, auto-capitalize)

**Step 4: Study**
- Degree/Certification (13 options from PhD to None)
- Study field (10 words max, Latin letters + special chars)
- Issued by Institution (10 words max)
- Issued in Date (dd/mm/yyyy)

**Step 5: Job Details**
- Entry date (dd/mm/yyyy)
- Job (dropdown from Settings > Job titles)
- Classification (auto-fill from job title)
- Degree (dropdown based on Settings > Groups > lowest/highest degree)
- Group (auto-fill based on classification)
- Department (dropdown from Settings > Departments)
- Pay basis (Salaried/Hourly)
- Contractual status (Fixed-term/Permanent)
- Employment type (Full-time/Part-time)
- Hours worked per day (4-7, only if Part-time)
- Contract start date (= entry date, read-only)
- Contract duration (1-99) + unit (days/months/years)
- Contract end date (auto-calculated, read-only)
- Probationary period (1-99) + unit (days/months)
- Confirmation date (auto-calculated, read-only)
- Unsuccessful probation notice period (1-999 days)
- Resignation notice period (1-999 days)
- Purpose of appointment (auto-capitalize)
- Basic salary (auto-fill from Settings > Basic salaries, read-only)

**Step 6: Identification**
- National ID Number (NIN) - 18 digits, mandatory
- ID Number (optional)
- ID issuing date/province/municipality (required if ID Number entered)
- Driver license number (optional, auto-uppercase)
- Driver license issuing date/province/municipality (required if license entered)
- Social security number (12 digits, format: xx xxxx xxxx xx, first 2 digits = birth year last 2 digits)
- Validation: ID or Driver license required (or both)
- Document age validation: cannot be 10+ years old

**Step 7: Payment**
- Bank name (dropdown from Settings > Banks)
- Account number (20 digits, format: xxx xxxxx xxxxxxxxxxxx, disabled until bank selected)

**Wizard Features:**
- Step navigation with icons and progress indicators
- Real-time validation with error messages
- Mandatory fields marked with *
- Auto-formatting for phone numbers, SSN, account numbers
- Age auto-calculation from birth date
- Contract end date auto-calculation
- Confirmation date auto-calculation
- Basic salary auto-fill from classification + degree
- Group auto-fill from classification
- Classification auto-fill from job title
- Reset fields button
- Success modal with animation
- Auto-generate next employee number after save
- Auto-create initial contract entry
- Auto-create personnel record

#### 5.2 Edit Existing Employee
- Same 7-step wizard as Add
- Pre-populated with existing employee data
- Navigation buttons: << (first), < (previous), > (next), >> (last)
- "Edit terminated employees" checkbox (default unchecked)
- Employee number field with double-click to open selector
- Employee selector modal:
  - Shows all employees (or only terminated if checkbox checked)
  - Sort by employee number or family name (radio buttons)
  - Keyboard navigation (up/down arrows)
  - Scrollable list
  - Format: "XXXX FamilyName FirstName"
- Read-only fields: Employee number, Job, Degree, Department, Contract duration
- "Save modifications" button (disabled until changes made)
- "Cancel recent modifications" button (disabled until changes made)
- "Delete employee" button (only for last employee in numerical order)
- Delete confirmation modal
- Auto-update age calculation
- Termination section (Step 8):
  - Termination date (dd/mm/yyyy, cannot be future date)
  - Termination reason (11 options in 2 columns, radio buttons)
  - "Cancel termination" button (for terminated employees)
  - Two-step cancellation confirmation

#### 5.3 Employees' List
**Table Features:**
- 34+ columns with dynamic widths
- Sticky first 3 columns (Employee Number, Family Name, Name)
- Sortable by any column (click header: asc → desc → none)
- Default sort: Employee Number ascending
- Row height: 27px (data), 40px (header)
- Orange hover effect on rows (primary color)
- Double-click row to open employee profile
- Profile confirmation modal with blur backdrop

**Columns:**
1. Employee's Number
2. Family Name
3. Name
4. Father's Name
5. Mother's Family Name
6. Mother's Name
7. Existing/Terminated (Existing/Departing/On Leave)
8. Entry Date
9. Job
10. Department
11. Group
12. Classification
13. Degree
14. Basic Salary (auto-calculated from classification + degree)
15. Social Security Number
16. Phone Number
17. Email Address
18. Province of Residency
19. Municipality of Residency
20. Address
21. ID Number
22. Driver License Number
23. NIN
24. Gender
25. Date of Birth
26. Province of Birth
27. Municipality of Birth
28. Age (auto-calculated, updates daily)
29. Situation
30. Number of Kids
31. Blood Type
32. Chronic Diseases
33. Study Degree
34. Study Field
35. Study Institution
36. Study Date
37. Bank Name
38. Account Number
39. Contract Start Date
40. Pay Basis
41. Contractual Status
42. Employment Type
43. Hours Worked Per Day (8 for Full-time)
44. Contract Duration (None if Permanent)
45. Contract End Date (None if Permanent)
46. Probationary Period
47. Confirmation Date
48. Unsuccessful Probation Notice (days)
49. Resignation Notice (days)
50. Purpose of the Appointment
51. Date of Leaving
52. Termination reason

**Action Buttons:**
- Filter (opens modal with blur backdrop)
- Clear All (with confirmation modal)
- Export (dropdown: Excel/PDF)
- Print

**Filter Modal:**
- Two-column layout
- Left: Situation, Entry Date, Date of Birth, Age, Contract Start/End Dates, Date of Leaving Work
- Right: Job, Department, Group, Classification
- Date range pickers with validation (end > start)
- Age range: 18-99
- Classification: 1 to max from Settings
- Apply/Reset/Cancel buttons
- "Reset Filter" button appears when filter active
- "Showing X of Y employees" indicator

**Export Features:**
- Excel: All columns with headers
- PDF: Landscape A4, auto-sized columns
- Both include all employee data with calculated fields

### 6. Employee Profiles

#### 6.1 Profile Search
- Search by employee number (auto-pad to 4 digits)
- Search by family name (autocomplete dropdown)
- Double-click dropdown item to select
- Invalid number error modal
- Auto-fill all profile fields

#### 6.2 Profile Display
- 8 search boxes in single row:
  1. Employee No. (read-only)
  2. Family Name (read-only)
  3. Name (read-only)
  4. Job (read-only)
  5. Department (read-only)
  6. Group (read-only)
  7. Class-Degree (format: "XX-XX", read-only)
  8. Phone (read-only)
- All boxes centered in card

#### 6.3 Profile Sidebar
**Logo & Navigation:**
- Phoenix HR logo with flame icon
- "Show Navigation" button (opens main sidebar as overlay)
- Main sidebar slides in from right with spring animation
- Blur backdrop when sidebar open

**Expandable Sections:**

**Contracts:**
- Shows contract start dates as sub-items
- Auto-expand if empty, show "(No documents have been prepared yet)"
- Auto-collapse after 3 seconds if empty
- Lock icon for expired contracts
- Click sub-item to select contract
- Multiple sections can be expanded simultaneously
- All sections collapse when switching employees

**Contract Form:**
- Reference code (Latin letters + numbers + é è à ï - / _)
- Date of issue (dd/mm/yyyy)
- Contract start day (dd/mm/yyyy, must be after latest contract end date)
- Contract duration (1-99) + unit (days/months/years)
- Contract end date (auto-calculated, read-only)
- Purpose of appointment (auto-fill from employee, editable)
- Validation: no overlapping contracts
- First contract: start date = entry date (read-only)
- Expired contracts: cannot edit
- Add/Save/Cancel/Reset buttons
- Smooth animations with blur backdrop

**Employee Onboarding Report:**
- Only 1 report per employee
- Reference code (same validation as contracts)
- Entry date (auto-fill from first contract, read-only)
- Entry date in letters (auto-convert, e.g., "The 10th of November, two thousand and twenty-five")
- Add/Edit/View/Export PDF/Print buttons
- Delete with confirmation

**Personnel Record:**
- Static record created when employee added
- Shows contract start date
- Cannot be edited or deleted
- View/Export PDF/Print buttons enabled when selected

**Change Employment Status:**
- Check if employee is terminated (show error)
- Check if employee has active contract (show error if expired)
- Form with:
  - Current status (7 read-only fields)
  - New status (7 editable fields)
  - Takes effect date (within contract period)
- Auto-fill new group from classification
- Auto-fill new basic salary from classification + degree
- Update employee data in list
- Show reminder about financial values
- Edit/Delete/View/Export PDF/Print buttons

#### 6.4 Action Buttons
- New (enabled when section expanded, disabled for personnel record)
- Edit (enabled when item selected, disabled for expired contracts)
- Delete (enabled for contracts/onboarding/status changes, not for personnel record or first contract)
- View (enabled when item selected)
- Export as PDF (enabled when item selected)
- Print (enabled when item selected)

### 7. Settings

#### 7.1 Departments Tab
- Left: Department list table (N°, Name, Manager, Actions)
- Right: Add/Edit form
  - Department name (Latin letters + numbers, auto-capitalize)
  - Manager employee number (dropdown with "No ID" option)
  - Manager name (auto-fill or manual entry)
- Edit/Remove buttons
- Remove confirmation modal

#### 7.2 Groups and Classifications Tab
- Classification settings:
  - Highest classification (1-99)
  - Lowest degree (0-99)
  - Highest degree (must be > lowest)
  - Save button with success message
- Group management:
  - Group name (Latin letters + numbers, auto-capitalize)
  - Lowest/Highest classification (auto-suggest next available)
  - Validation: no overlapping ranges
  - Add/Edit/Remove with confirmation

#### 7.3 Job Titles Tab
- Left: Job titles list (N°, Title, Classification, Actions)
- Right: Add/Edit form
  - Job title (Latin letters only, auto-capitalize first word)
  - Classification (dropdown 1 to max)
- Auto-sort by job title
- Edit/Remove buttons

#### 7.4 Basic Salaries Tab
- Dynamic table based on classification/degree settings
- Rows: 1 to highest classification
- Columns: lowest to highest degree
- Click cell to enter salary (decimal numbers)
- Format: "X XXX" (thousands separator)
- Display: "X XXX DA" (with currency)
- Empty cells show no text
- Save button with success message
- Instructions card

#### 7.5 Banks Tab
- Left: Banks list (N°, Name, Actions)
- Right: Add/Edit form
  - Bank name (Latin letters only, auto-capitalize)
- Edit button only (no delete)

#### 7.6 Administrative Decisions Tab
- Left: Decisions list (Label, Discontinuance, Edit)
- Right: Add/Edit form
  - Decision name (Latin letters + numbers + é è à ï -)
  - "User can issue discontinuance" checkbox
- 5 default non-editable decisions:
  1. Exit clearance form
  2. Rehire decision
  3. Probationary period: Successful
  4. Probationary period: Unsuccessful
  5. Probationary period evaluation form

#### 7.7 Preferences Tab
- Primary color card (10 colors)
- Sidebar color card (10 colors + default)
- Date and time card:
  - Date format (5 options)
  - Time format (12h/24h)
- Hourly pay percentages card:
  - Input for 50-99
  - Display added percentages as tags
  - Remove with X button
  - Save/Cancel buttons
- All changes apply immediately
- Persist to localStorage

#### 7.8 Change Password Tab
- Placeholder (coming soon)

#### 7.9 Backup/Restore Tab
- Placeholder (coming soon)

### 8. Placeholder Pages
- Attendance: "Coming soon" with calendar icon
- Rest entitlements/taken: "Coming soon" with calendar icon
- Payroll: "Coming soon" with dollar icon

## Data Storage Structure

### localStorage Keys
- `phoenix-hr-theme` - Theme preference (light/dark)
- `phoenix-hr-user` - Current user session
- `phoenix-hr-employees` - All employee data
- `phoenix-hr-contracts` - All contracts by employee
- `phoenix-hr-onboarding-reports` - Onboarding reports by employee
- `phoenix-hr-personnel-records` - Personnel records by employee
- `phoenix-hr-employment-status-changes` - Status changes by employee
- `phoenix-hr-job-titles` - Job titles list
- `phoenix-hr-departments-custom` - Departments list
- `phoenix-hr-groups-custom` - Groups list
- `phoenix-hr-classification-settings` - Classification/degree settings
- `phoenix-hr-basic-salaries` - Salary matrix
- `phoenix-hr-banks` - Banks list
- `phoenix-hr-administrative-decisions` - Administrative decisions
- `phoenix-hr-primary-color` - Selected primary color
- `phoenix-hr-sidebar-color` - Selected sidebar color
- `phoenix-hr-date-format` - Date format preference
- `phoenix-hr-time-format` - Time format preference
- `phoenix-hr-hourly-percentages` - Hourly pay percentages

## UI/UX Specifications

### Design System
- Glass morphism cards with backdrop blur
- Phoenix orange gradient (#f97316 → #ea580c)
- Rounded corners (xl = 12px, 2xl = 16px)
- Smooth transitions (0.2-0.3s)
- Hover effects with scale transforms
- Focus rings with primary color
- Error states with red borders
- Disabled states with reduced opacity

### Animations
- Fade in/up for page transitions
- Scale + fade for modals
- Spring physics for sidebar slide
- Blur backdrop for overlays
- Pulse animation for notification dots
- Glow animation for active icons

### Responsive Behavior
- Sidebar collapses on small screens
- Grid layouts adapt to screen size
- Tables scroll horizontally
- Modals centered with padding

### Accessibility
- Keyboard navigation for dropdowns
- Focus indicators on all interactive elements
- ARIA labels where appropriate
- Color contrast compliance
- Screen reader friendly structure

## Future Enhancements (Not Yet Implemented)
- Work Certificate (Termination) form
- French and Arabic language support
- Server integration for multi-user support
- Subscription management
- Email notifications
- Advanced reporting
- Document attachment system
- Approval workflows
- Time tracking
- Performance reviews
