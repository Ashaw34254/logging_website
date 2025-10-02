const User = require('../models/User');
const jwt = require('jsonwebtoken');

class AuthController {
  // Discord OAuth2 callback
  static async discordCallback(req, res) {
    try {
      if (!req.user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: req.user.id,
          discord_id: req.user.discord_id,
          role: req.user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Set token as httpOnly cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      // Redirect to dashboard
      res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } catch (error) {
      console.error('Discord callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  }

  // Get current user info
  static async getCurrentUser(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Not authenticated'
        });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // Remove sensitive information
      const { id, discord_id, username, discriminator, avatar, role, created_at, last_login } = user;
      
      res.json({
        user: {
          id,
          discord_id,
          username,
          discriminator,
          avatar,
          role,
          created_at,
          last_login
        }
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      // Clear the auth cookie
      res.clearCookie('auth_token');
      
      // Destroy session if using sessions
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destroy error:', err);
          }
        });
      }

      res.json({
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  // Check authentication status
  static async checkAuth(req, res) {
    try {
      const token = req.cookies.auth_token || req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.json({
          authenticated: false
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.json({
          authenticated: false
        });
      }

      res.json({
        authenticated: true,
        user: {
          id: user.id,
          discord_id: user.discord_id,
          username: user.username,
          discriminator: user.discriminator,
          avatar: user.avatar,
          role: user.role
        }
      });
    } catch (error) {
      res.json({
        authenticated: false
      });
    }
  }

  // Update user role (admin/owner only)
  static async updateUserRole(req, res) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      // Validate role
      const validRoles = ['support', 'moderator', 'admin', 'owner'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          error: 'Invalid role'
        });
      }

      // Only owners can assign owner role
      if (role === 'owner' && req.user.role !== 'owner') {
        return res.status(403).json({
          error: 'Only owners can assign owner role'
        });
      }

      // Can't change your own role unless you're owner promoting someone else to owner
      if (parseInt(userId) === req.user.id && !(req.user.role === 'owner' && role === 'owner')) {
        return res.status(400).json({
          error: 'Cannot change your own role'
        });
      }

      const updatedUser = await User.updateRole(userId, role);
      if (!updatedUser) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      res.json({
        message: 'User role updated successfully',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          role: updatedUser.role
        }
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  // Get all users (admin/owner only)
  static async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await User.getAll(page, limit);
      
      res.json(result);
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  // Delete user (owner only)
  static async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      // Can't delete yourself
      if (parseInt(userId) === req.user.id) {
        return res.status(400).json({
          error: 'Cannot delete your own account'
        });
      }

      const deleted = await User.delete(userId);
      if (!deleted) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      res.json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  // JWT authentication middleware
  static async authenticateToken(req, res, next) {
    try {
      const token = req.cookies.auth_token || req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(); // Continue without authentication
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user) {
        req.user = user;
      }
      
      next();
    } catch (error) {
      // Invalid token, continue without authentication
      next();
    }
  }
}

module.exports = AuthController;