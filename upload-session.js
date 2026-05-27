const fs = require("fs");
const https = require("https");

const cookies = JSON.parse(fs.readFileSync("ig-session.json", "utf8"));
const body = JSON.stringify({ cookies });

const options = {
  hostname: "puppeteer-server-production-4e0d.up.railway.app",
  path: "/uploadSession",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "puppeteer-server-11-2026",
    "Content-Length": Buffer.byteLength(body),
  },
};

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => console.log("Réponse:", data));
});

req.write(body);
req.end();
