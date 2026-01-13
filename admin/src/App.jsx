import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReceptionManagement from './pages/ReceptionManagement';
import ParentManagement from './pages/ParentManagement';
import TeacherManagement from './pages/TeacherManagement';
import GroupManagement from './pages/GroupManagement';
import SchoolRatings from './pages/SchoolRatings';
import { ToastContainer } from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';

const AppRoutes = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

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
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="receptions" element={<ReceptionManagement />} />
        <Route path="parents" element={<ParentManagement />} />
        <Route path="teachers" element={<TeacherManagement />} />
        <Route path="groups" element={<GroupManagement />} />
        <Route path="school-ratings" element={<SchoolRatings />} />
      </Route>

      <Route path="/" element={<Navigate to={isAuthenticated && isAdmin ? "/admin" : "/login"} replace />} />
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

