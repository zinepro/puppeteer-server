async function postComment(page, url, comment) {
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  await page.waitForSelector("textarea[placeholder]", { timeout: 10000 });
  await page.click("textarea[placeholder]");

  await page.type("textarea[placeholder]", comment, { delay: 50 });

  await page.keyboard.press("Enter");
  await new Promise((r) => setTimeout(r, 3000));
}

module.exports = { postComment };
