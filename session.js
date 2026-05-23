const fs = require("fs");
const path = require("path");

const SESSION_PATH = path.join(__dirname, "ig-session.json");

async function restoreSession(page) {
  if (!fs.existsSync(SESSION_PATH)) return false;
  const cookies = JSON.parse(fs.readFileSync(SESSION_PATH));
  await page.setCookie(...cookies);
  return true;
}

async function saveSession(page) {
  const cookies = await page.cookies();
  fs.writeFileSync(SESSION_PATH, JSON.stringify(cookies));
}

module.exports = { restoreSession, saveSession };
