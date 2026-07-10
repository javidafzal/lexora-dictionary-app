import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "lexora_token";
const TOKEN_TTL = "30d";

if (!JWT_SECRET || JWT_SECRET === "replace-this-with-a-long-random-string") {
  console.warn(
    "[lexora-server] WARNING: JWT_SECRET is missing or still the placeholder value. " +
      "Set a real secret in server/.env before deploying."
  );
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET ?? "dev-only-insecure-secret", { expiresIn: TOKEN_TTL });
}

export function verifyToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET ?? "dev-only-insecure-secret");
    return payload.sub;
  } catch {
    return null;
  }
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

/** Express middleware: attaches req.userId if a valid session cookie is present. */
export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  const userId = token ? verifyToken(token) : null;
  if (!userId) {
    return res.status(401).json({ error: "Not signed in." });
  }
  req.userId = userId;
  next();
}

export { COOKIE_NAME };
