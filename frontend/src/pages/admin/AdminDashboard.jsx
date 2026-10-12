import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Activity, Building2, CheckCircle2, Clock3, FileText, MapPin, RefreshCw, Search, ShieldAlert, ShieldCheck, Users, XCircle } from 'lucide-react';

const pageSize = 10;
const reportStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'DUPLICATE'];
const statusStyles = {
  PENDING: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-sky-100 text-sky-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
  DUPLICATE: 'bg-slate-200 text-slate-700',
};
const approvalStyles = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
};

function formatDate(value) {
  if (!value) return 'Not available';
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatusBadge({ status, styles = statusStyles }) {
  return (
    <span className={`inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
      {status?.replaceAll('_', ' ') || 'UNKNOWN'}
    </span>
  );
}

function ReportCard({ report }) {
  const citizen = report.citizenId;
  const authority = report.authorityId;
  const citizenArea = [citizen?.locality, citizen?.district, citizen?.state].filter(Boolean).join(', ');
  const issueLocation = report.location?.address || (
    report.location ? `${report.location.latitude}, ${report.location.longitude}` : 'Location not provided'
  );

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-civic-700">{report.reportId}</p>
          <h3 className="mt-1 break-words text-base font-semibold text-slate-900">{report.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{report.category} · Submitted {formatDate(report.createdAt)}</p>
        </div>
        <StatusBadge status={report.status} />
      </div>
      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
        <div className="min-w-0">
          <dt className="font-medium text-slate-500">Reported by</dt>
          <dd className="mt-1 break-words font-semibold text-slate-800">{citizen?.name || 'Citizen record unavailable'}</dd>
          <dd className="break-words text-slate-500">{citizen?.email || 'No email on record'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="font-medium text-slate-500">Citizen area</dt>
          <dd className="mt-1 break-words text-slate-800">{citizenArea || 'Area not provided'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="font-medium text-slate-500">Issue location</dt>
          <dd className="mt-1 break-words text-slate-800">{issueLocation}</dd>
        </div>
        <div className="min-w-0">
          <dt className="font-medium text-slate-500">Responsible authority</dt>
          <dd className="mt-1 break-words font-semibold text-slate-800">{authority?.name || 'Unassigned'}</dd>
          {authority?.email && <dd className="break-words text-slate-500">{authority.email}</dd>}
        </div>
      </dl>
      {report.remarks && <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600"><span className="font-medium text-slate-800">Latest update:</span> {report.remarks}</p>}
    </article>
  );
}

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
      <p className="text-sm text-slate-500">{pagination.total} records · Page {pagination.page} of {pagination.pages}</p>
      <div className="flex gap-2">
        <button type="button" onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page <= 1} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
        <button type="button" onClick={() => onPageChange(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}

function AuthorityRecord({ request, actioningId, onAction }) {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="break-words font-semibold text-slate-900">{request.name}</h3>
          <StatusBadge status={request.approvalStatus} styles={approvalStyles} />
        </div>
        <p className="mt-1 break-words text-sm text-slate-600">{request.email}</p>
        <p className="text-sm text-slate-500">{request.phone || 'No phone number'} · Requested {formatDate(request.createdAt)}</p>
      </div>
      {request.approvalStatus === 'PENDING' ? (
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => onAction(request._id, 'approve')} disabled={Boolean(actioningId)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"><CheckCircle2 size={16} /> Approve</button>
          <button type="button" onClick={() => onAction(request._id, 'reject')} disabled={Boolean(actioningId)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"><XCircle size={16} /> Reject</button>
        </div>
      ) : request.approvalStatus === 'APPROVED' ? <Building2 size={18} className="shrink-0 text-emerald-700" /> : <Activity size={18} className="shrink-0 text-slate-400" />}
    </article>
  );
}

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const requestedView = searchParams.get('view');
  const view = ['overview', 'reports', 'citizens', 'authorities'].includes(requestedView) ? requestedView : 'overview';
  const [requests, setRequests] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ citizens: 0, authorities: 0, reports: 0, pendingAuthorities: 0 });
  const [reportPagination, setReportPagination] = useState(null);
  const [citizenPagination, setCitizenPagination] = useState(null);
  const [reportPage, setReportPage] = useState(1);
  const [citizenPage, setCitizenPage] = useState(1);
  const [reportStatus, setReportStatus] = useState('ALL');
  const [reportSearch, setReportSearch] = useState('');
  const [citizenSearch, setCitizenSearch] = useState('');
  const [debouncedReportSearch, setDebouncedReportSearch] = useState('');
  const [debouncedCitizenSearch, setDebouncedCitizenSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actioningId, setActioningId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedReportSearch(reportSearch.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [reportSearch]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedCitizenSearch(citizenSearch.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [citizenSearch]);

  useEffect(() => {
    let active = true;
    let firstLoad = true;
    const loadData = async () => {
      if (firstLoad) setLoading(true);
      try {
        const [requestsResponse, statsResponse] = await Promise.all([
          axios.get('/auth/admin/requests'),
          axios.get('/auth/admin/stats'),
        ]);
        let recordsResponse;
        if (view === 'overview' || view === 'reports') {
          recordsResponse = await axios.get('/reports/admin', {
            params: {
              page: view === 'overview' ? 1 : reportPage,
              limit: view === 'overview' ? 5 : pageSize,
              status: view === 'reports' && reportStatus !== 'ALL' ? reportStatus : undefined,
              search: view === 'reports' ? debouncedReportSearch : undefined,
            },
          });
        } else if (view === 'citizens') {
          recordsResponse = await axios.get('/auth/admin/citizens', {
            params: { page: citizenPage, limit: pageSize, search: debouncedCitizenSearch },
          });
        }

        if (!active) return;
        setRequests(requestsResponse.data.requests || []);
        setStats(statsResponse.data.stats || { citizens: 0, authorities: 0, reports: 0, pendingAuthorities: 0 });
        if (view === 'overview' || view === 'reports') {
          setReports(recordsResponse.data.reports || []);
          setReportPagination(recordsResponse.data.pagination || null);
        } else if (view === 'citizens') {
          setCitizens(recordsResponse.data.citizens || []);
          setCitizenPagination(recordsResponse.data.pagination || null);
        }
        setUpdatedAt(new Date());
        setError('');
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Unable to load admin data. Please try again.');
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
          firstLoad = false;
        }
      }
    };

    loadData();
    const interval = window.setInterval(loadData, 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [view, reportPage, citizenPage, reportStatus, debouncedReportSearch, debouncedCitizenSearch, refreshKey]);

  const refresh = () => {
    setRefreshing(true);
    setRefreshKey((current) => current + 1);
  };

  const handleAuthorityAction = async (id, action) => {
    setActioningId(id);
    setError('');
    setNotice('');
    try {
      await axios.patch(`/auth/admin/authority/${id}/${action}`);
      setNotice(`Authority request ${action === 'approve' ? 'approved' : 'rejected'}.`);
      setRefreshKey((current) => current + 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Unable to ${action} this authority request.`);
    } finally {
      setActioningId('');
    }
  };

  const statCards = [
    { label: 'Citizens', value: stats.citizens, icon: Users, color: 'text-sky-700 bg-sky-50' },
    { label: 'Approved authorities', value: stats.authorities, icon: ShieldCheck, color: 'text-emerald-700 bg-emerald-50' },
    { label: 'Community reports', value: stats.reports, icon: FileText, color: 'text-violet-700 bg-violet-50' },
    { label: 'Awaiting approval', value: stats.pendingAuthorities, icon: ShieldAlert, color: 'text-amber-700 bg-amber-50' },
  ];
  const pendingRequests = requests.filter((request) => request.approvalStatus === 'PENDING');

  return (
    <div className="space-y-6 py-2 sm:py-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-civic-700">Civic operations</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            {view === 'reports' ? 'Report operations' : view === 'citizens' ? 'Citizen directory' : view === 'authorities' ? 'Authority access' : 'Dashboard overview'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {updatedAt ? `Updated ${updatedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · Refreshes every 30 seconds` : 'Connecting to live records'}
          </p>
        </div>
        <button type="button" onClick={refresh} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg bg-civic-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-civic-700 disabled:opacity-60">
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'Refreshing' : 'Refresh'}
        </button>
      </header>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}

      {view === 'overview' && (
        <>
          <section aria-label="Platform totals" className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 xl:grid-cols-4 sm:gap-4">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <article key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${color}`}><Icon size={19} /></div>
                <p className="mt-3 text-3xl font-bold text-slate-900">{loading ? '—' : value}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </article>
            ))}
          </section>
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Latest community reports</h2>
                <p className="mt-1 text-sm text-slate-500">Reporter, resident area, issue location, and assigned authority.</p>
              </div>
              <Link to="/admin?view=reports" className="text-sm font-semibold text-civic-700 hover:text-civic-900">All reports</Link>
            </div>
            {loading && reports.length === 0 && <p role="status" className="text-sm text-slate-500">Loading reports...</p>}
            {!loading && reports.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No community reports have been submitted yet.</p>}
            <div className="space-y-3">{reports.map((report) => <ReportCard key={report._id} report={report} />)}</div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
            <div className="flex items-center gap-2"><Clock3 size={18} className="text-amber-700" /><h2 className="text-lg font-semibold text-slate-900">Authority requests awaiting review</h2></div>
            <div className="mt-4 space-y-3">
              {pendingRequests.slice(0, 5).map((request) => <AuthorityRecord key={request._id} request={request} actioningId={actioningId} onAction={handleAuthorityAction} />)}
              {!loading && pendingRequests.length === 0 && <p className="text-sm text-slate-500">No authority requests need review.</p>}
              {pendingRequests.length > 5 && <Link to="/admin?view=authorities" className="inline-block text-sm font-semibold text-civic-700">View all {pendingRequests.length} pending requests</Link>}
            </div>
          </section>
        </>
      )}

      {view === 'reports' && (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <Search size={17} className="shrink-0 text-slate-400" />
              <input value={reportSearch} onChange={(event) => { setReportSearch(event.target.value); setReportPage(1); }} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search report, title, category, or location" aria-label="Search reports" />
            </label>
            <select value={reportStatus} onChange={(event) => { setReportStatus(event.target.value); setReportPage(1); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm sm:w-52" aria-label="Filter reports by status">
              <option value="ALL">All statuses</option>
              {reportStatuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
            </select>
          </div>
          {loading && reports.length === 0 && <p role="status" className="text-sm text-slate-500">Loading reports...</p>}
          {!loading && reports.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No reports match these filters.</p>}
          <div className="space-y-3">{reports.map((report) => <ReportCard key={report._id} report={report} />)}</div>
          <Pagination pagination={reportPagination} onPageChange={setReportPage} />
        </section>
      )}

      {view === 'citizens' && (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Search size={17} className="shrink-0 text-slate-400" />
            <input value={citizenSearch} onChange={(event) => { setCitizenSearch(event.target.value); setCitizenPage(1); }} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search name, email, locality, district, or state" aria-label="Search citizens" />
          </label>
          {loading && citizens.length === 0 && <p role="status" className="text-sm text-slate-500">Loading citizens...</p>}
          {!loading && citizens.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No citizens match this search.</p>}
          <div className="grid gap-3 lg:grid-cols-2">
            {citizens.map((citizen) => (
              <article key={citizen._id} className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><h2 className="break-words font-semibold text-slate-900">{citizen.name}</h2><p className="break-words text-sm text-slate-600">{citizen.email}</p></div>
                  <Users size={18} className="shrink-0 text-slate-400" />
                </div>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <p className="break-words text-slate-600"><span className="font-medium text-slate-800">Phone:</span> {citizen.phone || 'Not provided'}</p>
                  <p className="break-words text-slate-600"><span className="font-medium text-slate-800">Joined:</span> {formatDate(citizen.createdAt)}</p>
                  <p className="flex min-w-0 items-start gap-1.5 break-words text-slate-600 sm:col-span-2"><MapPin size={15} className="mt-0.5 shrink-0 text-civic-700" />{[citizen.locality, citizen.district, citizen.state].filter(Boolean).join(', ') || 'Area not provided'}</p>
                </div>
              </article>
            ))}
          </div>
          <Pagination pagination={citizenPagination} onPageChange={setCitizenPage} />
        </section>
      )}

      {view === 'authorities' && (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-500">Review access requests and see approved authority accounts.</p>
            <span className="text-sm font-medium text-slate-600">{requests.length} total accounts</span>
          </div>
          {loading && requests.length === 0 && <p role="status" className="text-sm text-slate-500">Loading authorities...</p>}
          {!loading && requests.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No authority accounts found.</p>}
          <div className="space-y-3">{requests.map((request) => <AuthorityRecord key={request._id} request={request} actioningId={actioningId} onAction={handleAuthorityAction} />)}</div>
        </section>
      )}
    </div>
  );
}
