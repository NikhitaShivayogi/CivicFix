import { useEffect, useState } from 'react';
import axios from 'axios';
import { resolveImageUrl } from '../../utils/imageUrl';

const statusStyles = {
  PENDING: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-sky-100 text-sky-700',
  RESOLVED: 'bg-civic-100 text-civic-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  DUPLICATE: 'bg-slate-200 text-slate-700',
};

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/reports/my')
      .then((response) => setReports(response.data.reports))
      .catch(() => setError('Unable to load your reports. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <h1 className="text-3xl font-bold text-slate-900">My reports</h1>
      <div className="mt-6 space-y-4">
        {loading && <p role="status" className="text-sm text-slate-500">Loading reports...</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {!loading && !error && reports.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">You have not submitted any reports yet.</p>
        )}
        {reports.map((report) => (
          <div key={report._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{report.reportId}</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">{report.title}</h2>
              </div>
              <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[report.status] || statusStyles.PENDING}`}>
                {report.status}
              </span>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
              <p><span className="font-medium text-slate-800">Category:</span> {report.category}</p>
              <p><span className="font-medium text-slate-800">Date:</span> {new Date(report.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              <p><span className="font-medium text-slate-800">Location:</span> {report.location.address || `${report.location.latitude}, ${report.location.longitude}`}</p>
            </div>
            {resolveImageUrl(report.imageUrl) && (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <img
                  src={resolveImageUrl(report.imageUrl)}
                  alt={`Evidence for ${report.title}`}
                  className="max-h-64 w-full object-contain"
                />
              </div>
            )}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <p><span className="font-medium text-slate-800">Authority remarks:</span> {report.remarks || 'Awaiting authority review'}</p>
              <p className="mt-2"><span className="font-medium text-slate-800">Last updated:</span> {new Date(report.updatedAt || report.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
