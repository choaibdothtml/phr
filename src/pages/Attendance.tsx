import { CalendarClock } from 'lucide-react';
export default function Attendance() {
  return (<div className="flex items-center justify-center h-full"><div className="text-center"><div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ background: 'var(--bg-tertiary)' }}><CalendarClock className="w-10 h-10" style={{ color: 'var(--text-tertiary)' }} /></div><h1 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Coming soon …</h1><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>This feature is under development</p></div></div>);
}
