const fs = require("fs");
const { execSync } = require("child_process");

// Path to your env file
const envFilePath = ".env.local";

// Read and split lines
const envVars = fs.readFileSync(envFilePath, "utf8")
  .split("\n")
  .filter(line => line.trim() && !line.trim().startsWith("#"));

for (const line of envVars) {
  const [key, ...rest] = line.split("=");
  const value = rest.join("=").trim().replace(/^['"]|['"]$/g, ""); // remove surrounding quotes

  // Escape newlines (especially for private keys)
  const escapedValue = value.replace(/\n/g, "\\n");

  console.log(`⏫ Uploading ${key}...`);
  try {
    execSync(`wrangler secret put ${key}`, { stdio: "inherit", input: `${escapedValue}\n` });
  } catch (err) {
    console.error(`❌ Failed to upload ${key}:`, err.message);
  }
}
