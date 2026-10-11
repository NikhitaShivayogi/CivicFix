import { useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
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

const normalizeIndianPhone = (phone = '') => phone.replace(/^\+91\s?/, '').replace(/\D/g, '');

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [originalPhone, setOriginalPhone] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', locality: '', district: '', state: '' });

  const beginEditing = () => {
    const phone = normalizeIndianPhone(user?.phone);
    setOriginalPhone(phone);
    setForm({
      name: user?.name || '',
      phone,
      locality: user?.locality || '',
      district: user?.district || '',
      state: user?.state || '',
    });
    setError('');
    setSaved(false);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    const payload = { name: form.name };
    if (form.phone !== originalPhone) payload.phone = form.phone;
    if (user?.role === 'CITIZEN') {
      payload.locality = form.locality;
      payload.district = form.district;
      payload.state = form.state;
    }

    try {
      await updateProfile(payload);
      setEditing(false);
      setSaved(true);
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.[0]?.msg || requestError.response?.data?.message || 'Unable to update your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formattedPhone = user?.phone
    ? (/^[6-9]\d{9}$/.test(user.phone) ? `+91 ${user.phone}` : user.phone)
    : 'Not provided';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
          <p className="mt-1 text-sm text-slate-600">Your account and location details</p>
        </div>
        {!editing && (
          <button type="button" onClick={beginEditing} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Pencil size={16} /> Edit profile
          </button>
        )}
      </div>

      {saved && <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">Profile updated successfully.</p>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {editing ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="profile-name" className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
              <input id="profile-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-civic-500" required />
            </div>
            <div>
              <label htmlFor="profile-email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input id="profile-email" value={user?.email || ''} className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-3 text-slate-500" readOnly />
              <p className="mt-1 text-xs text-slate-500">Email cannot be changed here.</p>
            </div>
            <div>
              <label htmlFor="profile-phone" className="mb-2 block text-sm font-medium text-slate-700">Phone number</label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-civic-500">
                <span className="border-r border-slate-300 pr-3 text-sm text-slate-600">+91</span>
                <input id="profile-phone" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value.replace(/\D/g, '').slice(0, 10) })} className="min-w-0 w-full bg-transparent px-3 py-3 outline-none" required />
              </div>
            </div>
            {user?.role === 'CITIZEN' && (
              <>
                <div>
                  <label htmlFor="profile-locality" className="mb-2 block text-sm font-medium text-slate-700">Area or locality</label>
                  <input id="profile-locality" value={form.locality} onChange={(event) => setForm({ ...form, locality: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-civic-500" required />
                </div>
                <div>
                  <label htmlFor="profile-district" className="mb-2 block text-sm font-medium text-slate-700">District</label>
                  <input id="profile-district" value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-civic-500" required />
                </div>
                <div>
                  <label htmlFor="profile-state" className="mb-2 block text-sm font-medium text-slate-700">State or union territory</label>
                  <select id="profile-state" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-civic-500" required>
                    <option value="" disabled>Select your state/UT</option>
                    {indianStates.map((state) => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-civic-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-civic-700 disabled:cursor-not-allowed disabled:opacity-60">
              <Check size={16} /> {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button type="button" onClick={cancelEditing} disabled={saving} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              <X size={16} /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ProfileField label="Full name" value={user?.name} />
          <ProfileField label="Email" value={user?.email} />
          <ProfileField label="Phone" value={formattedPhone} />
          {user?.role === 'CITIZEN' && <ProfileField label="Area or locality" value={user?.locality} />}
          <ProfileField label="District" value={user?.district} />
          <ProfileField label="State / union territory" value={user?.state} />
          <ProfileField label="Role" value={user?.role === 'AUTHORITY' ? 'Authority' : user?.role === 'ADMIN' ? 'Admin' : 'Citizen'} />
        </div>
      )}
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold text-slate-900">{value || 'Not provided'}</p>
    </div>
  );
}
