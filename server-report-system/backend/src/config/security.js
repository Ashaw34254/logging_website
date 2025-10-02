const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

// Rate limiting configuration
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// General API rate limit
const apiLimiter = createRateLimit(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  'Too many API requests from this IP, please try again after 15 minutes.'
);

// Strict rate limit for report submission
const reportLimiter = createRateLimit(
  600000, // 10 minutes
  5, // 5 reports per 10 minutes
  'Too many reports submitted. Please wait 10 minutes before submitting another report.'
);

// Auth rate limit
const authLimiter = createRateLimit(
  900000, // 15 minutes
  5, // 5 login attempts per 15 minutes
  'Too many login attempts from this IP, please try again after 15 minutes.'
);

// Security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "ws:"]
    }
  },
  crossOriginEmbedderPolicy: false
});

// Input validation schemas
const reportValidation = [
  body('type')
    .isIn(['player_report', 'bug_report', 'feedback'])
    .withMessage('Invalid report type'),
  body('category')
    .isLength({ min: 1, max: 50 })
    .trim()
    .escape()
    .withMessage('Category must be between 1-50 characters'),
  body('subcategory')
    .optional()
    .isLength({ max: 50 })
    .trim()
    .escape()
    .withMessage('Subcategory must be less than 50 characters'),
  body('priority')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority level'),
  body('description')
    .isLength({ min: 10, max: 2000 })
    .trim()
    .withMessage('Description must be between 10-2000 characters'),
  body('target_player_id')
    .optional()
    .isLength({ max: 100 })
    .trim()
    .escape()
    .withMessage('Target player ID must be less than 100 characters'),
  body('anonymous')
    .optional()
    .isBoolean()
    .withMessage('Anonymous must be true or false')
];

const statusUpdateValidation = [
  body('status')
    .isIn(['pending', 'in_progress', 'resolved', 'rejected'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .trim()
    .withMessage('Notes must be less than 1000 characters')
];

const userUpdateValidation = [
  body('role')
    .optional()
    .isIn(['support', 'moderator', 'admin', 'owner'])
    .withMessage('Invalid role'),
  body('username')
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .escape()
    .withMessage('Username must be between 1-50 characters')
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// CAPTCHA verification (placeholder for future implementation)
const verifyCaptcha = async (req, res, next) => {
  // Skip CAPTCHA in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  // For anonymous reports, implement CAPTCHA verification here
  if (req.body.anonymous) {
    const captchaToken = req.body.captchaToken;
    if (!captchaToken) {
      return res.status(400).json({
        error: 'CAPTCHA verification required for anonymous reports'
      });
    }
    
    // Verify CAPTCHA token with your preferred service (reCAPTCHA, hCaptcha, etc.)
    // Implementation depends on your chosen CAPTCHA service
  }
  
  next();
};

// File upload security
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

// XSS protection
const sanitizeInput = (req, res, next) => {
  // Remove any HTML tags from string inputs
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/<[^>]*>/g, '');
  };
  
  // Recursively sanitize object properties
  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };
  
  if (req.body) {
    sanitizeObject(req.body);
  }
  
  if (req.query) {
    sanitizeObject(req.query);
  }
  
  next();
};

module.exports = {
  apiLimiter,
  reportLimiter,
  authLimiter,
  securityHeaders,
  reportValidation,
  statusUpdateValidation,
  userUpdateValidation,
  handleValidationErrors,
  verifyCaptcha,
  fileFilter,
  sanitizeInput
};