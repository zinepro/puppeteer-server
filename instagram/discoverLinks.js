const SCROLL_DELAY = 2000;
const INSTAGRAM_HASHTAG = "https://www.instagram.com/explore/search/keyword/?q=%23";

async function scrapeHandler(page, scrollCount = 10) {
  const collectedLinks = new Set();

  await page.waitForSelector("a[href*='/p/']", { timeout: 60000 });

  for (let i = 0; i < scrollCount; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((r) => setTimeout(r, SCROLL_DELAY));

    const newLinks = await page.$$eval("main > div > div:nth-child(2) > div:first-child > div > div", (rows) => {
      const links = [];
      rows.forEach((row) => {
        row.querySelectorAll(":scope > div a[href*='/p/']").forEach((aTag) => links.push(aTag.href));
      });
      return links;
    });

    newLinks.forEach((link) => collectedLinks.add(link));
  }

  return [...collectedLinks];
}

async function discoverLinks(page, keywordsObj) {
  const allLinks = [];

  for (const [keyword, scrollCount] of Object.entries(keywordsObj)) {
    console.log(`Scraping keyword: ${keyword} (${scrollCount} scrolls)`);
    const url = INSTAGRAM_HASHTAG + keyword;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 5000));
    const links = await scrapeHandler(page, scrollCount);
    console.log(`${links.length} liens trouvés pour "${keyword}"`);
    allLinks.push(...links);
  }

  return allLinks.map((link) => ({
    shortcode: link.split("/p/")[1].replace("/", ""),
    scraped: false,
  }));
}

module.exports = { discoverLinks };
