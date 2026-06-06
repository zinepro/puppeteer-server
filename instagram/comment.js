async function postComments(page, url, comment, count) {
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 3000));

  for (let i = 0; i < count; i++) {
    // await page.waitForSelector("textarea[placeholder]", { timeout: 60000 });
    await new Promise((r) => setTimeout(r, 5000));

    const clickables = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("*"))
        .filter((el) => {
          const text = el.textContent.trim();
          return (text === "Ajouter un commentaire…" || text === "Add a comment…") && el.children.length === 0;
        })
        .map((el) => ({
          tag: el.tagName,
          placeholder: el.getAttribute("placeholder"),
          ariaLabel: el.getAttribute("aria-label"),
          role: el.getAttribute("role"),
          class: el.className,
        }));
    });

    console.log("Clickables:", JSON.stringify(clickables));

    await page.click("textarea[placeholder]");
    await new Promise((r) => setTimeout(r, 500));
    await page.type("textarea[placeholder]", comment, { delay: 50 });
    await new Promise((r) => setTimeout(r, 1000));

    const clicked = await page.evaluate(() => {
      const buttons = document.querySelectorAll('div[role="button"][tabindex="0"]');
      for (const btn of buttons) {
        const text = btn.textContent.trim();
        if (text === "Publier" || text === "Post" || text === "Publish") {
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (!clicked) {
      await page.keyboard.down("Control");
      await page.keyboard.press("Enter");
      await page.keyboard.up("Control");
    }

    await new Promise((r) => setTimeout(r, 4000));

    const currentUrl = page.url();
    if (!currentUrl.includes(url.split("/p/")[1])) {
      console.warn(`⚠️ Redirection détectée après commentaire ${i + 1}`);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      await new Promise((r) => setTimeout(r, 2000));
    }

    if (i < count - 1) {
      const pause = Math.floor(Math.random() * 2000) + 3000; // 3-5s
      await new Promise((r) => setTimeout(r, pause));
    }
  }

  console.log(`✅ ${count} commentaire(s) posté(s) sur ${url}`);
}

module.exports = { postComments };
