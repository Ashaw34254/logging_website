const db = require('../config/db');

class Analytics {
  static async getReportStats(dateFrom, dateTo) {
    const baseQuery = db('reports');
    
    if (dateFrom) {
      baseQuery.where('created_at', '>=', dateFrom);
    }
    if (dateTo) {
      baseQuery.where('created_at', '<=', dateTo);
    }

    // Total reports by status
    const statusStats = await baseQuery.clone()
      .select('status')
      .count('* as count')
      .groupBy('status');

    // Reports by type
    const typeStats = await baseQuery.clone()
      .select('type')
      .count('* as count')
      .groupBy('type');

    // Reports by priority
    const priorityStats = await baseQuery.clone()
      .select('priority')
      .count('* as count')
      .groupBy('priority');

    // Reports by category
    const categoryStats = await baseQuery.clone()
      .select('category')
      .count('* as count')
      .groupBy('category')
      .orderBy('count', 'desc')
      .limit(10);

    // Daily report trends (last 30 days)
    const trendStats = await db('reports')
      .select(db.raw('DATE(created_at) as date'))
      .count('* as count')
      .where('created_at', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .groupBy(db.raw('DATE(created_at)'))
      .orderBy('date', 'asc');

    return {
      statusStats,
      typeStats,
      priorityStats,
      categoryStats,
      trendStats
    };
  }

  static async getStaffPerformance(dateFrom, dateTo) {
    let query = db('reports')
      .join('users', 'reports.handled_by', 'users.id')
      .whereNotNull('reports.handled_by');
    
    if (dateFrom) {
      query = query.where('reports.created_at', '>=', dateFrom);
    }
    if (dateTo) {
      query = query.where('reports.created_at', '<=', dateTo);
    }

    // Reports handled by each staff member
    const handledReports = await query.clone()
      .select('users.username', 'users.role')
      .count('reports.id as handled_count')
      .groupBy('users.id', 'users.username', 'users.role')
      .orderBy('handled_count', 'desc');

    // Average resolution time by staff member
    const resolutionTimes = await db('reports')
      .join('users', 'reports.handled_by', 'users.id')
      .where('reports.status', 'resolved')
      .select(
        'users.username',
        'users.role',
        db.raw('AVG(TIMESTAMPDIFF(HOUR, reports.created_at, reports.updated_at)) as avg_resolution_hours')
      )
      .groupBy('users.id', 'users.username', 'users.role')
      .orderBy('avg_resolution_hours', 'asc');

    return {
      handledReports,
      resolutionTimes
    };
  }

  static async getTopReportedPlayers(limit = 10, dateFrom, dateTo) {
    let query = db('reports')
      .whereNotNull('target_player_id')
      .where('target_player_id', '!=', '');
    
    if (dateFrom) {
      query = query.where('created_at', '>=', dateFrom);
    }
    if (dateTo) {
      query = query.where('created_at', '<=', dateTo);
    }

    return await query
      .select('target_player_id')
      .count('* as report_count')
      .groupBy('target_player_id')
      .orderBy('report_count', 'desc')
      .limit(limit);
  }

  static async getResponseTimeStats(dateFrom, dateTo) {
    let query = db('reports')
      .whereIn('status', ['resolved', 'rejected']);
    
    if (dateFrom) {
      query = query.where('created_at', '>=', dateFrom);
    }
    if (dateTo) {
      query = query.where('created_at', '<=', dateTo);
    }

    const stats = await query
      .select(
        db.raw('AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_response_hours'),
        db.raw('MIN(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as min_response_hours'),
        db.raw('MAX(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as max_response_hours')
      )
      .first();

    return stats;
  }

  static async getActiveReports() {
    const pending = await db('reports').where('status', 'pending').count('* as count').first();
    const inProgress = await db('reports').where('status', 'in_progress').count('* as count').first();
    const unassigned = await db('reports').whereNull('handled_by').where('status', '!=', 'resolved').where('status', '!=', 'rejected').count('* as count').first();
    
    return {
      pending: pending.count,
      inProgress: inProgress.count,
      unassigned: unassigned.count
    };
  }

  static async getReportsByDateRange(dateFrom, dateTo) {
    return await db('reports')
      .select(db.raw('DATE(created_at) as date'))
      .count('* as count')
      .where('created_at', '>=', dateFrom)
      .where('created_at', '<=', dateTo)
      .groupBy(db.raw('DATE(created_at)'))
      .orderBy('date', 'asc');
  }

  static async getEscalationStats(dateFrom, dateTo) {
    let query = db('reports')
      .where('priority', 'high');
    
    if (dateFrom) {
      query = query.where('created_at', '>=', dateFrom);
    }
    if (dateTo) {
      query = query.where('created_at', '<=', dateTo);
    }

    const highPriorityStats = await query.clone()
      .select('status')
      .count('* as count')
      .groupBy('status');

    // Reports older than 24 hours without response
    const staleReports = await db('reports')
      .where('status', 'pending')
      .where('created_at', '<', new Date(Date.now() - 24 * 60 * 60 * 1000))
      .count('* as count')
      .first();

    return {
      highPriorityStats,
      staleReports: staleReports.count
    };
  }

  static async getDashboardSummary() {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Today's stats
    const todayStats = await db('reports')
      .where('created_at', '>=', today.toISOString().split('T')[0])
      .select('status', 'type')
      .count('* as count')
      .groupBy('status', 'type');

    // Week's stats
    const weekStats = await db('reports')
      .where('created_at', '>=', weekAgo)
      .select('type')
      .count('* as count')
      .groupBy('type');

    // Active issues
    const activeStats = await this.getActiveReports();

    // Recent activity
    const recentReports = await db('reports')
      .leftJoin('users as reporter', 'reports.reporter_discord_id', 'reporter.discord_id')
      .select(
        'reports.id',
        'reports.type',
        'reports.priority',
        'reports.status',
        'reports.created_at',
        'reporter.username as reporter_username'
      )
      .orderBy('reports.created_at', 'desc')
      .limit(5);

    return {
      todayStats,
      weekStats,
      activeStats,
      recentReports
    };
  }

  static async exportReportsData(filters = {}) {
    let query = db('reports')
      .leftJoin('users as reporter', 'reports.reporter_discord_id', 'reporter.discord_id')
      .leftJoin('users as handler', 'reports.handled_by', 'handler.id')
      .select(
        'reports.id',
        'reports.type',
        'reports.category',
        'reports.subcategory',
        'reports.priority',
        'reports.status',
        'reports.description',
        'reports.target_player_id',
        'reports.anonymous',
        'reports.created_at',
        'reports.updated_at',
        'reporter.username as reporter_username',
        'handler.username as handler_username'
      );

    // Apply filters similar to getAll method
    if (filters.type) query = query.where('reports.type', filters.type);
    if (filters.status) query = query.where('reports.status', filters.status);
    if (filters.priority) query = query.where('reports.priority', filters.priority);
    if (filters.date_from) query = query.where('reports.created_at', '>=', filters.date_from);
    if (filters.date_to) query = query.where('reports.created_at', '<=', filters.date_to);

    return await query.orderBy('reports.created_at', 'desc');
  }
}

module.exports = Analytics;