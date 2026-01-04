import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from '../consts';

export async function GET(context) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date))
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.excerpt || '',
        link: `/blog/${post.slug}/`,
      })),
  });
}
