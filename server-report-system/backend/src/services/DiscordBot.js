const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logger = require('../utils/logger');

class DiscordBot {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.channels = {
      reports: process.env.DISCORD_REPORTS_CHANNEL_ID,
      staff: process.env.DISCORD_STAFF_CHANNEL_ID,
      alerts: process.env.DISCORD_ALERTS_CHANNEL_ID,
      logs: process.env.DISCORD_LOGS_CHANNEL_ID
    };
  }

  async initialize() {
    if (!process.env.DISCORD_BOT_TOKEN) {
      logger.warn('Discord bot token not configured. Bot features will be disabled.');
      return false;
    }

    try {
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMembers
        ]
      });

      this.setupEventHandlers();
      await this.client.login(process.env.DISCORD_BOT_TOKEN);
      
      return true;
    } catch (error) {
      logger.error('Failed to initialize Discord bot:', error);
      return false;
    }
  }

  setupEventHandlers() {
    this.client.once('ready', () => {
      this.isReady = true;
      logger.info(`Discord bot logged in as ${this.client.user.tag}`);
      this.updateBotPresence();
    });

    this.client.on('error', (error) => {
      logger.error('Discord bot error:', error);
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton()) return;

      try {
        await this.handleButtonInteraction(interaction);
      } catch (error) {
        logger.error('Error handling Discord interaction:', error);
      }
    });
  }

  async handleButtonInteraction(interaction) {
    const [action, reportId] = interaction.customId.split('_');
    
    switch (action) {
      case 'claim':
        await this.handleReportClaim(interaction, reportId);
        break;
      case 'resolve':
        await this.handleReportResolve(interaction, reportId);
        break;
      case 'escalate':
        await this.handleReportEscalate(interaction, reportId);
        break;
      default:
        await interaction.reply({ content: 'Unknown action.', ephemeral: true });
    }
  }

  async handleReportClaim(interaction, reportId) {
    await interaction.reply({
      content: `Report #${reportId} has been claimed by ${interaction.user.username}. Please handle this report in the web interface.`,
      ephemeral: true
    });

    // Update the original message to show it's claimed
    const embed = EmbedBuilder.from(interaction.message.embeds[0])
      .setColor('#FFA500')
      .addFields({ name: 'Status', value: `🔄 Claimed by ${interaction.user.username}`, inline: true });

    await interaction.message.edit({ 
      embeds: [embed],
      components: [] // Remove buttons
    });
  }

  async handleReportResolve(interaction, reportId) {
    await interaction.reply({
      content: `Report #${reportId} marked for resolution by ${interaction.user.username}. Please complete the resolution in the web interface.`,
      ephemeral: true
    });

    const embed = EmbedBuilder.from(interaction.message.embeds[0])
      .setColor('#00FF00')
      .addFields({ name: 'Status', value: `✅ Resolved by ${interaction.user.username}`, inline: true });

    await interaction.message.edit({ 
      embeds: [embed],
      components: []
    });
  }

  async handleReportEscalate(interaction, reportId) {
    await interaction.reply({
      content: `Report #${reportId} has been escalated by ${interaction.user.username}. Admins have been notified.`,
      ephemeral: true
    });

    // Send escalation notification to admin channel
    if (this.channels.alerts) {
      await this.sendEscalationNotification(reportId, interaction.user.username);
    }
  }

  updateBotPresence() {
    if (!this.isReady) return;

    this.client.user.setActivity('AHRP Server Reports', { 
      type: 'WATCHING' 
    });
  }

  // Send new report notification
  async sendReportNotification(reportData) {
    if (!this.isReady || !this.channels.reports) return;

    try {
      const channel = await this.client.channels.fetch(this.channels.reports);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setTitle(`🚨 New ${reportData.type.replace('_', ' ').toUpperCase()} Report`)
        .setDescription(reportData.description.substring(0, 1000))
        .setColor(this.getPriorityColor(reportData.priority))
        .addFields(
          { name: '📋 Report ID', value: `#${reportData.id}`, inline: true },
          { name: '📂 Category', value: reportData.category || 'General', inline: true },
          { name: '⚡ Priority', value: this.getPriorityEmoji(reportData.priority) + ' ' + reportData.priority.toUpperCase(), inline: true },
          { name: '👤 Reporter', value: reportData.reporter_username || 'Anonymous', inline: true },
          { name: '🎯 Target Player', value: reportData.target_player_id ? `ID: ${reportData.target_player_id}` : 'N/A', inline: true },
          { name: '📅 Created', value: new Date(reportData.created_at).toLocaleString(), inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'AHRP Report System' });

      if (reportData.metadata && reportData.metadata.location) {
        embed.addFields({
          name: '📍 Location',
          value: `X: ${reportData.metadata.location.x}, Y: ${reportData.metadata.location.y}, Z: ${reportData.metadata.location.z}`,
          inline: false
        });
      }

      const actionRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`claim_${reportData.id}`)
            .setLabel('Claim Report')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('👋'),
          new ButtonBuilder()
            .setCustomId(`resolve_${reportData.id}`)
            .setLabel('Quick Resolve')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅'),
          new ButtonBuilder()
            .setCustomId(`escalate_${reportData.id}`)
            .setLabel('Escalate')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('⬆️')
        );

      await channel.send({
        embeds: [embed],
        components: [actionRow]
      });

      // Send additional alert for high/critical priority
      if (['high', 'critical'].includes(reportData.priority) && this.channels.alerts) {
        await this.sendPriorityAlert(reportData);
      }

    } catch (error) {
      logger.error('Error sending Discord report notification:', error);
    }
  }

  // Send priority alert for high/critical reports
  async sendPriorityAlert(reportData) {
    try {
      const channel = await this.client.channels.fetch(this.channels.alerts);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setTitle(`🚨 ${reportData.priority.toUpperCase()} PRIORITY ALERT`)
        .setDescription(`Report #${reportData.id} requires immediate attention!`)
        .setColor(reportData.priority === 'critical' ? '#FF0000' : '#FF6600')
        .addFields(
          { name: 'Type', value: reportData.type.replace('_', ' ').toUpperCase(), inline: true },
          { name: 'Category', value: reportData.category || 'General', inline: true },
          { name: 'Reporter', value: reportData.reporter_username || 'Anonymous', inline: true }
        )
        .setTimestamp();

      await channel.send({
        content: '@here',
        embeds: [embed]
      });

    } catch (error) {
      logger.error('Error sending priority alert:', error);
    }
  }

  // Send escalation notification
  async sendEscalationNotification(reportId, escalatedBy) {
    try {
      const channel = await this.client.channels.fetch(this.channels.alerts);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setTitle('📈 Report Escalated')
        .setDescription(`Report #${reportId} has been escalated and requires admin attention.`)
        .setColor('#FF6600')
        .addFields(
          { name: 'Escalated By', value: escalatedBy, inline: true },
          { name: 'Time', value: new Date().toLocaleString(), inline: true }
        )
        .setTimestamp();

      await channel.send({
        content: '@here',
        embeds: [embed]
      });

    } catch (error) {
      logger.error('Error sending escalation notification:', error);
    }
  }

  // Send staff activity summary
  async sendStaffSummary(summaryData) {
    if (!this.isReady || !this.channels.staff) return;

    try {
      const channel = await this.client.channels.fetch(this.channels.staff);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setTitle('📊 Daily Staff Summary')
        .setColor('#0099FF')
        .addFields(
          { name: '📝 New Reports', value: summaryData.newReports.toString(), inline: true },
          { name: '✅ Resolved Reports', value: summaryData.resolvedReports.toString(), inline: true },
          { name: '⏱️ Avg Response Time', value: summaryData.avgResponseTime + 'h', inline: true },
          { name: '👥 Active Staff', value: summaryData.activeStaff.toString(), inline: true },
          { name: '📈 Resolution Rate', value: summaryData.resolutionRate + '%', inline: true },
          { name: '🔄 Pending Reports', value: summaryData.pendingReports.toString(), inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'AHRP Report System - Daily Summary' });

      if (summaryData.topPerformers && summaryData.topPerformers.length > 0) {
        embed.addFields({
          name: '🏆 Top Performers',
          value: summaryData.topPerformers.map((performer, index) => 
            `${index + 1}. ${performer.name} - ${performer.resolved} reports`
          ).join('\n'),
          inline: false
        });
      }

      await channel.send({ embeds: [embed] });

    } catch (error) {
      logger.error('Error sending staff summary:', error);
    }
  }

  // Send system alert
  async sendSystemAlert(alertData) {
    if (!this.isReady || !this.channels.logs) return;

    try {
      const channel = await this.client.channels.fetch(this.channels.logs);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setTitle('⚠️ System Alert')
        .setDescription(alertData.message)
        .setColor(alertData.severity === 'critical' ? '#FF0000' : alertData.severity === 'warning' ? '#FFA500' : '#0099FF')
        .addFields(
          { name: 'Severity', value: alertData.severity.toUpperCase(), inline: true },
          { name: 'Component', value: alertData.component || 'System', inline: true },
          { name: 'Time', value: new Date().toLocaleString(), inline: true }
        )
        .setTimestamp();

      if (alertData.details) {
        embed.addFields({
          name: 'Details',
          value: alertData.details.substring(0, 1000),
          inline: false
        });
      }

      await channel.send({ embeds: [embed] });

    } catch (error) {
      logger.error('Error sending system alert:', error);
    }
  }

  // Utility methods
  getPriorityColor(priority) {
    switch (priority.toLowerCase()) {
      case 'critical': return '#FF0000';
      case 'high': return '#FF6600';
      case 'medium': return '#FFA500';
      case 'low': return '#00FF00';
      default: return '#808080';
    }
  }

  getPriorityEmoji(priority) {
    switch (priority.toLowerCase()) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }

  // Check if bot is ready
  isConnected() {
    return this.isReady && this.client && this.client.readyAt;
  }

  // Graceful shutdown
  async shutdown() {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
      logger.info('Discord bot disconnected');
    }
  }
}

// Export singleton instance
const discordBot = new DiscordBot();
module.exports = discordBot;