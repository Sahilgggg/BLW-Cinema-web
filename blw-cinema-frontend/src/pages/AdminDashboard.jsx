import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('movies'); 
  const [movies, setMovies] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  
  // UPDATED: Added showDate and showTime to the initial state
  const [newMovie, setNewMovie] = useState({ 
    title: '', genre: '', duration: '', showDate: '', showTime: '' 
  });
  const [posterFile, setPosterFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchMovies();
    fetchPendingUsers();
  }, []);

  const fetchMovies = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/movies`);
    setMovies(await res.json());
  };

  const fetchPendingUsers = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/pending-users`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    if (res.ok) setPendingUsers(await res.json());
  };

  // --- ADD MOVIE WITH IMAGE UPLOAD ---
  const handleAddMovie = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData();
    formData.append('title', newMovie.title);
    formData.append('genre', newMovie.genre);
    formData.append('duration', newMovie.duration);
    
    // UPDATED: Append the date and time to the backend request
    formData.append('showDate', newMovie.showDate);
    formData.append('showTime', newMovie.showTime);
    
    if (posterFile) formData.append('poster', posterFile);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/movies`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData, 
      });

      if (response.ok) {
        // UPDATED: Clear the date and time fields after success
        setNewMovie({ title: '', genre: '', duration: '', showDate: '', showTime: '' });
        setPosterFile(null);
        document.getElementById('file-upload').value = ''; 
        fetchMovies();
        alert('Movie & Poster published successfully!');
      }
    } catch (error) {
      console.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMovie = async (id) => {
    if (!window.confirm("Delete movie?")) return;
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/movies/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.token}` },
    });
    if (res.ok) fetchMovies();
  };

  // --- USER APPROVALS ---
  const handleApproveUser = async (id) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/approve-user/${id}`, {
      method: 'PUT', headers: { Authorization: `Bearer ${user.token}` }
    });
    if (res.ok) fetchPendingUsers();
  };

  const handleRejectUser = async (id) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/reject-user/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` }
    });
    if (res.ok) fetchPendingUsers();
  };

  return (
    <div className="min-h-screen bg-cinema-bg text-cinema-light pb-12">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0B0C10] shadow-md">
        <h2 className="text-xl font-bold text-white"><span className="text-cinema-gold">Admin</span> Dashboard</h2>
        <Link to="/" className="text-cinema-text hover:text-white transition text-sm">Return to Site &rarr;</Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="flex border-b border-gray-800 mb-8">
          <button onClick={() => setActiveTab('movies')} className={`px-6 py-3 font-bold transition ${activeTab === 'movies' ? 'text-cinema-gold border-b-2 border-cinema-gold' : 'text-gray-500'}`}>Manage Movies</button>
          <button onClick={() => setActiveTab('users')} className={`px-6 py-3 font-bold transition flex items-center gap-2 ${activeTab === 'users' ? 'text-cinema-gold border-b-2 border-cinema-gold' : 'text-gray-500'}`}>
            Pending Approvals {pendingUsers.length > 0 && <span className="bg-cinema-accent text-white text-xs px-2 py-0.5 rounded-full">{pendingUsers.length}</span>}
          </button>
        </div>

        {/* MOVIES TAB */}
        {activeTab === 'movies' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-cinema-surface p-6 rounded-xl border border-gray-800 h-fit">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">Add New Movie</h3>
              <form onSubmit={handleAddMovie} className="space-y-4">
                <input type="text" required value={newMovie.title} onChange={e => setNewMovie({...newMovie, title: e.target.value})} className="w-full bg-[#0B0C10] border border-gray-700 rounded px-3 py-2 text-white text-sm" placeholder="Title"/>
                <input type="text" required value={newMovie.genre} onChange={e => setNewMovie({...newMovie, genre: e.target.value})} className="w-full bg-[#0B0C10] border border-gray-700 rounded px-3 py-2 text-white text-sm" placeholder="Genre"/>
                <input type="text" required value={newMovie.duration} onChange={e => setNewMovie({...newMovie, duration: e.target.value})} className="w-full bg-[#0B0C10] border border-gray-700 rounded px-3 py-2 text-white text-sm" placeholder="Duration (e.g. 140 min)"/>
                
                {/* UPDATED: Added Date and Time UI Inputs */}
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-xs text-cinema-text mb-1">Show Date</label>
                    <input type="date" required 
                      value={newMovie.showDate} 
                      onChange={e => setNewMovie({...newMovie, showDate: e.target.value})} 
                      className="w-full bg-[#0B0C10] border border-gray-700 rounded px-3 py-2 text-white text-sm" 
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs text-cinema-text mb-1">Show Time</label>
                    <input type="time" required 
                      value={newMovie.showTime} 
                      onChange={e => setNewMovie({...newMovie, showTime: e.target.value})} 
                      className="w-full bg-[#0B0C10] border border-gray-700 rounded px-3 py-2 text-white text-sm" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-cinema-text mb-1 mt-2">Upload Poster Image</label>
                  <input id="file-upload" type="file" accept="image/*" required onChange={e => setPosterFile(e.target.files[0])} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"/>
                </div>

                <button type="submit" disabled={isUploading} className="w-full bg-cinema-gold hover:bg-yellow-600 text-black font-bold py-2 rounded transition mt-2">
                  {isUploading ? 'Uploading to Cloudinary...' : 'Publish to Site'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-cinema-surface p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">Currently Playing</h3>
              <div className="space-y-3">
                {movies.map(movie => (
                  <div key={movie._id} className="flex justify-between items-center bg-[#0B0C10] p-4 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-4">
                      {movie.posterUrl && <img src={movie.posterUrl} alt={movie.title} className="w-10 h-14 object-cover rounded" />}
                      <div>
                        <h4 className="text-white font-bold">{movie.title}</h4>
                        {/* UPDATED: Now displays the show date and time alongside the genre */}
                        <p className="text-xs text-cinema-text">{movie.genre} • <span className="text-cinema-gold">{movie.showDate} @ {movie.showTime}</span></p>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveMovie(movie._id)} className="text-xs text-cinema-accent border border-cinema-accent px-3 py-1 rounded">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-cinema-surface p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">Pending Admin Registrations</h3>
            {pendingUsers.length === 0 ? <p className="text-cinema-text py-8 text-center">No pending users.</p> : (
              <div className="space-y-3">
                {pendingUsers.map(u => (
                  <div key={u._id} className="flex justify-between items-center bg-[#0B0C10] p-4 rounded-lg border border-gray-800">
                    <div>
                      <h4 className="text-white font-bold">{u.name}</h4>
                      <p className="text-xs text-cinema-text">{u.email} • Requested Role: <span className="text-cinema-gold uppercase">{u.role}</span></p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveUser(u._id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">Approve</button>
                      <button onClick={() => handleRejectUser(u._id)} className="border border-gray-600 text-gray-400 hover:text-white px-3 py-1 rounded text-xs font-bold">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;