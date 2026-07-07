import { slot4BrandConfig } from '@/editable/theme/brand.config'

/*
  Copy for a Reference-Library first platform (kitpro-silentlab reference).
  Public surface centers on documents / references / resources. Never mention
  profiles publicly — they exist internally but are unlinked in the UI.
*/
export const pagesContent = {
  home: {
    metadata: {
      title: `${slot4BrandConfig.siteName} — a working reference archive`,
      description: 'A slow, curated archive of downloadable references, reports and working documents. Browse by category, save what you need.',
      openGraphTitle: `${slot4BrandConfig.siteName} — reference archive`,
      openGraphDescription: 'Downloadable references, reports and working documents, quietly catalogued for the long read.',
      keywords: ['reference library', 'downloadable references', 'working documents', 'archive'],
    },
    hero: {
      badge: '(01) The archive',
      title: ['A quiet reference archive', 'for the long read.'],
      description: 'Downloadable references, reports and working documents — collected slowly, filed carefully, and left open for anyone to browse.',
      primaryCta: { label: 'Enter the library', href: '/pdf' },
      secondaryCta: { label: 'Search the archive', href: '/search' },
      searchPlaceholder: 'Search references, categories, keywords…',
      focusLabel: 'On the shelf',
      featureCardBadge: 'Newest references',
      featureCardTitle: 'The latest references shape the visible spine of the archive.',
      featureCardDescription: 'Freshly filed documents anchor the home canvas — no invented content, no theatrical CTAs, just the archive as it stands today.',
    },
    intro: {
      badge: '(02) A note from the archive',
      title: 'A slower, better-lit place to browse working references.',
      paragraphs: [
        'Most reference sites treat documents as commodities — an endless scroll, no context, no shelf. This archive is the opposite: fewer files, better introductions, and the space to actually read them.',
        'Each reference is filed with a short editorial note, a document preview, and a way back into related material. Nothing is buried more than two clicks from the front page.',
        'What you find here is what has been carefully filed — not a firehose, not an algorithmic guess.',
      ],
      sideBadge: '(03) At a glance',
      sidePoints: [
        'Downloadable references paired with plainly written notes.',
        'A single, well-lit library — no bloated hub of half-features.',
        'Search across every filed document and its editorial context.',
        'Nothing is invented — only what has actually been catalogued.',
      ],
      primaryLink: { label: 'Enter the library', href: '/pdf' },
      secondaryLink: { label: 'About the archive', href: '/about' },
    },
    cta: {
      badge: '(04) Reading room',
      title: 'Everything filed. Nothing hidden.',
      description: 'Sit with the archive at your own pace. Download what you need. Come back when you need it again.',
      primaryCta: { label: 'Enter the library', href: '/pdf' },
      secondaryCta: { label: 'Talk to the curator', href: '/contact' },
    },
    taskSection: {
      heading: 'Filed under {label}',
      descriptionSuffix: 'The most recent additions to this shelf.',
    },
  },
  about: {
    badge: '(About)',
    title: 'A quiet archive, not a platform.',
    description: `${slot4BrandConfig.siteName} is a slow, curated shelf of downloadable references and working documents.`,
    paragraphs: [
      'This archive was built to hold the kind of documents you actually revisit — working papers, references, notes worth keeping.',
      'It is intentionally small, intentionally slow, and intentionally free of the noise you would expect on a modern content platform.',
      'What you find here is what has been filed. Nothing is invented, and nothing important is buried.',
    ],
    values: [
      {
        title: 'A single shelf',
        description: 'One well-lit reference library, browsable in minutes. No dashboards, no infinite feeds.',
      },
      {
        title: 'Written for readers',
        description: 'Every entry is paired with a plain-language note so the archive stays legible without prior context.',
      },
      {
        title: 'Filed to last',
        description: 'References are catalogued with care and kept accessible for as long as they remain useful.',
      },
    ],
  },
  contact: {
    eyebrow: `Reach ${slot4BrandConfig.siteName}`,
    title: 'A quiet inbox for the archive.',
    description: 'Tell us what you would like to file, correct, or find. Notes to the curator are read personally — not by a routing system.',
    formTitle: 'Write to the curator',
  },
  search: {
    metadata: {
      title: 'Search the archive',
      description: 'Search filed references, categories, notes and working documents.',
    },
    hero: {
      badge: '(Search)',
      title: 'Search filed references.',
      description: 'Use keywords, categories, or filed names to pull anything from the shelves.',
      placeholder: 'Search references by keyword, topic, or title',
    },
    resultsTitle: 'Recently filed',
  },
  create: {
    metadata: {
      title: 'Submit a reference',
      description: 'Submit a reference to the archive.',
    },
    locked: {
      badge: '(Restricted)',
      title: 'Sign in to submit a reference.',
      description: 'Open the submission workspace to file a reference into the shared archive.',
    },
    hero: {
      badge: '(Submit)',
      title: 'File a reference.',
      description: 'Add a document, write a short filing note, and place it on the right shelf.',
    },
    formTitle: 'Filing details',
    submitLabel: 'File this reference',
    successTitle: 'Filed. It will appear once reviewed.',
  },
  auth: {
    login: {
      metadataDescription: 'Sign in to the archive.',
      badge: '(Sign in)',
      title: 'Return to the reading room.',
      description: 'Sign in to file references, save drafts, and pick up where you left off.',
      formTitle: 'Sign in',
      submitLabel: 'Continue',
      noAccount: 'No account matched those details. Start with a new account.',
      success: 'Signed in. Redirecting…',
      createCta: 'Start a new account',
    },
    signup: {
      metadataDescription: 'Get started with the archive.',
      badge: '(Get started)',
      title: 'Open a filing account.',
      description: 'A filing account lets you submit references and hold drafts across sessions.',
      formTitle: 'Open an account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created. Redirecting…',
      loginCta: 'Sign in instead',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related notes',
      fallbackTitle: 'Filed note',
    },
    listing: {
      relatedTitle: 'Related entries',
      fallbackTitle: 'Directory entry',
    },
    image: {
      relatedTitle: 'Related visuals',
      fallbackTitle: 'Filed visual',
    },
    profile: {
      relatedTitle: 'Filed references',
      fallbackDescription: 'This contributor record is private and only reachable via a direct link.',
      visitButton: 'Open external site',
    },
  },
} as const
