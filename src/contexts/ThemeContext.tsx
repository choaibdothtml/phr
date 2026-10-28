import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';
interface ThemeContextType { theme: Theme; toggleTheme: () => void; setTheme: (t: Theme) => void; }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('phoenix-hr-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return 'light';
  });
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('phoenix-hr-theme', theme);
  }, [theme]);
  const toggleTheme = () => setThemeState(p => p === 'light' ? 'dark' : 'light');
  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeState }}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const c = useContext(ThemeContext);
  if (!c) throw new Error('useTheme must be used within ThemeProvider');
  return c;
}
