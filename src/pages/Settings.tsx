import { useState } from 'react';
import { 
  User, Shield, Bell, Palette, Globe, Server, 
  Key, Database, Save, CheckCircle, Monitor
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { user, subscription } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'server', label: 'Server Config', icon: Server },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Configure your workspace preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="glass-card p-2 space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id ? '' : ''
                  }`}
                  style={{
                    background: activeTab === tab.id ? 'var(--bg-tertiary)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: activeTab === tab.id ? '#f97316' : 'var(--text-tertiary)' }} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="glass-card p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>General Settings</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Basic workspace configuration</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      Organization Name
                    </label>
                    <input 
                      defaultValue="Phoenix Technologies Inc."
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      Timezone
                    </label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none cursor-pointer"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      <option>UTC-05:00 Eastern Time</option>
                      <option>UTC-06:00 Central Time</option>
                      <option>UTC-07:00 Mountain Time</option>
                      <option>UTC-08:00 Pacific Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      Date Format
                    </label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none cursor-pointer"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Profile Settings</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your personal information</p>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
                    style={{ background: 'var(--gradient-primary)' }}>
                    {user?.name?.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <button className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      Change Avatar
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Full Name</label>
                    <input defaultValue={user?.name || ''} className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Email</label>
                    <input defaultValue={user?.email || ''} className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Department</label>
                    <input defaultValue={user?.department || ''} className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} readOnly />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Role</label>
                    <input defaultValue={user?.role || ''} className="w-full px-4 py-3 rounded-xl text-sm outline-none capitalize"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} readOnly />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Security</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Password and authentication settings</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Current Password</label>
                    <input type="password" className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>New Password</label>
                    <input type="password" className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Confirm Password</label>
                    <input type="password" className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                </div>
                <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <Key className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Two-Factor Authentication</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Add an extra layer of security to your account</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Choose what notifications you receive</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Leave request updates', desc: 'Get notified when leave requests are submitted or updated' },
                    { label: 'Attendance alerts', desc: 'Receive alerts for late arrivals or absences' },
                    { label: 'Payroll notifications', desc: 'Get notified when payroll is processed' },
                    { label: 'Contract reminders', desc: 'Alerts for upcoming contract expirations' },
                    { label: 'System updates', desc: 'Notifications about app updates and maintenance' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={i < 3} className="sr-only peer" />
                        <div className="w-10 h-5 rounded-full peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-phoenix-500 bg-[var(--border-color)]" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Appearance</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Customize the look and feel</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Theme</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => theme !== 'light' && toggleTheme()}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        theme === 'light' ? 'border-phoenix-500' : ''
                      }`}
                      style={{ background: '#ffffff', borderColor: theme === 'light' ? '#f97316' : 'var(--border-color)' }}
                    >
                      <div className="w-full h-16 rounded-lg mb-2" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }} />
                      <p className="text-sm font-semibold text-gray-800">Light Mode</p>
                    </button>
                    <button
                      onClick={() => theme !== 'dark' && toggleTheme()}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        theme === 'dark' ? 'border-phoenix-500' : ''
                      }`}
                      style={{ background: '#0f172a', borderColor: theme === 'dark' ? '#f97316' : 'var(--border-color)' }}
                    >
                      <div className="w-full h-16 rounded-lg mb-2" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }} />
                      <p className="text-sm font-semibold text-gray-200">Dark Mode</p>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Language</label>
                  <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                    <Globe className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    <select className="bg-transparent text-sm outline-none flex-1" style={{ color: 'var(--text-primary)' }}>
                      <option value="en">English</option>
                      <option value="fr" disabled>French (Coming Soon)</option>
                      <option value="ar" disabled>Arabic (Coming Soon)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'server' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Server Configuration</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Configure connection to your backend server</p>
                </div>
                
                <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-emerald-600">Server Connected</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Last sync: 2 minutes ago</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      <Database className="w-3 h-3 inline mr-1" />
                      Server URL
                    </label>
                    <input 
                      defaultValue="https://api.phoenixhr.com"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      <Key className="w-3 h-3 inline mr-1" />
                      API Key
                    </label>
                    <input 
                      type="password"
                      defaultValue="phx_sk_live_xxxxxxxxxxxxx"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500/30"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                {/* Subscription Info */}
                {subscription && (
                  <div className="p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                    <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Subscription Status</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Plan</p>
                        <p className="text-sm font-bold capitalize mt-0.5" style={{ color: 'var(--text-primary)' }}>{subscription.plan}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Status</p>
                        <p className="text-sm font-bold capitalize mt-0.5 text-emerald-500">{subscription.status}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Expires</p>
                        <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{subscription.expiresAt}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* App Type */}
                <div className="p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Application Type</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-3 rounded-xl text-left border-2 border-phoenix-500" style={{ background: 'rgba(249, 115, 22, 0.05)' }}>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Host App</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Full features for HR managers</p>
                    </button>
                    <button className="p-3 rounded-xl text-left border-2" style={{ borderColor: 'var(--border-color)', background: 'transparent' }}>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Client App</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Limited features for employees</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 flex justify-end" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-105 hover:shadow-lg"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {saved ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
