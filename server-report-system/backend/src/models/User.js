const db = require('../config/db');

class User {
  static async findById(id) {
    return await db('users').where('id', id).first();
  }

  static async findByDiscordId(discordId) {
    return await db('users').where('discord_id', discordId).first();
  }

  static async create(userData) {
    const [id] = await db('users').insert({
      ...userData,
      created_at: new Date(),
      updated_at: new Date()
    });
    return this.findById(id);
  }

  static async update(id, userData) {
    await db('users').where('id', id).update({
      ...userData,
      updated_at: new Date()
    });
    return this.findById(id);
  }

  static async getAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const users = await db('users')
      .select('id', 'discord_id', 'username', 'discriminator', 'avatar', 'role', 'created_at', 'last_login')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
    
    const total = await db('users').count('id as count').first();
    
    return {
      users,
      total: total.count,
      page,
      pages: Math.ceil(total.count / limit)
    };
  }

  static async updateRole(id, role) {
    await db('users').where('id', id).update({
      role,
      updated_at: new Date()
    });
    return this.findById(id);
  }

  static async getStaffMembers() {
    return await db('users')
      .whereIn('role', ['moderator', 'admin', 'owner'])
      .select('id', 'discord_id', 'username', 'role');
  }

  static async delete(id) {
    return await db('users').where('id', id).del();
  }

  static hasPermission(userRole, requiredRole) {
    const roleHierarchy = {
      'support': 1,
      'moderator': 2,
      'admin': 3,
      'owner': 4
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  static canAccessReportType(userRole, reportType) {
    const permissions = {
      'support': ['bug_report', 'feedback'],
      'moderator': ['player_report', 'bug_report', 'feedback'],
      'admin': ['player_report', 'bug_report', 'feedback'],
      'owner': ['player_report', 'bug_report', 'feedback']
    };

    return permissions[userRole]?.includes(reportType) || false;
  }
}

module.exports = User;