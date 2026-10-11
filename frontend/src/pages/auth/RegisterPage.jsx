import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Mail, Phone, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
];

export default function RegisterPage({ expectedRole = 'CITIZEN' }) {
  const { register, registerAuthority } = useAuth();
  const navigate = useNavigate();
  const isAuthority = expectedRole === 'AUTHORITY';
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    locality: '',
    district: '',
    state: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isAuthority) {
        await registerAuthority(form);
        setPendingApproval(true);
        return;
      }

      const response = await register(form);
      navigate(response.user.role === 'AUTHORITY' ? '/authority' : '/citizen');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  if (pendingApproval) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center px-4 py-12">
        <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">Request submitted</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Your authority account is pending administrator approval. You can sign in after your request is approved.
          </p>
          <Link to="/authority/login" className="mt-6 inline-flex items-center justify-center rounded-xl bg-civic-600 px-4 py-3 font-semibold text-white hover:bg-civic-700">
            Go to authority sign in
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center px-4 py-12">
      <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft lg:grid-cols-2">
        <div className="bg-gradient-to-br from-civic-700 to-civic-500 p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-civic-50">{isAuthority ? 'Authority access request' : 'Citizen registration'}</p>
          <h1 className="mt-4 text-3xl font-bold">{isAuthority ? 'Request authority access' : 'Create your account'}</h1>
          <p className="mt-4 text-civic-50">
            {isAuthority
              ? 'Submit your details for administrator review. Approved staff can sign in to review community reports.'
              : 'Join CivicFix to report neighborhood issues, follow them live, and get notified when they are resolved.'}
          </p>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-semibold text-slate-900">{isAuthority ? 'Request access' : 'Register'}</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 focus-within:border-civic-500">
                <User size={18} className="text-slate-400" />
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full border-0 bg-transparent text-slate-900 outline-none" placeholder="Your name" required />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 focus-within:border-civic-500">
                <Mail size={18} className="text-slate-400" />
                <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full border-0 bg-transparent text-slate-900 outline-none" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Phone number</label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 focus-within:border-civic-500">
                <Phone size={18} className="text-slate-400" />
                <span className="shrink-0 border-r border-slate-300 pr-3 text-sm text-slate-600">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="min-w-0 w-full border-0 bg-transparent text-slate-900 outline-none"
                  placeholder="98765 43210"
                  aria-label="10-digit Indian mobile number"
                  required
                />
              </div>
            </div>

            {!isAuthority && (
              <>
                <div>
                  <label htmlFor="locality" className="mb-2 block text-sm font-medium text-slate-700">Area or locality</label>
                  <input id="locality" value={form.locality} onChange={(event) => setForm({ ...form, locality: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-civic-500" placeholder="Your area, town, or village" autoComplete="address-level3" required />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="district" className="mb-2 block text-sm font-medium text-slate-700">District</label>
                    <input id="district" value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-civic-500" placeholder="Your district" autoComplete="address-level2" required />
                  </div>
                  <div>
                    <label htmlFor="state" className="mb-2 block text-sm font-medium text-slate-700">State or union territory</label>
                    <select id="state" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-civic-500" autoComplete="address-level1" required>
                      <option value="" disabled>Select your state/UT</option>
                      {indianStates.map((state) => <option key={state} value={state}>{state}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-civic-500">
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full border-0 bg-transparent py-3 outline-none" placeholder="Password" required />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="shrink-0 text-slate-500 hover:text-slate-800" aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Confirm password</label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-civic-500">
                  <input type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} className="w-full border-0 bg-transparent py-3 outline-none" placeholder="Confirm" required />
                  <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} className="shrink-0 text-slate-500 hover:text-slate-800" aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'} title={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full rounded-xl bg-civic-600 px-4 py-3 font-semibold text-white shadow-soft transition hover:bg-civic-700 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? (isAuthority ? 'Submitting request...' : 'Creating account...') : (isAuthority ? 'Request access' : 'Create account')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to={isAuthority ? '/authority/login' : '/citizen/login'} className="font-semibold text-civic-700">Sign in</Link>
          </p>
          {!isAuthority && <p className="mt-3 text-center text-sm text-slate-600">Authority team? <Link to="/authority/request" className="font-semibold text-civic-700">Request access</Link></p>}
        </div>
      </div>
    </div>
  );
}
