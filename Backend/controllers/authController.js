const User = require('../models/User');
const jwt = require('jsonwebtoken');
const twilio = require('twilio'); // Left this in case you still want SMS fallback later

// --- HELPER FUNCTIONS ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ==========================================
// 1. REGISTER USER & CONDITIONAL OTP ROUTING
// ==========================================
exports.registerUser = async (req, res) => {
  const { name, email, mobile, password, role } = req.body;

  try {
    const searchConditions = [];
    if (email) searchConditions.push({ email: email });
    if (mobile) searchConditions.push({ mobile: mobile });

    if (searchConditions.length === 0) {
      return res.status(400).json({ message: 'Please provide either an email or a mobile number.' });
    }

    const userExists = await User.findOne({ $or: searchConditions });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email or mobile number already exists.' });
    }

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; 
    const requestedRole = role || 'user'; // Default to user if not provided

    // Create the unverified user in the database
    const user = await User.create({
      name,
      email: email || undefined,
      mobile: mobile || undefined,
      password,
      role: requestedRole,
      status: 'unverified',
      otp,
      otpExpires
    });

    // ==========================================
    // ROUTE A: ADMIN -> DEMO BYPASS (RETURN IN API)
    // ==========================================
    if (requestedRole === 'admin') {
      console.log(`\n🚀 DEMO MODE: Admin OTP for ${name} generated: ${otp}\n`);
      
      return res.status(201).json({ 
        message: 'Admin request submitted.', 
        otp: otp, // Sends OTP directly to the frontend
        userId: user._id 
      });
    } 
    
    // ==========================================
    // ROUTE B: USER -> DEMO BYPASS (RETURN IN API)
    // ==========================================
    else {
      // Priority 1: User's Email (Bypassed to Frontend)
      if (email) {
        console.log(`\n🚀 DEMO MODE: User OTP generated for ${email}: ${otp}\n`);

        return res.status(201).json({ 
          message: 'Registration successful!', 
          otp: otp, // Sends OTP directly to the frontend
          userId: user._id 
        });
      } 
      
      // Priority 2: User's Mobile (Fallback - Left active for Twilio if needed)
      else if (mobile) {
        try {
          const formattedMobile = mobile.startsWith('+') ? mobile : `+91${mobile}`;
          const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

          await client.messages.create({
            body: `Welcome to BLW Cinema! Your verification OTP is: ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedMobile
          });

          console.log(`\n📲 USER LOG: Twilio SMS OTP sent to ${formattedMobile}\n`);

          return res.status(201).json({ 
            message: 'Registration successful! Check your phone for the OTP.', 
            userId: user._id 
          });

        } catch (error) {
          console.error('\n🚨 Twilio Error:', error.message);
          return res.status(500).json({ message: 'SMS Failed. Check Twilio credentials.' });
        }
      }
    }

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server Error during registration' });
  }
};

// ==========================================
// 2. VERIFY OTP
// ==========================================
exports.verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP entered.' });
    if (user.otpExpires < Date.now()) return res.status(400).json({ message: 'OTP has expired.' });

    user.otp = undefined;
    user.otpExpires = undefined;

    if (user.role === 'admin') {
      user.status = 'active'; 
      await user.save();
      return res.status(200).json({ message: 'Master Admin verified! Fully active.' });
    }

    if (user.role === 'user') {
      user.status = 'pending_approval'; 
      await user.save();
      return res.status(200).json({ message: 'OTP Verified! Pending Admin approval.' });
    }
  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// ==========================================
// 3. LOGIN USER
// ==========================================
exports.loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { mobile: identifier }]
    });

    if (user && (await user.matchPassword(password))) {
      
      if (user.status === 'unverified') {
        return res.status(401).json({ message: 'Access Denied: Please verify your OTP.' });
      }
      if (user.status === 'pending_approval') {
        return res.status(403).json({ message: 'Account Pending: Waiting for Admin approval.' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials. Check email/mobile and password.' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server Error during login' });
  }
};

// ==========================================
// 4. ADMIN DASHBOARD - GET PENDING USERS
// ==========================================
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending_approval' }).select('-password');
    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error('Fetch Pending Users Error:', error);
    res.status(500).json({ message: 'Error fetching pending users' });
  }
};

// ==========================================
// 5. ADMIN DASHBOARD - APPROVE USER
// ==========================================
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.status = 'active';
    await user.save();
    
    res.status(200).json({ message: 'User approved successfully' });
  } catch (error) {
    console.error('Approve User Error:', error);
    res.status(500).json({ message: 'Error approving user' });
  }
};