import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '..', '_posts');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');

async function migratePosts() {
  try {
    const files = await fs.readdir(POSTS_DIR);

    for (const file of files) {
      if (!file.endsWith('.md')) continue;

      const content = await fs.readFile(path.join(POSTS_DIR, file), 'utf-8');

      // Parse front matter
      const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontMatterMatch) {
        console.log(`Skipping ${file}: No front matter found`);
        continue;
      }

      const frontMatter = frontMatterMatch[1];
      const body = content.slice(frontMatterMatch[0].length).trim();

      // Parse front matter lines
      const lines = frontMatter.split('\n');
      const newLines = [];

      for (const line of lines) {
        // Skip layout line
        if (line.startsWith('layout:')) continue;

        // Convert date format if needed (ensure proper YAML date)
        if (line.startsWith('date:')) {
          const dateMatch = line.match(/date:\s*['"]?(\d{4}-\d{2}-\d{2})['"]?/);
          if (dateMatch) {
            newLines.push(`date: ${dateMatch[1]}`);
            continue;
          }
        }

        newLines.push(line);
      }

      // Reconstruct file
      const newContent = `---\n${newLines.join('\n')}\n---\n\n${body}\n`;

      // Write to output directory
      await fs.writeFile(path.join(OUTPUT_DIR, file), newContent);
      console.log(`Migrated: ${file}`);
    }

    console.log('\nMigration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migratePosts();
