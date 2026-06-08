import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-[#0B0C10] border-b border-gray-800 py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-black text-white tracking-tight hover:opacity-90 transition">
          B.L.W <span className="text-cinema-accent">Cinema</span>
        </Link>

        {/* User Controls */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {/* Show Admin Link if user is an admin */}
              {user.role === 'admin' && (
                <Link to="/admin-dashboard" className="text-cinema-gold text-sm font-bold hover:underline">
                  Admin Panel
                </Link>
              )}
              
              <div className="flex items-center gap-4 border-l border-gray-700 pl-6">
                <span className="text-cinema-text text-sm hidden sm:inline-block">
                  Welcome, <span className="text-white font-bold">{user.name}</span>
                </span>
                
                {/* My Tickets Link */}
                <Link to="/my-tickets" className="text-cinema-text text-sm hover:text-white transition underline-offset-4 hover:underline">
                  My Tickets
                </Link>

                <button 
                  onClick={handleLogout}
                  className="bg-transparent border border-gray-600 text-gray-300 hover:text-white hover:border-white px-4 py-1.5 rounded text-sm font-medium transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link 
              to="/login" 
              className="bg-cinema-accent hover:bg-red-700 text-white px-6 py-2 rounded font-bold transition shadow-lg"
            >
              Sign In
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;