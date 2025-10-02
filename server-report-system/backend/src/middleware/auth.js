const User = require('../models/User');

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }
  next();
};

// Role-based authorization middleware
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    if (!User.hasPermission(req.user.role, requiredRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires ${requiredRole} role or higher`
      });
    }

    next();
  };
};

// Check if user can access specific report type
const canAccessReportType = (req, res, next) => {
  const reportType = req.body.type || req.query.type;
  
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  // Admin and Owner can access all report types
  if (req.user.role === 'admin' || req.user.role === 'owner') {
    return next();
  }

  // Check specific permissions for other roles
  if (!User.canAccessReportType(req.user.role, reportType)) {
    return res.status(403).json({
      error: 'Access denied',
      message: `Your role (${req.user.role}) cannot access ${reportType} reports`
    });
  }

  next();
};

// Check if user can modify specific report
const canModifyReport = async (req, res, next) => {
  try {
    const reportId = req.params.id;
    const Report = require('../models/Report');
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        error: 'Report not found'
      });
    }

    // Owner and Admin can modify any report
    if (req.user.role === 'owner' || req.user.role === 'admin') {
      req.report = report;
      return next();
    }

    // Check if user can access this report type
    if (!User.canAccessReportType(req.user.role, report.type)) {
      return res.status(403).json({
        error: 'Access denied',
        message: `Your role cannot access ${report.type} reports`
      });
    }

    // Users can only modify reports assigned to them or unassigned reports
    if (report.handled_by && report.handled_by !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only modify reports assigned to you'
      });
    }

    req.report = report;
    next();
  } catch (error) {
    console.error('Error checking report permissions:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Check if user is report owner (for reopening reports)
const isReportOwner = async (req, res, next) => {
  try {
    const reportId = req.params.id;
    const Report = require('../models/Report');
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        error: 'Report not found'
      });
    }

    // Check if user is the original reporter
    if (report.reporter_discord_id !== req.user.discord_id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only reopen your own reports'
      });
    }

    // Check if report is in resolved status
    if (report.status !== 'resolved') {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Only resolved reports can be reopened'
      });
    }

    req.report = report;
    next();
  } catch (error) {
    console.error('Error checking report ownership:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Optional authentication (for public endpoints that can work with or without auth)
const optionalAuth = (req, res, next) => {
  // If user is authenticated, attach user info
  // If not, continue without user info
  next();
};

// API key authentication (for FiveM server integration)
const requireApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const validApiKey = process.env.FIVEM_API_KEY || process.env.FIVEM_SERVER_KEY;

  if (!validApiKey) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'API key not configured'
    });
  }

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({
      error: 'Invalid API key',
      message: 'Valid API key required for this endpoint'
    });
  }

  next();
};

// Audit logging middleware
const auditLog = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after successful response
      if (res.statusCode < 400) {
        logAuditEvent(action, req, res);
      }
      originalSend.call(this, data);
    };
    
    next();
  };
};

async function logAuditEvent(action, req, res) {
  try {
    const auditData = {
      action,
      user_id: req.user?.id,
      user_discord_id: req.user?.discord_id,
      user_role: req.user?.role,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      endpoint: `${req.method} ${req.originalUrl}`,
      request_body: req.method !== 'GET' ? JSON.stringify(req.body) : null,
      report_id: req.params.id || req.body.id,
      timestamp: new Date()
    };

    // Log to database (create audit_logs table if needed)
    const db = require('../config/db');
    await db('audit_logs').insert(auditData);
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}

module.exports = {
  requireAuth,
  requireRole,
  canAccessReportType,
  canModifyReport,
  isReportOwner,
  optionalAuth,
  requireApiKey,
  auditLog
};