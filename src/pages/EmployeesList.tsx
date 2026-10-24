import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Download, Filter, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { api, Employee } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';
import * as XLSX from 'xlsx';

interface FilterState {
  situation: string;
  entryDateFrom: string;
  entryDateTo: string;
  dateOfBirthFrom: string;
  dateOfBirthTo: string;
  ageFrom: string;
  ageTo: string;
  contractStartFrom: string;
  contractStartTo: string;
  contractEndFrom: string;
  contractEndTo: string;
  leavingDateFrom: string;
  leavingDateTo: string;
  job: string;
  department: string;
  group: string;
  classification: string;
}

const defaultFilter: FilterState = {
  situation: '',
  entryDateFrom: '',
  entryDateTo: '',
  dateOfBirthFrom: '',
  dateOfBirthTo: '',
  ageFrom: '',
  ageTo: '',
  contractStartFrom: '',
  contractStartTo: '',
  contractEndFrom: '',
  contractEndTo: '',
  leavingDateFrom: '',
  leavingDateTo: '',
  job: '',
  department: '',
  group: '',
  classification: '',
};

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  column: keyof Employee | null;
  direction: SortDirection;
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function EmployeesList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState<FilterState>(defaultFilter);
  const [appliedFilter, setAppliedFilter] = useState<FilterState | null>(null);
  const [sort, setSort] = useState<SortState>({ column: null, direction: null });
  const tableRef = useRef<HTMLDivElement>(null);
  const { jobTitles, departments, groups, maxClassification } = useSettings();

  useEffect(() => {
    api.employees.getAll().then(data => {
      setEmployees(data);
      setFilteredEmployees(data);
      setLoading(false);
    });
  }, []);

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

  const applyFilter = () => {
    let result = [...employees];

    if (filter.situation) {
      result = result.filter(emp => {
        if (filter.situation === 'existing') return emp.status !== 'terminated';
        if (filter.situation === 'terminated') return emp.status === 'terminated';
        return true;
      });
    }

    if (filter.entryDateFrom) {
      result = result.filter(emp => emp.joinDate >= filter.entryDateFrom);
    }
    if (filter.entryDateTo) {
      result = result.filter(emp => emp.joinDate <= filter.entryDateTo);
    }

    if (filter.dateOfBirthFrom) {
      result = result.filter(emp => emp.dateOfBirth && emp.dateOfBirth >= filter.dateOfBirthFrom);
    }
    if (filter.dateOfBirthTo) {
      result = result.filter(emp => emp.dateOfBirth && emp.dateOfBirth <= filter.dateOfBirthTo);
    }

    if (filter.ageFrom) {
      const minAge = parseInt(filter.ageFrom);
      result = result.filter(emp => emp.dateOfBirth && calculateAge(emp.dateOfBirth) >= minAge);
    }
    if (filter.ageTo) {
      const maxAge = parseInt(filter.ageTo);
      result = result.filter(emp => emp.dateOfBirth && calculateAge(emp.dateOfBirth) <= maxAge);
    }

    if (filter.contractStartFrom) {
      result = result.filter(emp => emp.currentContractStartDate && emp.currentContractStartDate >= filter.contractStartFrom);
    }
    if (filter.contractStartTo) {
      result = result.filter(emp => emp.currentContractStartDate && emp.currentContractStartDate <= filter.contractStartTo);
    }

    if (filter.contractEndFrom) {
      result = result.filter(emp => emp.currentContractEndDate && emp.currentContractEndDate >= filter.contractEndFrom);
    }
    if (filter.contractEndTo) {
      result = result.filter(emp => emp.currentContractEndDate && emp.currentContractEndDate <= filter.contractEndTo);
    }

    if (filter.leavingDateFrom) {
      result = result.filter(emp => emp.dateOfLeavingWork && emp.dateOfLeavingWork >= filter.leavingDateFrom);
    }
    if (filter.leavingDateTo) {
      result = result.filter(emp => emp.dateOfLeavingWork && emp.dateOfLeavingWork <= filter.leavingDateTo);
    }

    if (filter.job) {
      result = result.filter(emp => emp.position === filter.job);
    }
    if (filter.department) {
      result = result.filter(emp => emp.department === filter.department);
    }
    if (filter.group) {
      result = result.filter(emp => emp.group === filter.group);
    }
    if (filter.classification) {
      result = result.filter(emp => emp.classification === filter.classification);
    }

    setFilteredEmployees(result);
    setAppliedFilter({ ...filter });
    setShowFilter(false);
  };

  const resetFilter = () => {
    setFilter(defaultFilter);
    setFilteredEmployees(employees);
    setAppliedFilter(null);
  };

  const cancelFilter = () => {
    setFilter(appliedFilter || defaultFilter);
    setShowFilter(false);
  };

  const exportToExcel = () => {
    const dataToExport = getSortedEmployees().map(emp => ({
      'Employee Number': emp.employeeNumber,
      'Family Name': emp.lastName,
      'Name': emp.firstName,
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
  };

  const columns: { key: keyof Employee; label: string; width: number }[] = [
    { key: 'employeeNumber', label: "Employee's Number", width: 120 },
    { key: 'lastName', label: 'Family Name', width: 130 },
    { key: 'firstName', label: 'Name', width: 120 },
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

  // Calculate cumulative left positions for sticky columns
  const stickyColumnPositions = [
    0, // Column 0 (Employee Number)
    columns[0].width, // Column 1 (Family Name)
    columns[0].width + columns[1].width, // Column 2 (Name)
  ];

  const getCellValue = (emp: Employee, col: typeof columns[0]) => {
    if (col.label === 'Age') {
      return emp.dateOfBirth ? calculateAge(emp.dateOfBirth) : '-';
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
  const isFiltered = appliedFilter !== null;

  return (
    <div className="px-6 pt-6 pb-0 h-full flex flex-col animate-fade-in-up">
      {/* Action Buttons - right aligned */}
      <div className="flex items-center justify-end gap-3 mb-4">
        {isFiltered && (
          <span className="text-xs font-medium px-3 py-1.5 rounded-lg mr-auto" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            Showing {filteredEmployees.length} of {employees.length} employees
          </span>
        )}
        {isFiltered && (
          <button
            onClick={resetFilter}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444'
            }}
          >
            <X className="w-4 h-4" />
            Reset Filter
          </button>
        )}
        <button
          onClick={() => setShowFilter(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
          style={{ 
            background: 'var(--bg-tertiary)', 
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)'
          }}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-105 hover:shadow-lg"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      {/* Table - fills remaining height */}
      <div 
        ref={tableRef}
        className="glass-card overflow-hidden flex-1 flex flex-col min-h-0"
        style={{ border: '1px solid var(--border-color)' }}
      >
        <div className="overflow-auto flex-1 h-full">
          <table className="w-full border-collapse" style={{ minWidth: '3600px', height: '100%' }}>
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={`${col.key}-${idx}`}
                    className={`px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none transition-colors hover:bg-[var(--bg-tertiary)] ${
                      idx < 3 ? 'sticky z-10' : ''
                    }`}
                    style={{ 
                      color: 'var(--text-tertiary)',
                      background: idx < 3 ? 'var(--bg-solid-primary)' : 'var(--bg-card)',
                      borderBottom: '2px solid var(--border-color)',
                      left: idx < 3 ? `${stickyColumnPositions[idx]}px` : undefined,
                      width: `${col.width}px`,
                      minWidth: `${col.width}px`,
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
                  <tr key={emp.id} className="transition-colors employee-row">
                    {columns.map((col, colIdx) => (
                      <td
                        key={`${col.key}-${colIdx}`}
                        className={`px-3 py-2.5 text-xs ${
                          colIdx < 3 ? 'sticky z-[5]' : ''
                        }`}
                        style={{ 
                          color: 'var(--text-primary)',
                          background: colIdx < 3 ? (rowIdx % 2 === 0 ? 'var(--bg-solid-primary)' : 'var(--bg-solid-secondary)') : 'transparent',
                          borderBottom: '1px solid var(--border-subtle)',
                          left: colIdx < 3 ? `${stickyColumnPositions[colIdx]}px` : undefined,
                          width: `${col.width}px`,
                          minWidth: `${col.width}px`,
                          fontWeight: colIdx < 3 ? 500 : 400,
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

      {/* Full-screen blur overlay + Modal (both portaled to body) */}
      {showFilter && createPortal(
        <>
          {/* Blur overlay - covers everything including sidebars */}
          <div className="fixed inset-0 z-40" style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }} />
          
          {/* Modal - sits on top of blur, NOT blurred */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in-up rounded-2xl" style={{ background: 'var(--bg-popup)', border: '1px solid var(--border-color)' }}>
            <div className="p-6 grid grid-cols-2 gap-8">
              {/* Left side */}
              <div className="space-y-5">
                
                {/* Situation */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Situation</label>
                  <select
                    value={filter.situation}
                    onChange={(e) => setFilter({ ...filter, situation: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    <option value="">All</option>
                    <option value="existing">Existing employees</option>
                    <option value="terminated">Terminated employees</option>
                  </select>
                </div>

                {/* Entry Date */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Entry Date</label>
                  <div className="flex items-center gap-2">
                    <input type="date" value={filter.entryDateFrom} onChange={(e) => setFilter({ ...filter, entryDateFrom: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>to</span>
                    <input type="date" value={filter.entryDateTo} onChange={(e) => setFilter({ ...filter, entryDateTo: e.target.value })}
                      min={filter.entryDateFrom}
                      className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Date of Birth</label>
                  <div className="flex items-center gap-2">
                    <input type="date" value={filter.dateOfBirthFrom} onChange={(e) => setFilter({ ...filter, dateOfBirthFrom: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>to</span>
                    <input type="date" value={filter.dateOfBirthTo} onChange={(e) => setFilter({ ...filter, dateOfBirthTo: e.target.value })}
                      min={filter.dateOfBirthFrom}
                      className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Age</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min="18" max="99" value={filter.ageFrom} onChange={(e) => setFilter({ ...filter, ageFrom: e.target.value })}
                      placeholder="18" className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>to</span>
                    <input type="number" min="19" max="99" value={filter.ageTo} onChange={(e) => setFilter({ ...filter, ageTo: e.target.value })}
                      placeholder="99" className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                </div>

                {/* Contract Start Date */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Contract Start Date</label>
                  <div className="flex items-center gap-2">
                    <input type="date" value={filter.contractStartFrom} onChange={(e) => setFilter({ ...filter, contractStartFrom: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>to</span>
                    <input type="date" value={filter.contractStartTo} onChange={(e) => setFilter({ ...filter, contractStartTo: e.target.value })}
                      min={filter.contractStartFrom}
                      className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                </div>

                {/* Contract End Date */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Contract End Date</label>
                  <div className="flex items-center gap-2">
                    <input type="date" value={filter.contractEndFrom} onChange={(e) => setFilter({ ...filter, contractEndFrom: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>to</span>
                    <input type="date" value={filter.contractEndTo} onChange={(e) => setFilter({ ...filter, contractEndTo: e.target.value })}
                      min={filter.contractEndFrom}
                      className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                </div>

                {/* Date of Leaving Work */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Date of Leaving Work</label>
                  <div className="flex items-center gap-2">
                    <input type="date" value={filter.leavingDateFrom} onChange={(e) => setFilter({ ...filter, leavingDateFrom: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>to</span>
                    <input type="date" value={filter.leavingDateTo} onChange={(e) => setFilter({ ...filter, leavingDateTo: e.target.value })}
                      min={filter.leavingDateFrom}
                      className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div className="space-y-5">
                {/* Job */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Job</label>
                  <select
                    value={filter.job}
                    onChange={(e) => setFilter({ ...filter, job: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    <option value="">All Jobs</option>
                    {jobTitles.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Department</label>
                  <select
                    value={filter.department}
                    onChange={(e) => setFilter({ ...filter, department: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Group */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Group</label>
                  <select
                    value={filter.group}
                    onChange={(e) => setFilter({ ...filter, group: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    <option value="">All Groups</option>
                    {groups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                {/* Classification */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Classification (1 - {maxClassification})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxClassification}
                    value={filter.classification}
                    onChange={(e) => setFilter({ ...filter, classification: e.target.value })}
                    placeholder={`1 to ${maxClassification}`}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-6 flex justify-center gap-3">
              <button
                onClick={cancelFilter}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={resetFilter}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
              >
                Reset Filter
              </button>
              <button
                onClick={applyFilter}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg"
                style={{ background: 'var(--gradient-primary)' }}
              >
                Apply Filter
              </button>
            </div>
          </div>
          </div>
        </>
      , document.body)}
    </div>
  );
}
