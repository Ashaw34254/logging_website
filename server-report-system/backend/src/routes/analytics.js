const express = require('express');
const AnalyticsController = require('../controllers/AnalyticsController');
const AuthController = require('../controllers/AuthController');
const { requireAuth, requireRole, auditLog } = require('../middleware/auth');
const { apiLimiter } = require('../config/security');

const router = express.Router();

// Apply rate limiting
router.use(apiLimiter);

// Apply authentication middleware
router.use(AuthController.authenticateToken);

// PUBLIC ROUTES (no authentication required)

// Get public statistics (anonymized)
router.get('/public', AnalyticsController.getPublicStats);

// AUTHENTICATED ROUTES

// Get dashboard analytics summary
router.get('/dashboard',
  requireAuth,
  requireRole('support'),
  AnalyticsController.getDashboardAnalytics
);

// Get comprehensive report statistics
router.get('/reports',
  requireAuth,
  requireRole('moderator'),
  AnalyticsController.getReportStats
);

// Get staff performance metrics
router.get('/staff',
  requireAuth,
  requireRole('admin'),
  AnalyticsController.getStaffPerformance
);

// Get trend data for charts
router.get('/trends',
  requireAuth,
  requireRole('support'),
  AnalyticsController.getTrendData
);

// Get analytics for specific time periods
router.get('/period',
  requireAuth,
  requireRole('support'),
  AnalyticsController.getAnalyticsByPeriod
);

// EXPORT ROUTES

// Export reports data (CSV, JSON, PDF)
router.get('/export/reports',
  requireAuth,
  requireRole('moderator'),
  auditLog('analytics_export_reports'),
  AnalyticsController.exportReports
);

// Generate and download automated weekly/monthly reports
router.get('/export/automated/:period',
  requireAuth,
  requireRole('admin'),
  auditLog('analytics_export_automated'),
  async (req, res) => {
    try {
      const { period } = req.params;
      
      if (!['week', 'month'].includes(period)) {
        return res.status(400).json({
          error: 'Invalid period. Use "week" or "month"'
        });
      }

      const report = await AnalyticsController.generateAutomatedReport(period);
      
      res.json({
        message: `${period.charAt(0).toUpperCase() + period.slice(1)}ly report generated`,
        report
      });
    } catch (error) {
      console.error('Generate automated report error:', error);
      res.status(500).json({
        error: 'Failed to generate automated report',
        message: error.message
      });
    }
  }
);

module.exports = router;