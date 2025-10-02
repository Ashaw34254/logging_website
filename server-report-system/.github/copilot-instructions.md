# AHRP Server Reporting System - GitHub Copilot Instructions

This is a comprehensive full-stack web-based server reporting system for a FiveM roleplay server (AHRP) with modern UI, Discord integration, and Cloudflare Tunnel support.

## Current Project State & Features

### ✅ Completed Features
- **Discord OAuth2 Authentication**: Full integration with role-based permissions (Owner, Admin, Moderator, Support)
- **Modern React Frontend**: Tailwind CSS styling with AHRP branding, logo, and hero sections
- **Testing Login System**: Real Discord OAuth integration for development/testing
- **Cloudflare Tunnel Support**: Secure public access without port forwarding
- **Server Automation**: Comprehensive batch scripts for development and production
- **Documentation Organization**: Centralized docs folder with setup guides
- **FiveM Integration**: Fixed permissions, NUI restoration, and report commands
- **Backend API**: Express.js with MySQL, JWT authentication, and Discord bot integration

### 🎨 UI/UX Enhancements
- AHRP Logo component with SVG graphics
- Hero section with modern landing page design
- Responsive Navbar with authentication states
- Clean CSS with Tailwind utility classes
- Professional color scheme and branding

### 🔧 Infrastructure & DevOps
- Batch files for server lifecycle management (start, stop, restart, status, troubleshoot)
- Cloudflare Tunnel configuration for HTTPS deployment
- CORS configuration for multiple domains (local + production)
- Environment-based configuration with .env files
- Automated process cleanup and port management

## Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MySQL with Knex.js query builder
- **Authentication**: Passport.js with Discord OAuth2 strategy + JWT
- **Discord Integration**: Discord.js bot with webhook support
- **Security**: CORS, rate limiting, input validation
- **Session Management**: Express-session with secure cookies

### Frontend
- **Framework**: React 18 with functional components and hooks
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom components
- **State Management**: Context API (AuthContext)
- **HTTP Client**: Axios with interceptors
- **Notifications**: React Hot Toast
- **Build Tool**: Create React App

### FiveM Integration
- **Language**: Lua for client/server scripts
- **Features**: In-game commands, NUI interface, permission system
- **Communication**: HTTP requests to backend API
- **UI**: HTML/CSS/JS for in-game interfaces

### Deployment & Infrastructure
- **Public Access**: Cloudflare Tunnel with automatic HTTPS
- **Development**: Local servers with hot reload
- **Process Management**: Windows batch scripts
- **Environment**: Multiple .env configurations for different environments

## Project Structure

```
logging_website/
├── docs/                              # 📚 All documentation
│   ├── README.md                      # Documentation index
│   ├── CLOUDFLARE_SETUP_GUIDE.md     # Complete setup guide
│   ├── BATCH_FILES_GUIDE.md          # Automation scripts guide
│   └── [other documentation files]
├── server-report-system/
│   ├── backend/                       # 🔧 Node.js API
│   │   ├── src/
│   │   │   ├── controllers/           # Route handlers
│   │   │   ├── middleware/            # Auth, validation, etc.
│   │   │   ├── models/                # Database models
│   │   │   ├── routes/                # API endpoints
│   │   │   ├── services/              # Business logic
│   │   │   ├── config/                # Configuration files
│   │   │   └── server.js              # Main server file
│   │   └── .env                       # Backend environment variables
│   ├── frontend/                      # 🎨 React application
│   │   ├── src/
│   │   │   ├── components/            # Reusable UI components
│   │   │   ├── pages/                 # Route components
│   │   │   ├── context/               # React Context providers
│   │   │   ├── services/              # API services
│   │   │   └── index.css              # Global styles
│   │   └── .env                       # Frontend environment variables
│   └── fivem/                         # 🎮 FiveM integration
│       ├── fxmanifest.lua             # FiveM resource manifest
│       ├── report_client.lua          # Client-side scripts
│       ├── report_server.lua          # Server-side scripts
│       └── config.lua                 # FiveM configuration
├── *.bat                              # 🔄 Server management scripts
└── README.md                          # Main project overview
```

## Key Components & Implementation Details

### Authentication Flow
1. User clicks "Login with Discord" → Redirects to `/api/auth/discord`
2. Discord OAuth → Callback to `/api/auth/discord/callback`
3. JWT token generated → Stored as httpOnly cookie
4. Frontend AuthContext manages authentication state
5. Protected routes use `requireAuth` middleware

### API Endpoints Structure
- `GET /api/health` - Health check
- `POST /api/auth/discord` - Discord OAuth initiation  
- `GET /api/auth/discord/callback` - OAuth callback
- `GET /api/auth/check` - Authentication status
- `POST /api/auth/logout` - User logout
- `GET /api/reports` - Get reports (protected)
- `POST /api/reports/submit` - Submit new report

### Frontend Architecture
- **AuthContext**: Global authentication state management
- **ApiService**: Centralized HTTP client with interceptors
- **Component Structure**: Modular, reusable components
- **Routing**: Protected routes with role-based access

## Development Guidelines for Copilot

### Code Style Preferences
- Use modern JavaScript (ES6+, async/await, destructuring)
- Functional React components with hooks
- Tailwind CSS utility classes over custom CSS
- Consistent error handling with try/catch blocks
- Environment-based configuration using process.env

### Security Best Practices
- Always validate input on both client and server
- Use parameterized queries for database operations
- Implement rate limiting on sensitive endpoints
- Secure cookies with httpOnly and sameSite flags
- CORS configuration for specific origins only

### File Organization
- Group related functionality in appropriate folders
- Use descriptive, consistent naming conventions
- Keep components small and focused on single responsibility
- Separate business logic from UI components
- Maintain clear separation between frontend and backend

### Development Workflow
- Test locally using `start-servers.bat`
- Use `start-all-with-tunnel.bat` for Cloudflare Tunnel testing
- Check `status-check.bat` for troubleshooting
- Update documentation when adding new features
- Follow the existing error handling patterns

## Recent Updates & Improvements
- Added Discord OAuth testing interface at `/testing-login`
- Implemented Cloudflare Tunnel support with HTTPS
- Created comprehensive server management batch scripts
- Organized all documentation into centralized `docs/` folder
- Enhanced UI with AHRP branding and modern design
- Fixed FiveM permission system and NUI components
- Added CORS support for multiple domains (local + production)

## Environment Configuration
- Backend uses comprehensive .env with Discord, database, and tunnel settings
- Frontend uses REACT_APP_ prefixed environment variables
- Cloudflare Tunnel requires domain configuration in multiple files
- FiveM integration uses API keys for secure communication

This system is production-ready with local development support, comprehensive documentation, and modern deployment practices using Cloudflare Tunnel for secure public access.