import { cp, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

// Enforce stable URLs and reject duplicates before the glob loader syncs content.
export async function readPosts(root) {
  const directory = join(root, 'src/content/blog');
  const entries = await readdir(directory, { recursive: true });
  const slugs = new Set();
  const posts = [];
  for (const file of entries.filter((name) => name.endsWith('.md')).sort()) {
    const source = await readFile(join(directory, file), 'utf8');
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!frontmatter) throw new Error(`${file}: missing YAML frontmatter`);
    const data = parse(frontmatter[1]);
    const slug = data?.slug;
    if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || /^\d{4}-\d{2}-\d{2}-/.test(slug) || /^\d+$/.test(slug)) {
      throw new Error(`${file}: set an explicit, date-free slug (for example: jekyll-on-apple-silicon)`);
    }
    if (slugs.has(slug)) throw new Error(`${file}: duplicate slug "${slug}"`);
    slugs.add(slug);
    posts.push({ ...data, file });
  }
  return posts;
}

export function contentChecks() {
  let root;
  return {
    name: 'content-checks',
    hooks: {
      'astro:config:setup': async ({ config }) => {
        root = fileURLToPath(config.root);
        await readPosts(root);
      },
      'astro:build:done': async ({ dir }) => {
        // Retain previously published image URLs while pages use optimized assets.
        await cp(join(root, 'src/assets/images'), new URL('images/', dir), { recursive: true });
      },
    },
  };
}
