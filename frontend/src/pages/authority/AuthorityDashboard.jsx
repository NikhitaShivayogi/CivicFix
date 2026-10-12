import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart3, CheckCircle2, Clock3, Filter, XCircle } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AuthorityDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/authority/reports')
      .then((response) => setReports(response.data.reports))
      .catch(() => setError('Unable to load authority metrics. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const countStatus = (status) => reports.filter((report) => report.status === status).length;
  const stats = [
    { label: 'Total reported issues', value: reports.length, icon: BarChart3 },
    { label: 'Pending', value: countStatus('PENDING'), icon: Clock3 },
    { label: 'In progress', value: countStatus('IN_PROGRESS'), icon: Filter },
    { label: 'Resolved', value: countStatus('RESOLVED'), icon: CheckCircle2 },
    { label: 'Rejected', value: countStatus('REJECTED'), icon: XCircle },
  ];
  const categoryStats = Object.entries(
    reports.reduce((counts, report) => {
      counts[report.category] = (counts[report.category] || 0) + 1;
      return counts;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-civic-700">Authority dashboard</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Operational overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{loading ? '—' : value}</p>
              </div>
              <div className="rounded-xl bg-civic-100 p-3 text-civic-700">
                <Icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-900">Issues by category</h2>
        {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
        {loading && <p role="status" className="mt-4 text-sm text-slate-500">Loading report data...</p>}
        {!loading && !error && categoryStats.length === 0 && <p className="mt-4 text-sm text-slate-600">Issue counts will appear as reports are submitted.</p>}
        {!loading && !error && categoryStats.length > 0 && (
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
