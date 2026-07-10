import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../auth-utils.js";

export const savedRouter = Router();

savedRouter.use(requireAuth);

savedRouter.get("/", (req, res) => {
  const user = db.findUserById(req.userId);
  if (!user) return res.status(401).json({ error: "Not signed in." });
  res.json({ savedWords: user.savedWords });
});

savedRouter.post("/:wordId", async (req, res) => {
  const user = db.findUserById(req.userId);
  if (!user) return res.status(401).json({ error: "Not signed in." });

  const { wordId } = req.params;
  const already = user.savedWords.includes(wordId);
  const nextSaved = already ? user.savedWords.filter((id) => id !== wordId) : [...user.savedWords, wordId];

  const updated = await db.setSavedWords(user.id, nextSaved);
  res.json({ savedWords: updated.savedWords });
});
