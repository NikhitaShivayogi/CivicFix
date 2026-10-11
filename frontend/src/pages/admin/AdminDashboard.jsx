import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/auth/admin/requests');
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Unable to fetch admin requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    setRefreshing(true);
    try {
      await axios.patch(`/auth/admin/authority/${id}/${action}`);
      await fetchRequests();
    } catch (error) {
      console.error(`Unable to ${action} authority request:`, error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-civic-700">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Authority approvals</h1>
        </div>
        <button onClick={() => fetchRequests()} className="rounded-xl bg-civic-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-civic-700">
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        {loading ? (
          <p className="text-sm text-slate-500">Loading authority requests...</p>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <ShieldAlert size={26} />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">No authority requests yet</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              This panel will show real authority access requests only when users submit them through the application.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{request.name}</p>
                  <p className="text-sm text-slate-600">{request.email}</p>
                  <p className="text-sm text-slate-500">Status: {request.approvalStatus}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(request._id, 'approve')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                    Approve
                  </button>
                  <button onClick={() => handleAction(request._id, 'reject')} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-emerald-600" size={20} />
          <h2 className="text-xl font-semibold text-slate-900">Real data only</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          No default users, no sample records, and no fake dashboard data are stored. Only real user-generated data appears here.
        </p>
      </section>
    </div>
  );
}
