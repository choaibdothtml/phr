import { Sun, Moon, Bell, Search, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { mockNotifications } from '../services/api';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <header 
      className="h-16 flex items-center justify-between px-6 relative z-20"
      style={{ 
        background: 'var(--bg-card)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div 
          className="flex items-center gap-2 px-4 py-2 rounded-xl w-full transition-all focus-within:ring-2 focus-within:ring-phoenix-500/30"
          style={{ 
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Search className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          <input 
            type="text" 
            placeholder="Search employees, departments..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-[var(--text-tertiary)]"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ 
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          ) : (
            <Sun className="w-4 h-4 text-phoenix-400" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 relative"
            style={{ 
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Bell className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-phoenix-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div 
              className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden z-50 animate-fade-in-up"
              style={{ 
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div className="p-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {mockNotifications.map(n => (
                  <div key={n.id} className="p-4 flex gap-3 transition-colors hover:bg-[var(--bg-tertiary)]"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.read ? 'pulse-dot' : 'opacity-0'}`}
                      style={{ background: n.type === 'warning' ? '#f59e0b' : n.type === 'success' ? '#10b981' : '#f97316' }}
                    />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl transition-all hover:scale-[1.02]"
            style={{ 
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--gradient-primary)' }}>
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] capitalize" style={{ color: 'var(--text-tertiary)' }}>
                {user?.role || 'employee'}
              </p>
            </div>
          </button>

          {showProfile && (
            <div 
              className="absolute right-0 top-12 w-56 rounded-2xl overflow-hidden z-50 animate-fade-in-up"
              style={{ 
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div className="p-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider"
                  style={{ background: 'var(--gradient-primary)', color: 'white' }}>
                  {user?.role}
                </span>
              </div>
              <div className="p-2">
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--bg-tertiary)]"
                  style={{ color: 'var(--text-secondary)' }}>
                  My Profile
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--bg-tertiary)]"
                  style={{ color: 'var(--text-secondary)' }}>
                  Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
