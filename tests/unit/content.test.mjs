import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readPosts } from '../../scripts/content-checks.mjs';
import { formatDate, formatDateISO } from '../../src/utils/date.ts';
import rehypeContent from '../../scripts/rehype-content.mjs';

test('calendar dates stay consistent across build timezones', () => {
  const previous = process.env.TZ;
  try {
    for (const tz of ['UTC', 'Asia/Bangkok', 'America/Los_Angeles']) {
      process.env.TZ = tz;
      assert.equal(formatDate(new Date('2022-05-27')), '27 May 2022');
      assert.equal(formatDateISO(new Date('2022-05-27')), '2022-05-27');
    }
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

test('slugs must be explicit, unique and date-free', async () => {
  const root = await mkdtemp(join(tmpdir(), 'patipat-slugs-'));
  const directory = join(root, 'src/content/blog');
  await mkdir(directory, { recursive: true });
  try {
    for (const slug of [null, '2022-05-27-title', '2', '../escape']) {
      await writeFile(join(directory, 'post.md'), `---\ntitle: Test\n${slug ? `slug: ${slug}\n` : ''}---\nBody`);
      await assert.rejects(readPosts(root), /explicit, date-free slug/);
    }
    await writeFile(join(directory, 'post.md'), '---\nslug: original-url\n---\nBody');
    assert.equal((await readPosts(root))[0].slug, 'original-url');
    await writeFile(join(directory, 'other.md'), '---\nslug: original-url\n---\nBody');
    await assert.rejects(readPosts(root), /duplicate slug/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('build-time image formatting preserves surrounding text and multiple images', () => {
  const image = () => ({ type: 'element', tagName: 'img', properties: { src: '/example.webp' }, children: [] });
  const paragraph = { type: 'element', tagName: 'p', properties: {}, children: [{ type: 'text', value: 'Caption before ' }, image(), { type: 'text', value: ' and after.' }, image()] };
  const standalone = { type: 'element', tagName: 'p', properties: {}, children: [image()] };
  const tree = { type: 'root', children: [paragraph, standalone] };
  rehypeContent()(tree);
  assert.equal(paragraph.tagName, 'p');
  assert.equal(paragraph.children.length, 4);
  assert.equal(paragraph.children[0].value, 'Caption before ');
  assert.equal(paragraph.children[2].value, ' and after.');
  assert.equal(standalone.tagName, 'div');
  assert.equal(standalone.children[0].properties.loading, 'lazy');
});

test('article sections begin at h2 whether authors start at h1 or h2', () => {
  for (const firstLevel of [1, 2]) {
    const tree = { type: 'root', children: [firstLevel, firstLevel + 1].map((level) => ({ type: 'element', tagName: `h${level}`, properties: {}, children: [] })) };
    rehypeContent()(tree);
    assert.deepEqual(tree.children.map((node) => node.tagName), ['h2', 'h3']);
  }
});
