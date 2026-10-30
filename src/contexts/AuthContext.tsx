import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'manager' | 'employee';
interface User { id: string; name: string; email: string; role: UserRole; department: string; }
interface AuthContextType {
  user: User | null; isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>; logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@phoenixhr.com': { password: 'admin123', user: { id: '1', name: 'Sarah Mitchell', email: 'admin@phoenixhr.com', role: 'admin', department: 'Human Resources' }},
  'manager@phoenixhr.com': { password: 'manager123', user: { id: '2', name: 'James Rodriguez', email: 'manager@phoenixhr.com', role: 'manager', department: 'Engineering' }},
  'employee@phoenixhr.com': { password: 'employee123', user: { id: '3', name: 'Emily Chen', email: 'employee@phoenixhr.com', role: 'employee', department: 'Design' }},
};
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const s = localStorage.getItem('phoenix-hr-user'); return s ? JSON.parse(s) : null;
  });
  const login = async (email: string, password: string): Promise<boolean> => {
    const mu = MOCK_USERS[email];
    if (mu && mu.password === password) { setUser(mu.user); localStorage.setItem('phoenix-hr-user', JSON.stringify(mu.user)); return true; }
    return false;
  };
  const logout = () => { setUser(null); localStorage.removeItem('phoenix-hr-user'); };
  return <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const c = useContext(AuthContext); if (!c) throw new Error('useAuth must be used within AuthProvider'); return c;
}
