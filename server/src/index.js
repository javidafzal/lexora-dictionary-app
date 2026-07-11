import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./passport.js";

import { authRouter } from "./routes/auth.js";
import { wordsRouter } from "./routes/words.js";
import { savedRouter } from "./routes/saved.js";

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";


const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 4000;

const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN ||
  "http://localhost:5175";

const isProd =
  process.env.NODE_ENV === "production";


const app = express();


app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);


app.use(express.json());

app.use(cookieParser());

app.use(passport.initialize());


app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});


app.use("/api/auth", authRouter);
app.use("/api/words", wordsRouter);
app.use("/api/saved", savedRouter);



const distDir = join(__dirname, "..", "..", "dist");


if (isProd && existsSync(distDir)) {
  app.use(express.static(distDir));

  app.get("*", (_req, res) => {
    res.sendFile(
      join(distDir, "index.html")
    );
  });
}



app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(500).json({
    error: "Something went wrong on our end.",
  });
});


app.listen(PORT, () => {
  console.log(
    `Lexora API listening on port ${PORT}`
  );
});