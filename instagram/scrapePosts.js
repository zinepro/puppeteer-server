const INSTAGRAM_POST = "https://www.instagram.com/p/";
const DELAY_MIN = 2000;
const DELAY_MAX = 5000;

const findWebInfo = (obj) => {
  if (!obj || typeof obj !== "object") return null;
  if (obj.xdt_api__v1__media__shortcode__web_info) return obj.xdt_api__v1__media__shortcode__web_info;
  for (const key in obj) {
    const found = findWebInfo(obj[key]);
    if (found) return found;
  }
  return null;
};

const extractPostData = (json) => {
  try {
    const webInfo = findWebInfo(json);
    const item = webInfo?.items?.[0];
    if (!item) return null;

    const dateDebut = item.taken_at ? new Date(item.taken_at * 1000).toISOString() : null;

    return {
      post_id: item.id,
      shortcode: item.code,
      is_sponsored: item.is_paid_partnership,
      already_liked: item.has_liked,
      comments_disabled: !!item.comments_disabled,
      caption: item.caption?.text || "",
      caption_is_edited: item.caption_is_edited,
      date_debut: dateDebut,
      nb_likes: item.like_count,
      nb_comments: item.comment_count,
      owner_id: item.user.id,
      owner_username: item.user.username,
      owner_profile_pic: item.user.profile_pic_url,
    };
  } catch (err) {
    console.error("extractPostData error:", err.message);
    return null;
  }
};

async function scrapePosts(page, shortcodes) {
  const results = [];
  const failed = [];

  for (const [index, shortcode] of shortcodes.entries()) {
    const url = INSTAGRAM_POST + shortcode + "/";
    console.log(`Scraping ${index + 1}/${shortcodes.length}: ${shortcode}`);

    // Navigation
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await new Promise((r) => setTimeout(r, 2000));
    } catch (navError) {
      console.warn(`Erreur navigation ${shortcode}:`, navError.message);
      failed.push(shortcode);
      continue;
    }

    // Extraction
    try {
      const html = await page.content();
      const scripts = await page.$$eval("script", (els) => els.map((el) => el.innerHTML));
      const jsonScript = scripts.find((s) => s && s.includes("xdt_api__v1__media__shortcode__web_info"));

      if (!jsonScript) {
        console.warn(`Aucun script JSON trouvé pour: ${shortcode}`);
        failed.push(shortcode);
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }

      const postJson = JSON.parse(jsonScript);
      const postData = extractPostData(postJson);

      if (postData && postData.caption !== undefined) {
        results.push(postData);
        console.log(`Succès: ${shortcode}`);
      } else {
        failed.push(shortcode);
      }
    } catch (parseError) {
      console.error(`Erreur extraction ${shortcode}:`, parseError.message);
      failed.push(shortcode);
    }

    // Pause anti-detection
    const pause = DELAY_MIN + Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN));
    await new Promise((r) => setTimeout(r, pause));
  }

  return { results, failed };
}

module.exports = { scrapePosts };
