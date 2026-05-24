const puppeteer = require("puppeteer");

async function getBrowser() {
  return await puppeteer.launch({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-infobars",
      "--window-size=1280,800",
    ],
    headless: "new",
  });
}

module.exports = { getBrowser };
