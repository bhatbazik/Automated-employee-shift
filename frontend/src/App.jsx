import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import EmployeeDashboard from './components/employee/Dashboard';
import AdminDashboard from './components/admin/Dashboard';
import ManageSeniority from './components/admin/ManageSeniority';
import ShiftSettings from './components/admin/ShiftSettings';
import GenerateSchedule from './components/admin/GenerateSchedule';
import { ToastContainer } from 'react-toastify';
import Navbar from "./components/common/Navbar";

const PrivateRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));

  useEffect(() => {
    const interval = setInterval(() => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (JSON.stringify(storedUser) !== JSON.stringify(user)) {
        setUser(storedUser);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [user]); 

  const handleLogout = () => {
    localStorage.removeItem("user");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
  };

  return (
    <Router>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/employee" element={<PrivateRoute role="employee"><EmployeeDashboard /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/manage-seniority" element={<PrivateRoute role="admin"><ManageSeniority /></PrivateRoute>} />
        <Route path="/admin/shift-settings" element={<PrivateRoute role="admin"><ShiftSettings /></PrivateRoute>} />
        <Route path="/admin/generate-schedule" element={<PrivateRoute role="admin"><GenerateSchedule /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
