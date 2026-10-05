import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'parse5';
import { readPosts } from './content-checks.mjs';

export async function checkBuild(root = process.cwd(), site = 'https://patipat.org') {
  const dist = join(root, 'dist');
  const posts = await readPosts(root);
  const published = posts.filter((post) => !post.draft);
  const exists = async (file) => stat(file).then((s) => s.isFile()).catch(() => false);
  for (const post of posts) {
    assert.equal(await exists(join(dist, 'blog', post.slug, 'index.html')), !post.draft, `Publication rule: ${post.slug}`);
    const oldName = post.file.replace(/\.md$/, '');
    if (oldName !== post.slug) assert.equal(await exists(join(dist, 'blog', oldName, 'index.html')), false, `Date-prefixed route remains: ${oldName}`);
  }

  const sitemap = await readFile(join(dist, 'sitemap-0.xml'), 'utf8');
  const feed = await readFile(join(dist, 'feed.xml'), 'utf8');
  assert.equal((feed.match(/<item>/g) || []).length, published.length, 'RSS must contain every published post');
  for (const post of posts) {
    const url = `${site}/blog/${post.slug}/`;
    assert.equal(sitemap.includes(url), !post.draft, `Sitemap publication rule: ${post.slug}`);
    assert.equal(feed.includes(url), !post.draft, `RSS publication rule: ${post.slug}`);
  }

  const files = (await readdir(dist, { recursive: true })).filter((name) => name.endsWith('.html'));
  let imageCount = 0;
  for (const file of files) {
    const html = await readFile(join(dist, file), 'utf8');
    const nodes = [];
    function walk(node) {
      if (node.tagName) nodes.push({ tag: node.tagName, attrs: Object.fromEntries((node.attrs || []).map(({ name, value }) => [name, value])) });
      for (const child of node.childNodes || []) walk(child);
    }
    walk(parse(html));
    assert.equal(nodes.filter((n) => n.tag === 'main').length, 1, `${file}: exactly one main landmark`);
    assert.equal(nodes.filter((n) => n.tag === 'h1').length, 1, `${file}: exactly one h1`);
    assert.ok(['th', 'en'].includes(nodes.find((n) => n.tag === 'html')?.attrs.lang), `${file}: page language`);
    const pagePath = '/' + relative(dist, join(dist, file)).replace(/index\.html$/, '');
    if (file === '404.html') {
      assert.equal(nodes.find((n) => n.tag === 'meta' && n.attrs.name === 'robots')?.attrs.content, 'noindex', '404 must be excluded from indexing');
    } else {
      assert.equal(nodes.find((n) => n.tag === 'link' && n.attrs.rel === 'canonical')?.attrs.href, site + pagePath, `${file}: canonical URL`);
    }
    const ids = new Set(nodes.map((n) => n.attrs.id).filter(Boolean));
    for (const { tag, attrs } of nodes) {
      if (tag === 'img') {
        imageCount++;
        assert.ok('alt' in attrs, `${file}: image alt attribute`);
        assert.ok(Number(attrs.width) > 0 && Number(attrs.height) > 0, `${file}: image dimensions for ${attrs.src}`);
        assert.ok(['lazy', 'eager'].includes(attrs.loading), `${file}: explicit image loading for ${attrs.src}`);
      }
      if (tag === 'iframe') assert.ok(attrs.title, `${file}: iframe title`);
      const refs = [attrs.href, attrs.src, ...(attrs.srcset?.split(',').map((s) => s.trim().split(/\s+/)[0]) || [])].filter(Boolean);
      for (const ref of refs) {
        if (ref.startsWith('#')) {
          if (ref !== '#') assert.ok(ids.has(decodeURIComponent(ref.slice(1))), `${file}: missing anchor ${ref}`);
          continue;
        }
        const url = new URL(ref, site + pagePath);
        if (url.origin !== site || !['http:', 'https:'].includes(url.protocol)) continue;
        const path = join(dist, decodeURIComponent(url.pathname));
        assert.ok(await exists(path) || await exists(join(path, 'index.html')), `${file}: broken internal reference ${ref}`);
      }
    }
    for (const draft of posts.filter((p) => p.draft)) assert.ok(!html.includes(`/blog/${draft.slug}/`), `${file}: draft link leaked`);
  }
  return { pages: files.length, publishedPosts: published.length, images: imageCount };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { settings } = await import('../src/data/settings.ts');
  console.log('Build checks passed:', await checkBuild(process.cwd(), settings.url));
}
