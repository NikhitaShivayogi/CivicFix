const jwt = require('jsonwebtoken');
const AccountIdentity = require('../models/AccountIdentity');
const accountModels = require('../models/accountModels');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const identity = await AccountIdentity.findOne({ accountId: decoded.id });

    if (!identity || (decoded.role && decoded.role !== identity.role)) {
      return res.status(401).json({ message: 'User account not found' });
    }

    req.user = await accountModels[identity.role].findById(identity.accountId).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user.role = identity.role;

    if (req.user.role === 'AUTHORITY' && req.user.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Authority account is not approved' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden: admin access required' });
  }

  next();
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
  }

  next();
};

module.exports = { protect, authorizeRoles };
