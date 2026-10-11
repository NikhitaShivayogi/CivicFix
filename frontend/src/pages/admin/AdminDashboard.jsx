import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, FileText, ShieldAlert, ShieldCheck, Users, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ citizens: 0, authorities: 0, reports: 0, pendingAuthorities: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [requestsRes, statsRes] = await Promise.all([
        axios.get('/auth/admin/requests'),
        axios.get('/auth/admin/stats'),
      ]);
      setRequests(requestsRes.data.requests || []);
      setStats(statsRes.data.stats || stats);
    } catch (error) {
      console.error('Unable to fetch admin data:', error);
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id, action) => {
    setRefreshing(true);
    try {
      await axios.patch(`/auth/admin/authority/${id}/${action}`);
      await fetchData();
    } catch (error) {
      console.error(`Unable to ${action} authority request:`, error);
    } finally {
      setRefreshing(false);
    }
  };

  const statCards = [
    { label: 'Citizens', value: stats.citizens, icon: Users, color: 'text-sky-600 bg-sky-50' },
    { label: 'Authorities', value: stats.authorities, icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Reports', value: stats.reports, icon: FileText, color: 'text-violet-600 bg-violet-50' },
    { label: 'Pending approvals', value: stats.pendingAuthorities, icon: ShieldAlert, color: 'text-amber-600 bg-amber-50' },
  ];

  const pendingRequests = requests.filter((r) => r.approvalStatus === 'PENDING');
  const decidedRequests = requests.filter((r) => r.approvalStatus !== 'PENDING');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-civic-700">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Dashboard overview</h1>
        </div>
        <button onClick={fetchData} className="rounded-xl bg-civic-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-civic-700">
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
              <Icon size={20} />
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Authority approvals</h2>
            <p className="mt-1 text-sm text-slate-500">Review and manage authority access requests.</p>
          </div>
          {pendingRequests.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              {pendingRequests.length} pending
            </span>
          )}
        </div>

        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-slate-500">Loading authority requests...</p>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <ShieldAlert size={26} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No authority requests yet</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                This panel will show real authority access requests only when users submit them through the application.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request._id} className="flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{request.name}</p>
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Pending</span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600">{request.email}</p>
                    {request.phone && <p className="text-xs text-slate-500">{request.phone}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(request._id, 'approve')} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                      <CheckCircle2 size={16} /> Approve
                    </button>
                    <button onClick={() => handleAction(request._id, 'reject')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))}

              {decidedRequests.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Previously reviewed</p>
                  <div className="space-y-3">
                    {decidedRequests.map((request) => (
                      <div key={request._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800">{request.name}</p>
                          <p className="text-sm text-slate-500">{request.email}</p>
                        </div>
                        <span
                          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-sm font-semibold ${
                            request.approvalStatus === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {request.approvalStatus === 'APPROVED' ? 'Approved' : 'Rejected'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
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
