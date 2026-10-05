import rss from '@astrojs/rss';
import { settings } from '../data/settings';
import { fetchPublishedPosts, sortPostsByDate } from '../utils/posts';

export async function GET(context) {
  const posts = await fetchPublishedPosts();
  const sortedPosts = sortPostsByDate(posts);

  return rss({
    title: settings.title,
    description: settings.description,
    site: context.site,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt || '',
      link: `/blog/${post.id}/`,
    })),
  });
}
