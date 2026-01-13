import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import GigList from './pages/Gigs/GigList';
import GigDetails from './pages/Gigs/GigDetails';
import CreateGig from './pages/Gigs/CreateGig';
import MyGigs from './pages/Gigs/MyGigs';
import MyBids from './pages/Bids/MyBids';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-200">
        <Routes>
          {/* Public Routes with Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/gigs" replace />} />
            <Route path="/gigs" element={<GigList />} />
            <Route path="/gigs/:id" element={<GigDetails />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-gig" element={<CreateGig />} />
              <Route path="/my-gigs" element={<MyGigs />} />
              <Route path="/my-bids" element={<MyBids />} />
            </Route>
          </Route>

          {/* Auth pages standalone (optional, or include in Layout if desired) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
