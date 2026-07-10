import { Router } from "express";
import { WORDS } from "../data/words.js";

export const wordsRouter = Router();

wordsRouter.get("/", (_req, res) => {
  res.json({ words: WORDS });
});

wordsRouter.get("/:id", (req, res) => {
  const word = WORDS.find((w) => w.id === req.params.id);
  if (!word) return res.status(404).json({ error: "Word not found." });
  res.json({ word });
});
