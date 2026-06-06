async function postComments(page, url, comment, count) {
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));
  console.log("Page chargée:", page.url());

  for (let i = 0; i < count; i++) {
    console.log(`Commentaire ${i + 1}/${count}`);
    await page.waitForSelector("textarea[placeholder]", { timeout: 10000 });
    console.log("Textarea trouvé");
    await page.click("textarea[placeholder]");
    await page.type("textarea[placeholder]", comment, { delay: 50 });
    console.log("Texte tapé");
    await page.keyboard.press("Enter");
    console.log("Enter pressé");
    await new Promise((r) => setTimeout(r, 3000));
  }
}

module.exports = { postComments };
