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

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bookings/my-tickets`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
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
        backgroundColor: '#0B0C10' // Matches your site background
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

  if (loading) return <div className="min-h-screen bg-cinema-bg text-white flex justify-center items-center">Loading your tickets...</div>;

  return (
    <div className="min-h-screen bg-cinema-bg text-cinema-light pb-12">
      <div className="max-w-5xl mx-auto px-4 mt-12">
        <h2 className="text-3xl font-black text-white mb-2">My Tickets</h2>
        <p className="text-cinema-text mb-8">View and manage your recent bookings.</p>

        {tickets.length === 0 ? (
          <div className="text-center py-16 bg-cinema-surface rounded-xl border border-gray-800">
            <p className="text-gray-400 mb-4">You haven't booked any movies yet.</p>
            <Link to="/" className="bg-cinema-accent text-white px-6 py-2 rounded font-bold hover:bg-red-600 transition">Browse Movies</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tickets.map(ticket => {
              const movieTitle = ticket.movie?.title || 'Unknown Movie';
              const qrPayload = `BLW Cinema | ID: ${ticket._id} | Movie: ${movieTitle} | Seats: ${ticket.seats.map(s => s.seatId).join(',')}`;

              return (
                <div key={ticket._id} className="flex flex-col">
                  
                  {/* --- THE BULLETPROOF TICKET ELEMENT --- */}
                  {/* ALL Tailwind color classes are removed from here down. Only pure hex inline styles. */}
                  <div 
                    id={`ticket-${ticket._id}`} 
                    className="flex rounded-t-xl overflow-hidden relative"
                    style={{ backgroundColor: '#111217', color: '#ffffff', border: '1px solid #1f2937' }}
                  >
                    {/* Left: Movie Poster */}
                    <div 
                      className="w-1/3 relative"
                      style={{ backgroundColor: '#090a0f', borderRight: '1px dashed #1f2937' }}
                    >
                      {/* Ticket Stub Holes (Background color set to match page bg) */}
                      <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full" style={{ backgroundColor: '#0B0C10' }}></div>
                      <div className="absolute -right-3 -bottom-3 w-6 h-6 rounded-full" style={{ backgroundColor: '#0B0C10' }}></div>
                      
                      <img src={ticket.movie?.posterUrl || ''} alt="Poster" className="w-full h-full object-cover" style={{ opacity: 0.8 }} crossOrigin="anonymous" />
                    </div>
                    
                    {/* Right: Ticket Details & QR Code */}
                    <div className="w-2/3 p-5 flex flex-col justify-between">
                      <div>
                        <span 
                          className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                          style={{ color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
                        >
                          Paid / Confirmed
                        </span>
                        
                        <h3 className="text-xl font-bold mt-2 mb-1" style={{ color: '#ffffff' }}>{movieTitle}</h3>
                        <p className="text-[10px] mb-4" style={{ color: '#9ca3af' }}>ID: {ticket._id.toUpperCase()}</p>
                        
                        <div className="flex gap-6 mb-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase" style={{ color: '#6b7280' }}>Seats</span>
                            <span className="text-sm font-bold" style={{ color: '#D4AF37' }}>{ticket.seats.map(s => s.seatId).join(', ')}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase" style={{ color: '#9ca3af' }}>Total Paid</span>
                            <span className="text-sm font-bold" style={{ color: '#ffffff' }}>₹{ticket.totalAmount}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Real QR Code */}
                      <div className="mt-4 pt-4 flex justify-between items-end" style={{ borderTop: '1px solid #1f2937' }}>
                        <div className="p-1.5 rounded" style={{ backgroundColor: '#ffffff' }}>
                          <QRCodeCanvas 
                            value={qrPayload} 
                            size={60} 
                            bgColor={"#ffffff"} 
                            fgColor={"#000000"} 
                            level={"H"} 
                          />
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#6b7280' }}>Admit</p>
                          <p className="text-lg font-black" style={{ color: '#ffffff' }}>{ticket.seats.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* --- DOWNLOAD BUTTON --- */}
                  <button 
                    onClick={() => downloadTicketPDF(ticket._id, movieTitle)}
                    disabled={downloadingId === ticket._id}
                    className="bg-[#1A1C23] hover:bg-gray-800 border-x border-b border-gray-800 text-[#D4AF37] font-bold py-3 rounded-b-xl transition text-sm flex justify-center items-center gap-2"
                  >
                    {downloadingId === ticket._id ? (
                      'Generating PDF...'
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
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