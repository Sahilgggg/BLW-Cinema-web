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
  { id: 'first', name: 'First Class', price: 30, rows: ['A', 'B', 'C'], seatsPerRow: 12, color: 'border-cinema-gold text-cinema-gold' },
  { id: 'second', name: 'Second Class', price: 20, rows: ['D', 'E', 'F', 'G', 'H', 'I', 'J'], seatsPerRow: 10, color: 'border-blue-400 text-blue-400' },
  { id: 'third', name: 'Third Class', price: 15, rows: ['K', 'L', 'M', 'N'], seatsPerRow: 8, color: 'border-gray-400 text-gray-400' },
];

function Booking() {
  const { id } = useParams(); // The Movie ID from the URL
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Get the logged-in user's token

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]); // Now dynamic from DB!
  const [isProcessing, setIsProcessing] = useState(false);

  // --- 1. FETCH BOOKED SEATS ON LOAD ---
  useEffect(() => {
    const fetchBookedSeats = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/movie/${id}`);
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

  // --- 3. CHECKOUT LOGIC ---
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
      const orderResponse = await fetch('http://localhost:5000/api/payments/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ amount: totalPrice }),
      });
      const orderData = await orderResponse.json();

      if (!orderResponse.ok) throw new Error('Failed to create payment order');

      // Step C: Open Razorpay Popup
      const options = {
        key: 'rzp_test_SypPbZEfurHbSU', // IMPORTANT: Paste your actual Key ID here too!
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'B.L.W Cinema Hall',
        description: `Movie Tickets (${selectedSeats.length} Seats)`,
        order_id: orderData.id,
        handler: async function (response) {
          // Step D: Razorpay success! Now verify signature on backend
          const verifyRes = await fetch('http://localhost:5000/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyRes.ok) {
            // Step E: Signature verified. Now actually lock the seats and save the booking!
            const bookingRes = await fetch('http://localhost:5000/api/bookings', {
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
            });

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
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#E50914', // Matches our cinema accent red
        },
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

  return (
    <div className="min-h-screen bg-cinema-bg text-cinema-light pb-12">
      {/* Top Navigation Bar */}
      <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0B0C10] sticky top-0 z-20 shadow-md">
        <Link to="/" className="text-cinema-text hover:text-white transition">&larr; Back</Link>
        <h2 className="text-xl font-bold text-white">Select Seats</h2>
        <div className="w-10"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Left Side: Seat Matrix */}
        <div className="flex-1 overflow-x-auto bg-cinema-surface p-6 md:p-10 rounded-2xl border border-gray-800">
          <div className="flex flex-col items-center min-w-max gap-8">
            {SEAT_CONFIG.map((section) => (
              <div key={section.id} className="w-full flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-4 border-b border-gray-700 pb-2">
                  <span className={`text-sm font-bold uppercase tracking-wider ${section.color}`}>{section.name}</span>
                  <span className="text-sm font-medium text-cinema-text">₹{section.price}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {section.rows.map((row) => (
                    <div key={row} className="flex items-center justify-center gap-4">
                      <span className="w-6 text-center text-cinema-text font-mono font-bold">{row}</span>
                      <div className="flex gap-2">
                        {[...Array(section.seatsPerRow)].map((_, index) => {
                          const seatId = `${row}${index + 1}`;
                          const isBooked = bookedSeats.includes(seatId);
                          const isSelected = selectedSeats.some(s => s.seatId === seatId);

                          return (
                            <button
                              key={seatId}
                              onClick={() => toggleSeat(seatId, section.price, section.name)}
                              disabled={isBooked || isProcessing}
                              className={`w-7 h-7 md:w-9 md:h-9 rounded-t-lg transition-all duration-200 text-xs font-bold
                                ${isBooked ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 
                                  isSelected ? 'bg-cinema-accent text-white transform scale-110 shadow-lg shadow-red-900/50' : 
                                  `bg-[#0B0C10] hover:bg-gray-700 text-transparent hover:text-white border ${section.color.split(' ')[0]}`}`}
                            >
                              {index + 1}
                            </button>
                          );
                        })}
                      </div>
                      <span className="w-6 text-center text-cinema-text font-mono font-bold">{row}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="w-full max-w-2xl mx-auto mt-16 mb-4">
            <div className="h-3 bg-gradient-to-t from-gray-700 to-gray-500 rounded-t-full opacity-60 shadow-[0_-15px_30px_rgba(255,255,255,0.05)]"></div>
            <p className="text-center text-xs text-cinema-text mt-3 uppercase tracking-widest font-bold">Screen This Way</p>
          </div>

          <div className="flex justify-center gap-6 mt-10 text-sm border-t border-gray-800 pt-6">
            <div className="flex items-center gap-2"><div className="w-4 h-4 border border-gray-500 rounded"></div> Available</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-cinema-accent rounded"></div> Selected</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-800 rounded"></div> Booked</div>
          </div>
        </div>

        {/* Right Side: Checkout Summary */}
        <div className="w-full lg:w-96 bg-cinema-surface p-6 rounded-xl border border-gray-800 sticky top-28">
          <h3 className="text-lg font-bold text-white mb-6 border-b border-gray-700 pb-4">Booking Summary</h3>
          
          <div className="min-h-[100px] mb-6">
            {selectedSeats.length === 0 ? (
              <p className="text-cinema-text text-sm italic text-center mt-8">No seats selected yet.</p>
            ) : (
              <ul className="space-y-3">
                {selectedSeats.map(seat => (
                  <li key={seat.seatId} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-white font-bold mr-2">{seat.seatId}</span>
                      <span className="text-cinema-text text-xs">({seat.section})</span>
                    </div>
                    <span className="text-white">₹{seat.price}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-between items-end mb-8 border-t border-gray-700 pt-6">
            <div className="flex flex-col">
              <span className="text-cinema-text text-sm">Total Amount</span>
              <span className="text-cinema-text text-xs mt-1">{selectedSeats.length} Ticket(s)</span>
            </div>
            <span className="text-cinema-gold font-black text-3xl">₹{totalPrice}</span>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={selectedSeats.length === 0 || isProcessing}
            className={`w-full py-4 rounded-lg font-bold text-lg transition duration-200 shadow-lg
              ${selectedSeats.length > 0 && !isProcessing ? 'bg-cinema-accent hover:bg-red-700 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
          >
            {isProcessing ? 'Processing...' : selectedSeats.length > 0 ? 'Confirm & Pay' : 'Select a Seat'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Booking;