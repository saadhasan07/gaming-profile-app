const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static assets
app.use(express.static(path.join(__dirname, 'client', 'public')));

// Routes
app.get('/api/test', (req, res) => {
  res.json({ msg: 'Gaming Profile App API is running' });
});

// Serve homepage
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'public', 'index.html'));
});

// Use port 3000 to avoid conflict with the CI/CD app on port 5000
const PORT = process.env.PORT || 3000;

// Make sure to bind to 0.0.0.0 to be accessible from outside
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ===========================================================
  🎮 Gaming Profile App server running on port ${PORT}
  🚀 View live demo at: http://localhost:${PORT}
  ===========================================================
  `);
});