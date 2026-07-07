import type { CSSProperties } from 'react'

/*
  Design contract for kitpro-silentlab reference.
  Monochrome palette, soft-corner buttons, bordered cards, huge typography.
  All colors ship via CSS variables — never hardcode the palette in JSX.
*/

export const editableRootStyle = {
  '--slot4-page-bg': '#ffffff',
  '--slot4-page-text': '#000000',
  '--slot4-panel-bg': '#f5f5f5',       // whitesmoke
  '--slot4-surface-bg': '#ffffff',
  '--slot4-muted-text': '#5d5d5d',     // dark-grey
  '--slot4-soft-muted-text': '#9c9c9c', // grey
  '--slot4-line': '#d1d1d1',           // border-secondary
  '--slot4-line-strong': '#9c9c9c',
  '--slot4-accent': '#000000',         // black is the accent surface
  '--slot4-accent-fill': '#000000',
  '--slot4-accent-soft': '#f5f5f5',
  '--slot4-on-accent': '#f8f7f0',      // cream text on black
  '--slot4-dark-bg': '#000000',
  '--slot4-dark-text': '#f8f7f0',
  '--slot4-sub-black': '#1e1e1e',
  '--slot4-media-bg': '#f5f5f5',
  '--slot4-cream': '#f8f7f0',
  '--slot4-warm': '#ffffff',
  '--slot4-gray': '#f5f5f5',
  '--slot4-body-gradient': 'none',
  '--editable-page-bg': '#ffffff',
  '--editable-page-text': '#000000',
  '--editable-container': '1360px',
  '--editable-border': '#d1d1d1',
  '--editable-border-strong': '#9c9c9c',
  '--editable-nav-bg': '#ffffff',
  '--editable-nav-text': '#000000',
  '--editable-nav-active': '#000000',
  '--editable-nav-active-text': '#f8f7f0',
  '--editable-cta-bg': '#000000',
  '--editable-cta-text': '#f8f7f0',
  '--editable-search-bg': '#ffffff',
  '--editable-footer-bg': '#000000',
  '--editable-footer-text': '#f8f7f0',
  '--editable-radius-button': '0.35rem',
  '--editable-radius-card': '0.6rem',
  '--editable-radius-input': '0.35rem',
  '--editable-radius-tag': '0.35rem',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-page-text)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-cream)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-warm)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-[var(--editable-border)]',
  darkBorder: 'border-white/12',
  shadow: 'shadow-[0_1px_0_rgba(0,0,0,0.04)]',
  shadowStrong: 'shadow-[0_18px_60px_rgba(0,0,0,0.10)]',
  overlay: 'bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.72))]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-10',
    sectionY: 'py-16 sm:py-24 lg:py-32',
    sectionYTight: 'py-12 sm:py-16 lg:py-20',
  },
  layout: {
    safeGrid: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center',
    rail: 'flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[280px] shrink-0 snap-start sm:w-[320px]',
  },
  type: {
    // Mono eyebrow chip, all-caps, tight tracking. DM Mono is the base body face.
    eyebrow: 'editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]',
    // HUGE hero display, Public Sans 700, tight neg letter-spacing (mimics 11vw h1).
    heroTitle: 'editable-display text-[clamp(2.6rem,10vw,10rem)] font-black leading-[0.94] tracking-[-0.02em]',
    sectionTitle: 'editable-display text-[clamp(2rem,6.5vw,4.6rem)] font-black leading-[1.02] tracking-[-0.015em]',
    subSectionTitle: 'editable-display text-[clamp(1.5rem,4vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.01em]',
    body: 'text-[15px] leading-[1.75] text-[var(--slot4-muted-text)] font-light',
    lead: 'text-[clamp(1rem,1.4vw,1.25rem)] leading-[1.7] text-[var(--slot4-muted-text)] font-light',
    emphasis: 'editable-display italic text-[var(--slot4-page-text)] font-medium',
  },
  surface: {
    // Bordered cards, subtle radius (0.6rem card / 1vw desktop-feel).
    card: `rounded-[var(--editable-radius-card)] border ${editablePalette.border} ${editablePalette.surfaceBg}`,
    soft: `rounded-[var(--editable-radius-card)] border ${editablePalette.border} ${editablePalette.panelBg}`,
    dark: `rounded-[var(--editable-radius-card)] ${editablePalette.darkBg} ${editablePalette.darkText}`,
    hairline: `border ${editablePalette.border}`,
  },
  button: {
    // Soft-corner buttons: barely rounded, DM Mono label, cream on black.
    primary: `inline-flex items-center justify-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--slot4-accent-fill)] px-6 py-3 text-[13px] font-medium uppercase tracking-[0.12em] text-[var(--slot4-on-accent)] editable-mono transition duration-300 hover:bg-[var(--slot4-sub-black)] active:scale-[0.985]`,
    secondary: `inline-flex items-center justify-center gap-2 rounded-[var(--editable-radius-button)] border border-[var(--slot4-line-strong)] bg-transparent px-6 py-3 text-[13px] font-medium uppercase tracking-[0.12em] text-[var(--slot4-page-text)] editable-mono transition duration-300 hover:bg-[var(--slot4-page-text)] hover:text-[var(--slot4-on-accent)] active:scale-[0.985]`,
    accent: `inline-flex items-center justify-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--slot4-accent-fill)] px-6 py-3 text-[13px] font-medium uppercase tracking-[0.12em] text-[var(--slot4-on-accent)] editable-mono transition duration-300 hover:bg-[var(--slot4-sub-black)] active:scale-[0.985]`,
    ghost: `inline-flex items-center justify-center gap-2 rounded-[var(--editable-radius-button)] px-4 py-2.5 text-[13px] font-medium uppercase tracking-[0.12em] text-[var(--slot4-page-text)] editable-mono transition duration-300 hover:text-[var(--slot4-muted-text)]`,
    onDark: `inline-flex items-center justify-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--slot4-on-accent)] px-6 py-3 text-[13px] font-medium uppercase tracking-[0.12em] text-[var(--slot4-page-text)] editable-mono transition duration-300 hover:bg-white active:scale-[0.985]`,
  },
  badge: {
    pill: `inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-muted-text)] editable-mono`,
    accentPill: `inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-on-accent)] editable-mono`,
    tag: `inline-flex items-center gap-1 rounded-[var(--editable-radius-tag)] border border-[var(--editable-border)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--slot4-muted-text)] editable-mono`,
  },
  media: {
    frame: `relative overflow-hidden rounded-[var(--editable-radius-card)] border border-[var(--editable-border)] ${editablePalette.mediaBg}`,
    frameFull: `relative overflow-hidden rounded-[var(--editable-radius-card)] ${editablePalette.mediaBg}`,
    ratio: 'aspect-[4/5]',
    ratioWide: 'aspect-[16/10]',
    ratioSquare: 'aspect-square',
  },
  motion: {
    lift: 'transition duration-500 hover:-translate-y-1',
    fade: 'transition duration-300 hover:opacity-70',
    zoom: 'transition duration-700 group-hover:scale-[1.03]',
  },
} as const

export const aiLayoutRules = [
  'All colors come from CSS vars in editableRootStyle — never hardcode reference palette in JSX.',
  'Display face = Public Sans (700+), body face = DM Mono (300).',
  'Buttons are soft-corner (0.35rem), NOT pill and NOT sharp.',
  'Cards are bordered with subtle radius; no heavy drop-shadow.',
  'Home hero uses a truly huge display size (clamp 2.6rem–10vw).',
  'Never surface profiles in public feeds; footer discovery lists Reference Library only.',
] as const
