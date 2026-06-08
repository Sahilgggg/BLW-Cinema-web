const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validation check for price
    if (!amount || amount <= 0) {
      console.error('❌ PAYMENT ERROR: Amount is missing or invalid:', amount);
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise securely
      currency: 'INR',
      receipt: `receipt_order_${Math.floor(Math.random() * 1000)}`,
    };

    console.log('Sending order parameters to Razorpay:', options);
    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    // THIS LINE IS CRUCIAL: It will print the exact reason for the 500 error in your terminal
    console.error('❌ RAZORPAY API CRASH:', error); 
    res.status(500).json({ message: 'Server Error during payment initialization' });
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: 'Payment verified successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
};