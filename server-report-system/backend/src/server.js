require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/discordAuth');
const cron = require('node-cron');
const { createServer } = require('http');
const { Server } = require('socket.io');
const compression = require('compression');
const morgan = require('morgan');
const winston = require('winston');

// Import routes
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const analyticsRoutes = require('./routes/analytics');

// Import config
const { securityHeaders } = require('./config/security');
const webhookService = require('./config/webhook');
const discordBot = require('./services/DiscordBot');

// Import models for automation
const Report = require('./models/Report');
const AnalyticsController = require('./controllers/AnalyticsController');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ahrp-report-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Basic middleware
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(securityHeaders);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Socket.IO for real-time notifications
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join_role_room', (role) => {
    socket.join(`role_${role}`);
    console.log(`Client ${socket.id} joined role room: ${role}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Store io instance for use in other modules
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong on our end'
    });
  } else {
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
      stack: err.stack
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested resource was not found'
  });
});

// Automated tasks and escalations
function setupAutomatedTasks() {
  // Check for stale reports every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Checking for stale reports...');
      const staleReports = await Report.getStaleReports(24); // 24 hours
      
      for (const report of staleReports) {
        await webhookService.sendEscalationNotification(
          report, 
          'Report has been pending for more than 24 hours'
        );
        
        // Notify via Socket.IO
        io.to('role_admin').emit('stale_report', {
          reportId: report.id,
          age: Date.now() - new Date(report.created_at).getTime()
        });
      }
      
      console.log(`Found ${staleReports.length} stale reports`);
    } catch (error) {
      console.error('Stale report check error:', error);
    }
  });

  // Auto-assign unassigned reports every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      console.log('Auto-assigning unassigned reports...');
      const unassignedReports = await Report.getUnassignedReports();
      
      for (const report of unassignedReports) {
        // Import ReportController for auto-assignment logic
        const ReportController = require('./controllers/ReportController');
        await ReportController.autoAssignReport(report);
      }
      
      console.log(`Auto-assigned ${unassignedReports.length} reports`);
    } catch (error) {
      console.error('Auto-assignment error:', error);
    }
  });

  // Generate weekly reports every Monday at 9 AM
  cron.schedule('0 9 * * 1', async () => {
    try {
      console.log('Generating weekly automated report...');
      const weeklyReport = await AnalyticsController.generateAutomatedReport('week');
      
      // Send weekly report via webhook or email
      // Implementation depends on your notification preferences
      console.log('Weekly report generated:', weeklyReport.summary);
      
      // Notify admins
      io.to('role_admin').emit('weekly_report', weeklyReport);
    } catch (error) {
      console.error('Weekly report generation error:', error);
    }
  });

  // Generate monthly reports on the 1st of each month at 9 AM
  cron.schedule('0 9 1 * *', async () => {
    try {
      console.log('Generating monthly automated report...');
      const monthlyReport = await AnalyticsController.generateAutomatedReport('month');
      
      // Send monthly report
      console.log('Monthly report generated:', monthlyReport.summary);
      
      // Notify admins and owners
      io.to('role_admin').emit('monthly_report', monthlyReport);
      io.to('role_owner').emit('monthly_report', monthlyReport);
    } catch (error) {
      console.error('Monthly report generation error:', error);
    }
  });

  // Clean up old files every day at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('Starting file cleanup...');
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(__dirname, '../uploads');
      
      // Get files older than 90 days
      const files = fs.readdirSync(uploadsDir);
      const now = Date.now();
      const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
      
      let deletedCount = 0;
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < ninetyDaysAgo) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
      
      console.log(`File cleanup completed. Deleted ${deletedCount} old files.`);
    } catch (error) {
      console.error('File cleanup error:', error);
    }
  });
}

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, async () => {
  console.log(`🚀 AHRP Report System Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  
  // Setup automated tasks
  setupAutomatedTasks();
  console.log('⏰ Automated tasks scheduled');
  
  // Initialize Discord bot
  try {
    const botInitialized = await discordBot.initialize();
    if (botInitialized) {
      console.log('🤖 Discord bot initialized successfully');
    } else {
      console.log('⚠️  Discord bot not configured (missing token)');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Discord bot:', error.message);
  }
  
  // Log available routes
  console.log('\n📍 Available routes:');
  console.log('   GET  /api/health');
  console.log('   POST /api/auth/discord');
  console.log('   GET  /api/auth/discord/callback');
  console.log('   GET  /api/reports');
  console.log('   POST /api/reports/submit');
  console.log('   GET  /api/analytics/dashboard');
  console.log('   GET  /api/analytics/public');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  // Shutdown Discord bot
  try {
    await discordBot.shutdown();
  } catch (error) {
    console.error('Error shutting down Discord bot:', error);
  }
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;