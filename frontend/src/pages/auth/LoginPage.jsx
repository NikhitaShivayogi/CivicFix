import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Building2, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage({ expectedRole }) {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(form.email, form.password);
      if (expectedRole && response.user.role !== expectedRole) {
        logout();
        if (expectedRole === 'ADMIN') {
          setError('This is not an admin account. Use the admin login page or a valid admin user.');
          return;
        }
        setError(expectedRole === 'AUTHORITY'
          ? 'This is not an authority account. Use Citizen sign in instead.'
          : 'This is not a citizen account. Use Authority sign in instead.');
        return;
      }
      navigate(response.user.role === 'ADMIN' ? '/admin' : response.user.role === 'AUTHORITY' ? '/authority' : '/citizen');
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || 'Unable to log in. Please try again.');
      } else if (err.request) {
        setError('Cannot reach the server. Check your internet connection or contact support.');
      } else {
        setError('Unable to log in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center px-4 py-12">
      <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft lg:grid-cols-2">
        <div className="bg-gradient-to-br from-civic-700 to-civic-500 p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-civic-50">{expectedRole === 'ADMIN' ? 'Admin workspace' : expectedRole === 'AUTHORITY' ? 'Authority workspace' : expectedRole === 'CITIZEN' ? 'Citizen workspace' : 'Welcome back'}</p>
          <h1 className="mt-4 text-3xl font-bold">{expectedRole === 'ADMIN' ? 'Admin sign in' : expectedRole === 'AUTHORITY' ? 'Authority team sign in' : expectedRole === 'CITIZEN' ? 'Citizen sign in' : 'Sign in to CivicFix'}</h1>
          <p className="mt-4 text-civic-50">
            {expectedRole === 'ADMIN'
              ? 'Review authority requests, oversee reports, and manage the CivicFix system.'
              : expectedRole === 'AUTHORITY'
                ? 'Review incoming community reports, coordinate work, and keep residents updated.'
                : expectedRole === 'CITIZEN'
                  ? 'Submit civic issues and follow their progress through your citizen workspace.'
                  : 'Monitor submitted civic issues or review community reports as an authority.'}
          </p>
        </div>

        <div className="p-8">
          {expectedRole !== 'ADMIN' && (
            <nav aria-label="Choose sign-in type" className="mb-6 grid grid-cols-2 gap-2">
              {[
                { role: 'CITIZEN', label: 'Citizen', detail: 'Report and track issues', to: '/citizen/login', Icon: UserRound },
                { role: 'AUTHORITY', label: 'Authority team', detail: 'Review community reports', to: '/authority/login', Icon: Building2 },
              ].map(({ role, label, detail, to, Icon }) => {
                const isActive = expectedRole === role;
                return (
                  <Link
                    key={role}
                    to={to}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex min-h-20 items-center gap-3 rounded-lg border px-3 py-3 transition ${isActive
                      ? 'border-civic-600 bg-civic-50 text-civic-800 ring-1 ring-civic-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-civic-300 hover:bg-slate-50'}`}
                  >
                    <Icon size={20} className={isActive ? 'shrink-0 text-civic-700' : 'shrink-0 text-slate-500'} />
                    <span className="min-w-0 text-left">
                      <span className="block text-sm font-semibold">{label}</span>
                      <span className="mt-0.5 block text-xs leading-4 text-slate-500">{detail}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          )}

          <h2 className="text-2xl font-semibold text-slate-900">
            {expectedRole === 'CITIZEN' ? 'Citizen sign in' : expectedRole === 'AUTHORITY' ? 'Authority team sign in' : expectedRole === 'ADMIN' ? 'Admin sign in' : 'Sign in'}
          </h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 focus-within:border-civic-500">
                <Mail size={18} className="text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="w-full border-0 bg-transparent text-slate-900 outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 focus-within:border-civic-500">
                <LockKeyhole size={18} className="text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="w-full border-0 bg-transparent text-slate-900 outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="shrink-0 text-slate-500 hover:text-slate-800"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full rounded-xl bg-civic-600 px-4 py-3 font-semibold text-white shadow-soft transition hover:bg-civic-700 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Signing in...' : expectedRole === 'CITIZEN' ? 'Sign in as citizen' : expectedRole === 'AUTHORITY' ? 'Sign in as authority' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center text-sm text-slate-600">
            {expectedRole !== 'ADMIN' && <p>Need a citizen account? <Link to="/register" className="font-semibold text-civic-700">Create one</Link></p>}
            {expectedRole !== 'AUTHORITY' && <p>New authority team? <Link to="/authority/request" className="font-semibold text-civic-700">Request access</Link></p>}
            {expectedRole === 'AUTHORITY' && <p>Need authority access? <Link to="/authority/request" className="font-semibold text-civic-700">Request access</Link></p>}
          </div>
        </div>
      </div>
    </div>
  );
}
