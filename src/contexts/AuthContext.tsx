import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'manager' | 'employee';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  // Future: subscription info will be loaded here from server
  subscription: {
    plan: 'free' | 'professional' | 'enterprise';
    expiresAt: string;
    status: 'active' | 'expired' | 'trial';
  } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data - will be replaced with server API calls
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@phoenixhr.com': {
    password: 'admin123',
    user: {
      id: '1',
      name: 'Sarah Mitchell',
      email: 'admin@phoenixhr.com',
      role: 'admin',
      department: 'Human Resources',
    }
  },
  'manager@phoenixhr.com': {
    password: 'manager123',
    user: {
      id: '2',
      name: 'James Rodriguez',
      email: 'manager@phoenixhr.com',
      role: 'manager',
      department: 'Engineering',
    }
  },
  'employee@phoenixhr.com': {
    password: 'employee123',
    user: {
      id: '3',
      name: 'Emily Chen',
      email: 'employee@phoenixhr.com',
      role: 'employee',
      department: 'Design',
    }
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('phoenix-hr-user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    // TODO: Replace with actual API call to your server
    // const response = await api.post('/auth/login', { email, password });
    
    const mockUser = MOCK_USERS[email];
    if (mockUser && mockUser.password === password) {
      setUser(mockUser.user);
      localStorage.setItem('phoenix-hr-user', JSON.stringify(mockUser.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('phoenix-hr-user');
    // TODO: Call server logout endpoint
  };

  // Mock subscription data - will come from server
  const subscription = {
    plan: 'enterprise' as const,
    expiresAt: '2027-12-31',
    status: 'active' as const,
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout,
      subscription 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
