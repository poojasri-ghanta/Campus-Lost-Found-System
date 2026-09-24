const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const auditService = require('../services/auditService');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, studentId, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
        error: 'EMAIL_ALREADY_EXISTS'
      });
    }

    const passwordHash = await User.hashPassword(password);
    const assignedRole = role === 'ADMIN' ? 'STUDENT' : (role || 'STUDENT'); // Prevent self-assigning ADMIN unless via admin console

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: assignedRole,
      department: department || 'General Studies',
      studentId: studentId || '',
      phone: phone || ''
    });

    const token = generateToken(user._id, user.role);

    await auditService.logAction({
      userId: user._id,
      userEmail: user.email,
      action: 'USER_REGISTER',
      entityType: 'USER',
      entityId: user._id,
      metadata: { role: user.role, department: user.department },
      req
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
        phone: user.phone,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
        error: 'MISSING_CREDENTIALS'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        error: 'INVALID_CREDENTIALS'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        error: 'INVALID_CREDENTIALS'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: `Account is suspended. Reason: ${user.suspensionReason || 'Contact campus administration.'}`,
        error: 'ACCOUNT_SUSPENDED'
      });
    }

    const token = generateToken(user._id, user.role);

    await auditService.logAction({
      userId: user._id,
      userEmail: user.email,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user._id,
      metadata: { role: user.role },
      req
    });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
        phone: user.phone,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, department, studentId, phone, profileImage } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (department !== undefined) user.department = department;
    if (studentId !== undefined) user.studentId = studentId;
    if (phone !== undefined) user.phone = phone;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    await auditService.logAction({
      userId: user._id,
      userEmail: user.email,
      action: 'USER_PROFILE_UPDATE',
      entityType: 'USER',
      entityId: user._id,
      req
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password (OTP verification code generator)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid campus email address.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered user found with this email address.'
      });
    }

    // Generate 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    await auditService.logAction({
      userId: user._id,
      userEmail: user.email,
      action: 'USER_PASSWORD_RESET_REQUESTED',
      entityType: 'USER',
      entityId: user._id,
      req
    });

    res.json({
      success: true,
      message: `Password reset verification code generated for ${user.email}.`,
      resetCode, // Provided for instant demo/local recovery verification
      email: user.email
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password with OTP code
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, verification code, and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordCode: resetCode.toString().trim(),
      resetPasswordExpire: { $gt: new Date() }
    }).select('+resetPasswordCode +resetPasswordExpire');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Please request a new code.'
      });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await auditService.logAction({
      userId: user._id,
      userEmail: user.email,
      action: 'USER_PASSWORD_RESET_COMPLETED',
      entityType: 'USER',
      entityId: user._id,
      req
    });

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword
};
