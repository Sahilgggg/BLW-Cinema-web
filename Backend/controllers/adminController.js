const User = require('../models/User');

// @desc    Admin approves a pending user
// @route   PUT /api/admin/approve-user/:id
// @access  Private/Admin
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.status !== 'pending_approval') {
      return res.status(400).json({ message: 'User is not waiting for approval' });
    }

    user.status = 'active';
    await user.save();

    res.status(200).json({ message: `${user.name} has been approved and can now log in!` });
  } catch (error) {
    console.error('Approval Error:', error);
    res.status(500).json({ message: 'Error approving user' });
  }
};