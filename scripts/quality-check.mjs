import { existsSync, readFileSync } from 'node:fs';

const required = [
  'dist/index.html',
  'dist/check/index.html',
  'dist/consult/index.html',
  'dist/contact/index.html',
  'dist/privacy/index.html',
  'dist/terms/index.html',
  'dist/advertising/index.html',
  'dist/sitemap-index.xml',
];

const missing = required.filter((path) => !existsSync(path));
if (missing.length) {
  console.error('Missing build outputs:', missing.join(', '));
  process.exit(1);
}

const check = readFileSync('dist/check/index.html', 'utf8');
if (!check.includes('欲求MAPセルフチェック')) throw new Error('Check page title missing');
if (!check.includes('医学的・心理学的診断')) throw new Error('Non-diagnostic disclaimer missing');

const consult = readFileSync('dist/consult/index.html', 'utf8');
if (!consult.includes('匿名相談')) throw new Error('Consult page missing');
if (!consult.includes('18歳以上')) throw new Error('Adult notice missing');

console.log('Quality check passed.');
