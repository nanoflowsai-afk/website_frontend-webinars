import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WebinarDashboard from './pages/WebinarDashboard';
import WebinarDetailsPage from './pages/WebinarDetailsPage';
import UserProfilePage from './pages/UserProfilePage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/webinars" replace />} />
          <Route path="webinars" element={<WebinarDashboard />} />
          <Route path="webinars/:id" element={<WebinarDetailsPage />} />
          <Route path="profile" element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          } />
          <Route path="registrations" element={
            <ProtectedRoute>
              <MyRegistrationsPage />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
