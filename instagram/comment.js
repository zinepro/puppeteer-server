async function postComments(page, url, comment, count) {
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 3000));
  console.log("Page chargée:", page.url());

  for (let i = 0; i < count; i++) {
    console.log(`Commentaire ${i + 1}/${count}`);

    // 1. Attendre et cliquer sur la textarea
    await page.waitForSelector("textarea[placeholder]", { timeout: 10000 });
    console.log("Textarea trouvée");
    await page.click("textarea[placeholder]");
    await new Promise((r) => setTimeout(r, 500));

    // 2. Taper le commentaire
    await page.type("textarea[placeholder]", comment, { delay: 50 });
    console.log("Texte tapé");

    // 3. Attendre que le bouton "Publier" devienne actif
    await new Promise((r) => setTimeout(r, 1000));

    // 4. Chercher le bouton Publier (plusieurs sélecteurs de secours)
    const submitSelectors = [
      // Bouton avec role="button" contenant "Publier" ou "Post"
      'div[role="button"]:has(+ div)',
      // Sélecteur basé sur le texte visible
      'div[role="button"][tabindex="0"]',
    ];

    // Chercher via evaluate pour matcher le texte "Publier" ou "Post"
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

    if (clicked) {
      console.log("Bouton Publier cliqué ✅");
    } else {
      // Fallback : tenter Ctrl+Enter
      console.log("Bouton non trouvé, tentative Ctrl+Enter...");
      await page.keyboard.down("Control");
      await page.keyboard.press("Enter");
      await page.keyboard.up("Control");
    }

    // 5. Vérifier qu'on est toujours sur la bonne page
    await new Promise((r) => setTimeout(r, 4000));
    const currentUrl = page.url();
    console.log("URL après post:", currentUrl);

    if (!currentUrl.includes(url.split("/p/")[1])) {
      console.warn("⚠️ Redirection détectée ! Re-navigation vers le post...");
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      await new Promise((r) => setTimeout(r, 2000));
    }

    if (i < count - 1) {
      const pause = Math.floor(Math.random() * 20000) + 10000;
      console.log(`Pause de ${Math.round(pause / 1000)}s avant prochain commentaire...`);
      await new Promise((r) => setTimeout(r, pause));
    }
  }
}

module.exports = { postComments };
