import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProfileSidebar from './ProfileSidebar';

export default function Layout() {
  const location = useLocation();
  const isProfilesPage = location.pathname === '/employees/profiles';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {isProfilesPage ? <ProfileSidebar /> : <Sidebar />}
      <main className="flex-1 overflow-y-auto mesh-bg">
        <Outlet />
      </main>
    </div>
  );
}
