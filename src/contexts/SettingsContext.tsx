import { createContext, useContext, useState, ReactNode } from 'react';
interface Department { id: string; name: string; managerName: string; managerEmployeeNumber: string; }
interface SettingsContextType {
  jobTitles: string[]; departments: Department[]; groups: string[]; maxClassification: number;
  addJobTitle: (t: string) => void; removeJobTitle: (t: string) => void;
  addDepartment: (d: Department) => void; removeDepartment: (id: string) => void;
  addGroup: (g: string) => void; removeGroup: (g: string) => void;
  setMaxClassification: (m: number) => void;
}
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [jobTitles, setJobTitles] = useState<string[]>(() => JSON.parse(localStorage.getItem('phoenix-hr-job-titles') || '[]'));
  const [departments, setDepartments] = useState<Department[]>(() => JSON.parse(localStorage.getItem('phoenix-hr-departments-custom') || '[]'));
  const [groups, setGroups] = useState<string[]>(() => JSON.parse(localStorage.getItem('phoenix-hr-groups-custom') || '[]'));
  const [maxClassification, setMaxClass] = useState<number>(() => {
    const s = localStorage.getItem('phoenix-hr-classification-settings');
    return s ? JSON.parse(s).highestClassification || 0 : 0;
  });
  const addJobTitle = (t: string) => { const u = [...jobTitles, t]; setJobTitles(u); localStorage.setItem('phoenix-hr-job-titles', JSON.stringify(u)); };
  const removeJobTitle = (t: string) => { const u = jobTitles.filter(x => x !== t); setJobTitles(u); localStorage.setItem('phoenix-hr-job-titles', JSON.stringify(u)); };
  const addDepartment = (d: Department) => { const u = [...departments, d]; setDepartments(u); localStorage.setItem('phoenix-hr-departments-custom', JSON.stringify(u)); };
  const removeDepartment = (id: string) => { const u = departments.filter(d => d.id !== id); setDepartments(u); localStorage.setItem('phoenix-hr-departments-custom', JSON.stringify(u)); };
  const addGroup = (g: string) => { const u = [...groups, g]; setGroups(u); localStorage.setItem('phoenix-hr-groups-custom', JSON.stringify(u)); };
  const removeGroup = (g: string) => { const u = groups.filter(x => x !== g); setGroups(u); localStorage.setItem('phoenix-hr-groups-custom', JSON.stringify(u)); };
  const setMaxClassification = (m: number) => { setMaxClass(m); const s = JSON.parse(localStorage.getItem('phoenix-hr-classification-settings') || '{}'); s.highestClassification = m; localStorage.setItem('phoenix-hr-classification-settings', JSON.stringify(s)); };
  return <SettingsContext.Provider value={{ jobTitles, departments, groups, maxClassification, addJobTitle, removeJobTitle, addDepartment, removeDepartment, addGroup, removeGroup, setMaxClassification }}>{children}</SettingsContext.Provider>;
}
export function useSettings() {
  const c = useContext(SettingsContext); if (!c) throw new Error('useSettings must be used within SettingsProvider'); return c;
}
