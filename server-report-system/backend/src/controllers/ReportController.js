const Report = require('../models/Report');
const User = require('../models/User');
const webhookService = require('../config/webhook');
const path = require('path');
const fs = require('fs');

class ReportController {
  // Create a new report
  static async createReport(req, res) {
    try {
      const {
        type,
        category,
        subcategory,
        priority,
        description,
        target_player_id,
        anonymous,
        reporter_player_id
      } = req.body;

      // Prepare report data
      const reportData = {
        type,
        category,
        subcategory,
        priority,
        description,
        target_player_id,
        anonymous: anonymous || false,
        status: 'pending',
        reporter_discord_id: anonymous ? null : (req.user?.discord_id || null),
        reporter_player_id: reporter_player_id || null
      };

      // Create the report
      const report = await Report.create(reportData);

      // Handle file attachments
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await Report.addAttachment(report.id, {
            filename: file.filename,
            original_name: file.originalname,
            file_path: file.path,
            file_size: file.size,
            mime_type: file.mimetype
          });
        }
      }

      // Get the complete report with attachments
      const completeReport = await Report.findById(report.id);

      // Send webhook notification
      try {
        const reportType = type === 'player_report' ? 'player' : 
                          type === 'bug_report' ? 'bug' : 'feedback';
        await webhookService.sendReportNotification(completeReport, reportType);
      } catch (webhookError) {
        console.error('Webhook notification failed:', webhookError);
      }

      // Auto-assign report if possible
      try {
        await this.autoAssignReport(completeReport);
      } catch (assignError) {
        console.error('Auto-assignment failed:', assignError);
      }

      res.status(201).json({
        message: 'Report created successfully',
        report: completeReport
      });
    } catch (error) {
      console.error('Create report error:', error);
      res.status(500).json({
        error: 'Failed to create report',
        message: error.message
      });
    }
  }

  // Get all reports with filtering
  static async getAllReports(req, res) {
    try {
      const {
        type,
        status,
        priority,
        category,
        handled_by,
        reporter_discord_id,
        target_player_id,
        date_from,
        date_to,
        search,
        page = 1,
        limit = 20
      } = req.query;

      const filters = {
        type,
        status,
        priority,
        category,
        handled_by,
        reporter_discord_id,
        target_player_id,
        date_from,
        date_to,
        search,
        userRole: req.user?.role
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      const result = await Report.getAll(filters, parseInt(page), parseInt(limit));
      
      res.json(result);
    } catch (error) {
      console.error('Get all reports error:', error);
      res.status(500).json({
        error: 'Failed to fetch reports',
        message: error.message
      });
    }
  }

  // Get specific report by ID
  static async getReportById(req, res) {
    try {
      const { id } = req.params;
      const report = await Report.findById(id);

      if (!report) {
        return res.status(404).json({
          error: 'Report not found'
        });
      }

      // Check if user can access this report type
      if (req.user && !User.canAccessReportType(req.user.role, report.type) && 
          req.user.role !== 'admin' && req.user.role !== 'owner') {
        return res.status(403).json({
          error: 'Access denied to this report type'
        });
      }

      res.json({
        report
      });
    } catch (error) {
      console.error('Get report by ID error:', error);
      res.status(500).json({
        error: 'Failed to fetch report',
        message: error.message
      });
    }
  }

  // Update report status
  static async updateReportStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const oldReport = req.report; // Set by middleware
      const updatedReport = await Report.updateStatus(id, status, req.user.id, notes);

      if (!updatedReport) {
        return res.status(404).json({
          error: 'Report not found'
        });
      }

      // Send webhook notification for status change
      try {
        await webhookService.sendStatusUpdate(updatedReport, oldReport.status, status, req.user);
      } catch (webhookError) {
        console.error('Webhook notification failed:', webhookError);
      }

      res.json({
        message: 'Report status updated successfully',
        report: updatedReport
      });
    } catch (error) {
      console.error('Update report status error:', error);
      res.status(500).json({
        error: 'Failed to update report status',
        message: error.message
      });
    }
  }

  // Assign report to staff member
  static async assignReport(req, res) {
    try {
      const { id } = req.params;
      const { handled_by } = req.body;

      // Validate that the assignee exists and has appropriate role
      const assignee = await User.findById(handled_by);
      if (!assignee) {
        return res.status(400).json({
          error: 'Assignee not found'
        });
      }

      // Check if assignee can handle this report type
      const report = req.report; // Set by middleware
      if (!User.canAccessReportType(assignee.role, report.type)) {
        return res.status(400).json({
          error: 'Assignee cannot handle this report type'
        });
      }

      const updatedReport = await Report.assign(id, handled_by);

      res.json({
        message: 'Report assigned successfully',
        report: updatedReport
      });
    } catch (error) {
      console.error('Assign report error:', error);
      res.status(500).json({
        error: 'Failed to assign report',
        message: error.message
      });
    }
  }

  // Add attachment to report
  static async addAttachment(req, res) {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded'
        });
      }

      const attachment = await Report.addAttachment(id, {
        filename: req.file.filename,
        original_name: req.file.originalname,
        file_path: req.file.path,
        file_size: req.file.size,
        mime_type: req.file.mimetype
      });

      res.json({
        message: 'Attachment added successfully',
        attachment
      });
    } catch (error) {
      console.error('Add attachment error:', error);
      res.status(500).json({
        error: 'Failed to add attachment',
        message: error.message
      });
    }
  }

  // Download attachment
  static async downloadAttachment(req, res) {
    try {
      const { id, attachmentId } = req.params;
      
      // Get report to check permissions
      const report = await Report.findById(id);
      if (!report) {
        return res.status(404).json({
          error: 'Report not found'
        });
      }

      // Check if user can access this report
      if (req.user && !User.canAccessReportType(req.user.role, report.type) && 
          req.user.role !== 'admin' && req.user.role !== 'owner') {
        return res.status(403).json({
          error: 'Access denied'
        });
      }

      // Find the attachment
      const attachment = report.attachments?.find(att => att.id == attachmentId);
      if (!attachment) {
        return res.status(404).json({
          error: 'Attachment not found'
        });
      }

      const filePath = path.join(__dirname, '../../uploads', attachment.filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          error: 'File not found on server'
        });
      }

      // Set headers for download
      res.setHeader('Content-Disposition', `attachment; filename="${attachment.original_name}"`);
      res.setHeader('Content-Type', attachment.mime_type);
      
      // Send file
      res.sendFile(filePath);
    } catch (error) {
      console.error('Download attachment error:', error);
      res.status(500).json({
        error: 'Failed to download attachment',
        message: error.message
      });
    }
  }

  // Delete report (admin/owner only)
  static async deleteReport(req, res) {
    try {
      const { id } = req.params;

      // Delete associated files
      const report = await Report.findById(id);
      if (report && report.attachments) {
        for (const attachment of report.attachments) {
          const filePath = path.join(__dirname, '../../uploads', attachment.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }

      const deleted = await Report.delete(id);
      if (!deleted) {
        return res.status(404).json({
          error: 'Report not found'
        });
      }

      res.json({
        message: 'Report deleted successfully'
      });
    } catch (error) {
      console.error('Delete report error:', error);
      res.status(500).json({
        error: 'Failed to delete report',
        message: error.message
      });
    }
  }

  // Reopen resolved report (report owner only)
  static async reopenReport(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason || reason.trim().length < 10) {
        return res.status(400).json({
          error: 'Reason for reopening must be at least 10 characters'
        });
      }

      const reopenedReport = await Report.reopenReport(id, req.user.id, reason);

      // Send webhook notification
      try {
        await webhookService.sendStatusUpdate(reopenedReport, 'resolved', 'pending', req.user);
      } catch (webhookError) {
        console.error('Webhook notification failed:', webhookError);
      }

      res.json({
        message: 'Report reopened successfully',
        report: reopenedReport
      });
    } catch (error) {
      console.error('Reopen report error:', error);
      res.status(500).json({
        error: 'Failed to reopen report',
        message: error.message
      });
    }
  }

  // Get user's own reports
  static async getUserReports(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      
      const filters = {
        reporter_discord_id: req.user.discord_id
      };

      const result = await Report.getAll(filters, parseInt(page), parseInt(limit));
      
      res.json(result);
    } catch (error) {
      console.error('Get user reports error:', error);
      res.status(500).json({
        error: 'Failed to fetch user reports',
        message: error.message
      });
    }
  }

  // Auto-assign report based on workload and role
  static async autoAssignReport(report) {
    try {
      // Get available staff for this report type
      const staffMembers = await User.getStaffMembers();
      const eligibleStaff = staffMembers.filter(staff => 
        User.canAccessReportType(staff.role, report.type)
      );

      if (eligibleStaff.length === 0) {
        return; // No eligible staff
      }

      // Get current workload for each staff member
      const workloads = await Promise.all(
        eligibleStaff.map(async (staff) => {
          const activeReports = await Report.getAll({
            handled_by: staff.id,
            status: 'in_progress'
          }, 1, 1000);
          
          return {
            staff,
            activeCount: activeReports.total
          };
        })
      );

      // Sort by workload (ascending) and role priority
      workloads.sort((a, b) => {
        if (a.activeCount !== b.activeCount) {
          return a.activeCount - b.activeCount;
        }
        // If same workload, prioritize higher roles
        const roleOrder = { 'owner': 4, 'admin': 3, 'moderator': 2, 'support': 1 };
        return roleOrder[b.staff.role] - roleOrder[a.staff.role];
      });

      // Assign to staff member with lowest workload
      const assignedStaff = workloads[0].staff;
      await Report.assign(report.id, assignedStaff.id);

    } catch (error) {
      console.error('Auto-assignment error:', error);
    }
  }
}

module.exports = ReportController;