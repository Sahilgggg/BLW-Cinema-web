import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function UserDashboard() {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Track screen size for responsive layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/bookings/my-tickets`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        if (response.ok) {
          const data = await response.json();
          setTickets(data);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTickets();
  }, [user.token]);

  // --- PDF GENERATION LOGIC ---
  const downloadTicketPDF = async (ticketId, movieTitle) => {
    setDownloadingId(ticketId);
    const ticketElement = document.getElementById(`ticket-${ticketId}`);
    try {
      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#080a0e', // Matches site background
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = 200;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 20, pdfWidth, pdfHeight);
      pdf.save(`BLW_Cinema_Ticket_${movieTitle.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Could not generate PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  // ─── LOADING STATE ────────────────────────────────────────────────────────
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
          Loading your tickets...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#080a0e',
      color: '#e8dcc8',
      fontFamily: "'DM Sans', sans-serif",
      paddingBottom: '60px',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Film strip top decoration */}
      <div style={{
        height: '12px',
        background: 'repeating-linear-gradient(90deg, #0d0f14 0 16px, #1a1c22 16px 20px)',
        opacity: 0.5,
      }} />

      <div style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: isMobile ? '28px 16px' : '48px 24px',
      }}>

        {/* Page header */}
        <div style={{ marginBottom: '32px' }}>
          {/* Gold shimmer bar */}
          <div style={{
            height: '2px',
            width: '60px',
            borderRadius: '2px',
            marginBottom: '16px',
            background: 'linear-gradient(90deg, #c9920a, #f0c040)',
          }} />

          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: isMobile ? '36px' : '48px',
            letterSpacing: '0.06em',
            color: '#ffffff',
            lineHeight: 1,
            marginBottom: '8px',
          }}>
            My Tickets
          </div>
          <p style={{
            fontSize: '13px',
            color: '#6b5c42',
            letterSpacing: '0.04em',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            View and manage your recent bookings.
          </p>
        </div>

        {/* Empty state */}
        {tickets.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            backgroundColor: '#0d0f14',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '6px',
          }}>
            {/* Empty ticket icon */}
            <div style={{
              width: '56px', height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(201,146,10,0.08)',
              border: '1px solid rgba(201,146,10,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '24px',
            }}>
              🎟
            </div>
            <p style={{
              color: '#6b5c42', fontSize: '14px',
              marginBottom: '20px',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              You haven't booked any movies yet.
            </p>
            <Link
              to="/"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(90deg, #9b2020, #c0392b)',
                color: '#ffffff',
                padding: '10px 24px',
                borderRadius: '3px',
                fontWeight: 700,
                fontSize: '12px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Browse Movies
            </Link>
          </div>
        ) : (
          /* Tickets grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '24px',
          }}>
            {tickets.map(ticket => {
              const movieTitle  = ticket.movie?.title || 'Unknown Movie';
              const qrPayload   = `BLW Cinema | ID: ${ticket._id} | Movie: ${movieTitle} | Seats: ${ticket.seats.map(s => s.seatId).join(',')}`;
              const isDownloading = downloadingId === ticket._id;

              return (
                <div key={ticket._id} style={{ display: 'flex', flexDirection: 'column' }}>

                  {/* ── THE TICKET ELEMENT (captured by html2canvas) ── */}
                  <div
                    id={`ticket-${ticket._id}`}
                    style={{
                      display: 'flex',
                      backgroundColor: '#0d0f14',
                      border: '1px solid rgba(255,255,255,0.09)',
                      borderBottom: 'none',
                      borderRadius: '6px 6px 0 0',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {/* Gold top accent line */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0,
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent, #c9920a, #f0c040, #c9920a, transparent)',
                    }} />

                    {/* Left: Movie Poster */}
                    <div style={{
                      width: '35%',
                      position: 'relative',
                      backgroundColor: '#080a0e',
                      borderRight: '1px dashed rgba(255,255,255,0.1)',
                      flexShrink: 0,
                    }}>
                      {/* Ticket stub holes */}
                      <div style={{
                        position: 'absolute', right: '-10px', top: '-10px',
                        width: '20px', height: '20px',
                        borderRadius: '50%', backgroundColor: '#080a0e',
                        zIndex: 2,
                      }} />
                      <div style={{
                        position: 'absolute', right: '-10px', bottom: '-10px',
                        width: '20px', height: '20px',
                        borderRadius: '50%', backgroundColor: '#080a0e',
                        zIndex: 2,
                      }} />

                      <img
                        src={ticket.movie?.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=80'}
                        alt="Poster"
                        crossOrigin="anonymous"
                        style={{
                          width: '100%', height: '100%',
                          objectFit: 'cover', opacity: 0.85,
                          display: 'block',
                        }}
                        onError={e => {
                          e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=80';
                        }}
                      />
                    </div>

                    {/* Right: Ticket Details */}
                    <div style={{
                      flex: 1,
                      padding: isMobile ? '16px 14px' : '20px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}>
                      {/* Top section */}
                      <div>
                        {/* Status badge */}
                        <span style={{
                          display: 'inline-block',
                          fontSize: '9px', fontWeight: 700,
                          letterSpacing: '0.12em', textTransform: 'uppercase',
                          padding: '3px 8px', borderRadius: '2px',
                          color: '#22c55e',
                          backgroundColor: 'rgba(34,197,94,0.08)',
                          border: '1px solid rgba(34,197,94,0.25)',
                          fontFamily: "'DM Sans', sans-serif",
                        }}>
                          Paid / Confirmed
                        </span>

                        {/* Movie title */}
                        <div style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: isMobile ? '16px' : '18px',
                          fontWeight: 700, color: '#ffffff',
                          marginTop: '10px', marginBottom: '2px',
                          lineHeight: 1.2,
                        }}>
                          {movieTitle}
                        </div>

                        {/* Booking ID */}
                        <p style={{
                          fontSize: '9px', color: '#4a3c2a',
                          letterSpacing: '0.06em', marginBottom: '16px',
                          fontFamily: 'monospace',
                        }}>
                          ID: {ticket._id.toUpperCase()}
                        </p>

                        {/* Seats + Amount row */}
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{
                              fontSize: '9px', textTransform: 'uppercase',
                              letterSpacing: '0.1em', color: '#6b5c42',
                              fontFamily: "'DM Sans', sans-serif",
                            }}>
                              Seats
                            </span>
                            <span style={{
                              fontSize: '13px', fontWeight: 700,
                              color: '#c9920a',
                              fontFamily: "'DM Sans', sans-serif",
                            }}>
                              {ticket.seats.map(s => s.seatId).join(', ')}
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{
                              fontSize: '9px', textTransform: 'uppercase',
                              letterSpacing: '0.1em', color: '#6b5c42',
                              fontFamily: "'DM Sans', sans-serif",
                            }}>
                              Total Paid
                            </span>
                            <span style={{
                              fontSize: '13px', fontWeight: 700,
                              color: '#ffffff',
                              fontFamily: "'DM Sans', sans-serif",
                            }}>
                              ₹{ticket.totalAmount}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom: QR + Admit count */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        paddingTop: '14px',
                        marginTop: '14px',
                      }}>
                        {/* QR Code */}
                        <div style={{
                          padding: '6px',
                          backgroundColor: '#ffffff',
                          borderRadius: '3px',
                          display: 'inline-block',
                          lineHeight: 0,
                        }}>
                          <QRCodeCanvas
                            value={qrPayload}
                            size={isMobile ? 52 : 60}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                          />
                        </div>

                        {/* Admit count */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontSize: '9px', fontWeight: 700,
                            letterSpacing: '0.16em', textTransform: 'uppercase',
                            color: '#4a3c2a',
                            fontFamily: "'DM Sans', sans-serif",
                            marginBottom: '2px',
                          }}>
                            Admit
                          </div>
                          <div style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: '36px', color: '#ffffff',
                            lineHeight: 1, letterSpacing: '0.04em',
                          }}>
                            {ticket.seats.length}
                          </div>
                          <div style={{
                            fontSize: '9px', color: '#4a3c2a',
                            fontFamily: "'DM Sans', sans-serif",
                          }}>
                            {ticket.seats.length === 1 ? 'Person' : 'Persons'}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* ── DOWNLOAD BUTTON ── */}
                  <button
                    onClick={() => downloadTicketPDF(ticket._id, movieTitle)}
                    disabled={isDownloading}
                    style={{
                      width: '100%',
                      padding: '13px',
                      backgroundColor: isDownloading ? '#0a0b0f' : '#0f1117',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderTop: 'none',
                      borderRadius: '0 0 6px 6px',
                      color: isDownloading ? '#4a3c2a' : '#c9920a',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '12px', fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      cursor: isDownloading ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '8px',
                      transition: 'background-color 0.2s',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    onMouseEnter={e => { if (!isDownloading) e.currentTarget.style.backgroundColor = '#141620'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = isDownloading ? '#0a0b0f' : '#0f1117'; }}
                  >
                    {isDownloading ? (
                      <>
                        <div style={{
                          width: '14px', height: '14px',
                          border: '2px solid rgba(201,146,10,0.2)',
                          borderTopColor: '#c9920a',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                          flexShrink: 0,
                        }} />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        {/* Download icon */}
                        <svg
                          width="14" height="14"
                          fill="none" stroke="currentColor"
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download E-Ticket
                      </>
                    )}
                  </button>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;