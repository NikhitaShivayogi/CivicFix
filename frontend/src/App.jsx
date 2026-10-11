import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import CitizenLayout from './layouts/CitizenLayout';
import AuthorityLayout from './layouts/AuthorityLayout';
import AppShell from './components/AppShell';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const CitizenDashboard = lazy(() => import('./pages/citizen/CitizenDashboard'));
const ReportIssuePage = lazy(() => import('./pages/citizen/ReportIssuePage'));
const MyReportsPage = lazy(() => import('./pages/citizen/MyReportsPage'));
const NotificationsPage = lazy(() => import('./pages/citizen/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/citizen/ProfilePage'));
const AuthorityDashboard = lazy(() => import('./pages/authority/AuthorityDashboard'));
const AllIssuesPage = lazy(() => import('./pages/authority/AllIssuesPage'));
const PendingIssuesPage = lazy(() => import('./pages/authority/PendingIssuesPage'));
const AuthorityDetailsPage = lazy(() => import('./pages/authority/AuthorityDetailsPage'));

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === 'AUTHORITY') {
      return <Navigate to="/authority" replace />;
    }
    return <Navigate to="/citizen" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<div role="status" className="flex min-h-64 items-center justify-center text-sm text-slate-500">Loading page...</div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : user.role === 'AUTHORITY' ? '/authority' : '/citizen'} replace /> : <LoginPage />} />
        <Route path="/citizen/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : user.role === 'AUTHORITY' ? '/authority' : '/citizen'} replace /> : <LoginPage expectedRole="CITIZEN" />} />
        <Route path="/authority/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : user.role === 'AUTHORITY' ? '/authority' : '/citizen'} replace /> : <LoginPage expectedRole="AUTHORITY" />} />
        <Route path="/admin/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : user.role === 'AUTHORITY' ? '/authority' : '/citizen'} replace /> : <LoginPage expectedRole="ADMIN" />} />
        <Route path="/register" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : user.role === 'AUTHORITY' ? '/authority' : '/citizen'} replace /> : <RegisterPage />} />
        <Route path="/authority/request" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : user.role === 'AUTHORITY' ? '/authority' : '/citizen'} replace /> : <RegisterPage expectedRole="AUTHORITY" />} />
        <Route path="/authority/register" element={<Navigate to="/authority/request" replace />} />

        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/citizen" element={<ProtectedRoute allowedRoles={['CITIZEN']}><CitizenLayout /></ProtectedRoute>}>
          <Route index element={<CitizenDashboard />} />
          <Route path="report" element={<ReportIssuePage />} />
          <Route path="reports" element={<MyReportsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="/authority" element={<ProtectedRoute allowedRoles={['AUTHORITY']}><AuthorityLayout /></ProtectedRoute>}>
          <Route index element={<AuthorityDashboard />} />
          <Route path="all-issues" element={<AllIssuesPage />} />
          <Route path="pending" element={<PendingIssuesPage />} />
          <Route path="issues/:id" element={<AuthorityDetailsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;