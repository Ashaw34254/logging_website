const Analytics = require('../models/Analytics');
const Report = require('../models/Report');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');

class AnalyticsController {
  // Get dashboard analytics
  static async getDashboardAnalytics(req, res) {
    try {
      const summary = await Analytics.getDashboardSummary();
      
      res.json({
        summary
      });
    } catch (error) {
      console.error('Get dashboard analytics error:', error);
      res.status(500).json({
        error: 'Failed to fetch dashboard analytics',
        message: error.message
      });
    }
  }

  // Get comprehensive report statistics
  static async getReportStats(req, res) {
    try {
      const {
        date_from,
        date_to
      } = req.query;

      const dateFrom = date_from ? new Date(date_from) : null;
      const dateTo = date_to ? new Date(date_to) : null;

      const stats = await Analytics.getReportStats(dateFrom, dateTo);
      const staffPerformance = await Analytics.getStaffPerformance(dateFrom, dateTo);
      const topReportedPlayers = await Analytics.getTopReportedPlayers(10, dateFrom, dateTo);
      const responseTimeStats = await Analytics.getResponseTimeStats(dateFrom, dateTo);
      const escalationStats = await Analytics.getEscalationStats(dateFrom, dateTo);

      res.json({
        stats,
        staffPerformance,
        topReportedPlayers,
        responseTimeStats,
        escalationStats
      });
    } catch (error) {
      console.error('Get report stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch report statistics',
        message: error.message
      });
    }
  }

  // Get staff performance metrics
  static async getStaffPerformance(req, res) {
    try {
      const {
        date_from,
        date_to
      } = req.query;

      const dateFrom = date_from ? new Date(date_from) : null;
      const dateTo = date_to ? new Date(date_to) : null;

      const performance = await Analytics.getStaffPerformance(dateFrom, dateTo);
      
      res.json({
        performance
      });
    } catch (error) {
      console.error('Get staff performance error:', error);
      res.status(500).json({
        error: 'Failed to fetch staff performance',
        message: error.message
      });
    }
  }

  // Get trend data for charts
  static async getTrendData(req, res) {
    try {
      const {
        date_from,
        date_to
      } = req.query;

      const dateFrom = date_from ? new Date(date_from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const dateTo = date_to ? new Date(date_to) : new Date();

      const trendData = await Analytics.getReportsByDateRange(dateFrom, dateTo);
      
      res.json({
        trendData
      });
    } catch (error) {
      console.error('Get trend data error:', error);
      res.status(500).json({
        error: 'Failed to fetch trend data',
        message: error.message
      });
    }
  }

  // Export reports data
  static async exportReports(req, res) {
    try {
      const {
        format = 'csv',
        type,
        status,
        priority,
        date_from,
        date_to
      } = req.query;

      const filters = {};
      if (type) filters.type = type;
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (date_from) filters.date_from = new Date(date_from);
      if (date_to) filters.date_to = new Date(date_to);

      const reports = await Analytics.exportReportsData(filters);

      if (format === 'csv') {
        const csvString = reports.map(report => {
          return [
            report.id,
            report.type,
            report.category,
            report.subcategory,
            report.priority,
            report.status,
            report.description,
            report.target_player_id,
            report.reporter_username,
            report.handler_username,
            report.created_at,
            report.updated_at
          ].join(',');
        }).join('\n');

        const header = 'id,type,category,subcategory,priority,status,description,target_player_id,reporter_username,handler_username,created_at,updated_at\n';
        const csv = header + csvString;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=reports_${Date.now()}.csv`);
        res.send(csv);
      } else if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=reports_${Date.now()}.json`);
        res.json(reports);
      } else if (format === 'pdf') {
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reports_${Date.now()}.pdf`);
        
        doc.pipe(res);
        
        // PDF header
        doc.fontSize(16).text('AHRP Report System - Export', 50, 50);
        doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, 50, 80);
        doc.moveDown();

        // Summary stats
        doc.text(`Total Reports: ${reports.length}`, 50, 120);
        
        let yPosition = 150;
        reports.forEach((report, index) => {
          if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
          }
          
          doc.text(`Report #${report.id}`, 50, yPosition);
          doc.text(`Type: ${report.type}`, 50, yPosition + 15);
          doc.text(`Status: ${report.status}`, 50, yPosition + 30);
          doc.text(`Priority: ${report.priority}`, 50, yPosition + 45);
          doc.text(`Created: ${new Date(report.created_at).toLocaleString()}`, 50, yPosition + 60);
          
          yPosition += 90;
        });

        doc.end();
      } else {
        res.status(400).json({
          error: 'Invalid format. Supported formats: csv, json, pdf'
        });
      }
    } catch (error) {
      console.error('Export reports error:', error);
      res.status(500).json({
        error: 'Failed to export reports',
        message: error.message
      });
    }
  }

  // Get public statistics (anonymized)
  static async getPublicStats(req, res) {
    try {
      const stats = await Analytics.getReportStats();
      
      // Return only non-sensitive aggregated data
      const publicStats = {
        totalReports: stats.statusStats.reduce((sum, stat) => sum + stat.count, 0),
        resolvedReports: stats.statusStats.find(s => s.status === 'resolved')?.count || 0,
        reportTypes: stats.typeStats,
        averageResponseTime: await Analytics.getResponseTimeStats()
      };

      res.json({
        stats: publicStats
      });
    } catch (error) {
      console.error('Get public stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch public statistics',
        message: error.message
      });
    }
  }

  // Get analytics for specific time periods
  static async getAnalyticsByPeriod(req, res) {
    try {
      const { period = 'month' } = req.query;
      
      let dateFrom;
      const dateTo = new Date();

      switch (period) {
        case 'week':
          dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          dateFrom = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          dateFrom = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      const stats = await Analytics.getReportStats(dateFrom, dateTo);
      const trendData = await Analytics.getReportsByDateRange(dateFrom, dateTo);
      const staffPerformance = await Analytics.getStaffPerformance(dateFrom, dateTo);

      res.json({
        period,
        dateRange: {
          from: dateFrom,
          to: dateTo
        },
        stats,
        trendData,
        staffPerformance
      });
    } catch (error) {
      console.error('Get analytics by period error:', error);
      res.status(500).json({
        error: 'Failed to fetch period analytics',
        message: error.message
      });
    }
  }

  // Generate automated weekly/monthly reports
  static async generateAutomatedReport(period = 'week') {
    try {
      let dateFrom;
      const dateTo = new Date();

      if (period === 'week') {
        dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      } else {
        dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      const stats = await Analytics.getReportStats(dateFrom, dateTo);
      const staffPerformance = await Analytics.getStaffPerformance(dateFrom, dateTo);
      const topReportedPlayers = await Analytics.getTopReportedPlayers(5, dateFrom, dateTo);
      const escalationStats = await Analytics.getEscalationStats(dateFrom, dateTo);

      const report = {
        period,
        dateRange: { from: dateFrom, to: dateTo },
        summary: {
          totalReports: stats.statusStats.reduce((sum, stat) => sum + stat.count, 0),
          resolvedReports: stats.statusStats.find(s => s.status === 'resolved')?.count || 0,
          pendingReports: stats.statusStats.find(s => s.status === 'pending')?.count || 0,
          highPriorityReports: stats.priorityStats.find(s => s.priority === 'high')?.count || 0
        },
        stats,
        staffPerformance,
        topReportedPlayers,
        escalationStats
      };

      return report;
    } catch (error) {
      console.error('Generate automated report error:', error);
      throw error;
    }
  }
}

module.exports = AnalyticsController;