import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, AlertTriangle, CheckCircle2, Clock3, MapPinned } from 'lucide-react';

export default function CitizenDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/reports/my')
      .then((response) => setReports(response.data.reports))
      .catch(() => setError('Unable to load your activity. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total reports', value: reports.length, icon: Activity, tone: 'bg-slate-100 text-slate-700' },
    { label: 'Pending', value: reports.filter((report) => report.status === 'PENDING').length, icon: Clock3, tone: 'bg-amber-100 text-amber-700' },
    { label: 'In progress', value: reports.filter((report) => report.status === 'IN_PROGRESS').length, icon: AlertTriangle, tone: 'bg-sky-100 text-sky-700' },
    { label: 'Resolved', value: reports.filter((report) => report.status === 'RESOLVED').length, icon: CheckCircle2, tone: 'bg-civic-100 text-civic-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-civic-700">Citizen dashboard</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Your civic activity</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-civic-100 px-3 py-2 text-sm font-medium text-civic-700">
            <MapPinned size={16} />
            {reports.filter((report) => ['PENDING', 'IN_PROGRESS'].includes(report.status)).length} active reports
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{loading ? '—' : value}</p>
              </div>
              <div className={`rounded-xl p-3 ${tone}`}>
                <Icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
        <h2 className="text-xl font-semibold text-slate-900">Recently submitted issues</h2>
        <div className="mt-5 space-y-3">
          {loading && <p role="status" className="text-sm text-slate-500">Loading reports...</p>}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {!loading && !error && reports.length === 0 && <p className="text-sm text-slate-600">Your submitted issues will appear here.</p>}
          {reports.slice(0, 3).map((issue) => (
            <div key={issue._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 sm:px-4">
              <div className="min-w-0">
                <p className="break-words font-medium text-slate-800">{issue.title}</p>
                <p className="text-sm text-slate-500">{new Date(issue.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
              <span className="shrink-0 rounded-full bg-civic-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-civic-700">
                {issue.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
