import express from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { protect, auditAction } from '../middleware/auth';
import { User } from '../models/User';
import { Company } from '../models/Company';
import { AppError } from '../middleware/errorHandler';
import { UserRole, UserStatus, CompanyStatus } from '../types';
import { logInfo, logError } from '../utils/logger';

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new company and admin user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - industry
 *               - adminEmail
 *               - adminPassword
 *               - adminFirstName
 *               - adminLastName
 *             properties:
 *               companyName:
 *                 type: string
 *               industry:
 *                 type: string
 *               address:
 *                 type: object
 *               contact:
 *                 type: object
 *               adminEmail:
 *                 type: string
 *               adminPassword:
 *                 type: string
 *               adminFirstName:
 *                 type: string
 *               adminLastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Company and admin user created successfully
 *       400:
 *         description: Validation error
 */
router.post('/register', [
  body('companyName').trim().isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
  body('industry').trim().isLength({ min: 2, max: 100 }).withMessage('Industry must be between 2 and 100 characters'),
  body('adminEmail').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('adminPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('adminFirstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('adminLastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('address.street').optional().trim().isLength({ min: 5, max: 200 }),
  body('address.city').optional().trim().isLength({ min: 2, max: 100 }),
  body('address.state').optional().trim().isLength({ min: 2, max: 100 }),
  body('address.country').optional().trim().isLength({ min: 2, max: 100 }),
  body('address.zipCode').optional().trim().isLength({ min: 3, max: 20 }),
  body('contact.phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please provide a valid phone number'),
  body('contact.website').optional().isURL().withMessage('Please provide a valid website URL')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const {
    companyName,
    industry,
    address,
    contact,
    adminEmail,
    adminPassword,
    adminFirstName,
    adminLastName
  } = req.body;

  // Check if company already exists
  const existingCompany = await Company.findOne({ name: companyName });
  if (existingCompany) {
    throw new AppError('Company with this name already exists', 400);
  }

  // Check if admin email already exists
  const existingUser = await User.findOne({ email: adminEmail });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  // Create company
  const company = new Company({
    name: companyName,
    industry,
    status: CompanyStatus.PENDING,
    address: address || {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    contact: {
      email: adminEmail,
      phone: contact?.phone || '',
      website: contact?.website
    },
    subscription: {
      plan: 'basic',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    }
  });

  await company.save();

  // Create admin user
  const adminUser = new User({
    email: adminEmail,
    password: adminPassword,
    firstName: adminFirstName,
    lastName: adminLastName,
    role: UserRole.ADMIN,
    status: UserStatus.PENDING,
    companyId: company._id,
    emailVerified: false
  });

  await adminUser.save();

  logInfo('New company registration', {
    companyId: company._id,
    companyName,
    adminEmail
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please wait for approval.',
    data: {
      companyId: company._id,
      companyName: company.name,
      status: company.status
    }
  });
}));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if password is correct
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if user is active
  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError('Your account is not active. Please contact support.', 401);
  }

  // Get company information
  const company = await Company.findById(user.companyId);
  if (!company) {
    throw new AppError('Company not found', 404);
  }

  // Check if company is active
  if (company.status !== CompanyStatus.ACTIVE) {
    throw new AppError('Your company account is not active. Please contact support.', 401);
  }

  // Check if subscription is active
  if (!company.isSubscriptionActive()) {
    throw new AppError('Your subscription has expired. Please renew to continue.', 401);
  }

  // Generate token
  const token = user.generateAuthToken();

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  logInfo('User login successful', {
    userId: user._id,
    email: user.email,
    companyId: user.companyId
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
        companyName: company.name,
        preferences: user.preferences
      }
    }
  });
}));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/me', protect, auditAction('read', 'user'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('companyId', 'name slug status');
  
  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        companyId: user.companyId,
        department: user.department,
        position: user.position,
        phone: user.phone,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        emailVerified: user.emailVerified,
        preferences: user.preferences
      }
    }
  });
}));

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // TODO: Send email with reset token
  // For now, just log it
  logInfo('Password reset requested', {
    userId: user._id,
    email: user.email,
    resetToken
  });

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
}));

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const { token, password } = req.body;

  // Hash the token
  const hashedToken = require('crypto')
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.updatePasswordChangedAt();
  
  await user.save();

  logInfo('Password reset successful', {
    userId: user._id,
    email: user.email
  });

  res.json({
    success: true,
    message: 'Password reset successful'
  });
}));

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password (authenticated)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.post('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
], auditAction('update', 'password'), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  
  // Check current password
  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordCorrect) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Set new password
  user.password = newPassword;
  user.updatePasswordChangedAt();
  
  await user.save();

  logInfo('Password changed', {
    userId: user._id,
    email: user.email
  });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', protect, auditAction('logout', 'user'), asyncHandler(async (req, res) => {
  // In a more complex implementation, you might want to blacklist the token
  // For now, we'll just return success
  logInfo('User logout', {
    userId: req.user._id,
    email: req.user.email
  });

  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

export default router; 