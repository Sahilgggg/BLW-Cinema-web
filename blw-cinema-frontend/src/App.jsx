import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Booking from './pages/Booking';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <div className="font-sans antialiased bg-cinema-bg min-h-screen flex flex-col">
      {/* Navbar sits outside the routes so it is always visible */}
      <Navbar />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protect the Booking route (must be logged in) */}
          <Route 
            path="/book/:id" 
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            } 
          />
          
          {/* Protect the Admin route (must be logged in AND be an admin) */}
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/my-tickets" 
          element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;