// server/src/routes.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const passport = require('passport');
require('./passport');

const prisma = new PrismaClient();

// --- FIXED MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // 1. Check if header exists
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: No token header' });
  }

  // 2. Smart Extraction: Handle both "Bearer <token>" and raw "<token>"
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token is empty' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Payload Fix: Check for both 'userId' (Normal) AND 'id' (Google)
    req.userId = decoded.userId || decoded.id;

    if (!req.userId) {
      throw new Error('Token is valid but contains no User ID');
    }

    next();
  } catch (err) {
    console.error("Auth Failed:", err.message);
    res.status(401).json({ error: 'Invalid Token' });
  }
};

// --- AUTH ROUTES ---

// 1. Redirect user to Google
router.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 2. Google Callback (FIXED)
router.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  // FIX: Use 'userId' to match the standard login
  const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Logic: Production vs Localhost
  const clientURL = process.env.NODE_ENV === 'production'
    ? 'https://uptime-monitor-theta.vercel.app/login' 
    : 'http://localhost:5173/login';

  res.redirect(`${clientURL}?token=${token}`);
});

// 3. Register User
router.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });
    res.json({ message: 'User created!' });
  } catch (error) {
    res.status(400).json({ error: 'User already exists' });
  }
});

// 4. Login User
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  res.json({ token, user: { name: user.name, email: user.email } });
});

// --- MONITOR ROUTES (Protected) ---

router.get('/monitors', authMiddleware, async (req, res) => {
  try {
    const monitors = await prisma.monitor.findMany({
      where: { userId: req.userId },
      include: {
        logs: { take: 20, orderBy: { createdAt: 'desc' } },
        incidents: { take: 5, orderBy: { startsAt: 'desc' } }
      }
    });
    res.json(monitors);
  } catch (error) {
    res.status(500).json({ error: 'Server Error Fetching Monitors' });
  }
});

router.post('/monitors', authMiddleware, async (req, res) => {
  const { name, url } = req.body;
  try {
    const monitor = await prisma.monitor.create({
      data: { name, url, userId: req.userId, isActive: true }
    });
    res.json(monitor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create monitor' });
  }
});

router.delete('/monitors/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.monitor.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;