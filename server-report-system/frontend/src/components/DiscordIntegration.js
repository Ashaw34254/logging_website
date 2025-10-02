import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const DiscordIntegration = () => {
  const [botStatus, setBotStatus] = useState({
    connected: false,
    lastSeen: null,
    channelsConfigured: 0
  });
  const [testMessage, setTestMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBotStatus();
  }, []);

  const fetchBotStatus = async () => {
    try {
      const response = await apiService.get('/discord/status');
      setBotStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch bot status:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    try {
      await apiService.post('/discord/test', { message: testMessage });
      setTestMessage('');
      alert('Test message sent successfully!');
    } catch (error) {
      console.error('Failed to send test message:', error);
      alert('Failed to send test message');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.056c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          Discord Integration
        </h3>
      </div>

      <div className="p-6">
        {/* Bot Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Bot Status</h4>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              botStatus.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-1 ${
                botStatus.connected ? 'bg-green-400' : 'bg-red-400'
              }`} />
              {botStatus.connected ? 'Connected' : 'Disconnected'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{botStatus.channelsConfigured}</div>
              <div className="text-sm text-gray-500">Channels Configured</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-500">Uptime Target</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">
                {botStatus.lastSeen ? new Date(botStatus.lastSeen).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-sm text-gray-500">Last Seen</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Features</h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">Automatic report notifications</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">Interactive report management buttons</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">Priority-based alerts (@here for high/critical)</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">Daily staff performance summaries</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">System alerts and escalation notifications</span>
            </div>
          </div>
        </div>

        {/* Channel Configuration */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Channel Configuration</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Reports Channel:</span>
                <span className="ml-2 text-gray-600">#reports</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Staff Channel:</span>
                <span className="ml-2 text-gray-600">#staff-notifications</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Alerts Channel:</span>
                <span className="ml-2 text-gray-600">#alerts</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Logs Channel:</span>
                <span className="ml-2 text-gray-600">#system-logs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Message */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Test Integration</h4>
          <div className="flex space-x-3">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter test message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={sendTestMessage}
              disabled={!testMessage.trim() || !botStatus.connected}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Test
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Send a test message to verify the Discord integration is working properly.
          </p>
        </div>

        {/* Setup Instructions */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Setup Instructions</h4>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <p className="mb-2"><strong>To configure Discord integration:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Create a Discord application at <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="underline">Discord Developer Portal</a></li>
                <li>Create a bot user and copy the bot token</li>
                <li>Add the bot to your Discord server with appropriate permissions</li>
                <li>Update your .env file with the bot token and channel IDs</li>
                <li>Restart the backend server</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscordIntegration;