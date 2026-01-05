import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogEntry = CollectionEntry<'blog'>;

export async function fetchPublishedPosts(): Promise<BlogEntry[]> {
  return getCollection('blog', ({ data }) => !data.draft);
}

export function sortPostsByDate(posts: BlogEntry[]): BlogEntry[] {
  return [...posts].sort(
    (first, second) =>
      new Date(second.data.date).getTime() - new Date(first.data.date).getTime()
  );
}

export function paginatePosts(
  posts: BlogEntry[],
  postsPerPage: number,
  page = 1
): { posts: BlogEntry[]; totalPages: number; currentPage: number } {
  const totalPages = Math.max(1, Math.ceil(posts.length / postsPerPage));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;

  return {
    posts: posts.slice(startIndex, endIndex),
    totalPages,
    currentPage,
  };
}

export function buildPaginationPaths(
  posts: BlogEntry[],
  postsPerPage: number,
  startingPage = 2
) {
  const sortedPosts = sortPostsByDate(posts);
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
  const paths = [] as Array<{
    params: { page: string };
    props: { posts: BlogEntry[]; currentPage: number; totalPages: number };
  }>;

  for (let page = startingPage; page <= totalPages; page++) {
    const { posts: pagePosts } = paginatePosts(sortedPosts, postsPerPage, page);

    paths.push({
      params: { page: String(page) },
      props: {
        posts: pagePosts,
        currentPage: page,
        totalPages,
      },
    });
  }

  return paths;
}
