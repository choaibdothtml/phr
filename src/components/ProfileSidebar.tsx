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
              src="https://i.ibb.co/M59xZBz0/NEWLOGO.png"
              alt="Phoenix HR Logo" 
              className="w-10 h-10 rounded-xl object-cover phoenix-glow"
              style={{ background: 'transparent' }}
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
