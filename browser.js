const puppeteer = require("puppeteer");

async function getBrowser() {
  return await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });
}

module.exports = { getBrowser };
