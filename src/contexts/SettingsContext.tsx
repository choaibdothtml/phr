import { createContext, useContext, useState, ReactNode } from 'react';

interface Department {
  id: string;
  name: string;
  managerName: string;
  managerEmployeeNumber: string;
}

interface SettingsContextType {
  jobTitles: string[];
  departments: Department[];
  groups: string[];
  maxClassification: number;
  addJobTitle: (title: string) => void;
  removeJobTitle: (title: string) => void;
  addDepartment: (dept: Department) => void;
  updateDepartment: (id: string, dept: Department) => void;
  removeDepartment: (id: string) => void;
  addGroup: (group: string) => void;
  removeGroup: (group: string) => void;
  setMaxClassification: (max: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [jobTitles, setJobTitles] = useState<string[]>(() => {
    const stored = localStorage.getItem('phoenix-hr-job-titles');
    return stored ? JSON.parse(stored) : [
      'HR Director', 'Senior Developer', 'UI/UX Designer', 'Backend Developer',
      'Marketing Manager', 'Financial Analyst', 'Graphic Designer', 'DevOps Engineer',
      'HR Specialist', 'Content Strategist'
    ];
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const stored = localStorage.getItem('phoenix-hr-departments');
    return stored ? JSON.parse(stored) : [
      { id: '1', name: 'Human Resources', managerName: 'Sarah Mitchell', managerEmployeeNumber: '0001' },
      { id: '2', name: 'Engineering', managerName: 'James Rodriguez', managerEmployeeNumber: '0002' },
      { id: '3', name: 'Design', managerName: 'Emily Chen', managerEmployeeNumber: '0003' },
      { id: '4', name: 'Marketing', managerName: 'Lisa Park', managerEmployeeNumber: '0005' },
      { id: '5', name: 'Finance', managerName: 'David Wilson', managerEmployeeNumber: '0006' },
    ];
  });

  const [groups, setGroups] = useState<string[]>(() => {
    const stored = localStorage.getItem('phoenix-hr-groups');
    return stored ? JSON.parse(stored) : [
      'Management', 'Backend', 'UI Team', 'Digital Marketing', 'Accounting',
      'Creative', 'Infrastructure', 'Recruitment', 'Content'
    ];
  });

  const [maxClassification, setMaxClassificationState] = useState<number>(() => {
    const stored = localStorage.getItem('phoenix-hr-max-classification');
    return stored ? parseInt(stored) : 5;
  });

  const addJobTitle = (title: string) => {
    const updated = [...jobTitles, title];
    setJobTitles(updated);
    localStorage.setItem('phoenix-hr-job-titles', JSON.stringify(updated));
  };

  const removeJobTitle = (title: string) => {
    const updated = jobTitles.filter(t => t !== title);
    setJobTitles(updated);
    localStorage.setItem('phoenix-hr-job-titles', JSON.stringify(updated));
  };

  const addDepartment = (dept: Department) => {
    const updated = [...departments, dept];
    setDepartments(updated);
    localStorage.setItem('phoenix-hr-departments', JSON.stringify(updated));
  };

  const updateDepartment = (id: string, dept: Department) => {
    const updated = departments.map(d => d.id === id ? dept : d);
    setDepartments(updated);
    localStorage.setItem('phoenix-hr-departments', JSON.stringify(updated));
  };

  const removeDepartment = (id: string) => {
    const updated = departments.filter(d => d.id !== id);
    setDepartments(updated);
    localStorage.setItem('phoenix-hr-departments', JSON.stringify(updated));
  };

  const addGroup = (group: string) => {
    const updated = [...groups, group];
    setGroups(updated);
    localStorage.setItem('phoenix-hr-groups', JSON.stringify(updated));
  };

  const removeGroup = (group: string) => {
    const updated = groups.filter(g => g !== group);
    setGroups(updated);
    localStorage.setItem('phoenix-hr-groups', JSON.stringify(updated));
  };

  const setMaxClassification = (max: number) => {
    setMaxClassificationState(max);
    localStorage.setItem('phoenix-hr-max-classification', max.toString());
  };

  return (
    <SettingsContext.Provider value={{
      jobTitles,
      departments,
      groups,
      maxClassification,
      addJobTitle,
      removeJobTitle,
      addDepartment,
      updateDepartment,
      removeDepartment,
      addGroup,
      removeGroup,
      setMaxClassification,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
