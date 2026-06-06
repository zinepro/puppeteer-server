export async function postComments(page, url, comment, count) {
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  for (let i = 0; i < count; i++) {
    await page.waitForSelector("textarea[placeholder]", { timeout: 10000 });
    await page.click("textarea[placeholder]");
    await page.type("textarea[placeholder]", comment, { delay: 50 });
    await page.keyboard.press("Enter");

    // Pause aléatoire entre commentaires (sauf après le dernier)
    if (i < count - 1) {
      const pause = Math.floor(Math.random() * 20000) + 10000;
      await new Promise((r) => setTimeout(r, pause));
    }
  }
}
