import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, ClipboardList, House, LayoutDashboard, LogOut, MapPinned, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const citizenNav = [
  { to: '/citizen', label: 'Dashboard' },
  { to: '/citizen/report', label: 'Report Issue' },
  { to: '/citizen/reports', label: 'My Reports' },
  { to: '/citizen/notifications', label: 'Notifications' },
  { to: '/citizen/profile', label: 'Profile' },
];

const authorityNav = [
  { to: '/authority', label: 'Dashboard' },
  { to: '/authority/all-issues', label: 'All Issues' },
  { to: '/authority/pending', label: 'Pending Issues' },
  { to: '/authority/profile', label: 'Profile' },
];

const adminNav = [
  { to: '/admin', label: 'Overview', view: 'overview', Icon: LayoutDashboard },
  { to: '/admin?view=reports', label: 'Reports', view: 'reports', Icon: ClipboardList },
  { to: '/admin?view=citizens', label: 'Citizens', view: 'citizens', Icon: Users },
  { to: '/admin?view=authorities', label: 'Authorities', view: 'authorities', Icon: Building2 },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const navItems = user?.role === 'ADMIN' ? adminNav : user?.role === 'AUTHORITY' ? authorityNav : citizenNav;
  const userId = user?._id || user?.id;

  useEffect(() => {
    if (!userId || user?.role === 'ADMIN') return undefined;

    let active = true;
    const loadUnreadCount = () => {
      axios.get('/notifications')
        .then((response) => {
          if (active) setUnreadCount(response.data.notifications.filter((item) => !item.isRead).length);
        })
        .catch(() => {
          if (active) setUnreadCount(0);
        });
    };

    loadUnreadCount();
    window.addEventListener('civicfix:notifications-updated', loadUnreadCount);
    return () => {
      active = false;
      window.removeEventListener('civicfix:notifications-updated', loadUnreadCount);
    };
  }, [user?.role, userId, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-[0_1px_8px_rgba(15,23,42,0.04)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:py-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="rounded-xl bg-civic-600 p-2 text-white shadow-soft">
              {user?.role === 'AUTHORITY' || user?.role === 'ADMIN' ? <ShieldCheck size={20} /> : <MapPinned size={20} />}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-civic-700">CivicFix</p>
              <p className="hidden text-xs text-slate-500 min-[380px]:block">Community issue reporting</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <NavLink to="/" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" aria-label="Home">
              <House size={16} />
              <span className="hidden sm:inline">Home</span>
            </NavLink>
            {user ? (
              <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                <div className="flex min-w-0 items-center gap-2 rounded-full bg-slate-100 px-2.5 py-2 text-sm font-medium text-slate-700 sm:px-3">
                  <Users size={16} />
                  <span className="max-w-24 truncate sm:max-w-48">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  aria-label="Logout"
                  title="Logout"
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:px-3"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <NavLink to="/login" className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">
                  Login
                </NavLink>
                <NavLink to="/register" className="rounded-lg bg-civic-600 px-3 py-2 font-medium text-white shadow-soft hover:bg-civic-700">
                  Register
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </header>

      {user ? (
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 lg:flex-row lg:gap-6">
          <nav aria-label="Primary navigation" className="flex gap-1 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => {
                  const active = user?.role === 'ADMIN'
                    ? (new URLSearchParams(location.search).get('view') || 'overview') === item.view
                    : isActive;
                  return `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${active ? 'bg-civic-100 text-civic-800' : 'text-slate-600 hover:bg-slate-100'}`;
                }}
              >
                {item.Icon && <item.Icon size={16} />}
                {item.label}
                {item.label === 'Notifications' && unreadCount > 0 && <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-civic-600 px-1 text-[10px] text-white">{unreadCount}</span>}
              </NavLink>
            ))}
          </nav>
          <aside className="hidden w-72 shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft lg:block">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => {
                    const active = user?.role === 'ADMIN'
                      ? (new URLSearchParams(location.search).get('view') || 'overview') === item.view
                      : isActive;
                    return `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                      active ? 'bg-civic-100 text-civic-800' : 'text-slate-600 hover:bg-slate-100'
                    }`;
                  }}
                >
                  <span className="flex items-center gap-2">{item.Icon && <item.Icon size={17} />} {item.label}</span>
                  {item.label === 'Notifications' && unreadCount > 0 && <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-civic-600 px-1 text-xs text-white">{unreadCount}</span>}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      ) : (
        <main>{children}</main>
      )}
    </div>
  );
}
