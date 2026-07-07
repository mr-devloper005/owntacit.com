import { slot4BrandConfig } from '@/editable/theme/brand.config'

/*
  Reference-Library framing. Nav has no task links; footer discovery lists ONLY
  the renamed Reference Library. Copy is written for a resource / archive
  audience — never generic SaaS.
*/
export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'An open reference archive',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  nav: {
    tagline: 'A quiet reference archive',
    primaryLinks: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    actions: {
      primary: { label: 'Get started', href: '/signup' },
      secondary: { label: 'Search', href: '/search' },
    },
  },
  footer: {
    tagline: 'A working reference archive',
    description: 'A slow, careful archive of downloadable references, working documents, and long-lived resources — kept legible, searchable, and free to browse.',
    columns: [
      {
        title: 'Discovery',
        links: [
          { label: 'Reference Library', href: '/pdf' },
          { label: 'Search the archive', href: '/search' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    ],
    bottomNote: 'Built quietly. Read carefully.',
  },
  commonLabels: {
    readMore: 'Continue reading',
    viewAll: 'See the archive',
    explore: 'Browse',
    latest: 'Newest',
    related: 'Related references',
    published: 'Filed',
  },
} as const
