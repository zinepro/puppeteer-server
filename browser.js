const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

async function getBrowser() {
  return await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,800"],
    headless: "new",
  });
}

module.exports = { getBrowser };
