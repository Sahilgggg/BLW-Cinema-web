import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';


function Login() {
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext); 
  // Remove 'dispatch' and bring in 'login'
const { login } = useContext(AuthContext);

  // --- UI STATE: Controls which form is visible ('login', 'register', or 'otp') ---
  const [view, setView] = useState('login'); 
  
  // --- FORM DATA STATE ---
  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', password: '', role: 'user', identifier: ''
  });
  const [otp, setOtp] = useState('');
  const [tempUserId, setTempUserId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage(''); // Clear errors when typing
  };

  // ==========================================
  // 1. HANDLE REGISTRATION (Creates User, Asks for OTP)
  // ==========================================
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setTempUserId(data.userId);
        setSuccessMessage(data.message);
        setView('otp'); // Switch screen to OTP
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('Registration failed. Server error.');
    }
  };

  // ==========================================
  // 2. HANDLE OTP VERIFICATION
  // ==========================================
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: tempUserId, otp: otp.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMessage('Verified successfully! You can now log in.');
        setView('login'); // Switch screen back to Login
        setOtp('');
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('OTP Verification failed.');
    }
  };

  // ==========================================
  // 3. HANDLE LOGIN
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: formData.identifier, password: formData.password }),
      });
      const data = await res.json();

      if (res.ok) {
        // Use the 'login' function from your AuthContext
        login(data); 
        navigate('/'); 
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('Login failed. Server error.');
    }
  };

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="min-h-screen bg-cinema-bg flex justify-center items-center text-white px-4">
      <div className="bg-[#111217] p-8 rounded-xl border border-gray-800 shadow-2xl w-full max-w-md">
        
        {/* Alerts for Success/Error Messages */}
        {errorMessage && <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded mb-4 text-center">{errorMessage}</div>}
        {successMessage && <div className="bg-green-500/10 border border-green-500 text-green-500 text-sm p-3 rounded mb-4 text-center">{successMessage}</div>}

        {/* ---------------------------------- */}
        {/* VIEW 1: OTP VERIFICATION SCREEN    */}
        {/* ---------------------------------- */}
        {view === 'otp' && (
          <div>
            <h2 className="text-2xl font-black mb-6 text-center text-[#D4AF37]">Verify Account</h2>
            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Enter 6-Digit OTP</label>
                <input 
                  type="text" 
                  maxLength="6" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  className="w-full mt-1 p-3 bg-[#0B0C10] border border-gray-700 rounded text-center tracking-[1em] font-bold text-xl focus:border-[#D4AF37] outline-none" 
                  placeholder="------" 
                  required 
                />
              </div>
              <button type="submit" className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded mt-2 hover:bg-yellow-500 transition">Verify & Continue</button>
            </form>
          </div>
        )}

        {/* ---------------------------------- */}
        {/* VIEW 2: REGISTRATION SCREEN        */}
        {/* ---------------------------------- */}
        {view === 'register' && (
          <div>
            <h2 className="text-2xl font-black mb-6 text-center">Create Account</h2>
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold">Full Name</label>
                <input type="text" name="name" onChange={handleChange} className="w-full mt-1 p-3 bg-[#0B0C10] border border-gray-700 rounded outline-none" required />
              </div>
              
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => setFormData({...formData, role: 'user'})} className={`w-1/2 py-2 text-xs font-bold rounded transition ${formData.role === 'user' ? 'bg-[#D4AF37] text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>User</button>
                <button type="button" onClick={() => setFormData({...formData, role: 'admin'})} className={`w-1/2 py-2 text-xs font-bold rounded transition ${formData.role === 'admin' ? 'bg-[#D4AF37] text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Admin</button>
              </div>

              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="text-xs text-gray-500 uppercase font-bold">Email</label>
                  <input type="email" name="email" onChange={handleChange} className="w-full mt-1 p-3 bg-[#0B0C10] border border-gray-700 rounded outline-none" placeholder="Optional" />
                </div>
                <div className="w-1/2">
                  <label className="text-xs text-gray-500 uppercase font-bold">Mobile</label>
                  <input type="text" name="mobile" onChange={handleChange} className="w-full mt-1 p-3 bg-[#0B0C10] border border-gray-700 rounded outline-none" placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold">Password</label>
                <input type="password" name="password" onChange={handleChange} className="w-full mt-1 p-3 bg-[#0B0C10] border border-gray-700 rounded outline-none" required />
              </div>
              <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded mt-2 hover:bg-red-700 transition">Send OTP</button>
            </form>
            <p className="text-center text-sm text-gray-400 mt-6">
              Already have an account? <button onClick={() => { setView('login'); setErrorMessage(''); setSuccessMessage(''); }} className="text-[#D4AF37] font-bold ml-1 hover:underline">Login</button>
            </p>
          </div>
        )}

        {/* ---------------------------------- */}
        {/* VIEW 3: LOGIN SCREEN               */}
        {/* ---------------------------------- */}
        {view === 'login' && (
          <div>
            <h2 className="text-2xl font-black mb-6 text-center">Welcome Back</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold">Email or Mobile Number</label>
                <input 
                  type="text" 
                  name="identifier" 
                  onChange={handleChange} 
                  className="w-full mt-1 p-3 bg-[#0B0C10] border border-gray-700 rounded outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition" 
                  placeholder="Enter email or 10-digit mobile"
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  onChange={handleChange} 
                  className="w-full mt-1 p-3 bg-[#0B0C10] border border-gray-700 rounded outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition" 
                  required 
                />
              </div>
              <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded mt-2 hover:bg-red-700 transition shadow-lg hover:shadow-red-600/20">Login</button>
            </form>
            <p className="text-center text-sm text-gray-400 mt-6">
              Don't have an account? <button onClick={() => { setView('register'); setErrorMessage(''); setSuccessMessage(''); }} className="text-[#D4AF37] font-bold ml-1 hover:underline">Sign Up</button>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Login;