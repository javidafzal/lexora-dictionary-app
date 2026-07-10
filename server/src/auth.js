import { Router } from "express";
import { randomUUID } from "node:crypto";
import { OAuth2Client } from "google-auth-library";

import { db } from "../db.js";
import {
  hashPassword,
  verifyPassword,
  signToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
} from "../auth.js";

export const authRouter = Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    savedWords: user.savedWords,
  };
}


// =======================
// Normal Signup
// =======================

authRouter.post("/signup", async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
    return res.status(400).json({
      error: "Enter a name, valid email, and password of at least 6 characters.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (db.findUserByEmail(normalizedEmail)) {
    return res.status(409).json({
      error: "An account with that email already exists.",
    });
  }

  const passwordHash = await hashPassword(password);

  const user = await db.createUser({
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  const token = signToken(user.id);

  setAuthCookie(res, token);

  res.status(201).json({
    user: publicUser(user),
  });
});


// =======================
// Normal Login
// =======================

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({
      error: "Enter your email and password.",
    });
  }

  const user = db.findUserByEmail(
    email.trim().toLowerCase()
  );

  const valid =
    user && user.passwordHash
      ? await verifyPassword(password, user.passwordHash)
      : false;


  if (!user || !valid) {
    return res.status(401).json({
      error: "Incorrect email or password.",
    });
  }


  const token = signToken(user.id);

  setAuthCookie(res, token);

  res.json({
    user: publicUser(user),
  });
});


// =======================
// Google Login
// =======================

authRouter.post("/google", async (req, res) => {
  try {

    const { credential } = req.body;


    if (!credential) {
      return res.status(400).json({
        error: "Google credential missing.",
      });
    }


    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });


    const payload = ticket.getPayload();


    const email = payload.email.toLowerCase();

    const name = payload.name;


    let user = db.findUserByEmail(email);


    if (!user) {

      user = await db.createUser({
        id: randomUUID(),
        name,
        email,
        passwordHash: "",
      });

    }


    const token = signToken(user.id);


    setAuthCookie(res, token);


    res.json({
      user: publicUser(user),
    });


  } catch (error) {

    console.error("Google login error:", error);

    res.status(401).json({
      error: "Google authentication failed.",
    });

  }
});


// =======================
// Logout
// =======================

authRouter.post("/logout", (_req, res) => {

  clearAuthCookie(res);

  res.status(204).end();

});


// =======================
// Current User
// =======================

authRouter.get("/me", requireAuth, (req, res) => {

  const user = db.findUserById(req.userId);


  if (!user) {
    return res.status(401).json({
      error: "Not signed in.",
    });
  }


  res.json({
    user: publicUser(user),
  });

});