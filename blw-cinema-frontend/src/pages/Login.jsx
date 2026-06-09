import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);
  // Remove 'dispatch' and bring in 'login'
  const { login } = useContext(AuthContext);

  // --- UI STATE: Controls which form is visible ('login', 'register', or 'otp') ---
  const [view, setView] = useState('login');

  // --- RESPONSIVE STATE: Tracks screen width for mobile adjustments ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 480);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setTempUserId(data.userId);
        setSuccessMessage(data.message);
        
        // 👇 THIS IS THE ONLY LINE ADDED FOR THE DEMO MODE ALERT 👇
        alert(`DEMO MODE - Your Verification Code is: ${data.otp}`);

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
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-otp`, {
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
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
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
  // REUSABLE STYLE OBJECTS — MOBILE RESPONSIVE
  // ==========================================
  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#080a0e',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: isMobile ? '0' : '16px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif",
    },
    glowLeft: {
      position: 'absolute',
      left: '-80px', top: '-60px',
      width: '320px', height: '320px',
      background: 'radial-gradient(circle, rgba(180,120,0,0.15) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    glowRight: {
      position: 'absolute',
      right: '-80px', bottom: '-60px',
      width: '280px', height: '280px',
      background: 'radial-gradient(circle, rgba(160,40,30,0.12) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    filmTop: {
      position: 'absolute', top: 0, left: 0, right: 0,
      height: '12px', opacity: 0.5, zIndex: 10,
      background: 'repeating-linear-gradient(90deg, #0d0f14 0 14px, #1a1c22 14px 18px)',
    },
    filmBottom: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: '12px', opacity: 0.5, zIndex: 10,
      background: 'repeating-linear-gradient(90deg, #0d0f14 0 14px, #1a1c22 14px 18px)',
    },
    card: {
      position: 'relative', zIndex: 20,
      width: '100%',
      maxWidth: isMobile ? '100%' : '420px',
      minHeight: isMobile ? '100vh' : 'auto',
      backgroundColor: '#0d0f14',
      border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: isMobile ? '0' : '8px',
      padding: isMobile ? '48px 20px 32px' : '32px 28px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: isMobile ? 'center' : 'flex-start',
    },
    goldBar: {
      height: '2px', borderRadius: '2px', marginBottom: '24px',
      background: 'linear-gradient(90deg, transparent, #c9920a, #f0c040, #c9920a, transparent)',
    },
    logoText: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: isMobile ? '36px' : '32px',
      letterSpacing: '0.1em',
      color: '#ffffff',
      lineHeight: 1,
      textAlign: 'center',
    },
    logoSub: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '9px',
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: '#6b5c42',
      marginTop: '4px',
      textAlign: 'center',
    },
    viewTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: isMobile ? '24px' : '22px',
      fontWeight: 700,
      color: '#e8dcc8',
      textAlign: 'center',
      marginBottom: '4px',
    },
    viewSub: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '10px',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: '#6b5c42',
      textAlign: 'center',
      marginBottom: '24px',
    },
    label: {
      display: 'block',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '10px',
      fontWeight: 600,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: '#6b5c42',
      marginBottom: '6px',
    },
    input: {
      width: '100%',
      backgroundColor: '#080a0e',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '3px',
      padding: isMobile ? '13px 14px' : '10px 12px',
      color: '#e8dcc8',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: isMobile ? '16px' : '13px', // 16px prevents iOS zoom on focus
      outline: 'none',
      marginBottom: '16px',
      WebkitAppearance: 'none', // removes iOS default styling
    },
    otpInput: {
      width: '100%',
      backgroundColor: '#080a0e',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '3px',
      padding: '12px',
      color: '#f0c040',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: isMobile ? '28px' : '24px',
      fontWeight: 700,
      letterSpacing: '0.5em',
      textAlign: 'center',
      outline: 'none',
      marginBottom: '8px',
      WebkitAppearance: 'none',
    },
    btnRed: {
      width: '100%',
      padding: isMobile ? '14px' : '11px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '12px',
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
      background: 'linear-gradient(90deg, #9b2020, #c0392b)',
      color: '#ffffff',
      marginTop: '4px',
      WebkitTapHighlightColor: 'transparent', // removes tap flash on mobile
    },
    btnGold: {
      width: '100%',
      padding: isMobile ? '14px' : '11px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '12px',
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
      background: 'linear-gradient(90deg, #c9920a, #e8aa20)',
      color: '#0d0700',
      marginTop: '4px',
      WebkitTapHighlightColor: 'transparent',
    },
    switchRow: {
      textAlign: 'center',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '13px',
      color: '#6b5c42',
      marginTop: '20px',
    },
    switchBtn: {
      background: 'none',
      border: 'none',
      color: '#c9920a',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '13px',
      fontFamily: "'DM Sans', sans-serif",
      marginLeft: '4px',
      textDecoration: 'underline',
      WebkitTapHighlightColor: 'transparent',
    },
    divider: {
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
      margin: '16px 0',
    },
    alertErr: {
      fontSize: '12px',
      padding: '10px 14px',
      borderRadius: '4px',
      marginBottom: '16px',
      textAlign: 'center',
      background: 'rgba(180,40,30,0.12)',
      border: '1px solid rgba(200,60,50,0.35)',
      color: '#e07060',
      fontFamily: "'DM Sans', sans-serif",
    },
    alertOk: {
      fontSize: '12px',
      padding: '10px 14px',
      borderRadius: '4px',
      marginBottom: '16px',
      textAlign: 'center',
      background: 'rgba(30,140,80,0.10)',
      border: '1px solid rgba(40,160,90,0.30)',
      color: '#5dbf8a',
      fontFamily: "'DM Sans', sans-serif",
    },
  };

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div style={styles.page}>

      {/* Atmospheric background glows */}
      <div style={styles.glowLeft} />
      <div style={styles.glowRight} />

      {/* Film strip perforations top & bottom */}
      <div style={styles.filmTop} />
      <div style={styles.filmBottom} />

      {/* Main card — full screen on mobile, centered card on desktop */}
      <div style={styles.card}>

        {/* Gold shimmer bar */}
        <div style={styles.goldBar} />

        {/* Cinema branding */}
        <div style={{ marginBottom: '20px' }}>
          <div style={styles.logoText}>B.L.W Cinema</div>
          <div style={styles.logoSub}>Premium Experience</div>
        </div>

        {/* Alerts for Success/Error Messages */}
        {errorMessage && <div style={styles.alertErr}>{errorMessage}</div>}
        {successMessage && <div style={styles.alertOk}>{successMessage}</div>}

        {/* ---------------------------------- */}
        {/* VIEW 1: OTP VERIFICATION SCREEN    */}
        {/* ---------------------------------- */}
        {view === 'otp' && (
          <div>
            <div style={styles.viewTitle}>Verify Account</div>
            <div style={styles.viewSub}>OTP sent to your contact</div>

            <form onSubmit={handleVerifyOTP}>
              <label style={{ ...styles.label, textAlign: 'center', display: 'block' }}>
                Enter 6-Digit OTP
              </label>
              <input
                type="number"
                inputMode="numeric"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={styles.otpInput}
                placeholder="------"
                required
              />
              <p style={{
                fontSize: '11px', color: '#6b5c42',
                textAlign: 'center', marginBottom: '16px',
                fontFamily: "'DM Sans', sans-serif"
              }}>
                Check your email or mobile for the code
              </p>

              <div style={styles.divider} />

              <button type="submit" style={styles.btnGold}>
                Verify &amp; Continue
              </button>
            </form>

            <div style={styles.switchRow}>
              <button
                onClick={() => { setView('register'); setErrorMessage(''); setSuccessMessage(''); }}
                style={styles.switchBtn}
              >
                ← Back to Register
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------- */}
        {/* VIEW 2: REGISTRATION SCREEN        */}
        {/* ---------------------------------- */}
        {view === 'register' && (
          <div>
            <div style={styles.viewTitle}>Create Account</div>
            <div style={styles.viewSub}>Join B.L.W Cinema</div>

            <form onSubmit={handleRegister}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                onChange={handleChange}
                style={styles.input}
                placeholder="Your full name"
                autoComplete="name"
                required
              />

              {/* Role toggle buttons */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'user' })}
                  style={{
                    flex: 1,
                    padding: isMobile ? '12px' : '8px',
                    fontSize: '10px', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    borderRadius: '3px', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    WebkitTapHighlightColor: 'transparent',
                    ...(formData.role === 'user'
                      ? { background: 'linear-gradient(90deg,#c9920a,#e8aa20)', color: '#0d0700', border: 'none' }
                      : { background: '#080a0e', color: '#6b5c42', border: '1px solid rgba(255,255,255,0.08)' })
                  }}
                >
                  User
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  style={{
                    flex: 1,
                    padding: isMobile ? '12px' : '8px',
                    fontSize: '10px', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    borderRadius: '3px', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    WebkitTapHighlightColor: 'transparent',
                    ...(formData.role === 'admin'
                      ? { background: 'linear-gradient(90deg,#c9920a,#e8aa20)', color: '#0d0700', border: 'none' }
                      : { background: '#080a0e', color: '#6b5c42', border: '1px solid rgba(255,255,255,0.08)' })
                  }}
                >
                  Admin
                </button>
              </div>

              {/* Email + Mobile — stack vertically on mobile */}
              <div style={{ display: 'flex', gap: '10px', flexDirection: isMobile ? 'column' : 'row' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    name="email"
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Optional"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Mobile</label>
                  <input
                    type="tel"
                    name="mobile"
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Optional"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>
              </div>

              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                style={styles.input}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />

              <button type="submit" style={styles.btnRed}>
                Send OTP
              </button>
            </form>

            <div style={styles.switchRow}>
              Already have an account?
              <button
                onClick={() => { setView('login'); setErrorMessage(''); setSuccessMessage(''); }}
                style={styles.switchBtn}
              >
                Login
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------- */}
        {/* VIEW 3: LOGIN SCREEN               */}
        {/* ---------------------------------- */}
        {view === 'login' && (
          <div>
            <div style={styles.viewTitle}>Welcome Back</div>
            <div style={styles.viewSub}>Sign in to your account</div>

            <form onSubmit={handleLogin}>
              <label style={styles.label}>Email or Mobile Number</label>
              <input
                type="text"
                name="identifier"
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter email or 10-digit mobile"
                autoComplete="username"
                inputMode="email"
                required
              />

              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                style={styles.input}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />

              <button type="submit" style={styles.btnRed}>
                Login
              </button>
            </form>

            <div style={styles.switchRow}>
              Don't have an account?
              <button
                onClick={() => { setView('register'); setErrorMessage(''); setSuccessMessage(''); }}
                style={styles.switchBtn}
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Login;