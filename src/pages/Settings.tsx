import DepartmentsTab from './DepartmentsTab';

export default function Settings() {
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

      {/* Departments Tab */}
      <DepartmentsTab />
    </div>
  );
}
