const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Initialize middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/sharing', require('./routes/sharing'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/games', require('./routes/games'));
app.use('/api/gamestats', require('./routes/gameStats'));
app.use('/api/events', require('./routes/events'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

// Define port
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = require('http').createServer(app);

// Initialize WebSocket server
const initWebSocket = require('./websocket');
const wsServer = initWebSocket(server);

// Attach WebSocket to app for route handlers to access
app.locals.wsServer = wsServer;

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));