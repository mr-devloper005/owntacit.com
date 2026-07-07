'use client'

import Link from 'next/link'
import { ArrowUpRight, Github, Twitter, Linkedin } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

/*
  Footer (kitpro-silentlab reference):
  - Multi-column, black cream-text canvas.
  - HUGE marquee-ish site name up top.
  - Discovery column lists ONLY the renamed Reference Library.
    No profile links, no profile promotion, ever.
*/
export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  const libraryRoute =
    SITE_CONFIG.tasks.find((task) => task.enabled && task.key === 'pdf')?.route ||
    SITE_CONFIG.taskViews?.pdf ||
    ''

  return (
    <footer className="mt-8 bg-[var(--slot4-dark-bg)] text-[var(--slot4-on-accent)]">
      {/* Top CTA marquee — mirrors the reference's cta-big-text-marquee. */}
      <div className="overflow-hidden border-b border-white/10 py-8">
        <div className="editable-marquee-track editable-display text-[clamp(2rem,8vw,4rem)] font-black leading-none tracking-[-0.02em]">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="inline-flex items-center gap-12">
              <span>Read {SITE_CONFIG.name}</span>
              <span className="opacity-40">*</span>
              <span>Save what matters</span>
              <span className="opacity-40">*</span>
              <span>Read {SITE_CONFIG.name}</span>
              <span className="opacity-40">*</span>
              <span>Reference the archive</span>
              <span className="opacity-40">*</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[var(--editable-container)] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-16 lg:px-10 lg:py-24">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center border border-white/40 bg-transparent">
              <img
                src="/favicon.png?v=20260707"
                alt={SITE_CONFIG.name}
                className="h-11 w-11 object-contain invert"
              />
            </span>
            <span className="editable-display text-lg font-bold tracking-[-0.005em]">{SITE_CONFIG.name}</span>
          </Link>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/70">
            {globalContent.footer?.description || SITE_CONFIG.description}
          </p>
          
        </div>

        <div>
          <h3 className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-white/45">Discovery</h3>
          <div className="mt-5 grid gap-3">
            {libraryRoute ? (
              <Link
                href={libraryRoute}
                className="editable-mono inline-flex items-center gap-2 text-sm font-normal text-white/85 transition hover:text-white"
              >
                Reference Library <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ) : null}
            <Link
              href="/search"
              className="editable-mono inline-flex items-center gap-2 text-sm font-normal text-white/85 transition hover:text-white"
            >
              Search the archive <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div>
          <h3 className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-white/45">Resources</h3>
          <div className="mt-5 grid gap-3">
            <Link href="/about" className="editable-mono text-sm text-white/85 transition hover:text-white">About</Link>
            <Link href="/contact" className="editable-mono text-sm text-white/85 transition hover:text-white">Contact</Link>
          </div>
        </div>

        <div>
          <h3 className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-white/45">Account</h3>
          <div className="mt-5 grid gap-3">
            {session ? (
              <>
                <Link href="/create" className="editable-mono text-sm text-white/85 transition hover:text-white">Submit a reference</Link>
                <button
                  type="button"
                  onClick={logout}
                  className="editable-mono text-left text-sm text-white/85 transition hover:text-white"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="editable-mono text-sm text-white/85 transition hover:text-white">Sign in</Link>
                <Link href="/signup" className="editable-mono text-sm text-white/85 transition hover:text-white">Get started</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[var(--editable-container)] flex-col items-center justify-between gap-3 px-5 py-6 text-[10px] font-medium uppercase tracking-[0.22em] text-white/45 editable-mono sm:flex-row sm:px-8 lg:px-10">
          <span>© {year} {SITE_CONFIG.name}</span>
          <span>{globalContent.footer?.bottomNote || 'A reference-first archive.'}</span>
        </div>
      </div>
    </footer>
  )
}
