# AHRP Report System

A comprehensive reporting system for FiveM servers with Discord integration and modern web interface.

## 🚀 Features

- **Discord OAuth Authentication** - Secure login with role-based permissions
- **FiveM Integration** - In-game reporting commands and NUI interface
- **Modern Web Dashboard** - React-based frontend with responsive design
- **Real-time Notifications** - Instant Discord alerts for new reports
- **Cloudflare Tunnel Support** - Secure public access without port forwarding
- **Automated Server Management** - Batch scripts for easy deployment

## 📁 Project Structure

```
logging_website/
├── docs/                          # 📚 All documentation
├── server-report-system/
│   ├── backend/                   # 🔧 Node.js API server
│   ├── frontend/                  # 🎨 React web application
│   └── fivem/                     # 🎮 FiveM integration scripts
├── *.bat                          # 🔄 Server management scripts
└── README.md                      # 📖 This file
```

## 🏃‍♂️ Quick Start

1. **Read the Documentation**: Check out the [docs folder](docs/) for detailed setup guides
2. **Install Dependencies**: Ensure you have Node.js, MySQL, and optionally Cloudflare Tunnel
3. **Configure Environment**: Set up your `.env` files using the provided templates
4. **Run the System**: Use the batch files for easy server management

### Essential Documentation

- **[Setup Guide](docs/CLOUDFLARE_SETUP_GUIDE.md)** - Complete installation and configuration
- **[Batch Files Guide](docs/BATCH_FILES_GUIDE.md)** - Server automation scripts
- **[FiveM Integration](docs/FiveM_README.md)** - Game server setup
- **[Design Documentation](docs/DESIGN_ENHANCEMENTS.md)** - UI/UX improvements

## 🔧 Technology Stack

- **Backend**: Node.js, Express, MySQL, Discord.js
- **Frontend**: React, Tailwind CSS, React Router
- **Authentication**: Discord OAuth2 + JWT
- **Deployment**: Cloudflare Tunnel
- **Game Integration**: FiveM Lua scripts

## 🚦 Getting Started

### For Developers
1. Clone the repository
2. Follow the [Cloudflare Setup Guide](docs/CLOUDFLARE_SETUP_GUIDE.md)
3. Use `start-servers.bat` for local development

### For Server Owners
1. Review the [FiveM README](docs/FiveM_README.md)
2. Configure your Discord application
3. Use `start-all-with-tunnel.bat` for production

## 📞 Support

- Check the [documentation](docs/) first
- Review troubleshooting sections in setup guides
- Verify your configuration files match the examples

## 🔄 Recent Updates

- Added Discord OAuth integration with testing interface
- Implemented Cloudflare Tunnel support for secure public access
- Created comprehensive batch scripts for server management
- Enhanced UI with modern design and AHRP branding
- Fixed FiveM permission system and NUI components

---

*For detailed documentation, see the [docs folder](docs/)*