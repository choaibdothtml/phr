import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, UserPlus, Users, List, CalendarClock, DollarSign,
  Settings, LogOut, Flame, ChevronLeft, ChevronRight,
  Sun, Moon, Bell, User, X, CheckCheck
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { mockNotifications } from '../services/api';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/employees', label: 'Add/Edit an employee', icon: UserPlus },
  { path: '/employees/list', label: "Employees' list", icon: List },
  { path: '/employees/profiles', label: "Employees' profiles", icon: Users },
  { path: '/attendance', label: 'Attendance', icon: CalendarClock },
  { path: '/rest-entitlements', label: 'Rest entitlements/taken', icon: CalendarClock },
  { path: '/payroll', label: 'Payroll', icon: DollarSign },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEmployeeMenu, setShowEmployeeMenu] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [dateFormat, setDateFormat] = useState('full');
  const [timeFormat, setTimeFormat] = useState('12h');
  const unreadCount = notifications.filter(n => !n.read).length;

  const sidebarRef = useRef<HTMLDivElement>(null);
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);
  const employeeMenuRef = useRef<HTMLDivElement>(null);
  const employeeButtonRef = useRef<HTMLButtonElement>(null);
  const employeeDropdownRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // Load date/time format preferences
  useEffect(() => {
    const savedDateFormat = localStorage.getItem('phoenix-hr-date-format');
    const savedTimeFormat = localStorage.getItem('phoenix-hr-time-format');
    if (savedDateFormat) setDateFormat(savedDateFormat);
    if (savedTimeFormat) setTimeFormat(savedTimeFormat);
  }, []);

  // Update time every minute and check for format changes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Update every minute

    // Check for format preference changes every second
    const formatChecker = setInterval(() => {
      const savedDateFormat = localStorage.getItem('phoenix-hr-date-format');
      const savedTimeFormat = localStorage.getItem('phoenix-hr-time-format');
      if (savedDateFormat && savedDateFormat !== dateFormat) setDateFormat(savedDateFormat);
      if (savedTimeFormat && savedTimeFormat !== timeFormat) setTimeFormat(savedTimeFormat);
    }, 1000); // Check every second

    return () => {
      clearInterval(timer);
      clearInterval(formatChecker);
    };
  }, [dateFormat, timeFormat]);

  // Format date and time
  const formatDateTime = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                    'july', 'august', 'september', 'october', 'november', 'december'];
    
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    
    // Add ordinal suffix to day
    const getOrdinalSuffix = (n: number) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };
    
    const dayWithSuffix = `${day}${getOrdinalSuffix(day)}`;
    
    // Format date based on user preference
    let dateStr = '';
    switch (dateFormat) {
      case 'full':
        dateStr = `${dayName}, ${monthName} ${dayWithSuffix}, ${year}`;
        break;
      case 'dd/mm/yyyy':
        dateStr = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
        break;
      case 'dd/mm/yy':
        dateStr = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
        break;
      case 'mm/dd/yyyy':
        dateStr = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
        break;
      case 'mm/dd/yy':
        dateStr = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
        break;
      default:
        dateStr = `${dayName}, ${monthName} ${dayWithSuffix}, ${year}`;
    }
    
    // Format time based on user preference
    let hours = date.getHours();
    const minutes = date.getMinutes();
    let timeStr = '';
    
    if (timeFormat === '24h') {
      const hoursStr = hours.toString().padStart(2, '0');
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      timeStr = `${hoursStr}:${minutesStr}`;
    } else {
      // 12h format
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      timeStr = `${hours}:${minutesStr} ${ampm}`;
    }
    
    return { date: dateStr, time: timeStr };
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const closeDropdowns = () => {
    setShowNotifications(false);
    setShowProfile(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Don't close if clicking inside the notifications dropdown
      if (notificationsDropdownRef.current && notificationsDropdownRef.current.contains(target)) {
        return;
      }
      
      // Don't close if clicking inside the employee menu button
      if (employeeMenuRef.current && employeeMenuRef.current.contains(target)) {
        return;
      }
      
      // Don't close if clicking inside the employee dropdown menu
      if (employeeDropdownRef.current && employeeDropdownRef.current.contains(target)) {
        return;
      }
      
      // Check if click is outside sidebar
      if (sidebarRef.current && !sidebarRef.current.contains(target)) {
        closeDropdowns();
        setShowEmployeeMenu(false);
      } else {
        // Close employee menu when clicking elsewhere in sidebar
        setShowEmployeeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside 
      ref={sidebarRef}
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
          
          // Special handling for "Add/Edit an employee" button
          if (item.path === '/employees') {
            return (
              <div key={item.path} className="relative" ref={employeeMenuRef}>
                <button
                  ref={employeeButtonRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!showEmployeeMenu) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMenuPosition({
                        top: rect.top,
                        left: rect.right + 8
                      });
                    }
                    setShowEmployeeMenu(!showEmployeeMenu);
                  }}
                  className={`sidebar-indicator w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive ? 'active nav-item-active' : 'nav-item'
                  }`}
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
                    <span className="text-sm font-medium flex-1 text-left" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {item.label}
                    </span>
                  )}
                </button>
                
                {/* Employee Action Dropdown */}
                {showEmployeeMenu && createPortal(
                  <AnimatePresence>
                    <motion.div
                      ref={employeeDropdownRef}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="fixed w-56 rounded-xl overflow-hidden z-[9999]"
                      style={{ 
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-lg)',
                        left: `${menuPosition.left}px`,
                        top: `${menuPosition.top}px`
                      }}
                    >
                      <button
                        onClick={() => {
                          setShowEmployeeMenu(false);
                          navigate('/employees');
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center gap-3"
                        style={{ 
                          color: 'var(--text-primary)',
                          borderBottom: '1px solid var(--border-subtle)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(var(--primary-color-rgb), 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <UserPlus className="w-4 h-4" style={{ color: 'var(--phoenix-500)' }} />
                        Add a new employee
                      </button>
                      <button
                        onClick={() => {
                          setShowEmployeeMenu(false);
                          navigate('/employees/edit');
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center gap-3"
                        style={{ color: 'var(--text-primary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(var(--primary-color-rgb), 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Users className="w-4 h-4" style={{ color: 'var(--phoenix-500)' }} />
                        Edit an existing employee
                      </button>
                    </motion.div>
                  </AnimatePresence>
                , document.body)}
              </div>
            );
          }
          
          // Regular navigation for other items
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-indicator w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive ? 'active nav-item-active' : 'nav-item'
              }`}
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
                <span className="text-sm font-medium" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-3 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="space-y-1.5">
          {/* Notifications button - shown first when collapsed */}
          {collapsed && (
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="w-full flex items-center justify-center px-3 py-2.5 rounded-xl transition-all hover:bg-[var(--bg-tertiary)] group"
                title="Notifications"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center relative"
                  style={{ background: 'var(--bg-tertiary)' }}>
                  <Bell className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-phoenix-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Theme toggle + Notifications on the same horizontal line (when expanded) */}
          <div className="flex items-center gap-1.5">
            {/* Theme toggle */}
            <div className="flex-1">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-center px-3 py-2.5 rounded-xl transition-all hover:bg-[var(--bg-tertiary)] group"
                title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--bg-tertiary)' }}>
                  {theme === 'light' ? (
                    <Moon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  ) : (
                    <Sun className="w-4 h-4 text-phoenix-400" />
                  )}
                </div>
              </button>
            </div>

            {/* Notifications - only shown here when expanded */}
            {!collapsed && (
              <div className="relative flex-1">
                <button
                  onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                  className="w-full flex items-center justify-center px-3 py-2.5 rounded-xl transition-all hover:bg-[var(--bg-tertiary)] group"
                  title="Notifications"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center relative"
                    style={{ background: 'var(--bg-tertiary)' }}>
                    <Bell className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-phoenix-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Notifications dropdown - shared between collapsed and expanded states */}
          {createPortal(
            <AnimatePresence>
              {showNotifications && (
                <>
                  {/* Blur overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-40"
                    style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
                    onClick={() => setShowNotifications(false)}
                  />
                  
                  {/* Dropdown menu */}
                  <motion.div
                    ref={notificationsDropdownRef}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="fixed z-50 w-80 rounded-2xl overflow-hidden"
                    style={{ 
                      background: 'var(--bg-popup)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-lg)',
                      left: collapsed ? '80px' : '268px',
                      bottom: '180px',
                    }}
                  >
                        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                            {unreadCount > 0 && (
                              <span className="text-[10px] font-semibold text-phoenix-500">{unreadCount} unread</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                              <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-1.5 text-[11px] font-medium hover:text-phoenix-500 transition-colors"
                                style={{ color: 'var(--text-secondary)' }}
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                                Mark all as read
                              </button>
                            )}
                            <button
                              onClick={() => setShowNotifications(false)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-colors"
                            >
                              <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.map(n => (
                            <div key={n.id} className="p-3 flex gap-3 transition-colors hover:bg-[var(--bg-tertiary)]"
                              style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'pulse-dot' : 'opacity-0'}`}
                                style={{ background: n.type === 'warning' ? '#f59e0b' : n.type === 'success' ? '#10b981' : '#f97316' }}
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                                <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              , document.body)}

          {/* User Profile - directly above logout */}
          <div className="relative">
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-[var(--bg-tertiary)] group"
              title={collapsed ? user?.name || 'User' : undefined}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--gradient-primary)' }}>
                <User className="w-4 h-4 text-white" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[10px] capitalize truncate" style={{ color: 'var(--text-tertiary)' }}>
                    {user?.role || 'employee'}
                  </p>
                </div>
              )}
            </button>

            {/* Profile dropdown */}
            {showProfile && (
              <div 
                className="absolute left-full ml-2 bottom-0 w-56 rounded-2xl overflow-hidden z-50 animate-fade-in-up"
                style={{ 
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div className="p-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider"
                    style={{ background: 'var(--gradient-primary)', color: 'white' }}>
                    {user?.role}
                  </span>
                </div>
                <div className="p-2">
                  <button onClick={() => { navigate('/settings'); closeDropdowns(); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--bg-tertiary)]"
                    style={{ color: 'var(--text-secondary)' }}>
                    My Profile
                  </button>
                  <button onClick={() => { navigate('/settings'); closeDropdowns(); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--bg-tertiary)]"
                    style={{ color: 'var(--text-secondary)' }}>
                    Preferences
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
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

          {/* Date and Time */}
          {!collapsed && (
            <div className="flex flex-col items-center justify-center px-3 py-2 mt-2">
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                {formatDateTime(currentDateTime).date}
              </span>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                {formatDateTime(currentDateTime).time}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
