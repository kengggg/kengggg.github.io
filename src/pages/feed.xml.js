import rss from '@astrojs/rss';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import { fetchPublishedPosts, sortPostsByDate } from '../utils/posts';

export async function GET(context) {
  const posts = await fetchPublishedPosts();
  const sortedPosts = sortPostsByDate(posts);

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt || '',
      link: `/blog/${post.slug}/`,
    })),
  });
}
