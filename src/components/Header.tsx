import { Search } from 'lucide-react';

export default function Header() {
  return (
    <header 
      className="h-16 flex items-center px-6 relative z-20"
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
    </header>
  );
}
