import type { TaskKey } from '@/lib/site-config'

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

/*
  Voices for public archive headers.
  The renamed pdf label ("Reference Library") is the public-facing surface.
  The renamed profile label ("Contributor") is copy-only, only used on the
  profile detail page (which is direct-URL-only).
*/
export const taskPageVoices = {
  article: {
    eyebrow: '(Notes)',
    headline: 'Editorial notes filed alongside the archive.',
    description: 'Short essays and long-form notes written to accompany the reference shelves.',
    filterLabel: 'Filter notes',
    secondaryNote: 'Notes are companions to the archive — read them slowly.',
    chips: ['Filed slowly', 'Written by hand', 'Read at your pace'],
  },
  classified: {
    eyebrow: '(Board)',
    headline: 'Time-sensitive notices from the archive.',
    description: 'Short, practical notices tied to the working archive.',
    filterLabel: 'Filter notice type',
    secondaryNote: 'Notices come and go — the archive stays.',
    chips: ['Short-form', 'Time-bound', 'Practical'],
  },
  sbm: {
    eyebrow: '(Bookmarks)',
    headline: 'Curated links that sit alongside the shelves.',
    description: 'Outside references worth pinning to the archive.',
    filterLabel: 'Filter collection',
    secondaryNote: 'Not everything worth reading lives on this shelf.',
    chips: ['External', 'Curated', 'Kept close'],
  },
  profile: {
    eyebrow: '(Contributor)',
    headline: 'A private contributor record.',
    description: 'This page exists as a direct-link record and is not surfaced anywhere else on the site.',
    filterLabel: 'Filter record',
    secondaryNote: 'Contributor records are unlisted by design.',
    chips: ['Direct link only', 'Unlisted', 'Contributor record'],
  },
  pdf: {
    eyebrow: '(Reference Library)',
    headline: 'The Reference Library — filed, downloadable, open to read.',
    description: 'Every filed reference: working papers, downloadable reports, and long-form documents — catalogued with a short editorial note and a live preview.',
    filterLabel: 'Filter shelf',
    secondaryNote: 'Fewer references, better introductions.',
    chips: ['Downloadable', 'Filed with notes', 'Kept open'],
  },
  listing: {
    eyebrow: '(Directory)',
    headline: 'A quiet directory of entries tied to the archive.',
    description: 'Entries connected to the working archive, listed plainly.',
    filterLabel: 'Filter category',
    secondaryNote: 'Directory entries are plain by intent.',
    chips: ['Plain', 'Practical', 'Connected'],
  },
  image: {
    eyebrow: '(Visuals)',
    headline: 'Visuals filed alongside the reference archive.',
    description: 'Image-led entries that accompany the archive shelves.',
    filterLabel: 'Filter visual category',
    secondaryNote: 'Images kept plainly, in service of the archive.',
    chips: ['Gallery', 'Plainly filed', 'In service'],
  },
} satisfies Record<TaskKey, TaskPageVoice>
