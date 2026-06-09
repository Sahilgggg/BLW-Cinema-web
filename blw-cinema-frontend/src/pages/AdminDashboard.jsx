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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Track screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchMovies();
    fetchPendingUsers();
  }, []);

  const fetchMovies = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/movies`);
    setMovies(await res.json());
  };

  const fetchPendingUsers = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/pending-users`,
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    if (res.ok) setPendingUsers(await res.json());
  };

  // --- ADD MOVIE WITH IMAGE UPLOAD ---
  const handleAddMovie = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData();
    formData.append('title',    newMovie.title);
    formData.append('genre',    newMovie.genre);
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
    if (!window.confirm('Delete movie?')) return;
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/movies/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.token}` },
    });
    if (res.ok) fetchMovies();
  };

  // --- USER APPROVALS ---
  const handleApproveUser = async (id) => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/approve-user/${id}`,
      { method: 'PUT', headers: { Authorization: `Bearer ${user.token}` } }
    );
    if (res.ok) fetchPendingUsers();
  };

  const handleRejectUser = async (id) => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/reject-user/${id}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` } }
    );
    if (res.ok) fetchPendingUsers();
  };

  // ─── SHARED STYLE TOKENS ─────────────────────────────────────────────────
  const token = {
    bg:        '#080a0e',
    surface:   '#0d0f14',
    surfaceAlt:'#0a0b0f',
    border:    'rgba(255,255,255,0.07)',
    gold:      '#c9920a',
    goldLight: '#f0c040',
    red:       '#c0392b',
    text:      '#e8dcc8',
    muted:     '#6b5c42',
    faint:     '#4a3c2a',
    font:      "'DM Sans', sans-serif",
    fontTitle: "'Playfair Display', serif",
    fontHero:  "'Bebas Neue', sans-serif",
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: token.bg,
    border: `1px solid ${token.border}`,
    borderRadius: '3px',
    padding: '10px 12px',
    color: token.text,
    fontFamily: token.font,
    fontSize: '13px',
    outline: 'none',
    colorScheme: 'dark',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: token.muted, marginBottom: '6px',
    fontFamily: token.font,
  };

  const fieldWrap = { marginBottom: '14px' };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: token.bg,
      color: token.text,
      fontFamily: token.font,
      paddingBottom: '60px',
    }}>

      {/* Film strip top */}
      <div style={{
        height: '12px',
        background: 'repeating-linear-gradient(90deg, #0d0f14 0 16px, #1a1c22 16px 20px)',
        opacity: 0.5,
      }} />

      {/* Top nav bar */}
      <div style={{
        padding: isMobile ? '14px 16px' : '16px 32px',
        borderBottom: `1px solid ${token.border}`,
        backgroundColor: token.surfaceAlt,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: token.fontHero,
            fontSize: '22px', letterSpacing: '0.08em',
            color: token.gold,
          }}>Admin</span>
          <span style={{
            fontFamily: token.fontHero,
            fontSize: '22px', letterSpacing: '0.08em',
            color: token.text,
          }}>Dashboard</span>
        </div>
        <Link to="/" style={{
          color: token.muted, fontSize: '12px',
          textDecoration: 'none', letterSpacing: '0.06em',
          fontFamily: token.font,
        }}>
          Return to Site →
        </Link>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '20px 14px' : '32px 24px',
      }}>

        {/* Stats row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '28px',
        }}>
          {[
            { label: 'Total Movies',    value: movies.length,       color: token.gold },
            { label: 'Now Showing',     value: movies.filter(m => m.status === 'Now Showing').length, color: '#22c55e' },
            { label: 'Coming Soon',     value: movies.filter(m => m.status === 'Coming Soon').length, color: '#60a5fa' },
            { label: 'Pending Users',   value: pendingUsers.length, color: token.red },
          ].map(stat => (
            <div key={stat.label} style={{
              backgroundColor: token.surface,
              border: `1px solid ${token.border}`,
              borderRadius: '4px',
              padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '6px',
            }}>
              <span style={{
                fontSize: '10px', letterSpacing: '0.12em',
                textTransform: 'uppercase', color: token.muted,
                fontFamily: token.font,
              }}>
                {stat.label}
              </span>
              <span style={{
                fontFamily: token.fontHero,
                fontSize: '36px', color: stat.color,
                lineHeight: 1, letterSpacing: '0.02em',
              }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${token.border}`,
          marginBottom: '24px',
        }}>
          {[
            { key: 'movies', label: 'Manage Movies' },
            { key: 'users',  label: 'Pending Approvals' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                position: 'relative',
                padding: isMobile ? '10px 16px' : '12px 24px',
                fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                border: 'none', background: 'none',
                cursor: 'pointer',
                color: activeTab === tab.key ? token.gold : token.muted,
                fontFamily: token.font,
                display: 'flex', alignItems: 'center', gap: '8px',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {tab.label}
              {/* Pending badge on users tab */}
              {tab.key === 'users' && pendingUsers.length > 0 && (
                <span style={{
                  backgroundColor: token.red,
                  color: '#fff',
                  fontSize: '9px', fontWeight: 700,
                  padding: '2px 6px', borderRadius: '10px',
                  fontFamily: token.font,
                }}>
                  {pendingUsers.length}
                </span>
              )}
              {/* Active underline */}
              {activeTab === tab.key && (
                <span style={{
                  position: 'absolute', bottom: '-1px', left: 0, right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, ${token.gold}, ${token.goldLight})`,
                }} />
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════ */}
        {/* MOVIES TAB                                    */}
        {/* ══════════════════════════════════════════════ */}
        {activeTab === 'movies' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
            gap: '20px',
            alignItems: 'flex-start',
          }}>

            {/* ── Add Movie Form ── */}
            <div style={{
              backgroundColor: token.surface,
              border: `1px solid ${token.border}`,
              borderRadius: '6px',
              padding: isMobile ? '20px 16px' : '24px',
            }}>
              {/* Gold bar */}
              <div style={{
                height: '2px', borderRadius: '2px', marginBottom: '20px',
                background: `linear-gradient(90deg, transparent, ${token.gold}, ${token.goldLight}, ${token.gold}, transparent)`,
              }} />

              <div style={{
                fontFamily: token.fontTitle,
                fontSize: '17px', fontWeight: 700,
                color: token.text, marginBottom: '20px',
              }}>
                Add New Movie
              </div>

              <form onSubmit={handleAddMovie}>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Title</label>
                  <input
                    type="text" required
                    value={newMovie.title}
                    onChange={e => setNewMovie({ ...newMovie, title: e.target.value })}
                    style={inputStyle}
                    placeholder="Movie title"
                  />
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Genre</label>
                  <input
                    type="text" required
                    value={newMovie.genre}
                    onChange={e => setNewMovie({ ...newMovie, genre: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. Action, Drama"
                  />
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Duration</label>
                  <input
                    type="text" required
                    value={newMovie.duration}
                    onChange={e => setNewMovie({ ...newMovie, duration: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. 140 min"
                  />
                </div>

                {/* UPDATED: Date + Time side by side */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Show Date</label>
                    <input
                      type="date" required
                      value={newMovie.showDate}
                      onChange={e => setNewMovie({ ...newMovie, showDate: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Show Time</label>
                    <input
                      type="time" required
                      value={newMovie.showTime}
                      onChange={e => setNewMovie({ ...newMovie, showTime: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Poster upload */}
                <div style={fieldWrap}>
                  <label style={labelStyle}>Poster Image</label>
                  <div style={{
                    border: `1px dashed rgba(201,146,10,0.3)`,
                    borderRadius: '3px',
                    padding: '16px',
                    textAlign: 'center',
                    backgroundColor: token.bg,
                  }}>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      required
                      onChange={e => setPosterFile(e.target.files[0])}
                      style={{
                        width: '100%',
                        fontSize: '12px',
                        color: token.muted,
                        fontFamily: token.font,
                        cursor: 'pointer',
                      }}
                    />
                    {posterFile && (
                      <p style={{
                        fontSize: '11px', color: token.gold,
                        marginTop: '8px', fontFamily: token.font,
                      }}>
                        ✓ {posterFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontFamily: token.font,
                    fontSize: '12px', fontWeight: 700,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    border: 'none', borderRadius: '3px',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    background: isUploading
                      ? '#1a1c22'
                      : `linear-gradient(90deg, ${token.gold}, ${token.goldLight})`,
                    color: isUploading ? token.faint : '#0d0700',
                    marginTop: '4px',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {isUploading ? 'Uploading to Cloudinary...' : 'Publish to Site'}
                </button>
              </form>
            </div>

            {/* ── Currently Playing List ── */}
            <div style={{
              backgroundColor: token.surface,
              border: `1px solid ${token.border}`,
              borderRadius: '6px',
              padding: isMobile ? '20px 16px' : '24px',
            }}>
              {/* Gold bar */}
              <div style={{
                height: '2px', borderRadius: '2px', marginBottom: '20px',
                background: `linear-gradient(90deg, transparent, ${token.gold}, ${token.goldLight}, ${token.gold}, transparent)`,
              }} />

              <div style={{
                fontFamily: token.fontTitle,
                fontSize: '17px', fontWeight: 700,
                color: token.text, marginBottom: '20px',
              }}>
                Currently Playing
              </div>

              {movies.length === 0 ? (
                <p style={{
                  color: token.faint, textAlign: 'center',
                  padding: '32px 0', fontSize: '13px',
                  fontFamily: token.font,
                }}>
                  No movies added yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {movies.map(movie => (
                    <div key={movie._id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: token.bg,
                      border: `1px solid ${token.border}`,
                      borderRadius: '4px',
                      padding: '12px 14px',
                      gap: '12px',
                    }}>
                      {/* Poster thumbnail + info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                        {movie.posterUrl && (
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            style={{
                              width: '36px', height: '50px',
                              objectFit: 'cover', borderRadius: '2px',
                              flexShrink: 0,
                              border: `1px solid ${token.border}`,
                            }}
                          />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontFamily: token.fontTitle,
                            fontSize: '14px', fontWeight: 700,
                            color: token.text,
                            whiteSpace: 'nowrap', overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {movie.title}
                          </div>
                          {/* UPDATED: Displays show date and time alongside genre */}
                          <div style={{
                            fontSize: '11px', color: token.muted,
                            marginTop: '2px', fontFamily: token.font,
                          }}>
                            {movie.genre} &bull;{' '}
                            <span style={{ color: token.gold }}>
                              {movie.showDate} @ {movie.showTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveMovie(movie._id)}
                        style={{
                          fontSize: '10px', fontWeight: 700,
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          padding: '6px 12px',
                          border: `1px solid rgba(192,57,43,0.4)`,
                          color: token.red, background: 'transparent',
                          borderRadius: '2px', cursor: 'pointer',
                          fontFamily: token.font, flexShrink: 0,
                          WebkitTapHighlightColor: 'transparent',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(192,57,43,0.12)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/* USERS TAB                                     */}
        {/* ══════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div style={{
            backgroundColor: token.surface,
            border: `1px solid ${token.border}`,
            borderRadius: '6px',
            padding: isMobile ? '20px 16px' : '24px',
          }}>
            {/* Gold bar */}
            <div style={{
              height: '2px', borderRadius: '2px', marginBottom: '20px',
              background: `linear-gradient(90deg, transparent, ${token.gold}, ${token.goldLight}, ${token.gold}, transparent)`,
            }} />

            <div style={{
              fontFamily: token.fontTitle,
              fontSize: '17px', fontWeight: 700,
              color: token.text, marginBottom: '20px',
            }}>
              Pending Admin Registrations
            </div>

            {pendingUsers.length === 0 ? (
              <p style={{
                color: token.faint, textAlign: 'center',
                padding: '40px 0', fontSize: '13px',
                fontFamily: token.font,
              }}>
                No pending users. All clear!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pendingUsers.map(u => (
                  <div key={u._id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: token.bg,
                    border: `1px solid ${token.border}`,
                    borderRadius: '4px',
                    padding: '14px 16px',
                    gap: '12px',
                    flexWrap: isMobile ? 'wrap' : 'nowrap',
                  }}>
                    {/* User info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Avatar circle */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${token.gold}, ${token.goldLight})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: token.fontHero,
                          fontSize: '16px', color: '#0d0700',
                          flexShrink: 0,
                        }}>
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{
                            fontFamily: token.fontTitle,
                            fontSize: '14px', fontWeight: 700,
                            color: token.text,
                          }}>
                            {u.name}
                          </div>
                          <div style={{
                            fontSize: '11px', color: token.muted,
                            marginTop: '2px', fontFamily: token.font,
                          }}>
                            {u.email} &bull; Role:{' '}
                            <span style={{
                              color: token.gold,
                              textTransform: 'uppercase',
                              fontWeight: 700,
                            }}>
                              {u.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Approve / Reject buttons */}
                    <div style={{
                      display: 'flex', gap: '8px',
                      width: isMobile ? '100%' : 'auto',
                      marginTop: isMobile ? '12px' : '0',
                    }}>
                      <button
                        onClick={() => handleApproveUser(u._id)}
                        style={{
                          flex: isMobile ? 1 : 'none',
                          padding: '8px 16px',
                          fontSize: '11px', fontWeight: 700,
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          border: 'none', borderRadius: '2px',
                          cursor: 'pointer',
                          background: 'linear-gradient(90deg, #166534, #16a34a)',
                          color: '#f0fff4',
                          fontFamily: token.font,
                          WebkitTapHighlightColor: 'transparent',
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectUser(u._id)}
                        style={{
                          flex: isMobile ? 1 : 'none',
                          padding: '8px 16px',
                          fontSize: '11px', fontWeight: 700,
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          border: `1px solid rgba(255,255,255,0.1)`,
                          borderRadius: '2px',
                          cursor: 'pointer',
                          background: 'transparent',
                          color: token.muted,
                          fontFamily: token.font,
                          WebkitTapHighlightColor: 'transparent',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = token.text; }}
                        onMouseLeave={e => { e.currentTarget.style.color = token.muted; }}
                      >
                        Reject
                      </button>
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