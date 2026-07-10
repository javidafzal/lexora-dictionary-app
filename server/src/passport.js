import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "./db.js";
import { randomUUID } from "node:crypto";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      const email = profile.emails[0].value.toLowerCase();

      let user = db.findUserByEmail(email);

      if (!user) {
        user = await db.createUser({
          id: randomUUID(),
          name: profile.displayName,
          email,
          passwordHash: "",
        });
      }

      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  done(null, db.findUserById(id));
});

export default passport;