/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // Users table
    .createTable('users', table => {
      table.increments('id').primary();
      table.string('discord_id', 20).notNullable().unique();
      table.string('username', 50).notNullable();
      table.string('discriminator', 4);
      table.string('avatar', 100);
      table.string('email', 100);
      table.enum('role', ['support', 'moderator', 'admin', 'owner']).defaultTo('support');
      table.timestamp('last_login');
      table.timestamps(true, true);
      
      table.index('discord_id');
      table.index('role');
    })
    
    // Reports table
    .createTable('reports', table => {
      table.increments('id').primary();
      table.enum('type', ['player_report', 'bug_report', 'feedback']).notNullable();
      table.string('category', 50).notNullable();
      table.string('subcategory', 50);
      table.enum('priority', ['low', 'medium', 'high']).defaultTo('medium');
      table.text('description').notNullable();
      table.string('target_player_id', 100);
      table.string('reporter_discord_id', 20);
      table.string('reporter_player_id', 100);
      table.boolean('anonymous').defaultTo(false);
      table.enum('status', ['pending', 'in_progress', 'resolved', 'rejected']).defaultTo('pending');
      table.integer('handled_by').unsigned();
      table.timestamps(true, true);
      
      table.foreign('reporter_discord_id').references('discord_id').inTable('users').onDelete('SET NULL');
      table.foreign('handled_by').references('id').inTable('users').onDelete('SET NULL');
      
      table.index('type');
      table.index('status');
      table.index('priority');
      table.index('category');
      table.index('reporter_discord_id');
      table.index('handled_by');
      table.index('created_at');
    })
    
    // Report attachments table
    .createTable('report_attachments', table => {
      table.increments('id').primary();
      table.integer('report_id').unsigned().notNullable();
      table.string('filename', 255).notNullable();
      table.string('original_name', 255).notNullable();
      table.string('file_path', 500).notNullable();
      table.integer('file_size').unsigned();
      table.string('mime_type', 100);
      table.timestamp('uploaded_at').defaultTo(knex.fn.now());
      
      table.foreign('report_id').references('id').inTable('reports').onDelete('CASCADE');
      table.index('report_id');
    })
    
    // Report status history table
    .createTable('report_status_history', table => {
      table.increments('id').primary();
      table.integer('report_id').unsigned().notNullable();
      table.enum('old_status', ['pending', 'in_progress', 'resolved', 'rejected']).notNullable();
      table.enum('new_status', ['pending', 'in_progress', 'resolved', 'rejected']).notNullable();
      table.integer('changed_by').unsigned();
      table.text('notes');
      table.timestamp('changed_at').defaultTo(knex.fn.now());
      
      table.foreign('report_id').references('id').inTable('reports').onDelete('CASCADE');
      table.foreign('changed_by').references('id').inTable('users').onDelete('SET NULL');
      
      table.index('report_id');
      table.index('changed_at');
    })
    
    // Audit logs table
    .createTable('audit_logs', table => {
      table.increments('id').primary();
      table.string('action', 100).notNullable();
      table.integer('user_id').unsigned();
      table.string('user_discord_id', 20);
      table.string('user_role', 20);
      table.string('ip_address', 45);
      table.text('user_agent');
      table.string('endpoint', 200);
      table.json('request_body');
      table.integer('report_id').unsigned();
      table.timestamp('timestamp').defaultTo(knex.fn.now());
      
      table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
      table.foreign('report_id').references('id').inTable('reports').onDelete('SET NULL');
      
      table.index('action');
      table.index('user_id');
      table.index('timestamp');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('audit_logs')
    .dropTableIfExists('report_status_history')
    .dropTableIfExists('report_attachments')
    .dropTableIfExists('reports')
    .dropTableIfExists('users');
};