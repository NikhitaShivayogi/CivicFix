import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ImageOff, Search } from 'lucide-react';
import { resolveImageUrl } from '../../utils/imageUrl';

const statusStyles = {
  PENDING: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-sky-100 text-sky-700',
  RESOLVED: 'bg-civic-100 text-civic-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  DUPLICATE: 'bg-slate-200 text-slate-700',
};

export default function AllIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/authority/reports')
      .then((response) => setIssues(response.data.reports))
      .catch(() => setError('Unable to load issues. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredIssues = issues.filter((issue) => {
    const matchesStatus = status === 'ALL' || issue.status === status;
    const searchText = `${issue.reportId} ${issue.title} ${issue.category} ${issue.citizenId?.name || ''} ${issue.authorityId?.name || ''}`.toLowerCase();
    return matchesStatus && searchText.includes(search.trim().toLowerCase());
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <h1 className="text-3xl font-bold text-slate-900">All issues</h1>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <Search size={18} className="shrink-0 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search report ID, title, or category" aria-label="Search issues" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Filter by status">
          <option value="ALL">All statuses</option>
          {Object.keys(statusStyles).map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}
        </select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Photo</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Report ID</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Title</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Reported by</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Category</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Location</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Responsible authority</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredIssues.map((issue) => {
              const photoUrl = resolveImageUrl(issue.imageUrl);
              return (
              <tr key={issue._id}>
                <td className="px-4 py-3">
                  {photoUrl ? (
                    <img src={photoUrl} alt="" className="h-12 w-12 rounded-lg border border-slate-200 object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
                      <ImageOff size={16} />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{issue.reportId}</td>
                <td className="px-4 py-3 text-sm text-slate-800">{issue.title}</td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  <p className="font-medium text-slate-900">{issue.citizenId?.name || 'Citizen'}</p>
                  <p className="text-xs text-slate-500">{issue.citizenId?.email || ''}</p>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{issue.category}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{issue.location.address || `${issue.location.latitude}, ${issue.location.longitude}`}</td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {issue.authorityId?.name || <span className="text-slate-400">Unassigned</span>}
                  {issue.authorityId?.email && <p className="text-xs text-slate-500">{issue.authorityId.email}</p>}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex rounded-full px-2.5 py-1 font-semibold ${statusStyles[issue.status] || statusStyles.PENDING}`}>
                    {issue.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm"><Link to={`/authority/issues/${issue._id}`} className="font-semibold text-civic-700 hover:text-civic-900">Review</Link></td>
              </tr>
              );
            })}
            {!loading && !error && filteredIssues.length === 0 && <tr><td colSpan="9" className="px-4 py-8 text-center text-sm text-slate-500">No issues match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
      {loading && <p role="status" className="mt-4 text-sm text-slate-500">Loading issues...</p>}
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    </div>
  );
}
