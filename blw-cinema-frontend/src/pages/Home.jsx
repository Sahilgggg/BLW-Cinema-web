import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [filter, setFilter] = useState('All');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024);

  // Track screen size for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch movies from MongoDB when the component loads
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/movies`);
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

  // Determine grid columns based on screen size
  const getGridCols = () => {
    if (isMobile) return '1fr';
    if (isTablet) return '1fr 1fr';
    return '1fr 1fr 1fr 1fr';
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#080a0e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          width: '44px', height: '44px',
          border: '2px solid rgba(201,146,10,0.2)',
          borderTopColor: '#c9920a',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{
          fontSize: '11px', letterSpacing: '0.14em',
          textTransform: 'uppercase', color: '#6b5c42',
        }}>
          Loading Movies...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Fallback if no movies are in the database yet
  const spotlightMovie = movies.length > 0 ? movies[0] : null;

  return (
    <div style={{
      backgroundColor: '#080a0e',
      minHeight: '100vh',
      color: '#e8dcc8',
      fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* 1. Hero Spotlight Section */}
      {spotlightMovie && (
        <div style={{
          position: 'relative',
          height: isMobile ? '55vh' : '62vh',
          overflow: 'hidden',
        }}>

          {/* Film strip top */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '14px', zIndex: 3, opacity: 0.5,
            background: 'repeating-linear-gradient(90deg, #0d0f14 0 16px, #1a1c22 16px 20px)',
          }} />

          {/* Poster background */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `
              linear-gradient(to top, #080a0e 0%, rgba(8,10,14,0.3) 60%),
              linear-gradient(to right, rgba(8,10,14,0.95) 0%, rgba(8,10,14,0.5) 50%, transparent 100%),
              url(${spotlightMovie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80'})
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />

          {/* Left amber glow */}
          <div style={{
            position: 'absolute', left: '-60px', top: '-40px',
            width: '350px', height: '350px', pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(180,120,0,0.2) 0%, transparent 70%)',
          }} />

          {/* Curtain vignettes */}
          <div style={{
            position: 'absolute', left: 0, top: 0, width: '40px', height: '100%',
            background: 'linear-gradient(90deg, rgba(60,20,0,0.7), transparent)',
            zIndex: 2, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', right: 0, top: 0, width: '40px', height: '100%',
            background: 'linear-gradient(270deg, rgba(60,20,0,0.7), transparent)',
            zIndex: 2, pointerEvents: 'none',
          }} />

          {/* Hero Content */}
          <div style={{
            position: 'relative', zIndex: 4,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: isMobile ? '0 16px 28px' : '0 48px 36px',
          }}>

            {/* Spotlight badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'linear-gradient(90deg, #c9920a, #f0c040)',
              color: '#1a0a00',
              fontSize: '9px', fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              padding: '4px 12px', borderRadius: '2px',
              width: 'fit-content', marginBottom: '10px',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#1a0a00' }} />
              Spotlight
            </div>

            {/* Movie title */}
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: isMobile ? '42px' : '68px',
              letterSpacing: '0.04em',
              color: '#ffffff',
              lineHeight: 1,
              marginBottom: '8px',
              textShadow: '0 2px 30px rgba(0,0,0,0.8)',
            }}>
              {spotlightMovie.title.toUpperCase()}
            </div>

            {/* Genre & Duration */}
            <div style={{
              fontSize: isMobile ? '12px' : '13px',
              color: '#b0956a',
              letterSpacing: '0.08em',
              marginBottom: '20px',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {spotlightMovie.genre} &bull; {spotlightMovie.duration}
            </div>

            {/* Book Now button */}
            <Link
              to={`/book/${spotlightMovie._id}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(90deg, #c9920a, #e8aa20)',
                color: '#0d0700',
                fontSize: isMobile ? '11px' : '12px',
                fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: isMobile ? '10px 20px' : '12px 28px',
                borderRadius: '2px', textDecoration: 'none',
                width: 'fit-content',
                boxShadow: '0 4px 24px rgba(200,140,0,0.3)',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              ▶ Book Tickets Now
            </Link>
          </div>
        </div>
      )}

      {/* Gold divider */}
      <div style={{
        height: '1px',
        margin: '0 24px',
        background: 'linear-gradient(90deg, transparent, rgba(200,146,10,0.4), transparent)',
      }} />

      {/* 2. Filter Navigation Tab */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: isMobile ? '0 16px' : '0 32px',
      }}>

        {/* Section label */}
        <p style={{
          fontSize: '9px', letterSpacing: '0.18em',
          textTransform: 'uppercase', color: '#6b5c42',
          paddingTop: '20px', paddingBottom: '0',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Now at B.L.W Cinema Hall
        </p>

        {/* Filter tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          marginTop: '12px',
          overflowX: 'auto', // scrollable on mobile if needed
          WebkitOverflowScrolling: 'touch',
        }}>
          {['All', 'Now Showing', 'Coming Soon'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                position: 'relative',
                fontSize: '11px', fontWeight: 500,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: isMobile ? '12px 14px' : '12px 22px',
                border: 'none', background: 'none',
                cursor: 'pointer', whiteSpace: 'nowrap',
                color: filter === tab ? '#f0c040' : '#6b5c42',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'color 0.2s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {tab}
              {/* Active gold underline */}
              {filter === tab && (
                <span style={{
                  position: 'absolute', bottom: '-1px', left: 0, right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, #c9920a, #f0c040)',
                }} />
              )}
            </button>
          ))}
        </div>

        {/* 3. Responsive Movies Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: getGridCols(),
          gap: isMobile ? '16px' : '20px',
          padding: '20px 0 40px',
        }}>
          {movies.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1', textAlign: 'center',
              color: '#4a3c2a', padding: '48px 0',
              fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
            }}>
              No movies found. Add some from the Admin Dashboard!
            </div>
          ) : (
            movies
              .filter(m => filter === 'All' || m.status === filter)
              .map((movie) => (
                <MovieCard key={movie._id} movie={movie} isMobile={isMobile} />
              ))
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MOVIE CARD — Separate component for cleanliness
// ==========================================
function MovieCard({ movie, isMobile }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#0f1117',
        border: hovered
          ? '1px solid rgba(201,146,10,0.45)'
          : '1px solid rgba(255,255,255,0.07)',
        borderRadius: '4px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'border-color 0.25s, transform 0.25s',
      }}
    >
      {/* Poster image */}
      <div style={{
        position: 'relative',
        height: isMobile ? '220px' : '260px',
        overflow: 'hidden',
        backgroundColor: '#141620',
      }}>
        <img
          src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80'}
          alt={movie.title}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.4s',
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';
          }}
        />

        {/* Status badge — green for Now Showing, gold for Coming Soon */}
        <span style={{
          position: 'absolute', top: '10px', right: '10px',
          fontSize: '9px', fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '3px 8px', borderRadius: '2px',
          fontFamily: "'DM Sans', sans-serif",
          ...(movie.status === 'Now Showing'
            ? { background: 'rgba(22,160,80,0.88)', color: '#e8ffe8' }
            : { background: 'rgba(201,146,10,0.88)', color: '#1a0a00' })
        }}>
          {movie.status}
        </span>
      </div>

      {/* Card body */}
      <div style={{
        padding: '14px 16px 16px',
        display: 'flex', flexDirection: 'column',
        flex: 1, justifyContent: 'space-between',
      }}>
        <div>
          {/* Movie title */}
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: isMobile ? '16px' : '15px',
            fontWeight: 700,
            color: hovered ? '#f0c040' : '#e8dcc8',
            marginBottom: '4px',
            lineHeight: 1.2,
            transition: 'color 0.2s',
          }}>
            {movie.title}
          </div>

          {/* Genre */}
          <div style={{
            fontSize: '10px', color: '#6b5c42',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            marginBottom: '14px',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {movie.genre}
          </div>
        </div>

        {/* Footer: duration + book button */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '12px',
        }}>
          <span style={{
            fontSize: '10px', color: '#8a7355',
            letterSpacing: '0.04em',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            ⏱ {movie.duration}
          </span>

          <Link
            to={`/book/${movie._id}`}
            style={{
              fontSize: '9px', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: isMobile ? '7px 14px' : '6px 12px',
              border: '1px solid rgba(201,146,10,0.5)',
              color: '#c9920a', borderRadius: '2px',
              textDecoration: 'none',
              fontFamily: "'DM Sans', sans-serif",
              background: hovered
                ? 'linear-gradient(90deg, #c9920a, #e8aa20)'
                : 'transparent',
              transition: 'background 0.2s, color 0.2s',
              ...(hovered ? { color: '#0d0700', borderColor: 'transparent' } : {}),
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Book Seat
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;