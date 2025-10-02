const express = require('express');
const multer = require('multer');
const path = require('path');
const ReportController = require('../controllers/ReportController');
const AuthController = require('../controllers/AuthController');
const { 
  requireAuth, 
  requireRole, 
  canAccessReportType, 
  canModifyReport, 
  isReportOwner, 
  requireApiKey,
  auditLog 
} = require('../middleware/auth');
const { 
  apiLimiter, 
  reportLimiter, 
  reportValidation, 
  statusUpdateValidation,
  handleValidationErrors,
  verifyCaptcha,
  fileFilter,
  sanitizeInput
} = require('../config/security');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5 // Maximum 5 files per report
  },
  fileFilter
});

// Apply general API rate limiting
router.use(apiLimiter);

// Apply authentication middleware to all routes
router.use(AuthController.authenticateToken);

// Input sanitization
router.use(sanitizeInput);

// PUBLIC ROUTES (no authentication required)

// Submit report (from FiveM or anonymous web users)
router.post('/submit',
  reportLimiter,
  upload.array('attachments', 5),
  reportValidation,
  handleValidationErrors,
  verifyCaptcha,
  auditLog('report_submit'),
  ReportController.createReport
);

// Submit report with API key (from FiveM server)
router.post('/submit/fivem',
  requireApiKey,
  reportLimiter,
  upload.array('attachments', 5),
  reportValidation,
  handleValidationErrors,
  auditLog('report_submit_fivem'),
  ReportController.createReport
);

// AUTHENTICATED ROUTES

// Get all reports (with role-based filtering)
router.get('/',
  requireAuth,
  ReportController.getAllReports
);

// Get specific report by ID
router.get('/:id',
  requireAuth,
  ReportController.getReportById
);

// Get user's own reports
router.get('/user/mine',
  requireAuth,
  ReportController.getUserReports
);

// Update report status
router.patch('/:id/status',
  requireAuth,
  canModifyReport,
  statusUpdateValidation,
  handleValidationErrors,
  auditLog('report_status_update'),
  ReportController.updateReportStatus
);

// Assign report to staff member
router.patch('/:id/assign',
  requireAuth,
  requireRole('moderator'),
  canModifyReport,
  auditLog('report_assign'),
  ReportController.assignReport
);

// Add attachment to existing report
router.post('/:id/attachments',
  requireAuth,
  canModifyReport,
  upload.single('attachment'),
  auditLog('report_attachment_add'),
  ReportController.addAttachment
);

// Download attachment
router.get('/:id/attachments/:attachmentId',
  requireAuth,
  ReportController.downloadAttachment
);

// Reopen resolved report (report owner only)
router.post('/:id/reopen',
  requireAuth,
  isReportOwner,
  auditLog('report_reopen'),
  ReportController.reopenReport
);

// ADMIN/MODERATOR ROUTES

// Create report on behalf of user (staff only)
router.post('/',
  requireAuth,
  requireRole('moderator'),
  canAccessReportType,
  upload.array('attachments', 5),
  reportValidation,
  handleValidationErrors,
  auditLog('report_create_staff'),
  ReportController.createReport
);

// Update report details (moderator+)
router.patch('/:id',
  requireAuth,
  requireRole('moderator'),
  canModifyReport,
  auditLog('report_update'),
  ReportController.updateReportStatus
);

// ADMIN ONLY ROUTES

// Delete report
router.delete('/:id',
  requireAuth,
  requireRole('admin'),
  auditLog('report_delete'),
  ReportController.deleteReport
);

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File size too large',
        message: `Maximum file size is ${process.env.MAX_FILE_SIZE || '10MB'}`
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum 5 files per report'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected file field',
        message: 'Invalid file upload field'
      });
    }
  }
  
  if (error.message === 'File type not allowed') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only images, text files, and PDFs are allowed'
    });
  }
  
  console.error('Report route error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

module.exports = router;