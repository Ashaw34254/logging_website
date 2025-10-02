import io from 'socket.io-client';
import toast from 'react-hot-toast';

class NotificationService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.callbacks = new Map();
  }

  // Initialize socket connection
  connect(user) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001', {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to notification service');
      this.connected = true;
      
      // Join role-based room
      if (user?.role) {
        this.socket.emit('join_role_room', user.role);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification service');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connected = false;
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Set up event listeners for different notification types
  setupEventListeners() {
    if (!this.socket) return;

    // New report notifications
    this.socket.on('new_report', (data) => {
      this.handleNewReport(data);
      this.triggerCallback('new_report', data);
    });

    // Report status updates
    this.socket.on('report_status_update', (data) => {
      this.handleReportStatusUpdate(data);
      this.triggerCallback('report_status_update', data);
    });

    // Report assignments
    this.socket.on('report_assigned', (data) => {
      this.handleReportAssigned(data);
      this.triggerCallback('report_assigned', data);
    });

    // Stale report alerts
    this.socket.on('stale_report', (data) => {
      this.handleStaleReport(data);
      this.triggerCallback('stale_report', data);
    });

    // Weekly reports
    this.socket.on('weekly_report', (data) => {
      this.handleWeeklyReport(data);
      this.triggerCallback('weekly_report', data);
    });

    // Monthly reports
    this.socket.on('monthly_report', (data) => {
      this.handleMonthlyReport(data);
      this.triggerCallback('monthly_report', data);
    });

    // High priority report alerts
    this.socket.on('high_priority_alert', (data) => {
      this.handleHighPriorityAlert(data);
      this.triggerCallback('high_priority_alert', data);
    });

    // General system notifications
    this.socket.on('system_notification', (data) => {
      this.handleSystemNotification(data);
      this.triggerCallback('system_notification', data);
    });
  }

  // Handle new report notification
  handleNewReport(data) {
    const { report, reportType } = data;
    const priorityIcon = report.priority === 'high' ? '🚨' : 
                        report.priority === 'medium' ? '⚠️' : 'ℹ️';
    
    toast.success(
      `${priorityIcon} New ${reportType} report #${report.id}`,
      {
        duration: 5000,
        position: 'top-right',
      }
    );

    // Play notification sound for high priority
    if (report.priority === 'high') {
      this.playNotificationSound();
    }
  }

  // Handle report status update notification
  handleReportStatusUpdate(data) {
    const { reportId, oldStatus, newStatus, handledBy } = data;
    const statusIcon = newStatus === 'resolved' ? '✅' : 
                      newStatus === 'rejected' ? '❌' : 
                      newStatus === 'in_progress' ? '🔄' : '📋';
    
    toast.info(
      `${statusIcon} Report #${reportId} status changed to ${newStatus}`,
      {
        duration: 4000,
        position: 'top-right',
      }
    );
  }

  // Handle report assignment notification
  handleReportAssigned(data) {
    const { reportId, assignedTo, assignedBy } = data;
    
    toast.info(
      `📋 Report #${reportId} assigned to ${assignedTo}`,
      {
        duration: 4000,
        position: 'top-right',
      }
    );
  }

  // Handle stale report alert
  handleStaleReport(data) {
    const { reportId, age } = data;
    const hours = Math.floor(age / (1000 * 60 * 60));
    
    toast.error(
      `⏰ Report #${reportId} has been pending for ${hours} hours`,
      {
        duration: 8000,
        position: 'top-right',
      }
    );

    this.playNotificationSound();
  }

  // Handle weekly report notification
  handleWeeklyReport(data) {
    toast.success(
      '📊 Weekly report generated and available for review',
      {
        duration: 6000,
        position: 'top-right',
      }
    );
  }

  // Handle monthly report notification
  handleMonthlyReport(data) {
    toast.success(
      '📈 Monthly report generated and available for review',
      {
        duration: 6000,
        position: 'top-right',
      }
    );
  }

  // Handle high priority alert
  handleHighPriorityAlert(data) {
    const { reportId, message } = data;
    
    toast.error(
      `🚨 HIGH PRIORITY: Report #${reportId} - ${message}`,
      {
        duration: 10000,
        position: 'top-center',
      }
    );

    this.playNotificationSound();
  }

  // Handle system notification
  handleSystemNotification(data) {
    const { type, message, level = 'info' } = data;
    
    const toastFunction = level === 'error' ? toast.error :
                         level === 'warning' ? toast.error :
                         level === 'success' ? toast.success :
                         toast.info;
    
    toastFunction(message, {
      duration: 5000,
      position: 'top-right',
    });
  }

  // Register callback for specific event
  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set());
    }
    this.callbacks.get(event).add(callback);
  }

  // Unregister callback
  off(event, callback) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).delete(callback);
    }
  }

  // Trigger registered callbacks
  triggerCallback(event, data) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Notification callback error:', error);
        }
      });
    }
  }

  // Play notification sound
  playNotificationSound() {
    try {
      // Create and play audio notification
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(error => {
        console.log('Could not play notification sound:', error);
      });
    } catch (error) {
      console.log('Notification sound not available:', error);
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Show browser notification
  showBrowserNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: 'ahrp-report',
        renotify: true,
        requireInteraction: false,
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
    return null;
  }

  // Get connection status
  isConnected() {
    return this.connected;
  }

  // Emit custom event
  emit(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;