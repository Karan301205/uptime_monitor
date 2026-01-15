// server/src/passport.js
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
    // 👇 This automatically switches between Localhost and your Live Site
callbackURL: (process.env.NODE_ENV === 'production') 
  ? "https://uptime-monitor-xipl.onrender.com/api/auth/google/callback" 
  : "http://localhost:3000/api/auth/google/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email: profile.emails[0].value }
      });

      // 2. If not, create them
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            name: profile.displayName,
            googleId: profile.id,
            // No password needed
          }
        });
      } else if (!user.googleId) {
        // If user exists but didn't use Google before, link the account
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

// We don't need extensive session serialization since we use JWTs, 
// but Passport requires these functions to be defined.
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, id));