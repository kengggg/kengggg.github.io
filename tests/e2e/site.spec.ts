import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { settings } from '../../src/data/settings';

const thaiPost = '/blog/no-thai-numbers-in-governmental-documents/';
const englishPost = '/blog/jekyll-on-apple-silicon/';

test('original article URLs work and date-prefixed routes are gone', async ({ request }) => {
  expect((await request.get(englishPost)).status()).toBe(200);
  expect((await request.get('/blog/jekyll-on-apple-silicon')).status()).toBe(200);
  const removed = await request.get('/blog/2021-01-02-jekyll-on-apple-silicon/', { maxRedirects: 0 });
  expect(removed.status()).toBe(404);
});

test('navigation, metadata and back/forward agree', async ({ page }) => {
  await page.goto('/');
  await page.locator('.blog-post__title a').first().click();
  await expect(page).toHaveURL(thaiPost);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', settings.url + thaiPost);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('html')).toHaveAttribute('lang', 'th');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', settings.url + '/about/');
  await page.goBack();
  await expect(page).toHaveURL(thaiPost);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About');
});

test('a slower, superseded navigation cannot overwrite the newer page', async ({ page }) => {
  await page.goto('/');
  await page.route('**/blog/2/', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue().catch(() => {}); // Native navigation may cancel this request.
  });
  const started = page.waitForRequest('**/blog/2/');
  await page.getByRole('link', { name: 'Older Posts' }).click({ noWaitAfter: true });
  await started;
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About', exact: true }).click();
  // Wait beyond the intentionally delayed response to catch a stale overwrite.
  await page.waitForTimeout(1800);
  await expect(page).toHaveURL('/about/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', settings.url + '/about/');
});

test('mobile content and navigation work without JavaScript or images', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.route('**/*', (route) => route.request().resourceType() === 'image' ? route.abort() : route.continue());
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.locator('.blog-post__title').first()).toBeVisible();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About');
  await context.close();
});

test('mobile menu works with keyboard, Escape and viewport changes', async ({ page, browserName }) => {
  // Safari on macOS uses Option-Tab to include links when Full Keyboard Access is off.
  const tab = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  await expect(menu).toBeVisible();
  await page.keyboard.press(tab);
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press(tab);
  await expect(page.locator('.header__title')).toBeFocused();
  await page.keyboard.press(tab);
  await expect(menu).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press(tab);
  await expect(page.getByRole('link', { name: 'Home', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(menu).toBeHidden();
  await expect(page.getByRole('link', { name: 'About', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 320, height: 700 });
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('responsive images reserve space and defer distant cards', async ({ page, browserName }) => {
  await page.goto('/');
  const last = page.locator('.blog-post__image img').last();
  await expect(last).toHaveAttribute('loading', 'lazy');
  await expect(last).toHaveAttribute('srcset', /320w.*640w/);
  expect(await last.evaluate((img: HTMLImageElement) => Number(img.getAttribute('width')) > 0 && Number(img.getAttribute('height')) > 0)).toBe(true);
  if (browserName === 'chromium') {
    expect(await last.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(0);
  }
  await last.scrollIntoViewIfNeeded();
  await expect.poll(() => last.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});

test('pagination shows each article once and returns to the homepage', async ({ page, request }) => {
  const feed = await (await request.get('/feed.xml')).text();
  const expectedCount = (feed.match(/<item>/g) || []).length;
  const seen = new Set<string>();
  await page.goto('/');
  for (let i = 0; i < Math.ceil(expectedCount / settings.postsPerPage); i++) {
    const links = await page.locator('.blog-post__title a').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')!));
    for (const href of links) { expect(seen.has(href)).toBe(false); seen.add(href); }
    const next = page.getByRole('link', { name: 'Older Posts' });
    if (!await next.count()) break;
    await next.click();
  }
  expect(seen.size).toBe(expectedCount);
  await page.goto('/blog/2/');
  await page.getByRole('link', { name: 'Newer Posts' }).click();
  await expect(page).toHaveURL('/');
});

for (const path of ['/', '/about/', thaiPost, englishPost]) {
  test(`accessible page and responsive layout: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
    await page.setViewportSize({ width: 320, height: 700 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('main')).toBeVisible();
  });
}
