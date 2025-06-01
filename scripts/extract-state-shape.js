#!/usr/bin/env node

const { execSync } = require("child_process");

try {
  execSync("npx tsx scripts/extract-state-shape.ts", { stdio: "inherit" });
} catch (error) {
  console.error("Error extracting state shape:", error.message);
  process.exit(1);
}
