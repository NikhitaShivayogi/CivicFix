import { useEffect, useState } from 'react';
import axios from 'axios';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/notifications')
      .then((response) => setNotifications(response.data.notifications))
      .catch(() => setError('Unable to load notifications. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const markAsRead = async (notificationId) => {
    setError('');
    try {
      const response = await axios.patch(`/notifications/${notificationId}/read`);
      setNotifications((current) => current.map((notification) =>
        notification._id === notificationId ? response.data.notification : notification
      ));
      window.dispatchEvent(new Event('civicfix:notifications-updated'));
    } catch {
      setError('Unable to update this notification. Please try again.');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
      <div className="mt-6 space-y-4">
        {loading && <p role="status" className="text-sm text-slate-500">Loading notifications...</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {!loading && !error && notifications.length === 0 && <p className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">You have no notifications.</p>}
        {notifications.map((notification) => (
          <div key={notification._id} className={`rounded-2xl border p-4 ${notification.isRead ? 'border-slate-200 bg-slate-50' : 'border-civic-200 bg-civic-50'}`}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-semibold text-slate-900">{notification.title}</h2>
              {!notification.isRead && <span className="rounded-full bg-civic-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">New</span>}
            </div>
            <p className="mt-2 text-sm text-slate-600">{notification.message}</p>
            <div className="mt-3 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              {!notification.isRead && (
                <button type="button" onClick={() => markAsRead(notification._id)} className="text-sm font-semibold text-civic-700 hover:text-civic-900">
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
