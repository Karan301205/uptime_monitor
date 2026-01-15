// server/src/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { startCronJob } = require('./cron'); 
const router = require('./routes');
const passport = require('passport');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:5173',                   // Your Local Frontend
    'https://uptime-monitor-theta.vercel.app'  // Your Live Vercel Frontend
  ],
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());
app.use('/api', router);

app.get('/', (req, res) => {
  res.send('Uptime Monitor API is running 🚀');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start the background worker
  startCronJob(); 
});