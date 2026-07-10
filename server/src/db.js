import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "..", "data", "db.json");

function ensureDbFile() {
  const dir = dirname(DB_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify({ users: {} }, null, 2));
  }
}

function readDb() {
  ensureDbFile();
  const raw = readFileSync(DB_PATH, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return { users: {} };
  }
}

// Serialize writes so concurrent requests don't clobber each other.
let writeQueue = Promise.resolve();
function writeDb(data) {
  writeQueue = writeQueue.then(
    () => writeFileSync(DB_PATH, JSON.stringify(data, null, 2)),
    () => writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
  );
  return writeQueue;
}

/**
 * Minimal data-access layer. Swap the internals of these functions for
 * real SQL/ORM calls (Postgres, Supabase, etc.) without touching the routes —
 * that's the whole point of keeping this layer thin.
 */
export const db = {
  findUserByEmail(email) {
    const data = readDb();
    return Object.values(data.users).find((u) => u.email === email.toLowerCase()) ?? null;
  },

  findUserById(id) {
    const data = readDb();
    return data.users[id] ?? null;
  },

  async createUser({ id, name, email, passwordHash }) {
    const data = readDb();
    const user = { id, name, email: email.toLowerCase(), passwordHash, savedWords: [] };
    data.users[id] = user;
    await writeDb(data);
    return user;
  },

  async setSavedWords(id, savedWords) {
    const data = readDb();
    if (!data.users[id]) return null;
    data.users[id].savedWords = savedWords;
    await writeDb(data);
    return data.users[id];
  },
};
