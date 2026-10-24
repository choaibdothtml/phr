import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, CalendarClock, 
  FileText, Settings, LogOut, Flame, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employees', label: 'Employees', icon: Users },
  { path: '/departments', label: 'Departments', icon: Building2 },
  { path: '/attendance', label: 'Attendance', icon: CalendarClock },
  { path: '/leave', label: 'Leave Requests', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={`h-screen flex flex-col transition-all duration-300 ease-in-out relative ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
      style={{ 
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center phoenix-glow"
            style={{ background: 'var(--gradient-primary)' }}>
            <Flame className="w-5 h-5 text-white" />
          </div>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-display font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>
              Phoenix HR
            </h1>
            <p className="text-[10px] font-medium tracking-wider uppercase" style={{ color: 'var(--text-tertiary)' }}>
              Management Suite
            </p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all hover:scale-110"
        style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
        ) : (
          <ChevronLeft className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-indicator w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive ? 'active' : ''
              }`}
              style={{
                background: isActive ? 'var(--bg-tertiary)' : 'transparent',
              }}
              title={collapsed ? item.label : undefined}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isActive ? 'phoenix-glow' : 'group-hover:scale-105'
              }`}
                style={{ 
                  background: isActive ? 'var(--gradient-primary)' : 'transparent',
                }}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} 
                  style={{ color: isActive ? 'white' : 'var(--text-secondary)' }} 
                />
              </div>
              {!collapsed && (
                <span className={`text-sm font-medium transition-colors ${
                  isActive ? '' : ''
                }`} style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-red-50 dark:hover:bg-red-950/20 group"
          title={collapsed ? 'Logout' : undefined}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <LogOut className="w-4 h-4 text-red-500" />
          </div>
          {!collapsed && (
            <span className="text-sm font-medium text-red-500">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}
