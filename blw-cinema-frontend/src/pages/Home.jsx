import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [filter, setFilter] = useState('All');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch movies from MongoDB when the component loads
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/movies');
        const data = await response.json();
        setMovies(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-cinema-bg flex items-center justify-center text-white">Loading Movies...</div>;
  }

  // Fallback if no movies are in the database yet
  const spotlightMovie = movies.length > 0 ? movies[0] : null;

  return (
    <div className="bg-cinema-bg min-h-screen text-cinema-light">
      
      {/* 1. Hero Spotlight Section */}
      {spotlightMovie && (
        <div className="relative h-[60vh] bg-cover bg-center flex items-end p-8 md:p-16" 
             style={{ backgroundImage: `linear-gradient(to top, #0B0C10, transparent), url(${spotlightMovie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80'})` }}>
          <div className="max-w-2xl bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
            <span className="bg-cinema-accent text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Spotlight
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white mt-2 mb-3">{spotlightMovie.title}</h2>
            <p className="text-cinema-text text-sm md:text-base mb-4">{spotlightMovie.genre} • {spotlightMovie.duration}</p>
            <Link to={`/book/${spotlightMovie._id}`} className="inline-block bg-cinema-accent hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg transition duration-200">
              Book Tickets Now
            </Link>
          </div>
        </div>
      )}

      {/* 2. Filter Navigation Tab */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        <div className="flex border-b border-gray-800 gap-6 text-sm md:text-base font-semibold">
          {['All', 'Now Showing', 'Coming Soon'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`pb-4 transition-all duration-200 ${filter === tab ? 'text-cinema-gold border-b-2 border-cinema-gold' : 'text-cinema-text hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 3. Responsive Movies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 py-8">
          {movies.length === 0 ? (
            <div className="col-span-full text-center text-cinema-text py-12">No movies found. Add some from the Admin Dashboard!</div>
          ) : (
            movies.filter(m => filter === 'All' || m.status === filter).map((movie) => (
              <div key={movie._id} className="bg-cinema-surface rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition duration-300 flex flex-col group">
                <div className="relative overflow-hidden h-72 bg-gray-900">
                  <img 
                    src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80'} 
                    alt={movie.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded shadow-md ${movie.status === 'Now Showing' ? 'bg-green-600 text-white' : 'bg-cinema-gold text-black'}`}>
                    {movie.status}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cinema-gold transition duration-200">{movie.title}</h3>
                    <p className="text-cinema-text text-xs mb-4">{movie.genre}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                    <span className="text-sm font-medium text-cinema-light">{movie.duration}</span>
                    <Link to={`/book/${movie._id}`} className="bg-transparent hover:bg-cinema-accent text-cinema-accent hover:text-white border border-cinema-accent font-bold py-1.5 px-4 rounded text-xs transition duration-200">
                      Book Seat
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;