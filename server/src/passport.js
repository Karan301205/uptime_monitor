const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

console.log("---- DEBUG KEYS ----");
console.log("CLIENT ID:", process.env.GOOGLE_CLIENT_ID); 
console.log("CLIENT SECRET:", process.env.GOOGLE_CLIENT_SECRET);
console.log("--------------------");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: (process.env.NODE_ENV === 'production') 
  ? "https://uptime-monitor-xipl.onrender.com/api/auth/google/callback" 
  : "http://localhost:3000/api/auth/google/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await prisma.user.findUnique({
        where: { email: profile.emails[0].value }
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            name: profile.displayName,
            googleId: profile.id,
          }
        });
      } else if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.id }
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, id));