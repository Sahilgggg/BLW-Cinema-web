import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Helper to inject the Razorpay script into the page dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Cinema Layout Configuration
const SEAT_CONFIG = [
  { id: 'first',  name: 'First Class',  price: 30, rows: ['A','B','C'],               seatsPerRow: 12, color: '#c9920a' },
  { id: 'second', name: 'Second Class', price: 20, rows: ['D','E','F','G','H','I','J'], seatsPerRow: 10, color: '#60a5fa' },
  { id: 'third',  name: 'Third Class',  price: 15, rows: ['K','L','M','N'],            seatsPerRow: 8,  color: '#9ca3af' },
];

function Booking() {
  const { id } = useParams(); // The Movie ID from the URL
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Get the logged-in user's token

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats]     = useState([]); // Now dynamic from DB!
  const [isProcessing, setIsProcessing]   = useState(false);
  const [isMobile, setIsMobile]           = useState(window.innerWidth < 1024);

  // Track screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 1. FETCH BOOKED SEATS ON LOAD ---
  useEffect(() => {
    const fetchBookedSeats = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/bookings/movie/${id}`
        );
        if (response.ok) {
          const data = await response.json();
          setBookedSeats(data); // Array of seat IDs like ['A1', 'C4']
        }
      } catch (error) {
        console.error('Error fetching booked seats:', error);
      }
    };
    fetchBookedSeats();

    // Optional: Poll every 5 seconds to keep seats updated if someone else is booking
    const interval = setInterval(fetchBookedSeats, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // --- 2. SEAT SELECTION LOGIC ---
  const toggleSeat = (seatId, price, sectionName) => {
    if (bookedSeats.includes(seatId)) return;
    const isAlreadySelected = selectedSeats.some(seat => seat.seatId === seatId);
    if (isAlreadySelected) {
      setSelectedSeats(selectedSeats.filter(seat => seat.seatId !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, { seatId, price: Number(price), section: sectionName }]);
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + (Number(seat.price) || 0), 0);

  // --- 3. SECURE RAZORPAY CHECKOUT LOGIC ---
  const handleCheckout = async () => {
    if (selectedSeats.length === 0) return;
    setIsProcessing(true);

    try {
      // Step A: Load the script
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

      // Step B: Create the order on your Node backend
      const orderResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ amount: totalPrice }),
        }
      );
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error('Failed to create payment order');

      // Step C: Open Razorpay Popup
      const options = {
        key: 'rzp_test_SypPbZEfurHbSU',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'B.L.W Cinema Hall',
        description: `Movie Tickets (${selectedSeats.length} Seats)`,
        order_id: orderData.id,
        handler: async function (response) {
          // Step D: Razorpay success! Now verify signature on backend
          const verifyRes = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/payments/verify`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`,
              },
              body: JSON.stringify({
                razorpay_order_id:  response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            }
          );

          if (verifyRes.ok) {
            // Step E: Signature verified. Now lock seats and save booking!
            const bookingRes = await fetch(
              `${import.meta.env.VITE_BACKEND_URL}/api/bookings`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                  movieId: id,
                  seats: selectedSeats,
                  totalAmount: totalPrice,
                }),
              }
            );

            if (bookingRes.ok) {
              alert('Payment Successful & Booking Confirmed!');
              navigate('/my-tickets');
            } else {
              const bookingError = await bookingRes.json();
              alert(`Payment successful, but booking failed: ${bookingError.message}. Initiating refund.`);
            }
          } else {
            alert('Payment verification failed!');
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#c9920a' },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── STYLES ───────────────────────────────────────────────────────────────
  const S = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#080a0e',
      color: '#e8dcc8',
      fontFamily: "'DM Sans', sans-serif",
      paddingBottom: '60px',
    },

    // Top sticky nav
    topNav: {
      padding: isMobile ? '14px 16px' : '16px 28px',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      backgroundColor: '#0a0b0f',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0, zIndex: 20,
    },
    backLink: {
      color: '#6b5c42',
      textDecoration: 'none',
      fontSize: '13px',
      letterSpacing: '0.04em',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex', alignItems: 'center', gap: '6px',
    },
    navTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: isMobile ? '16px' : '18px',
      fontWeight: 700,
      color: '#e8dcc8',
    },

    // Main layout
    layout: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '20px 12px' : '32px 24px',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '24px' : '32px',
      alignItems: 'flex-start',
    },

    // Seat matrix container
    seatPanel: {
      flex: 1,
      backgroundColor: '#0d0f14',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '6px',
      padding: isMobile ? '16px 12px' : '32px',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
    },

    // Section header
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      paddingBottom: '10px',
      marginBottom: '16px',
    },
    sectionName: {
      fontSize: '11px', fontWeight: 700,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      fontFamily: "'DM Sans', sans-serif",
    },
    sectionPrice: {
      fontSize: '12px', color: '#6b5c42',
      fontFamily: "'DM Sans', sans-serif",
    },

    // Row label
    rowLabel: {
      width: '20px', textAlign: 'center',
      color: '#6b5c42', fontSize: '11px',
      fontWeight: 700, fontFamily: 'monospace',
      flexShrink: 0,
    },

    // Screen bar
    screenBar: {
      height: '4px',
      background: 'linear-gradient(90deg, transparent, rgba(200,146,10,0.5), rgba(240,192,64,0.8), rgba(200,146,10,0.5), transparent)',
      borderRadius: '2px',
      margin: '0 auto',
      maxWidth: '500px',
    },
    screenLabel: {
      textAlign: 'center',
      fontSize: '9px', letterSpacing: '0.2em',
      textTransform: 'uppercase', color: '#6b5c42',
      marginTop: '8px', fontFamily: "'DM Sans', sans-serif",
    },

    // Legend
    legendWrap: {
      display: 'flex',
      justifyContent: 'center',
      gap: isMobile ? '16px' : '28px',
      marginTop: '24px',
      paddingTop: '20px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      flexWrap: 'wrap',
    },
    legendItem: {
      display: 'flex', alignItems: 'center', gap: '7px',
      fontSize: '11px', color: '#8a7355',
      fontFamily: "'DM Sans', sans-serif",
    },

    // Checkout panel
    checkoutPanel: {
      width: isMobile ? '100%' : '340px',
      backgroundColor: '#0d0f14',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '6px',
      padding: '24px',
      position: isMobile ? 'static' : 'sticky',
      top: '80px',
      flexShrink: 0,
    },
    summaryTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '17px', fontWeight: 700,
      color: '#e8dcc8', marginBottom: '20px',
      paddingBottom: '16px',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    },
    seatRow: {
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: '12px',
    },
    seatId: {
      color: '#ffffff', fontWeight: 700,
      fontSize: '14px', marginRight: '8px',
      fontFamily: "'DM Sans', sans-serif",
    },
    seatSection: {
      color: '#6b5c42', fontSize: '11px',
      fontFamily: "'DM Sans', sans-serif",
    },
    seatPrice: {
      color: '#e8dcc8', fontSize: '13px',
      fontFamily: "'DM Sans', sans-serif",
    },
    totalRow: {
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-end',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      paddingTop: '20px', marginBottom: '24px',
    },
    totalLabel: {
      color: '#6b5c42', fontSize: '12px',
      fontFamily: "'DM Sans', sans-serif",
    },
    totalCount: {
      color: '#6b5c42', fontSize: '11px',
      marginTop: '4px',
      fontFamily: "'DM Sans', sans-serif",
    },
    totalAmount: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: '42px', color: '#c9920a',
      lineHeight: 1, letterSpacing: '0.02em',
    },
  };

  // Seat button style — computed per seat state
  const getSeatStyle = (isBooked, isSelected, sectionColor) => ({
    width: isMobile ? '26px' : '32px',
    height: isMobile ? '26px' : '32px',
    borderRadius: '4px 4px 2px 2px',
    fontSize: '9px', fontWeight: 700,
    cursor: isBooked ? 'not-allowed' : 'pointer',
    border: isBooked
      ? '1px solid rgba(255,255,255,0.05)'
      : isSelected
        ? 'none'
        : `1px solid ${sectionColor}`,
    backgroundColor: isBooked
      ? '#111318'
      : isSelected
        ? '#c0392b'
        : '#0a0b0f',
    color: isBooked
      ? '#2a2a2a'
      : isSelected
        ? '#ffffff'
        : 'transparent',
    transform: isSelected ? 'scale(1.12)' : 'scale(1)',
    transition: 'all 0.15s',
    flexShrink: 0,
    WebkitTapHighlightColor: 'transparent',
    fontFamily: 'monospace',
  });

  const getCheckoutBtnStyle = (active) => ({
    width: '100%',
    padding: '14px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px', fontWeight: 700,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    border: 'none', borderRadius: '3px',
    cursor: active ? 'pointer' : 'not-allowed',
    background: active
      ? 'linear-gradient(90deg, #9b2020, #c0392b)'
      : '#1a1c22',
    color: active ? '#ffffff' : '#4a4a4a',
    transition: 'opacity 0.2s',
    WebkitTapHighlightColor: 'transparent',
  });

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>

      {/* Top Navigation Bar */}
      <div style={S.topNav}>
        <Link to="/" style={S.backLink}>
          ← Back
        </Link>
        <div style={S.navTitle}>Select Seats</div>
        <div style={{ width: '40px' }} />
      </div>

      <div style={S.layout}>

        {/* ── LEFT: Seat Matrix ── */}
        <div style={S.seatPanel}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', minWidth: 'max-content' }}>

            {SEAT_CONFIG.map((section) => (
              <div key={section.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* Section header */}
                <div style={{ ...S.sectionHeader, width: '100%' }}>
                  <span style={{ ...S.sectionName, color: section.color }}>
                    {section.name}
                  </span>
                  <span style={S.sectionPrice}>₹{section.price}</span>
                </div>

                {/* Seat rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {section.rows.map((row) => (
                    <div key={row} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? '6px' : '10px' }}>

                      {/* Row label left */}
                      <span style={S.rowLabel}>{row}</span>

                      {/* Seat buttons */}
                      <div style={{ display: 'flex', gap: isMobile ? '4px' : '6px' }}>
                        {[...Array(section.seatsPerRow)].map((_, index) => {
                          const seatId   = `${row}${index + 1}`;
                          const isBooked   = bookedSeats.includes(seatId);
                          const isSelected = selectedSeats.some(s => s.seatId === seatId);

                          return (
                            <button
                              key={seatId}
                              onClick={() => toggleSeat(seatId, section.price, section.name)}
                              disabled={isBooked || isProcessing}
                              title={seatId}
                              style={getSeatStyle(isBooked, isSelected, section.color)}
                            >
                              {index + 1}
                            </button>
                          );
                        })}
                      </div>

                      {/* Row label right */}
                      <span style={S.rowLabel}>{row}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Screen indicator */}
          <div style={{ marginTop: '48px', marginBottom: '8px', padding: '0 16px' }}>
            <div style={S.screenBar} />
            <p style={S.screenLabel}>Screen This Way</p>
          </div>

          {/* Legend */}
          <div style={S.legendWrap}>
            <div style={S.legendItem}>
              <div style={{ width: '14px', height: '14px', border: '1px solid #6b5c42', borderRadius: '3px' }} />
              Available
            </div>
            <div style={S.legendItem}>
              <div style={{ width: '14px', height: '14px', backgroundColor: '#c0392b', borderRadius: '3px' }} />
              Selected
            </div>
            <div style={S.legendItem}>
              <div style={{ width: '14px', height: '14px', backgroundColor: '#111318', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.05)' }} />
              Booked
            </div>
          </div>
        </div>

        {/* ── RIGHT: Checkout Summary ── */}
        <div style={S.checkoutPanel}>

          {/* Gold shimmer bar */}
          <div style={{
            height: '2px', borderRadius: '2px', marginBottom: '20px',
            background: 'linear-gradient(90deg, transparent, #c9920a, #f0c040, #c9920a, transparent)',
          }} />

          <div style={S.summaryTitle}>Booking Summary</div>

          {/* Selected seats list */}
          <div style={{ minHeight: '100px', marginBottom: '16px' }}>
            {selectedSeats.length === 0 ? (
              <p style={{
                color: '#4a3c2a', fontSize: '13px',
                textAlign: 'center', marginTop: '24px',
                fontStyle: 'italic',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                No seats selected yet.
              </p>
            ) : (
              <div>
                {selectedSeats.map(seat => (
                  <div key={seat.seatId} style={S.seatRow}>
                    <div>
                      <span style={S.seatId}>{seat.seatId}</span>
                      <span style={S.seatSection}>({seat.section})</span>
                    </div>
                    <span style={S.seatPrice}>₹{seat.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          <div style={S.totalRow}>
            <div>
              <div style={S.totalLabel}>Total Amount</div>
              <div style={S.totalCount}>{selectedSeats.length} Ticket(s)</div>
            </div>
            <div style={S.totalAmount}>₹{totalPrice}</div>
          </div>

          {/* Checkout button */}
          <button
            onClick={handleCheckout}
            disabled={selectedSeats.length === 0 || isProcessing}
            style={getCheckoutBtnStyle(selectedSeats.length > 0 && !isProcessing)}
          >
            {isProcessing
              ? 'Processing...'
              : selectedSeats.length > 0
                ? 'Confirm & Pay'
                : 'Select a Seat'}
          </button>

          {/* Section price reference */}
          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              fontSize: '9px', letterSpacing: '0.14em',
              textTransform: 'uppercase', color: '#4a3c2a',
              marginBottom: '12px',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Seat Pricing
            </div>
            {SEAT_CONFIG.map(s => (
              <div key={s.id} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '8px',
              }}>
                <span style={{
                  fontSize: '11px', color: s.color,
                  fontWeight: 600, letterSpacing: '0.06em',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {s.name}
                </span>
                <span style={{
                  fontSize: '12px', color: '#8a7355',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  ₹{s.price}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Booking;