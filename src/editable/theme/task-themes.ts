import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  Reference-library task surfaces (kitpro-silentlab).

  One shared visual language for every task — monochrome, mono/serif pairing,
  soft-corner surfaces. Only the kicker/note copy varies per task.
  The renamed pdf label ("Reference Library") is public; the renamed profile
  label ("Contributor") only ever surfaces on the profile detail page.
*/

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const FONT_DISPLAY = "'Public Sans', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
const FONT_BODY = "'DM Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

const base = {
  dark: false,
  fontDisplay: FONT_DISPLAY,
  fontBody: FONT_BODY,
  bg: '#ffffff',
  surface: '#ffffff',
  raised: '#f5f5f5',
  text: '#000000',
  muted: '#5d5d5d',
  line: '#d1d1d1',
  accent: '#000000',
  accentSoft: '#f5f5f5',
  onAccent: '#f8f7f0',
  glow: 'rgba(0,0,0,0.04)',
  radius: '0.6rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Notes', note: 'Long-form writing and editorial notes worth your attention.' },
  listing: { ...base, kicker: 'Directory', note: 'Verified entries with the details you need.' },
  classified: { ...base, kicker: 'Board', note: 'Fresh, time-sensitive notices ready to act on.' },
  image: { ...base, kicker: 'Visuals', note: 'A visual index of standout imagery.' },
  sbm: { ...base, kicker: 'Bookmarks', note: 'Curated links worth returning to.' },
  // Renamed public label: pdf → "Reference Library"
  pdf: { ...base, kicker: 'Reference Library', note: 'Downloadable references, reports, and working documents.' },
  // Renamed label surfaces ONLY on the profile detail page.
  profile: { ...base, kicker: 'Contributor', note: 'A record of the people behind the archive.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
