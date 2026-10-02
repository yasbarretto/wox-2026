#!/usr/bin/env node
/*
  Replaces the __CHAT_ENDPOINT__ / __CHAT_API_TOKEN__ placeholders in
  chatbot.js with values from the environment.

  Runs on Railway via `npm run build` (Nixpacks runs it automatically
  before `npm start`). Set CHAT_ENDPOINT and CHAT_API_TOKEN in the
  Railway service's Variables tab.

  Idempotent: if the placeholders are already gone (e.g. a second build on the
  same checkout), it exits 0 without changing anything.
*/
"use strict";

const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "chatbot.js");
const PLACEHOLDERS = {
  __CHAT_ENDPOINT__: "CHAT_ENDPOINT",
  __CHAT_API_TOKEN__: "CHAT_API_TOKEN",
};

let src = fs.readFileSync(FILE, "utf8");

const present = Object.keys(PLACEHOLDERS).filter((p) => src.includes(p));
if (present.length === 0) {
  console.log("inject-config: no placeholders found in chatbot.js, nothing to do");
  process.exit(0);
}

const missing = present
  .map((p) => PLACEHOLDERS[p])
  .filter((envName) => !process.env[envName]);
if (missing.length) {
  console.error(`inject-config: missing required env var(s): ${missing.join(", ")}`);
  process.exit(1);
}

for (const [placeholder, envName] of Object.entries(PLACEHOLDERS)) {
  // Escape for safe insertion into a single-quoted JS string literal.
  const value = process.env[envName].replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  src = src.split(placeholder).join(value);
}

if (Object.keys(PLACEHOLDERS).some((p) => src.includes(p))) {
  console.error("inject-config: placeholder substitution failed");
  process.exit(1);
}

fs.writeFileSync(FILE, src);
console.log(`inject-config: substituted ${present.join(", ")} in chatbot.js`);
