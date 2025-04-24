# Gaming Profile App

A comprehensive social gaming platform that enables users to discover, share, and connect through interactive gaming experiences.

## Features

- **User Authentication**
  - Email/password registration and login
  - Social authentication (Google, Facebook)
  - JWT-based authentication system
  - Password reset functionality

- **Profile Management**
  - Customizable gaming profiles
  - Profile themes and customization options
  - Game statistics tracking
  - Achievement showcase

- **Social Features**
  - Friend system (add, remove, pending requests)
  - Real-time messaging with WebSockets
  - Online status indicators
  - Activity feed

- **Game Integration**
  - Game catalog browsing
  - Game details and information
  - Connect gaming platform accounts (Steam, Xbox, PlayStation, etc.)
  - Track game stats and achievements

- **Leaderboards**
  - Global and game-specific leaderboards
  - Filtering and sorting options
  - Friend comparisons

- **Game Event Scheduler**
  - Create and join gaming events
  - Event notification system
  - Calendar integration

- **Real-time Features**
  - Live notifications
  - Chat and messaging
  - Typing indicators
  - Online presence status

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- CSS with animations and transitions
- WebSocket for real-time communications
- React Context API for state management

### Backend
- Node.js with Express
- MongoDB for data storage
- WebSocket server for real-time features
- JWT for authentication
- Mongoose for MongoDB ODM

### Third-party Integrations
- OAuth providers (Google, Facebook)
- Gaming platform APIs (optional)
- Cloud storage for media (AWS S3 or similar)

## Project Structure

```
gaming-profile-app/
├── client/                 # Frontend React application
│   ├── public/             # Public assets
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # React Context providers
│       ├── hooks/          # Custom React hooks
│       ├── pages/          # Page components
│       ├── services/       # API service calls
│       ├── utils/          # Utility functions
│       └── App.js          # Main App component
├── server/                 # Backend Node.js/Express
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── websocket.js        # WebSocket server implementation
│   └── server.js           # Main server file
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies
└── README.md               # Project documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/saadhasan07/gaming-profile-app.git
   cd gaming-profile-app
   ```

2. Install dependencies:
   ```
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   ```

3. Environment setup:
   - Copy `.env.example` to `.env`
   - Update environment variables with your values

4. Start MongoDB:
   - If using local MongoDB: `mongod`
   - If using Atlas: Update the connection string in your `.env` file

5. Start the development servers:
   ```
   # In the root directory
   npm run dev
   ```

## WebSocket Integration

The application uses WebSockets for real-time features such as chat, notifications, and user presence.

### Server-side Implementation
The WebSocket server is implemented in `server/websocket.js` and initialized in `server/server.js`. It handles:
- Authentication via JWT
- Message sending and receiving
- Online status management
- Typing indicators
- Event notifications

### Client-side Integration
The WebSocket client is implemented in `client/src/services/websocketService.js`. It provides:
- Connection management (including reconnection)
- Message handling
- Event-based communication
- Presence updates

### Event Types
- `auth`: Authenticate WebSocket connection
- `message`: Send/receive direct messages
- `typing`: Typing indicators
- `presence`: User online status updates
- `join_event`: Join game event rooms
- `new_message`: Receive new messages
- `friend_requests`: Friend request notifications
- `upcoming_events`: Event notifications
- `achievement_unlocked`: Achievement notifications

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/facebook` - Facebook OAuth login

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user
- `PUT /api/users/me/password` - Update password

### Friends
- `GET /api/friends` - Get friends list
- `POST /api/friends/request/:userId` - Send friend request
- `POST /api/friends/accept/:userId` - Accept friend request
- `POST /api/friends/reject/:userId` - Reject friend request
- `DELETE /api/friends/:userId` - Remove friend

### Messages
- `GET /api/messages` - Get all conversations
- `GET /api/messages/conversation/:userId` - Get messages with user
- `POST /api/messages/:userId` - Send message to user
- `PATCH /api/messages/:messageId/read` - Mark message as read

### Games
- `GET /api/games` - Get all games
- `GET /api/games/:id` - Get game by ID
- `GET /api/games/popular` - Get popular games
- `GET /api/games/search?q=query` - Search games

### Game Stats
- `GET /api/gamestats/user/:userId` - Get user game stats
- `GET /api/gamestats/game/:gameId` - Get game stats for a game
- `POST /api/gamestats` - Create/update game stats

### Achievements
- `GET /api/achievements/user/:userId` - Get user achievements
- `GET /api/achievements/game/:gameId` - Get achievements for a game
- `POST /api/achievements/unlock` - Unlock achievement

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/join` - Join event
- `POST /api/events/:id/leave` - Leave event

## UI Components

The application includes several reusable UI components:

- **AnimatedButton**: Button with hover and click animations, neon glow effect, and optional icon
- **AnimatedCard**: Card with hover animations, 3D tilt effect, and optional glow
- **AnimatedLoader**: Loading indicators with various styles and animations
- **NotificationPopup**: Animated notification popups for various events
- **ChatInterface**: Real-time chat interface with typing indicators
- **UserPresence**: Online status indicators with animations
- **AchievementUnlocked**: Achievement notification with particle effects

## Deployment

### Prerequisites
- MongoDB database (production)
- Node.js hosting (Heroku, AWS, etc.)

### Deployment Steps
1. Set up production MongoDB database
2. Configure environment variables for production
3. Build frontend assets:
   ```
   cd client
   npm run build
   ```
4. Deploy to your hosting provider of choice

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Socket.IO](https://socket.io/) (Alternative to native WebSockets)
- [JWT](https://jwt.io/)