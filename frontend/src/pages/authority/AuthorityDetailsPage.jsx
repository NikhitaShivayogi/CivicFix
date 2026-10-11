import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, CheckCircle2, UserRoundCheck } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../context/AuthContext';

const statusOptions = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'DUPLICATE'];

export default function AuthorityDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('PENDING');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    axios.get(`/authority/reports/${id}`)
      .then((response) => {
        setReport(response.data.report);
        setHistory(response.data.history);
        setStatus(response.data.report.status);
        setRemark(response.data.report.remarks || '');
      })
      .catch(() => setError('Unable to load this issue. Please try again.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await axios.patch(`/authority/reports/${id}/status`, { status, remark });
      const response = await axios.get(`/authority/reports/${id}`);
      setReport(response.data.report);
      setHistory(response.data.history);
      setSuccess('Issue update saved. The citizen has been notified.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update this issue. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignment = async () => {
    setAssigning(true);
    setError('');
    setSuccess('');

    try {
      await axios.patch(`/authority/reports/${id}/assign`);
      const response = await axios.get(`/authority/reports/${id}`);
      setReport(response.data.report);
      setHistory(response.data.history);
      setSuccess('You are now responsible for this issue. The citizen has been notified.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to take responsibility for this issue.');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <p role="status" className="text-sm text-slate-500">Loading issue...</p>;
  if (!report) return <p role="alert" className="text-sm text-red-700">{error || 'Issue not found.'}</p>;

  const [latitude, longitude] = [report.location.latitude, report.location.longitude];
  const imageUrl = report.imageUrl ? new URL(report.imageUrl, axios.defaults.baseURL).toString() : '';
  const isResponsible = report.authorityId && String(report.authorityId._id || report.authorityId) === String(user?._id || user?.id);

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{report.reportId}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{report.title}</h1>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">{report.status.replace('_', ' ')}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Issue description</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{report.description}</p>
          </div>

          {imageUrl && <img src={imageUrl} alt={`Evidence for ${report.title}`} className="max-h-96 w-full rounded-xl border border-slate-200 object-contain" />}

          <div className="h-72 overflow-hidden rounded-2xl border border-slate-200">
            <MapContainer center={[latitude, longitude]} zoom={14} scrollWheelZoom className="h-full w-full">
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[latitude, longitude]}>
                <Popup>{report.location.address || report.title}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Issue details</h2>
            <dl className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex gap-2"><dt className="font-medium text-slate-800">Category:</dt><dd>{report.category}</dd></div>
              <div><dt className="font-medium text-slate-800">Reported by:</dt><dd className="mt-1">{report.citizenId?.name || 'Citizen'}</dd>{report.citizenId?.email && <dd className="text-xs text-slate-500">{report.citizenId.email}</dd>}{report.citizenId?.phone && <dd className="text-xs text-slate-500">{report.citizenId.phone}</dd>}</div>
              <div><dt className="font-medium text-slate-800">Responsible authority:</dt><dd className="mt-1">{report.authorityId?.name || 'Unassigned'}</dd>{report.authorityId?.email && <dd className="text-xs text-slate-500">{report.authorityId.email}</dd>}</div>
              <div className="flex gap-2"><dt className="font-medium text-slate-800">Location:</dt><dd>{report.location.address || `${latitude}, ${longitude}`}</dd></div>
              <div className="flex gap-2"><dt className="font-medium text-slate-800">Date:</dt><dd>{new Date(report.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</dd></div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Authority review</h2>
            {!report.authorityId ? (
              <div>
                <p className="mt-2 text-sm text-slate-600">No authority has taken responsibility for this issue yet.</p>
                <button type="button" onClick={handleAssignment} disabled={assigning} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-civic-600 px-4 py-3 font-semibold text-white hover:bg-civic-700 disabled:opacity-60">
                  <UserRoundCheck size={17} /> {assigning ? 'Assigning...' : 'Take responsibility'}
                </button>
              </div>
            ) : isResponsible ? (
              <form onSubmit={handleUpdate}>
                <p className="mt-2 text-sm font-medium text-green-800">You are responsible for this issue.</p>
                <label htmlFor="issue-status" className="mt-3 block text-sm font-medium text-slate-700">Status</label>
                <select id="issue-status" value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">
                  {statusOptions.map((option) => <option key={option} value={option}>{option.replace('_', ' ')}</option>)}
                </select>
                <label htmlFor="issue-remark" className="mt-3 block text-sm font-medium text-slate-700">Remark</label>
                <textarea id="issue-remark" value={remark} onChange={(event) => setRemark(event.target.value)} rows="4" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-civic-500" placeholder="Add an update for the citizen" />
                {error && <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-red-700"><AlertCircle size={16} />{error}</p>}
                {success && <p role="status" className="mt-3 flex items-center gap-2 text-sm text-green-700"><CheckCircle2 size={16} />{success}</p>}
                <button type="submit" disabled={saving} className="mt-3 w-full rounded-xl bg-civic-600 px-4 py-3 font-semibold text-white hover:bg-civic-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving...' : 'Save update'}</button>
              </form>
            ) : (
              <p className="mt-2 text-sm text-slate-600">This issue is assigned to {report.authorityId.name}. Only the responsible authority can update it.</p>
            )}
            {!isResponsible && error && <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-red-700"><AlertCircle size={16} />{error}</p>}
            {!isResponsible && success && <p role="status" className="mt-3 flex items-center gap-2 text-sm text-green-700"><CheckCircle2 size={16} />{success}</p>}
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h2 className="text-lg font-semibold text-slate-900">Status history</h2>
        {history.length === 0 ? <p className="mt-3 text-sm text-slate-600">No status updates yet.</p> : (
          <ol className="mt-3 space-y-3">
            {history.map((item) => (
              <li key={item._id} className="border-l-2 border-civic-300 pl-4 text-sm">
                <p className="font-medium text-slate-800">{item.previousStatus || 'Submitted'} → {item.newStatus.replace('_', ' ')}</p>
                {item.remark && <p className="mt-1 text-slate-600">{item.remark}</p>}
                <p className="mt-1 text-xs text-slate-500">{item.updatedBy?.name || 'Authority'} · {new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
