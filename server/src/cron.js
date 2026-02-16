const cron = require('node-cron');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendAlertEmail(email, url, status) {
  const subject = status === 'DOWN' ? '🚨 Site Down Alert' : '✅ Site Recovered';
  const text = status === 'DOWN' 
    ? `Your monitor for ${url} is unreachable.` 
    : `Good news! ${url} is back online.`;

  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to: email, subject, text });
  } catch (error) {
    console.error('Email failed:', error);
  }
}

async function checkMonitor(monitor) {
  const start = Date.now();
  let status = 500;
  let responseTime = 0;

  try {
    const res = await axios.get(monitor.url, { timeout: 5000 });
    status = res.status;
    responseTime = Date.now() - start;
  } catch (error) {
    responseTime = Date.now() - start;
  }

  const isUp = status === 200;

  const openIncident = await prisma.incident.findFirst({
    where: { 
      monitorId: monitor.id, 
      endsAt: null 
    }
  });

  if (!isUp && !openIncident) {
    console.log(`❌ ${monitor.url} went DOWN. Opening Incident.`);
    
    await prisma.incident.create({
      data: { monitorId: monitor.id, startsAt: new Date() }
    });
    
    if (monitor.user?.email) await sendAlertEmail(monitor.user.email, monitor.url, 'DOWN');

  } else if (isUp && openIncident) {
    console.log(`✅ ${monitor.url} recovered. Closing Incident.`);
    
    await prisma.incident.update({
      where: { id: openIncident.id },
      data: { endsAt: new Date() }
    });

    if (monitor.user?.email) await sendAlertEmail(monitor.user.email, monitor.url, 'UP');
  }

  await prisma.log.create({
    data: {
      monitorId: monitor.id,
      statusCode: status,
      responseTime: responseTime,
    },
  });
}

const startCronJob = () => {
  cron.schedule('* * * * *', async () => {
    console.log('🔄 Checking monitors...');
    const monitors = await prisma.monitor.findMany({
      where: { isActive: true },
      include: { user: true }
    });
    await Promise.allSettled(monitors.map(m => checkMonitor(m)));
  });
};

module.exports = { startCronJob };