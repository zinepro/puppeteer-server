const { saveSession } = require("../session");

const IG_USERNAME = process.env.IG_USERNAME;
const IG_EMAIL = process.env.IG_EMAIL;
const IG_PASSWORD = process.env.IG_PASSWORD;

async function loginInstagram(page) {
  await new Promise((r) => setTimeout(r, 3000));

  await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  await page.waitForSelector('input[name="pass"]', { timeout: 15000 });

  await page.type('input[name="email"]', IG_EMAIL, { delay: 50 });
  await page.type('input[name="pass"]', IG_PASSWORD, { delay: 50 });

  await page.click('div[aria-label="Log in"], div[aria-label="Se connecter"]');
  await new Promise((r) => setTimeout(r, 3000));

  try {
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 });
  } catch (e) {
    console.log("Erreur navigation:", e.message);
  }

  await saveSession(page);
}

async function isLoggedIn(page) {
  await page.goto("https://www.instagram.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 3000));

  const profileLink = await page.$(`a[href="/${IG_USERNAME}/"]`);
  console.log("Profile link trouvé:", profileLink ? "OUI" : "NON");

  return !!profileLink;
}

module.exports = { loginInstagram, isLoggedIn };
