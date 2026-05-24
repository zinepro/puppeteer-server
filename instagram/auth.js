const { saveSession } = require("../session");

const IG_EMAIL = process.env.IG_EMAIL;
const IG_PASSWORD = process.env.IG_PASSWORD;

async function loginInstagram(page) {
  await new Promise((r) => setTimeout(r, 3000));

  const buttons = await page.$$eval("button, div[role='button']", (els) =>
    els.map((el) => ({
      tag: el.tagName,
      ariaLabel: el.getAttribute("aria-label"),
      text: el.innerText.substring(0, 50),
    })),
  );
  console.log("Boutons trouvés:", JSON.stringify(buttons, null, 2));

  await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  await page.waitForSelector('input[name="pass"]', { timeout: 15000 });

  await page.type('input[name="email"]', IG_EMAIL, { delay: 50 });
  await page.type('input[name="pass"]', IG_PASSWORD, { delay: 50 });

  await page.click('div[aria-label="Log In"], div[aria-label="Se connecter"]');
  await new Promise((r) => setTimeout(r, 3000));

  try {
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 });
  } catch (e) {
    console.log("Erreur navigation:", e.message);
  }

  await new Promise((r) => setTimeout(r, 5000));

  const allCookies = await page.cookies();
  console.log(
    "Cookies après login:",
    allCookies.map((c) => c.name),
  );
  console.log("URL après login:", page.url());
  await saveSession(page);
}

async function isLoggedIn(page) {
  const cookies = await page.cookies("https://www.instagram.com");
  console.log(
    "Cookies actifs:",
    cookies.map((c) => c.name),
  );
  const sessionCookie = cookies.find((c) => c.name === "sessionid");
  console.log("Cookie sessionid trouvé:", sessionCookie ? "OUI" : "NON");
  return !!sessionCookie;
}

module.exports = { loginInstagram, isLoggedIn };
