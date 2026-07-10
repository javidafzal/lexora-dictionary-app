import { Router } from "express";
import { randomUUID } from "node:crypto";
import { db } from "../db.js";
import { hashPassword, verifyPassword, signToken, setAuthCookie, clearAuthCookie, requireAuth } from "../auth-utils.js";

export const authRouter = Router();

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, savedWords: user.savedWords };
}

authRouter.post("/signup", async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
    return res
      .status(400)
      .json({ error: "Enter a name, valid email, and a password of at least 6 characters." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (db.findUserByEmail(normalizedEmail)) {
    return res.status(409).json({ error: "An account with that email already exists. Try signing in instead." });
  }

  const passwordHash = await hashPassword(password);
  const user = await db.createUser({ id: randomUUID(), name: name.trim(), email: normalizedEmail, passwordHash });

  const token = signToken(user.id);
  setAuthCookie(res, token);
  res.status(201).json({ user: publicUser(user) });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "Enter your email and password." });
  }

  const user = db.findUserByEmail(email.trim().toLowerCase());
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !valid) {
    return res.status(401).json({ error: "That email and password combination doesn't match an account." });
  }

  const token = signToken(user.id);
  setAuthCookie(res, token);
  res.json({ user: publicUser(user) });
});

authRouter.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.status(204).end();
});

authRouter.get("/me", requireAuth, (req, res) => {
  const user = db.findUserById(req.userId);
  if (!user) return res.status(401).json({ error: "Not signed in." });
  res.json({ user: publicUser(user) });
});
