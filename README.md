# Puppeteer Server pour n8n

Serveur Express qui expose Puppeteer via une API HTTP, à appeler depuis n8n avec le nœud HTTP Request.

## Lancer en local

```bash
npm install
node index.js
```

## Tester en local

```bash
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-key" \
  -d '{"url": "https://google.com"}'
```

## Déployer sur Railway

1. Push ce dossier sur un repo GitHub
2. Connecter le repo sur railway.app
3. Ajouter la variable d'environnement : API_KEY=une-clé-secrète-de-ton-choix

## Appel depuis n8n

- Method : POST
- URL : https://ton-projet.railway.app/run
- Header : x-api-key = ta clé secrète
- Body (JSON) :
  {
    "url": "https://google.com"
  }
