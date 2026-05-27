require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const { getBrowser } = require("./browser");
const { restoreSession } = require("./session");
const { loginInstagram, isLoggedIn } = require("./instagram/auth");
const { postComment } = require("./instagram/comment");
const { discoverLinks } = require("./instagram/discoverLinks");
const { scrapePosts } = require("./instagram/scrapePosts");

const SESSION_PATH = path.join("/tmp", "ig-session.json");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setTimeout(300000); // 5 minutes
  next();
});

const API_KEY = process.env.API_KEY || "dev-key";

// Middleware sécurité
app.use((req, res, next) => {
  if (req.headers["x-api-key"] !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// Route : login et sauvegarde de session
app.post("/login", async (req, res) => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.goto("https://www.instagram.com/", { waitUntil: "networkidle2" });
    await loginInstagram(page);
    await browser.close();
    res.json({ success: true, message: "Connecté et session sauvegardée !" });
  } catch (err) {
    await browser.close();
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route : poster un commentaire
app.post("/comment", async (req, res) => {
  const { url, comment } = req.body;

  if (!url || !comment) {
    return res.status(400).json({ error: "url et comment sont requis" });
  }

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    const sessionRestored = await restoreSession(page);

    const loggedIn = await isLoggedIn(page);

    if (!loggedIn) {
      await page.goto("https://www.instagram.com/", { waitUntil: "networkidle2" });
      await loginInstagram(page);
    }

    await postComment(page, url, comment);

    await browser.close();
    res.json({ success: true, message: "Commentaire posté !" });
  } catch (err) {
    await browser.close();
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route de base (test)
app.post("/run", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "url manquante" });

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    const title = await page.title();
    await browser.close();
    res.json({ success: true, title });
  } catch (err) {
    await browser.close();
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/discoverLinks", async (req, res) => {
  const { keywords } = req.body;

  if (!keywords || typeof keywords !== "object") {
    return res.status(400).json({ error: "keywords est requis (objet)" });
  }

  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  );
  await page.setExtraHTTPHeaders({ "Accept-Language": "fr-FR,fr;q=0.9" });

  try {
    const sessionRestored = await restoreSession(page);
    console.log("Session restaurée:", sessionRestored);
    const loggedIn = await isLoggedIn(page);
    console.log("Est connecté:", loggedIn);

    if (!loggedIn) {
      await page.goto("https://www.instagram.com/", { waitUntil: "networkidle2" });
      await loginInstagram(page);
    }

    console.log("go sur page de découverte");
    const links = await discoverLinks(page, keywords);
    console.log("Liens découverts:", links);
    await browser.close();
    res.json({ success: true, links });
  } catch (err) {
    await browser.close();
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/uploadSession", async (req, res) => {
  const { cookies } = req.body;
  if (!cookies) return res.status(400).json({ error: "cookies requis" });
  fs.writeFileSync(SESSION_PATH, JSON.stringify(cookies));
  res.json({ success: true, message: "Session uploadée !" });
});

app.post("/scrapePosts", async (req, res) => {
  const { shortcodes } = req.body;

  if (!shortcodes || !Array.isArray(shortcodes)) {
    return res.status(400).json({ error: "shortcodes est requis (array)" });
  }

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    const sessionRestored = await restoreSession(page);
    console.log("Session restaurée:", sessionRestored);

    const loggedIn = await isLoggedIn(page);
    console.log("Est connecté:", loggedIn);

    if (!loggedIn) {
      await page.goto("https://www.instagram.com/", { waitUntil: "domcontentloaded" });
      await loginInstagram(page);
    }

    const { results, failed } = await scrapePosts(page, shortcodes);
    await browser.close();
    res.json({ success: true, results, failed });
  } catch (err) {
    await browser.close();
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/refreshSession", async (req, res) => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    const sessionRestored = await restoreSession(page);
    console.log("Session restaurée:", sessionRestored);

    await page.goto("https://www.instagram.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 3000));

    const cookies = await page.cookies();
    console.log(
      "Cookies rafraîchis:",
      cookies.map((c) => c.name),
    );

    fs.writeFileSync(SESSION_PATH, JSON.stringify(cookies));
    console.log("Session sauvegardée.");

    await browser.close();
    res.json({ success: true, message: "Session rafraîchie !" });
  } catch (err) {
    await browser.close();
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Serveur Puppeteer démarré sur le port " + (process.env.PORT || 3000));
});
