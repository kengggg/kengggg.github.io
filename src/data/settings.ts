// Site identity and publishing settings. Visual tokens live in styles/_variables.scss.
export const settings = {
  title: 'patipat.org',
  description: 'Random Access Memory.',
  url: 'https://patipat.org',
  author: 'Keng Susumpow',
  postsPerPage: 6,
  language: 'th',
  favicon: '/images/favicon.ico',
  twitterHandle: '@kengggg',
  fontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai+Looped:wght@400;600&display=swap',
  menu: [
    { title: 'Home', url: '/' },
    { title: 'About', url: '/about/' },
  ],
  social: [
    { title: 'Twitter', icon: 'twitter', url: 'https://twitter.com/kengggg' },
    { title: 'GitHub', icon: 'github', url: 'https://github.com/kengggg' },
  ],
} as const;

export type Language = 'th' | 'en';
