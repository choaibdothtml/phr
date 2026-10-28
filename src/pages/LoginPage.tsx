import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Eye, EyeOff, ArrowRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@phoenixhr.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    const success = await login(email, password); setLoading(false);
    if (success) navigate('/'); else setError('Invalid credentials. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute inset-0 mesh-bg" />
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-20 blur-3xl" style={{ background: 'var(--gradient-primary)' }} />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--gradient-accent)' }} />
      <button onClick={toggleTheme} className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 z-10" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', backdropFilter: 'blur(12px)' }}>
        {theme === 'light' ? <Moon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /> : <Sun className="w-4 h-4 text-phoenix-400" />}
      </button>
      <div className="relative w-full max-w-md mx-4 animate-fade-in-up">
        <div className="glass-card p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 phoenix-glow" style={{ background: 'var(--gradient-primary)' }}><Flame className="w-8 h-8 text-white" /></div>
            <h1 className="font-display text-2xl font-bold gradient-text">Phoenix HR</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Sign in to your workspace</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Email Address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-phoenix-500/30" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} placeholder="you@company.com" required /></div>
            <div><label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Password</label><div className="relative"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-phoenix-500/30" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} placeholder="••••••••" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
            {error && <div className="px-4 py-2.5 rounded-xl text-sm text-red-500 bg-red-500/10 border border-red-500/20">{error}</div>}
            <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'var(--gradient-primary)' }}>{loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In<ArrowRight className="w-4 h-4" /></>}</button>
          </form>
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
            <p className="text-xs text-center mb-3" style={{ color: 'var(--text-tertiary)' }}>Demo Credentials</p>
            <div className="grid grid-cols-3 gap-2">
              {[{ role: 'Admin', email: 'admin@phoenixhr.com', pass: 'admin123' }, { role: 'Manager', email: 'manager@phoenixhr.com', pass: 'manager123' }, { role: 'Employee', email: 'employee@phoenixhr.com', pass: 'employee123' }].map(cred => (
                <button key={cred.role} onClick={() => { setEmail(cred.email); setPassword(cred.pass); }} className="px-2 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all hover:scale-105" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>{cred.role}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
