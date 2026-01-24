import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminRegister from './pages/AdminRegister';
import Dashboard from './pages/Dashboard';
import BusinessStats from './pages/BusinessStats';
import RevenueStats from './pages/RevenueStats';
import UsageStats from './pages/UsageStats';
import UsersStats from './pages/UsersStats';
import TherapyManagement from './pages/TherapyManagement';
import PaymentManagement from './pages/PaymentManagement';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { ToastContainer } from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';

const AppRoutes = () => {
  const { isAuthenticated, isBusiness, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/admin" replace />} />
      <Route path="/admin-register" element={!isAuthenticated ? <AdminRegister /> : <Navigate to="/admin" replace />} />
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="statistics" element={<BusinessStats />} />
        <Route path="revenue" element={<RevenueStats />} />
        <Route path="users" element={<UsersStats />} />
        <Route path="usage" element={<UsageStats />} />
        <Route path="therapy" element={<TherapyManagement />} />
        <Route path="payments" element={<PaymentManagement />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/" element={<Navigate to={isAuthenticated && isBusiness ? "/admin" : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

