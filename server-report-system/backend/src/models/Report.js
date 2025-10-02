const db = require('../config/db');

class Report {
  static async create(reportData) {
    const [id] = await db('reports').insert({
      ...reportData,
      created_at: new Date(),
      updated_at: new Date()
    });
    return this.findById(id);
  }

  static async findById(id) {
    const report = await db('reports')
      .leftJoin('users as reporter', 'reports.reporter_discord_id', 'reporter.discord_id')
      .leftJoin('users as handler', 'reports.handled_by', 'handler.id')
      .select(
        'reports.*',
        'reporter.username as reporter_username',
        'reporter.discriminator as reporter_discriminator',
        'handler.username as handler_username',
        'handler.role as handler_role'
      )
      .where('reports.id', id)
      .first();

    if (report) {
      // Get attachments
      report.attachments = await db('report_attachments')
        .where('report_id', id)
        .select('id', 'filename', 'original_name', 'file_size', 'mime_type');
      
      // Get status history
      report.status_history = await db('report_status_history')
        .leftJoin('users', 'report_status_history.changed_by', 'users.id')
        .where('report_id', id)
        .select(
          'report_status_history.*',
          'users.username as changed_by_username'
        )
        .orderBy('changed_at', 'desc');
    }

    return report;
  }

  static async getAll(filters = {}, page = 1, limit = 20) {
    let query = db('reports')
      .leftJoin('users as reporter', 'reports.reporter_discord_id', 'reporter.discord_id')
      .leftJoin('users as handler', 'reports.handled_by', 'handler.id')
      .select(
        'reports.*',
        'reporter.username as reporter_username',
        'reporter.discriminator as reporter_discriminator',
        'handler.username as handler_username',
        'handler.role as handler_role'
      );

    // Apply filters
    if (filters.type) {
      query = query.where('reports.type', filters.type);
    }
    if (filters.status) {
      query = query.where('reports.status', filters.status);
    }
    if (filters.priority) {
      query = query.where('reports.priority', filters.priority);
    }
    if (filters.category) {
      query = query.where('reports.category', filters.category);
    }
    if (filters.handled_by) {
      query = query.where('reports.handled_by', filters.handled_by);
    }
    if (filters.reporter_discord_id) {
      query = query.where('reports.reporter_discord_id', filters.reporter_discord_id);
    }
    if (filters.target_player_id) {
      query = query.where('reports.target_player_id', 'LIKE', `%${filters.target_player_id}%`);
    }
    if (filters.date_from) {
      query = query.where('reports.created_at', '>=', filters.date_from);
    }
    if (filters.date_to) {
      query = query.where('reports.created_at', '<=', filters.date_to);
    }
    if (filters.search) {
      query = query.where(function() {
        this.where('reports.description', 'LIKE', `%${filters.search}%`)
            .orWhere('reports.target_player_id', 'LIKE', `%${filters.search}%`)
            .orWhere('reports.category', 'LIKE', `%${filters.search}%`);
      });
    }

    // Role-based filtering
    if (filters.userRole && filters.userRole !== 'admin' && filters.userRole !== 'owner') {
      if (filters.userRole === 'moderator') {
        query = query.whereIn('reports.type', ['player_report', 'bug_report', 'feedback']);
      } else if (filters.userRole === 'support') {
        query = query.whereIn('reports.type', ['bug_report', 'feedback']);
      }
    }

    const offset = (page - 1) * limit;
    const reports = await query
      .orderBy('reports.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Get total count
    let countQuery = db('reports');
    // Apply same filters for count
    if (filters.type) countQuery = countQuery.where('type', filters.type);
    if (filters.status) countQuery = countQuery.where('status', filters.status);
    if (filters.priority) countQuery = countQuery.where('priority', filters.priority);
    if (filters.category) countQuery = countQuery.where('category', filters.category);
    if (filters.handled_by) countQuery = countQuery.where('handled_by', filters.handled_by);
    if (filters.reporter_discord_id) countQuery = countQuery.where('reporter_discord_id', filters.reporter_discord_id);
    if (filters.target_player_id) countQuery = countQuery.where('target_player_id', 'LIKE', `%${filters.target_player_id}%`);
    if (filters.date_from) countQuery = countQuery.where('created_at', '>=', filters.date_from);
    if (filters.date_to) countQuery = countQuery.where('created_at', '<=', filters.date_to);
    if (filters.search) {
      countQuery = countQuery.where(function() {
        this.where('description', 'LIKE', `%${filters.search}%`)
            .orWhere('target_player_id', 'LIKE', `%${filters.search}%`)
            .orWhere('category', 'LIKE', `%${filters.search}%`);
      });
    }
    if (filters.userRole && filters.userRole !== 'admin' && filters.userRole !== 'owner') {
      if (filters.userRole === 'moderator') {
        countQuery = countQuery.whereIn('type', ['player_report', 'bug_report', 'feedback']);
      } else if (filters.userRole === 'support') {
        countQuery = countQuery.whereIn('type', ['bug_report', 'feedback']);
      }
    }

    const total = await countQuery.count('id as count').first();

    return {
      reports,
      total: total.count,
      page,
      pages: Math.ceil(total.count / limit)
    };
  }

  static async update(id, updateData) {
    await db('reports').where('id', id).update({
      ...updateData,
      updated_at: new Date()
    });
    return this.findById(id);
  }

  static async updateStatus(id, status, handledBy, notes = null) {
    const report = await this.findById(id);
    if (!report) return null;

    const oldStatus = report.status;

    // Update report
    await db('reports').where('id', id).update({
      status,
      handled_by: handledBy,
      updated_at: new Date()
    });

    // Add to status history
    await db('report_status_history').insert({
      report_id: id,
      old_status: oldStatus,
      new_status: status,
      changed_by: handledBy,
      notes,
      changed_at: new Date()
    });

    return this.findById(id);
  }

  static async addAttachment(reportId, attachmentData) {
    const [id] = await db('report_attachments').insert({
      report_id: reportId,
      ...attachmentData,
      uploaded_at: new Date()
    });
    return await db('report_attachments').where('id', id).first();
  }

  static async getAttachments(reportId) {
    return await db('report_attachments').where('report_id', reportId);
  }

  static async deleteAttachment(attachmentId) {
    return await db('report_attachments').where('id', attachmentId).del();
  }

  static async delete(id) {
    // Delete related records first
    await db('report_attachments').where('report_id', id).del();
    await db('report_status_history').where('report_id', id).del();
    return await db('reports').where('id', id).del();
  }

  static async assign(id, handledBy) {
    await db('reports').where('id', id).update({
      handled_by: handledBy,
      status: 'in_progress',
      updated_at: new Date()
    });

    // Add to status history
    await db('report_status_history').insert({
      report_id: id,
      old_status: 'pending',
      new_status: 'in_progress',
      changed_by: handledBy,
      notes: 'Report assigned',
      changed_at: new Date()
    });

    return this.findById(id);
  }

  static async getStaleReports(hoursThreshold = 24) {
    return await db('reports')
      .where('status', 'pending')
      .where('created_at', '<', new Date(Date.now() - hoursThreshold * 60 * 60 * 1000))
      .select('*');
  }

  static async getUnassignedReports() {
    return await db('reports')
      .whereNull('handled_by')
      .where('status', '!=', 'resolved')
      .where('status', '!=', 'rejected')
      .select('*');
  }

  static async reopenReport(id, reopenedBy, reason) {
    await db('reports').where('id', id).update({
      status: 'pending',
      handled_by: null,
      updated_at: new Date()
    });

    // Add to status history
    await db('report_status_history').insert({
      report_id: id,
      old_status: 'resolved',
      new_status: 'pending',
      changed_by: reopenedBy,
      notes: `Report reopened: ${reason}`,
      changed_at: new Date()
    });

    return this.findById(id);
  }
}

module.exports = Report;