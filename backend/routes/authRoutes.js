const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const AccountIdentity = require('../models/AccountIdentity');
const accountModels = require('../models/accountModels');
const Report = require('../models/Report');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const locationData = require('../data/indianLocations.json');

const router = express.Router();

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });

const serializeUser = (user, role) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  locality: user.locality || '',
  district: user.district || '',
  state: user.state || '',
  role,
  ...(role === 'AUTHORITY' ? { approvalStatus: user.approvalStatus } : {}),
});

const registrationValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit Indian mobile number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

const indianLocations = [...locationData.states, ...locationData.unionTerritories];
const indianStates = indianLocations.map(({ name }) => name);
const getDistrictsByState = (state) => indianLocations.find(
  (location) => location.name.toLowerCase() === String(state || '').toLowerCase()
)?.districts || null;

const citizenRegistrationValidation = [
  ...registrationValidation,
  body('locality').trim().notEmpty().withMessage('Area or locality is required'),
  body('district')
    .trim()
    .notEmpty()
    .withMessage('District is required')
    .bail()
    .custom((district, { req }) => {
      if (!getDistrictsByState(req.body.state)?.includes(district)) {
        throw new Error('Select a district that belongs to the selected state or union territory');
      }
      return true;
    }),
  body('state').isIn(indianStates).withMessage('Select a valid Indian state or union territory'),
];

const profileUpdateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number'),
  body('locality').optional().trim().notEmpty().withMessage('Area or locality cannot be empty'),
  body('district').optional().trim().notEmpty().withMessage('District cannot be empty'),
  body('state').optional().isIn(indianStates).withMessage('Select a valid Indian state or union territory'),
  body('district').optional().trim().custom((district, { req }) => {
    const state = req.body.state || req.user.state;
    const locationChanged = district !== req.user.district || state !== req.user.state;
    if (locationChanged && !getDistrictsByState(state)?.includes(district)) {
      throw new Error('Select a district that belongs to the selected state or union territory');
    }
    return true;
  }),
];

const registerWithRole = (role) => async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, phone, password, locality, district, state } = req.body;
      const normalizedEmail = email.trim().toLowerCase();

      const existingIdentity = await AccountIdentity.findOne({ email: normalizedEmail });
      if (existingIdentity) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const accountId = new mongoose.Types.ObjectId();
      const Model = accountModels[role];

      try {
        await AccountIdentity.create({ email: normalizedEmail, role, accountId });
      } catch (error) {
        if (error.code === 11000) {
          return res.status(400).json({ message: 'User with this email already exists' });
        }
        throw error;
      }

      let user;
      try {
        user = await Model.create({
          _id: accountId,
          name: name.trim(),
          email: normalizedEmail,
          phone,
          ...(role === 'CITIZEN' ? { locality: locality.trim(), district: district.trim(), state } : {}),
          password: hashedPassword,
          ...(role === 'AUTHORITY' ? { approvalStatus: 'PENDING' } : {}),
        });
      } catch (error) {
        await AccountIdentity.deleteOne({ accountId });
        if (error.code === 11000) {
          return res.status(400).json({ message: 'User with this email already exists' });
        }
        throw error;
      }

      if (role === 'AUTHORITY') {
        return res.status(202).json({
          message: 'Authority registration submitted. Access is pending administrator approval.',
          user: serializeUser(user, role),
        });
      }

      res.status(201).json({
        token: generateToken(user._id, role),
        user: serializeUser(user, role),
      });
    } catch (error) {
      next(error);
    }
  };

router.post('/register', citizenRegistrationValidation, registerWithRole('CITIZEN'));
router.post('/authority/request', registrationValidation, registerWithRole('AUTHORITY'));
router.post('/authority/register', registrationValidation, registerWithRole('AUTHORITY'));

router.get('/locations', (_req, res) => {
  res.json({ locations: indianLocations });
});

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').isIn(['CITIZEN', 'AUTHORITY', 'ADMIN']).withMessage('Select an account type'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, role } = req.body;
      const identity = await AccountIdentity.findOne({ email: email.trim().toLowerCase() });

      if (!identity) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const user = await accountModels[identity.role].findById(identity.accountId);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      if (identity.role !== role) {
        return res.status(401).json({ message: 'These credentials do not match the selected account type.' });
      }

      if (identity.role === 'AUTHORITY' && user.approvalStatus !== 'APPROVED') {
        const message = user.approvalStatus === 'REJECTED'
          ? 'This authority registration was not approved. Contact your administrator.'
          : 'Your authority account is awaiting administrator approval.';
        return res.status(403).json({ message });
      }

      res.json({
        token: generateToken(user._id, identity.role),
        user: serializeUser(user, identity.role),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/me', protect, async (req, res) => {
  res.json({ user: serializeUser(req.user, req.user.role) });
});

router.patch('/me', protect, profileUpdateValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const editableFields = req.user.role === 'CITIZEN'
      ? ['name', 'phone', 'locality', 'district', 'state']
      : ['name', 'phone'];
    const fieldsToUpdate = editableFields.filter((field) => Object.hasOwn(req.body, field));
    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ message: 'Provide at least one profile field to update' });
    }

    fieldsToUpdate.forEach((field) => {
      req.user[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
    });
    await req.user.save();

    res.json({ message: 'Profile updated successfully', user: serializeUser(req.user, req.user.role) });
  } catch (error) {
    next(error);
  }
});

router.get('/admin/requests', protect, authorizeRoles('ADMIN'), async (_req, res, next) => {
  try {
    const requests = await accountModels.AUTHORITY.find().select('-password').sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    next(error);
  }
});

router.get('/admin/stats', protect, authorizeRoles('ADMIN'), async (_req, res, next) => {
  try {
    const [citizenCount, authorityCount, reportCount, pendingAuthorityCount] = await Promise.all([
      accountModels.CITIZEN.countDocuments(),
      accountModels.AUTHORITY.countDocuments({ approvalStatus: 'APPROVED' }),
      Report.countDocuments(),
      accountModels.AUTHORITY.countDocuments({ approvalStatus: 'PENDING' }),
    ]);

    res.json({
      stats: {
        citizens: citizenCount,
        authorities: authorityCount,
        reports: reportCount,
        pendingAuthorities: pendingAuthorityCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/admin/citizens', protect, authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const search = String(req.query.search || '').trim().slice(0, 100);
    const query = {};

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(escapedSearch, 'i');
      query.$or = [
        { name: pattern },
        { email: pattern },
        { locality: pattern },
        { district: pattern },
        { state: pattern },
      ];
    }

    const [citizens, total] = await Promise.all([
      accountModels.CITIZEN.find(query)
        .select('name email phone locality district state createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      accountModels.CITIZEN.countDocuments(query),
    ]);

    res.json({
      citizens,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/admin/authority/:id/approve', protect, authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const user = await accountModels.AUTHORITY.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Authority account not found' });
    }

    user.approvalStatus = 'APPROVED';
    await user.save();

    return res.json({ message: 'Authority request approved', user: serializeUser(user, 'AUTHORITY') });
  } catch (error) {
    next(error);
  }
});

router.patch('/admin/authority/:id/reject', protect, authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const user = await accountModels.AUTHORITY.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Authority account not found' });
    }

    user.approvalStatus = 'REJECTED';
    await user.save();

    return res.json({ message: 'Authority request rejected', user: serializeUser(user, 'AUTHORITY') });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
