// server/src/routes.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const passport = require('passport');
require('./passport');

const prisma = new PrismaClient();

// --- MIDDLEWARE: Protect Routes ---
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid Token' });
  }
};

// --- AUTH ROUTES ---

// 1. Redirect user to Google
router.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 2. Google calls this back
// server/src/routes.js

router.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // 👇 LOGIC: If we are in Production (Render), send to Vercel. Otherwise, Localhost.
  const clientURL = process.env.NODE_ENV === 'production'
    ? 'https://uptime-monitor-theta.vercel.app/login'  // Live Vercel Link
    : 'http://localhost:5173/login';                   // Localhost

  res.redirect(`${clientURL}?token=${token}`);
});

// 1. Register User
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

// 2. Login User
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

// 3. Get All Monitors (Dashboard)
router.get('/monitors', authMiddleware, async (req, res) => {
  const monitors = await prisma.monitor.findMany({
    where: { userId: req.userId },
    include: {
      logs: {
        take: 20,
        orderBy: { createdAt: 'desc' }
      },
      // 👇 ADD THIS SECTION
      incidents: {
        take: 5, // Get last 5 crashes
        orderBy: { startsAt: 'desc' }
      }
    }
  });
  res.json(monitors);
});

// 4. Add New Monitor
router.post('/monitors', authMiddleware, async (req, res) => {
  const { name, url } = req.body;
  try {
    const monitor = await prisma.monitor.create({
      data: {
        name,
        url,
        userId: req.userId,
        isActive: true
      }
    });
    res.json(monitor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create monitor' });
  }
});

// 5. Delete Monitor
router.delete('/monitors/:id', authMiddleware, async (req, res) => {
  await prisma.monitor.delete({
    where: { id: parseInt(req.params.id) }
  });
  res.json({ message: 'Deleted' });
});


module.exports = router;