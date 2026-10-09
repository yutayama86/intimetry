import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';

const SITE = 'https://intimetry.com';

const required = [
  'dist/index.html',
  'dist/check/index.html',
  'dist/consult/index.html',
  'dist/contact/index.html',
  'dist/about/index.html',
  'dist/articles/index.html',
  'dist/privacy/index.html',
  'dist/terms/index.html',
  'dist/advertising/index.html',
  'dist/robots.txt',
  'dist/sitemap-index.xml',
  'dist/sitemap-0.xml',
];

const missing = required.filter((path) => !existsSync(path));
if (missing.length) {
  console.error('Missing build outputs:', missing.join(', '));
  process.exit(1);
}

const read = (path) => readFileSync(path, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const htmlPages = required.filter((path) => path.endsWith('.html'));
for (const path of htmlPages) {
  const html = read(path);
  assert(/<title>[^<]+<\/title>/i.test(html), `Missing <title>: ${path}`);
  assert(/<meta name="description" content="[^"]+"/i.test(html), `Missing meta description: ${path}`);
  assert(/<link rel="canonical" href="https:\/\/intimetry\.com\//i.test(html), `Wrong/missing canonical: ${path}`);
  assert(html.includes('application/ld+json'), `Missing JSON-LD: ${path}`);
  assert(!html.includes('intimetry.example'), `Placeholder domain leaked: ${path}`);
}

const index = read('dist/index.html');
assert(index.includes('性生活を、もっと豊かに。'), 'Mission missing on home');
assert(index.includes('欲求を、わかる言葉に。'), 'Tagline missing on home');
assert(index.includes('G-93GRSHCET0'), 'GA4 measurement ID missing from production build');
assert(index.includes('googletagmanager.com/gtag/js'), 'GA4 gtag loader missing from production build');

const check = read('dist/check/index.html');
assert(check.includes('欲求MAPセルフチェック'), 'Check page title missing');
assert(check.includes('医学的・心理学的診断'), 'Non-diagnostic disclaimer missing');

const consult = read('dist/consult/index.html');
assert(consult.includes('匿名相談'), 'Consult page missing');
assert(consult.includes('18歳以上'), 'Adult notice missing');
assert(consult.includes('プライバシーポリシー'), 'Consult privacy link missing');

const privacy = read('dist/privacy/index.html');
assert(privacy.includes('セルフチェック回答'), 'Privacy: check-answer handling missing');
assert(privacy.includes('Cloudflare'), 'Privacy: infrastructure processing disclosure missing');
assert(privacy.includes('匿名相談'), 'Privacy: consult handling missing');

const terms = read('dist/terms/index.html');
assert(terms.includes('18歳以上'), 'Terms: adult restriction missing');
assert(terms.includes('診断'), 'Terms: non-diagnostic position missing');

const robots = read('dist/robots.txt');
assert(robots.includes('User-agent: *'), 'robots.txt missing User-agent');
assert(robots.includes('Allow: /'), 'robots.txt missing Allow');
assert(robots.includes(`Sitemap: ${SITE}/sitemap-index.xml`), 'robots.txt sitemap URL incorrect');

const sitemapIndex = read('dist/sitemap-index.xml');
assert(sitemapIndex.includes('sitemap-0.xml'), 'sitemap-index.xml does not reference sitemap-0.xml');

const sitemap = read('dist/sitemap-0.xml');
for (const url of [
  `${SITE}/`,
  `${SITE}/check/`,
  `${SITE}/consult/`,
  `${SITE}/articles/`,
  `${SITE}/about/`,
]) {
  assert(sitemap.includes(url), `Sitemap missing URL: ${url}`);
}
assert(!sitemap.includes('intimetry.example'), 'Placeholder domain leaked into sitemap');

const analytics = read('src/lib/analytics.ts');
for (const event of [
  'diagnosis_start',
  'diagnosis_complete',
  'result_share',
  'recommendation_click',
  'contact_submit',
  'consult_submit',
]) {
  assert(analytics.includes(event), `Analytics event missing: ${event}`);
}

const consultSource = read('src/pages/consult/index.astro');
assert(!consultSource.includes("message:String("), 'Potential consult body sent to analytics');


// Affiliate guardrails (docs/AFFILIATE.md): links only on approved pages, PR notice before the title, rel=sponsored, no placeholders.
const AFFILIATE_ALLOWED_PAGES = new Set([
  'dist/articles/when-boyfriend-doesnt-initiate/index.html',
  'dist/articles/decline-without-guilt/index.html',
  'dist/articles/newlywed-sexless/index.html',
]);
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = `${dir}/${name}`;
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
for (const path of walk('dist').filter((file) => file.endsWith('.html'))) {
  const html = read(path);
  assert(!html.includes('REPLACE_WITH_'), `Placeholder left in build output: ${path}`);
  const links = html.match(/<a\b[^>]*href="https:\/\/px\.a8\.net[^"]*"[^>]*>/g) || [];
  if (links.length === 0) continue;
  assert(AFFILIATE_ALLOWED_PAGES.has(path), `Affiliate link on a page that is not approved: ${path}`);
  const notice = html.indexOf('class="pr-notice"');
  const title = html.indexOf('<h1');
  assert(notice !== -1 && title !== -1 && notice < title, `PR notice must appear before the title: ${path}`);
  for (const tag of links) {
    assert(/rel="[^"]*\bsponsored\b[^"]*"/.test(tag), `Affiliate link must have rel=sponsored: ${path}`);
    assert(!/a8mat=(TEST|PENDING|HFDT\+MHI\+YIP)/.test(tag), `Sample or placeholder affiliate link: ${path}`);
  }
}

console.log('Launch quality checks passed.');
