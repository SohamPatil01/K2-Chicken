/**
 * Fallback images sourced from the HTML design reference (k2chicken.html).
 * Used when a product has no image_url in the database.
 * Matched by lowercased product name keywords, most-specific first.
 */
const KEYWORD_IMAGE_MAP: [string[], string][] = [
  // Specific cuts first
  [["tikka"], "https://kimi-web-img.moonshot.cn/img/www.thespruceeats.com/9a63883f4bfe67b944fd70db11108e4e7cc0a143.jpg"],
  [["peri"], "https://kimi-web-img.moonshot.cn/img/www.shutterstock.com/e9fc424626a4cdebec1c913e62f7eea4d91f369a.jpg"],
  [["tandoori"], "https://kimi-web-img.moonshot.cn/img/www.bbassets.com/1e58dc16a316b76449bbfa5e7b52da24188c7900.jpg"],
  [["biryani"], "https://kimi-web-img.moonshot.cn/img/www.bbassets.com/88132760dc598bfa84513c1d06bcba68fddf79dc.jpg"],
  [["butterflied", "fillet"], "https://kimi-web-img.moonshot.cn/img/thumbs.dreamstime.com/bdd3886b3cd000a6759a8d5bfbba9d6f31b9ec1b.jpg"],
  [["soup", "bone", "carcass"], "https://kimi-web-img.moonshot.cn/img/assets.hyperpure.com/a3a8e448f387270ce4e40ed9e261ab74408385c9.jpeg"],
  [["gizzard"], "https://kimi-web-img.moonshot.cn/img/www.shutterstock.com/fb02870c859e6683a6ed7d781fa8d546929e12a9.jpg"],
  [["liver"], "https://kimi-web-img.moonshot.cn/img/www.shutterstock.com/fb02870c859e6683a6ed7d781fa8d546929e12a9.jpg"],
  [["mince", "keema", "kheema"], "https://kimi-web-img.moonshot.cn/img/shoplineimg.com/62df4adcfa097d84f89f345d1ec560f282d27517.jpg"],
  [["wing"], "https://kimi-web-img.moonshot.cn/img/onestophalal.com/f26ae8db86477b04ea6cf7f3a30ec4f1175fb252.jpg"],
  [["leg quarter", "leg"], "https://kimi-web-img.moonshot.cn/img/assets.tendercuts.in/5fa64d1ab650743d25f21156c24dd0bef06a8edf.jpg"],
  [["drumstick"], "https://kimi-web-img.moonshot.cn/img/rollingwoodfarms.com/bf703c09d3970f00266fa9480f7bd35adecce33f.jpg"],
  [["thigh"], "https://kimi-web-img.moonshot.cn/img/www.stillmanqualitymeats.com/db9e4d8fcbecdab547c341b8389f14d957679e89.jpg"],
  [["breast"], "https://kimi-web-img.moonshot.cn/img/static.vecteezy.com/5339c9121c7a3481ddc70f0574454df60ebc1a6f.jpg"],
  [["curry cut", "curry"], "https://kimi-web-img.moonshot.cn/img/godavaricuts.com/747b5042a020e44cbf486a9eed119bbca686fe46.jpg"],
  [["whole", "full bird", "dressed"], "https://kimi-web-img.moonshot.cn/img/5.imimg.com/fb727c0dea5b0f27e5a26035d675c74dba083be4.png"],
];

/** Returns a fallback image URL for a product based on its name. */
export function getProductFallbackImage(productName: string): string {
  const lower = productName.toLowerCase();
  for (const [keywords, url] of KEYWORD_IMAGE_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return url;
  }
  // Generic chicken fallback
  return "https://kimi-web-img.moonshot.cn/img/5.imimg.com/fb727c0dea5b0f27e5a26035d675c74dba083be4.png";
}
