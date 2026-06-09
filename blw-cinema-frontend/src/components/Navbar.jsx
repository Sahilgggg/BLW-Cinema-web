import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  // ─── STYLE TOKENS ─────────────────────────────────────────────────────────
  const token = {
    bg:       '#0a0b0f',
    border:   'rgba(255,255,255,0.07)',
    gold:     '#c9920a',
    goldLight:'#f0c040',
    red:      '#c0392b',
    text:     '#e8dcc8',
    muted:    '#6b5c42',
    font:     "'DM Sans', sans-serif",
    fontHero: "'Bebas Neue', sans-serif",
  };

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .nav-link {
          color: ${token.muted};
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          font-family: ${token.font};
          transition: color 0.2s;
        }
        .nav-link:hover { color: ${token.text}; }
        .nav-link-gold {
          color: ${token.gold};
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          font-family: ${token.font};
          transition: color 0.2s;
        }
        .nav-link-gold:hover { color: ${token.goldLight}; }
        .hamburger-line {
          display: block;
          width: 22px; height: 2px;
          background: ${token.muted};
          border-radius: 2px;
          transition: all 0.25s;
        }
      `}</style>

      <nav style={{
        backgroundColor: token.bg,
        borderBottom: `1px solid ${token.border}`,
        position: 'sticky', top: 0, zIndex: 50,
        fontFamily: token.font,
      }}>

        {/* Film strip perforations */}
        <div style={{
          height: '10px',
          background: 'repeating-linear-gradient(90deg, #0d0f14 0 14px, #141620 14px 18px)',
          opacity: 0.6,
        }} />

        {/* Main navbar row */}
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 20px',
          height: '56px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>

          {/* ── Logo ── */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{
              fontFamily: token.fontHero,
              fontSize: '26px',
              letterSpacing: '0.08em',
              color: '#ffffff',
              lineHeight: 1,
            }}>
              B.L.W
            </span>
            <span style={{
              fontFamily: token.fontHero,
              fontSize: '26px',
              letterSpacing: '0.08em',
              color: token.red,
              lineHeight: 1,
            }}>
              Cinema
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}
            className="desktop-nav"
          >
            {user ? (
              <>
                {/* Admin link — only for admin role */}
                {user.role === 'admin' && (
                  <Link to="/admin-dashboard" className="nav-link-gold">
                    Admin Panel
                  </Link>
                )}

                {/* Divider */}
                <div style={{
                  width: '1px', height: '20px',
                  backgroundColor: token.border,
                }} />

                {/* Welcome text — hidden on small screens via inline check */}
                <span style={{
                  fontSize: '12px', color: token.muted,
                  fontFamily: token.font, letterSpacing: '0.04em',
                }}>
                  Welcome,{' '}
                  <span style={{ color: token.text, fontWeight: 700 }}>
                    {user.name}
                  </span>
                </span>

                {/* My Tickets */}
                <Link to="/my-tickets" className="nav-link">
                  My Tickets
                </Link>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'transparent',
                    border: `1px solid rgba(255,255,255,0.12)`,
                    color: token.muted,
                    padding: '6px 16px',
                    borderRadius: '2px',
                    fontSize: '11px', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontFamily: token.font,
                    transition: 'all 0.2s',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = token.text;
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = token.muted;
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              /* Sign In button — logged out state */
              <Link
                to="/login"
                style={{
                  background: `linear-gradient(90deg, #9b2020, ${token.red})`,
                  color: '#ffffff',
                  padding: '8px 22px',
                  borderRadius: '2px',
                  fontSize: '11px', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  textDecoration: 'none',
                  fontFamily: token.font,
                  boxShadow: '0 2px 16px rgba(192,57,43,0.25)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* ── Hamburger (mobile only) ── */}
          {user && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              style={{
                display: 'none', // shown via media query below
                background: 'none', border: 'none',
                cursor: 'pointer', padding: '4px',
                flexDirection: 'column', gap: '5px',
                WebkitTapHighlightColor: 'transparent',
              }}
              id="hamburger-btn"
            >
              <span className="hamburger-line" style={{
                transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
              }} />
              <span className="hamburger-line" style={{
                opacity: menuOpen ? 0 : 1,
              }} />
              <span className="hamburger-line" style={{
                transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
              }} />
            </button>
          )}

          {/* Sign In on mobile — shown when logged out */}
          {!user && (
            <Link
              to="/login"
              style={{
                background: `linear-gradient(90deg, #9b2020, ${token.red})`,
                color: '#ffffff',
                padding: '7px 18px',
                borderRadius: '2px',
                fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                textDecoration: 'none',
                fontFamily: token.font,
              }}
            >
              Sign In
            </Link>
          )}

        </div>

        {/* ── Mobile dropdown menu ── */}
        {user && menuOpen && (
          <div style={{
            backgroundColor: '#0d0f14',
            borderTop: `1px solid ${token.border}`,
            padding: '16px 20px 20px',
            animation: 'slideDown 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
          }}>
            {/* Welcome */}
            <div style={{
              fontSize: '12px', color: token.muted,
              fontFamily: token.font, letterSpacing: '0.04em',
              padding: '10px 0',
              borderBottom: `1px solid ${token.border}`,
              marginBottom: '4px',
            }}>
              Welcome,{' '}
              <span style={{ color: token.text, fontWeight: 700 }}>{user.name}</span>
            </div>

            {/* Admin Panel link */}
            {user.role === 'admin' && (
              <Link
                to="/admin-dashboard"
                onClick={() => setMenuOpen(false)}
                style={{
                  color: token.gold,
                  fontSize: '12px', fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  textDecoration: 'none',
                  fontFamily: token.font,
                  padding: '12px 0',
                  borderBottom: `1px solid ${token.border}`,
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                {/* Star icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Admin Panel
              </Link>
            )}

            {/* My Tickets */}
            <Link
              to="/my-tickets"
              onClick={() => setMenuOpen(false)}
              style={{
                color: token.muted,
                fontSize: '12px', fontWeight: 500,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                textDecoration: 'none',
                fontFamily: token.font,
                padding: '12px 0',
                borderBottom: `1px solid ${token.border}`,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {/* Ticket icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z"/>
              </svg>
              My Tickets
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: token.muted,
                fontSize: '12px', fontWeight: 500,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                fontFamily: token.font,
                padding: '12px 0',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Logout icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Logout
            </button>
          </div>
        )}

        {/* Responsive styles via injected style tag */}
        <style>{`
          @media (max-width: 768px) {
            .desktop-nav { display: none !important; }
            #hamburger-btn { display: flex !important; }
          }
          @media (min-width: 769px) {
            #hamburger-btn { display: none !important; }
            .desktop-nav { display: flex !important; }
          }
        `}</style>

      </nav>
    </>
  );
}

export default Navbar;