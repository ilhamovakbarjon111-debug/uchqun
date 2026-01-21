import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/context/AuthContext';
import { ToastProvider } from './shared/context/ToastContext';
import { NotificationProvider } from './shared/context/NotificationContext';
import { ToastContainer } from './shared/components/Toast';
import Login from './pages/Login';
import ProtectedRoute from './shared/components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ParentManagement from './pages/ParentManagement';
import Activities from './pages/Activities';
import Meals from './pages/Meals';
import Media from './pages/Media';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import MonitoringJournal from './pages/MonitoringJournal';
import ParentApp from './parent/ParentApp';
import ParentDashboard from './parent/pages/Dashboard';
import ChildProfile from './parent/pages/ChildProfile';
import ParentActivities from './parent/pages/Activities';
import ParentMeals from './parent/pages/Meals';
import ParentMedia from './parent/pages/Media';
import ParentChat from './parent/pages/Chat';
import Notifications from './parent/pages/Notifications';
import Help from './parent/pages/Help';
import AIChat from './parent/pages/AIChat';
import TeacherRating from './parent/pages/TeacherRating';

function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <ToastContainer />
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* Parent routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute requireRole="parent">
                    <ParentApp />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ParentDashboard />} />
                <Route path="child" element={<ChildProfile />} />
                <Route path="activities" element={<ParentActivities />} />
                <Route path="meals" element={<ParentMeals />} />
                <Route path="media" element={<ParentMedia />} />
                <Route path="ai-chat" element={<AIChat />} />
                <Route path="chat" element={<ParentChat />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="help" element={<Help />} />
                <Route path="rating" element={<TeacherRating />} />
              </Route>

              {/* Teacher routes */}
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute requireRole="teacher">
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="parents" element={<ParentManagement />} />
                <Route path="profile" element={<Profile />} />
                <Route path="activities" element={<Activities />} />
                <Route path="meals" element={<Meals />} />
                <Route path="media" element={<Media />} />
                <Route path="chat" element={<Chat />} />
                <Route path="monitoring" element={<MonitoringJournal />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ToastProvider>
  );
}

export default App;

