const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const passport = require('passport');
require('./passport');

const prisma = new PrismaClient();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: No token header' });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token is empty' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
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

router.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const clientURL = process.env.NODE_ENV === 'production'
    ? 'https://uptime-monitor-theta.vercel.app/login' 
    : 'http://localhost:5173/login';

  res.redirect(`${clientURL}?token=${token}`);
});

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

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  res.json({ token, user: { name: user.name, email: user.email } });
});

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

// --- USER PROFILE ROUTE (FIXED) ---
router.get('/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId }, 
      select: { 
        name: true, 
        email: true, 
        createdAt: true,
        monitors: {
          select: {
            id: true,
            name: true,
            url: true,
            isActive: true,
            logs: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: { statusCode: true }
            }
          }
        }
      }
    });
    res.json(user);
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;