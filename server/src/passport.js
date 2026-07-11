import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { randomUUID } from "node:crypto";
import { db } from "./db.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();

        if (!email) {
          return done(new Error("Google account has no email"));
        }

        let user = db.findUserByEmail(email);

        if (!user) {
          user = await db.createUser({
            id: randomUUID(),
            name: profile.displayName || "Google User",
            email,
            passwordHash: "",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;