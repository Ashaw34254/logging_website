const express = require('express');
const passport = require('../config/discordAuth');
const AuthController = require('../controllers/AuthController');
const { requireAuth, requireRole, auditLog } = require('../middleware/auth');
const { authLimiter } = require('../config/security');

const router = express.Router();

// Discord OAuth2 routes
router.get('/discord', authLimiter, passport.authenticate('discord'));

router.get('/discord/callback', 
  authLimiter,
  passport.authenticate('discord', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  AuthController.discordCallback
);

// Authentication status and user info
router.get('/check', AuthController.authenticateToken, AuthController.checkAuth);
router.get('/user', AuthController.authenticateToken, requireAuth, AuthController.getCurrentUser);

// Logout
router.post('/logout', 
  AuthController.authenticateToken, 
  requireAuth, 
  auditLog('user_logout'),
  AuthController.logout
);

// User management (admin/owner only)
router.get('/users', 
  AuthController.authenticateToken, 
  requireRole('admin'), 
  AuthController.getAllUsers
);

router.patch('/users/:userId/role', 
  AuthController.authenticateToken, 
  requireRole('admin'),
  auditLog('user_role_update'),
  AuthController.updateUserRole
);

router.delete('/users/:userId', 
  AuthController.authenticateToken, 
  requireRole('owner'),
  auditLog('user_delete'),
  AuthController.deleteUser
);

module.exports = router;