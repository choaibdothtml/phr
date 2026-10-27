import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, ArrowUpDown, ArrowUp, ArrowDown, Printer, ChevronDown, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api, Employee } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  column: keyof Employee | null;
  direction: SortDirection;
}

function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;
  
  // Parse dd/mm/yyyy format
  const parts = dateOfBirth.split('/');
  if (parts.length !== 3) return 0;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JavaScript
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return 0;
  
  const today = new Date();
  const birth = new Date(year, month, day);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function EmployeesList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState<SortState>({ column: 'employeeNumber', direction: 'asc' });
  const [showProfileConfirm, setShowProfileConfirm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const [stickyColumnPositions, setStickyColumnPositions] = useState<number[]>([0, 0, 0]);
  const { jobTitles, departments, groups, maxClassification } = useSettings();
  
  // Track current date to force age recalculation at midnight
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());
  useEffect(() => {
    // Check every minute if the date has changed
    const interval = setInterval(() => {
      const newDate = new Date().toDateString();
      if (newDate !== currentDate) {
        setCurrentDate(newDate);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [currentDate]);

  useEffect(() => {
    // Load employees from localStorage first
    const savedEmployees = localStorage.getItem('phoenix-hr-employees');
    if (savedEmployees) {
      const employeesFromStorage = JSON.parse(savedEmployees);
      setEmployees(employeesFromStorage);
      setFilteredEmployees(employeesFromStorage);
      setLoading(false);
    } else {
      // Fallback to API if no localStorage data
      api.employees.getAll().then(data => {
        setEmployees(data);
        setFilteredEmployees(data);
        setLoading(false);
      });
    }
  }, [location.key]); // Reload when location changes (e.g., when navigating from wizard)

  // Calculate sticky column positions after render
  useEffect(() => {
    if (tableRef.current && !loading) {
      // Use setTimeout to ensure table is fully rendered
      setTimeout(() => {
        const table = tableRef.current?.querySelector('table');
        if (table) {
          const headerCells = table.querySelectorAll('thead th');
          const positions: number[] = [];
          let currentLeft = 0;
          
          for (let i = 0; i < 3; i++) {
            positions.push(currentLeft);
            if (headerCells[i]) {
              currentLeft += (headerCells[i] as HTMLElement).offsetWidth;
            }
          }
          
          setStickyColumnPositions(positions);
        }
      }, 0);
    }
  }, [loading, filteredEmployees, sort]);

  const handleSort = (column: keyof Employee) => {
    if (sort.column === column) {
      if (sort.direction === 'asc') {
        setSort({ column, direction: 'desc' });
      } else if (sort.direction === 'desc') {
        setSort({ column: null, direction: null });
      } else {
        setSort({ column, direction: 'asc' });
      }
    } else {
      setSort({ column, direction: 'asc' });
    }
  };

  const getSortedEmployees = () => {
    if (!sort.column || !sort.direction) return filteredEmployees;

    return [...filteredEmployees].sort((a, b) => {
      const aVal = a[sort.column!];
      const bVal = b[sort.column!];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });
  };

  const exportToExcel = () => {
    const dataToExport = getSortedEmployees().map(emp => ({
      'Employee Number': emp.employeeNumber,
      'Family Name': emp.lastName,
      'Name': emp.firstName,
      'Existing/Departing': emp.status === 'active' ? 'Existing' : emp.status === 'terminated' ? 'Departing' : emp.status === 'on-leave' ? 'On Leave' : '',
      'Entry Date': emp.joinDate,
      'Job': emp.position,
      'Department': emp.department,
      'Group': emp.group,
      'Classification': emp.classification || '',
      'Degree': emp.degree || '',
      'Social Security Number': emp.socialSecurityNumber || '',
      'Phone Number': emp.phone,
      'Email Address': emp.email,
      'Province of Residency': emp.provinceOfResidency || '',
      'Municipality of Residency': emp.municipalityOfResidency || '',
      'Address': emp.address || '',
      'ID Number': emp.idNumber || '',
      'Driver License Number': emp.driverLicenseNumber || '',
      'NIN': emp.nationalIdNumber || '',
      'Gender': emp.gender || '',
      'Date of Birth': emp.dateOfBirth || '',
      'Province of Birth': emp.provinceOfBirth || '',
      'Municipality of Birth': emp.municipalityOfBirth || '',
      'Age': emp.dateOfBirth ? calculateAge(emp.dateOfBirth) : '',
      'Situation': emp.situation || '',
      'Number of Kids': emp.numberOfKids || 0,
      'Blood Type': emp.bloodType || '',
      'Chronic Diseases': emp.chronicDiseases || '',
      'Bank Name': emp.bankName || '',
      'Account Number': emp.accountNumber || '',
      'Current Contract Start Date': emp.currentContractStartDate || '',
      'Current Contract End Date': emp.currentContractEndDate || '',
      'Date of Leaving Work': emp.dateOfLeavingWork || '',
      'Reason for Leaving': emp.reasonForLeaving || '',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, 'employees_list.xlsx');
    setShowExportDropdown(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const dataToExport = getSortedEmployees().map(emp => [
      emp.employeeNumber,
      emp.lastName,
      emp.firstName,
      emp.status === 'active' ? 'Existing' : emp.status === 'terminated' ? 'Departing' : emp.status === 'on-leave' ? 'On Leave' : '',
      emp.joinDate,
      emp.position,
      emp.department,
      emp.group,
      emp.classification || '',
      emp.degree || '',
      emp.socialSecurityNumber || '',
      emp.phone,
      emp.email,
      emp.provinceOfResidency || '',
      emp.municipalityOfResidency || '',
      emp.address || '',
      emp.idNumber || '',
      emp.driverLicenseNumber || '',
      emp.nationalIdNumber || '',
      emp.gender || '',
      emp.dateOfBirth || '',
      emp.provinceOfBirth || '',
      emp.municipalityOfBirth || '',
      emp.dateOfBirth ? calculateAge(emp.dateOfBirth).toString() : '',
      emp.situation || '',
      emp.numberOfKids?.toString() || '0',
      emp.bloodType || '',
      emp.chronicDiseases || '',
      emp.bankName || '',
      emp.accountNumber || '',
      emp.currentContractStartDate || '',
      emp.currentContractEndDate || '',
      emp.dateOfLeavingWork || '',
      emp.reasonForLeaving || '',
    ]);

    const headers = [[
      'Employee Number', 'Family Name', 'Name', 'Existing/Departing', 'Entry Date',
      'Job', 'Department', 'Group', 'Classification', 'Degree',
      'Social Security Number', 'Phone Number', 'Email Address',
      'Province of Residency', 'Municipality of Residency', 'Address',
      'ID Number', 'Driver License Number', 'NIN', 'Gender',
      'Date of Birth', 'Province of Birth', 'Municipality of Birth', 'Age',
      'Situation', 'Number of Kids', 'Blood Type', 'Chronic Diseases',
      'Bank Name', 'Account Number', 'Contract Start Date', 'Contract End Date',
      'Date of Leaving', 'Reason for Leaving'
    ]];

    autoTable(doc, {
      head: headers,
      body: dataToExport,
      startY: 20,
      styles: { fontSize: 6, cellPadding: 1 },
      headStyles: { fillColor: [249, 115, 22], fontSize: 7 },
      margin: { top: 20 }
    });

    doc.save('employees_list.pdf');
    setShowExportDropdown(false);
  };

  const handleRowDoubleClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowProfileConfirm(true);
  };

  const handleConfirmProfile = () => {
    if (selectedEmployee) {
      // Save current sort to localStorage
      localStorage.setItem('employeesListSort', JSON.stringify(sort));
      localStorage.setItem('employeesListFrom', 'list');
      
      // Navigate to profile
      navigate('/employees/profiles', { 
        state: { employee: selectedEmployee } 
      });
    }
    setShowProfileConfirm(false);
    setSelectedEmployee(null);
  };

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear all employees
  const handleClearAllEmployees = () => {
    localStorage.removeItem('phoenix-hr-employees');
    setEmployees([]);
    setFilteredEmployees([]);
    setSort({ column: 'employeeNumber', direction: 'asc' });
    setShowClearConfirm(false);
  };

  const columns: { key: keyof Employee; label: string; width: number }[] = [
    { key: 'employeeNumber', label: "Employee's Number", width: 120 },
    { key: 'lastName', label: 'Family Name', width: 130 },
    { key: 'firstName', label: 'Name', width: 120 },
    { key: 'status', label: 'Existing/Departing', width: 140 },
    { key: 'joinDate', label: 'Entry Date', width: 110 },
    { key: 'position', label: 'Job', width: 150 },
    { key: 'department', label: 'Department', width: 140 },
    { key: 'group', label: 'Group', width: 130 },
    { key: 'classification', label: 'Classification', width: 110 },
    { key: 'degree', label: 'Degree', width: 160 },
    { key: 'socialSecurityNumber', label: 'Social Security Number', width: 160 },
    { key: 'phone', label: 'Phone Number', width: 130 },
    { key: 'email', label: 'Email Address', width: 200 },
    { key: 'provinceOfResidency', label: 'Province of Residency', width: 160 },
    { key: 'municipalityOfResidency', label: 'Municipality of Residency', width: 180 },
    { key: 'address', label: 'Address', width: 200 },
    { key: 'idNumber', label: 'ID Number', width: 110 },
    { key: 'driverLicenseNumber', label: 'Driver License Number', width: 150 },
    { key: 'nationalIdNumber', label: 'NIN', width: 160 },
    { key: 'gender', label: 'Gender', width: 100 },
    { key: 'dateOfBirth', label: 'Date of Birth', width: 120 },
    { key: 'provinceOfBirth', label: 'Province of Birth', width: 150 },
    { key: 'municipalityOfBirth', label: 'Municipality of Birth', width: 170 },
    { key: 'dateOfBirth', label: 'Age', width: 80 },
    { key: 'situation', label: 'Situation', width: 120 },
    { key: 'numberOfKids', label: 'Number of Kids', width: 130 },
    { key: 'bloodType', label: 'Blood Type', width: 100 },
    { key: 'chronicDiseases', label: 'Chronic Diseases', width: 150 },
    { key: 'bankName', label: 'Bank Name', width: 130 },
    { key: 'accountNumber', label: 'Account Number', width: 140 },
    { key: 'currentContractStartDate', label: 'Contract Start Date', width: 150 },
    { key: 'currentContractEndDate', label: 'Contract End Date', width: 150 },
    { key: 'dateOfLeavingWork', label: 'Date of Leaving', width: 130 },
    { key: 'reasonForLeaving', label: 'Reason for Leaving', width: 160 },
  ];

  const getCellValue = (emp: Employee, col: typeof columns[0]) => {
    if (col.label === 'Age') {
      return emp.dateOfBirth ? calculateAge(emp.dateOfBirth) : '-';
    }
    if (col.label === 'Existing/Departing') {
      if (emp.status === 'active') return 'Existing';
      if (emp.status === 'terminated') return 'Departing';
      if (emp.status === 'on-leave') return 'On Leave';
      return '-';
    }
    const val = emp[col.key];
    return val !== undefined && val !== null && val !== '' ? val : '-';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-phoenix-200 border-t-phoenix-500 rounded-full animate-spin" />
      </div>
    );
  }

  const sortedEmployees = getSortedEmployees();

  return (
    <div className="px-6 pt-6 pb-0 h-full flex flex-col animate-fade-in-up">
      {/* Action Buttons - right aligned */}
      <div className="flex items-center justify-end gap-3 mb-4">
        <button
          onClick={() => setShowClearConfirm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
          style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444'
          }}
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
        <div className="relative" ref={exportDropdownRef}>
          <button
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-105 hover:shadow-lg"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <Download className="w-4 h-4" />
            Export
            <ChevronDown className="w-4 h-4" />
          </button>
          
          <AnimatePresence>
            {showExportDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50"
                style={{ 
                  background: 'var(--bg-popup)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <button
                  onClick={exportToExcel}
                  className="w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center gap-3"
                  style={{ 
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M9,13V15H11V13H9M9,17V19H11V17H9M13,13V15H15V13H13M13,17V19H15V17H13Z" />
                  </svg>
                  Export as Excel file
                </button>
                <button
                  onClick={exportToPDF}
                  className="w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center gap-3"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,13H9V14.5H10V13M10,17H9V18.5H10V17M15,13H13V14.5H15V13M15,17H13V18.5H15V17Z" />
                  </svg>
                  Export as PDF file
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
          style={{ 
            background: 'var(--bg-tertiary)', 
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)'
          }}
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      {/* Table - fills remaining height */}
      <div 
        ref={tableRef}
        className="glass-card overflow-hidden flex-1 flex flex-col min-h-0"
        style={{ border: '1px solid var(--border-color)' }}
      >
        <div className="overflow-auto flex-1">
          <table className="border-collapse w-full">
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={`${col.key}-${idx}`}
                    className={`px-3 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none transition-colors hover:bg-[var(--bg-tertiary)] whitespace-nowrap ${
                      idx < 3 ? 'sticky z-10' : ''
                    }`}
                    style={{ 
                      color: 'var(--text-tertiary)',
                      background: idx < 3 ? 'var(--bg-solid-primary)' : 'var(--bg-card)',
                      borderBottom: '2px solid var(--border-color)',
                      left: idx < 3 ? `${stickyColumnPositions[idx]}px` : undefined,
                      height: '40px',
                      lineHeight: '1.2',
                    }}
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      {sort.column === col.key && sort.direction === 'asc' && <ArrowUp className="w-3 h-3 text-phoenix-500" />}
                      {sort.column === col.key && sort.direction === 'desc' && <ArrowDown className="w-3 h-3 text-phoenix-500" />}
                      {sort.column !== col.key && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedEmployees.length > 0 ? (
                sortedEmployees.map((emp, rowIdx) => (
                  <tr 
                    key={emp.id} 
                    className="transition-colors employee-row cursor-pointer"
                    onDoubleClick={() => handleRowDoubleClick(emp)}
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={`${col.key}-${colIdx}`}
                        className={`px-3 text-sm whitespace-nowrap ${
                          colIdx < 3 ? 'sticky z-[5]' : ''
                        }`}
                        style={{ 
                          color: 'var(--text-primary)',
                          background: colIdx < 3 ? (rowIdx % 2 === 0 ? 'var(--bg-solid-primary)' : 'var(--bg-solid-secondary)') : 'transparent',
                          borderBottom: '1px solid var(--border-subtle)',
                          left: colIdx < 3 ? `${stickyColumnPositions[colIdx]}px` : undefined,
                          fontWeight: colIdx < 3 ? 500 : 400,
                          height: '27px',
                          lineHeight: '1.2',
                        }}
                      >
                        {getCellValue(emp, col)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16 text-center">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      No results found, please edit the filter
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Confirmation Modal */}
      {createPortal(
        <AnimatePresence>
          {showProfileConfirm && selectedEmployee && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[60]"
                style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
                onClick={() => setShowProfileConfirm(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
              >
                <div 
                  className="w-full max-w-md rounded-2xl p-6 pointer-events-auto"
                  style={{ 
                    background: 'var(--bg-popup)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(var(--primary-color-rgb), 0.1)' }}>
                    <svg className="w-8 h-8" style={{ color: 'var(--phoenix-500)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Open Employee Profile
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Would you like to open {selectedEmployee.employeeNumber} {selectedEmployee.lastName} {selectedEmployee.firstName}'s profile?
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowProfileConfirm(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                    style={{ 
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    No
                  </button>
                  <button
                    onClick={handleConfirmProfile}
                    className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      , document.body)}

      {/* Clear All Confirmation Modal */}
      {createPortal(
        <AnimatePresence>
          {showClearConfirm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[60]"
                style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
                onClick={() => setShowClearConfirm(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
              >
                <div 
                  className="w-full max-w-md rounded-2xl p-6 pointer-events-auto"
                  style={{ 
                    background: 'var(--bg-popup)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                      <Trash2 className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Clear All Employees
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Are you sure you want to delete all employees? This action cannot be undone.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                      style={{ 
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearAllEmployees}
                      className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg"
                      style={{ background: '#ef4444' }}
                    >
                      Delete All
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      , document.body)}
    </div>
  );
}
