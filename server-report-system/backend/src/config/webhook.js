const axios = require('axios');

class WebhookService {
  constructor() {
    this.webhooks = {
      playerReports: process.env.WEBHOOK_PLAYER_REPORTS,
      bugReports: process.env.WEBHOOK_BUG_REPORTS,
      feedback: process.env.WEBHOOK_FEEDBACK,
      urgent: process.env.WEBHOOK_URGENT
    };
  }

  async sendWebhook(webhookUrl, embed) {
    if (!webhookUrl) {
      console.warn('Webhook URL not configured');
      return;
    }

    try {
      await axios.post(webhookUrl, {
        embeds: [embed]
      });
    } catch (error) {
      console.error('Webhook send error:', error.message);
    }
  }

  async sendReportNotification(report, reportType = 'player') {
    const embed = {
      title: `New ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      color: this.getColorByPriority(report.priority),
      fields: [
        {
          name: 'Report ID',
          value: `#${report.id}`,
          inline: true
        },
        {
          name: 'Type',
          value: report.type,
          inline: true
        },
        {
          name: 'Priority',
          value: report.priority,
          inline: true
        },
        {
          name: 'Category',
          value: report.category,
          inline: true
        },
        {
          name: 'Subcategory',
          value: report.subcategory || 'N/A',
          inline: true
        },
        {
          name: 'Status',
          value: report.status,
          inline: true
        },
        {
          name: 'Reporter',
          value: report.reporter_discord_id ? `<@${report.reporter_discord_id}>` : 'Anonymous',
          inline: false
        },
        {
          name: 'Description',
          value: report.description.length > 1024 ? 
            report.description.substring(0, 1021) + '...' : 
            report.description,
          inline: false
        }
      ],
      timestamp: new Date(report.created_at).toISOString(),
      footer: {
        text: 'AHRP Report System'
      }
    };

    if (report.target_player_id) {
      embed.fields.splice(6, 0, {
        name: 'Target Player',
        value: report.target_player_id,
        inline: true
      });
    }

    // Determine webhook URL based on report type
    let webhookUrl;
    switch (reportType) {
      case 'player':
        webhookUrl = this.webhooks.playerReports;
        break;
      case 'bug':
        webhookUrl = this.webhooks.bugReports;
        break;
      case 'feedback':
        webhookUrl = this.webhooks.feedback;
        break;
      default:
        webhookUrl = this.webhooks.playerReports;
    }

    await this.sendWebhook(webhookUrl, embed);

    // Send to urgent channel if high priority
    if (report.priority === 'high') {
      embed.title = `🚨 URGENT: ${embed.title}`;
      await this.sendWebhook(this.webhooks.urgent, embed);
    }
  }

  async sendStatusUpdate(report, oldStatus, newStatus, handledBy) {
    const embed = {
      title: `Report Status Updated`,
      color: this.getColorByStatus(newStatus),
      fields: [
        {
          name: 'Report ID',
          value: `#${report.id}`,
          inline: true
        },
        {
          name: 'Old Status',
          value: oldStatus,
          inline: true
        },
        {
          name: 'New Status',
          value: newStatus,
          inline: true
        },
        {
          name: 'Handled By',
          value: handledBy ? `<@${handledBy.discord_id}>` : 'System',
          inline: true
        },
        {
          name: 'Type',
          value: report.type,
          inline: true
        },
        {
          name: 'Priority',
          value: report.priority,
          inline: true
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'AHRP Report System'
      }
    };

    // Send to appropriate webhook based on report type
    let webhookUrl;
    if (report.type === 'player_report') {
      webhookUrl = this.webhooks.playerReports;
    } else if (report.type === 'bug_report') {
      webhookUrl = this.webhooks.bugReports;
    } else {
      webhookUrl = this.webhooks.feedback;
    }

    await this.sendWebhook(webhookUrl, embed);
  }

  async sendEscalationNotification(report, reason) {
    const embed = {
      title: `🔺 Report Escalated`,
      color: 0xFF6B35, // Orange
      fields: [
        {
          name: 'Report ID',
          value: `#${report.id}`,
          inline: true
        },
        {
          name: 'Type',
          value: report.type,
          inline: true
        },
        {
          name: 'Priority',
          value: report.priority,
          inline: true
        },
        {
          name: 'Status',
          value: report.status,
          inline: true
        },
        {
          name: 'Age',
          value: this.getReportAge(report.created_at),
          inline: true
        },
        {
          name: 'Assigned To',
          value: report.handled_by ? `<@${report.handled_by_discord_id}>` : 'Unassigned',
          inline: true
        },
        {
          name: 'Escalation Reason',
          value: reason,
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'AHRP Report System - Escalation'
      }
    };

    await this.sendWebhook(this.webhooks.urgent, embed);
  }

  getColorByPriority(priority) {
    switch (priority.toLowerCase()) {
      case 'high':
        return 0xFF4444; // Red
      case 'medium':
        return 0xFFAA00; // Orange
      case 'low':
        return 0x00AA00; // Green
      default:
        return 0x7289DA; // Discord Blurple
    }
  }

  getColorByStatus(status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 0xFFAA00; // Orange
      case 'in_progress':
        return 0x7289DA; // Blue
      case 'resolved':
        return 0x00AA00; // Green
      case 'rejected':
        return 0xFF4444; // Red
      default:
        return 0x99AAB5; // Gray
    }
  }

  getReportAge(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day(s) ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour(s) ago`;
    } else {
      return 'Less than 1 hour ago';
    }
  }
}

module.exports = new WebhookService();