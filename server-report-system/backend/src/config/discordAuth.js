const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const db = require('./db');

// Discord OAuth2 Strategy
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_REDIRECT_URI,
  scope: ['identify', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await db('users').where('discord_id', profile.id).first();
    
    if (!user) {
      // Create new user
      const userData = {
        discord_id: profile.id,
        username: profile.username,
        discriminator: profile.discriminator,
        avatar: profile.avatar,
        email: profile.email,
        role: 'support', // Default role
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const [userId] = await db('users').insert(userData);
      user = await db('users').where('id', userId).first();
    } else {
      // Update existing user info
      await db('users')
        .where('discord_id', profile.id)
        .update({
          username: profile.username,
          discriminator: profile.discriminator,
          avatar: profile.avatar,
          email: profile.email,
          last_login: new Date(),
          updated_at: new Date()
        });
      
      user = await db('users').where('discord_id', profile.id).first();
    }
    
    return done(null, user);
  } catch (error) {
    console.error('Discord auth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db('users').where('id', id).first();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;