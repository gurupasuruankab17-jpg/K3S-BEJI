import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './store/auth';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { EventDetail } from './pages/EventDetail';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="event/:id" element={<EventDetail />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
