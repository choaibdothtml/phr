import { Menu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';

export default function ProfileSidebar() {
  const [showAppSidebar, setShowAppSidebar] = useState(false);
  const sidebarOverlayRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!showAppSidebar) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarOverlayRef.current && 
        !sidebarOverlayRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setShowAppSidebar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAppSidebar]);

  return (
    <>
      {/* Profile Sidebar */}
      <aside 
        className="h-screen flex flex-col w-[260px] transition-all duration-300 ease-in-out relative z-10"
        style={{ 
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
        }}
      >
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="relative flex-shrink-0">
            <img 
              src="data:image/png;base64,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"
              alt="Phoenix HR Logo" 
              className="w-10 h-10 rounded-xl object-cover phoenix-glow"
            />
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <h1 className="font-display font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>
              Phoenix HR
            </h1>
            <p className="text-[10px] font-medium tracking-wider uppercase" style={{ color: 'var(--text-tertiary)' }}>
              Profile View
            </p>
          </div>
          {/* Menu button - shows app sidebar */}
          <button
            ref={menuButtonRef}
            onClick={() => setShowAppSidebar(!showAppSidebar)}
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            style={{ 
              background: showAppSidebar ? 'rgba(249, 115, 22, 0.15)' : 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
            }}
            title="Show navigation"
          >
            <Menu className="w-4 h-4" style={{ color: showAppSidebar ? '#f97316' : 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Profile Sidebar Content - Empty for now */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs text-center px-3" style={{ color: 'var(--text-tertiary)' }}>
            Profile navigation will be added here
          </p>
        </nav>
      </aside>

      {/* App Sidebar Overlay - slides in from the right */}
      <AnimatePresence>
        {showAppSidebar && (
          <>
            {/* Blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40"
              style={{ backdropFilter: 'blur(8px)', background: 'rgba(0, 0, 0, 0.2)' }}
            />
            
            {/* Sidebar sliding in from right */}
            <motion.div
              ref={sidebarOverlayRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen z-50"
              style={{ 
                width: '260px',
                borderLeft: '1px solid var(--border-color)',
                boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.15)',
              }}
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
