import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ImageOff } from 'lucide-react';
import { getReportImageUrls } from '../../utils/imageUrl';

export default function PendingIssuesPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/authority/reports', { params: { status: 'PENDING' } })
      .then((response) => setPending(response.data.reports))
      .catch(() => setError('Unable to load pending issues. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Pending issues</h1>
      <div className="mt-6 space-y-4">
        {loading && <p role="status" className="text-sm text-slate-500">Loading pending issues...</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {!loading && !error && pending.length === 0 && <p className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">There are no pending issues to review.</p>}
        {pending.map((issue) => {
          const photoUrls = getReportImageUrls(issue);
          const photoUrl = photoUrls[0];
          return (
          <div key={issue._id} className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:p-4">
            <div className="flex min-w-0 items-center gap-4">
              {photoUrl ? (
                <div className="shrink-0">
                  <img src={photoUrl} alt="" className="h-16 w-16 rounded-lg border border-slate-200 object-cover" />
                  {photoUrls.length > 1 && <p className="mt-1 text-center text-xs text-slate-500">+{photoUrls.length - 1}</p>}
                </div>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400">
                  <ImageOff size={20} />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">{issue.reportId}</p>
                <h2 className="mt-2 break-words text-lg font-semibold text-slate-900">{issue.title}</h2>
                <p className="mt-1 break-words text-sm text-slate-600">{issue.category} · {issue.location.address || `${issue.location.latitude}, ${issue.location.longitude}`}</p>
                <p className="mt-2 break-words text-sm text-slate-700">Reported by: <span className="font-medium">{issue.citizenId?.name || 'Citizen'}</span>{issue.citizenId?.email ? ` · ${issue.citizenId.email}` : ''}</p>
                <p className="mt-1 text-sm text-slate-700">Responsible: <span className="font-medium">{issue.authorityId?.name || 'Unassigned'}</span></p>
              </div>
            </div>
            <Link to={`/authority/issues/${issue._id}`} className="shrink-0 rounded-xl bg-civic-600 px-4 py-2 text-center font-medium text-white transition hover:bg-civic-700 sm:w-auto">
              Review
            </Link>
          </div>
          );
        })}
      </div>
    </div>
  );
}
