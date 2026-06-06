const fs = require("fs");
const path = require("path");

const SESSION_PATH =
  process.env.NODE_ENV === "production" ? "/tmp/ig-session.json" : path.join(__dirname, "ig-session.json");

async function restoreSession(page) {
  console.log("SESSION_PATH:", SESSION_PATH);
  console.log("Fichier existe:", fs.existsSync(SESSION_PATH));
  if (!fs.existsSync(SESSION_PATH)) return false;
  const cookies = JSON.parse(fs.readFileSync(SESSION_PATH));
  console.log(
    "Cookies sauvegardés:",
    cookies.map((c) => c.name),
  );
  await page.setCookie(...cookies);
  return true;
}

async function saveSession(page) {
  const cookies = await page.cookies();
  fs.writeFileSync(SESSION_PATH, JSON.stringify(cookies));
}

module.exports = { restoreSession, saveSession };
