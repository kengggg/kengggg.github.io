import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, writeFile, symlink, rm, readFile, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { checkBuild } from '../scripts/check-build.mjs';
import { settings } from '../src/data/settings.ts';

test('a draft is absent from built routes, listings, RSS and sitemap', { timeout: 120000 }, async () => {
  const root = process.cwd();
  const fixture = await realpath(await mkdtemp(join(tmpdir(), 'patipat-publishing-')));
  try {
    for (const path of ['src', 'public', 'scripts', 'astro.config.mjs', 'package.json', 'tsconfig.json']) {
      await cp(join(root, path), join(fixture, path), { recursive: true });
    }
    await symlink(join(root, 'node_modules'), join(fixture, 'node_modules'), 'dir');
    await writeFile(join(fixture, 'src/content/blog/2026-10-06-private-draft.md'), '---\nslug: private-draft\nlang: en\ntitle: UNPUBLISHED_DRAFT_PROBE\ndate: 2026-10-06\ndraft: true\n---\nPRIVATE_BODY_MUST_NOT_BE_PUBLISHED\n');
    execFileSync(process.execPath, [join(root, 'node_modules/astro/bin/astro.mjs'), 'build', '--root', fixture], {
      cwd: fixture, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' }, stdio: 'pipe', timeout: 100000,
    });
    const result = await checkBuild(fixture, settings.url);
    assert.ok(result.publishedPosts > 0);
    for (const path of ['index.html', 'feed.xml', 'sitemap-0.xml']) {
      assert.doesNotMatch(await readFile(join(fixture, 'dist', path), 'utf8'), /UNPUBLISHED_DRAFT_PROBE|PRIVATE_BODY_MUST_NOT_BE_PUBLISHED/);
    }
  } finally { await rm(fixture, { recursive: true, force: true }); }
});
