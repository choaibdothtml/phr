import { Flame } from 'lucide-react';

export default function ProfileSidebar() {
  return (
    <aside 
      className="h-screen flex flex-col w-[260px] transition-all duration-300 ease-in-out"
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
        <div className="overflow-hidden">
          <h1 className="font-display font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>
            Phoenix HR
          </h1>
          <p className="text-[10px] font-medium tracking-wider uppercase" style={{ color: 'var(--text-tertiary)' }}>
            Profile View
          </p>
        </div>
      </div>

      {/* Profile Sidebar Content - Empty for now */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-center px-3" style={{ color: 'var(--text-tertiary)' }}>
          Profile navigation will be added here
        </p>
      </nav>
    </aside>
  );
}
