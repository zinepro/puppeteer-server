const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY || 'dev-key';

// Middleware sécurité
app.use((req, res, next) => {
  if (req.headers['x-api-key'] !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

app.post('/run', async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: 'url manquante' });

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const title = await page.title();
    await browser.close();
    res.json({ success: true, title });

  } catch (err) {
    await browser.close();
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Serveur Puppeteer démarré sur le port ' + (process.env.PORT || 3000));
});
