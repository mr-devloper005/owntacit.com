'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, X, PlusCircle, LogIn, UserPlus, LogOut } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

/*
  Nav rules (kitpro-silentlab reference):
  - NO task-archive links (no directory / library / profile / task labels)
  - Left: brand circle logo → /
  - Center: About + Contact only
  - Right: Search icon → /search, then auth actions
  - Sticks; on scroll, adds a hairline underline
  - Mobile menu mirrors the same links (no task labels, no profile link)
*/
export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const staticLinks: Array<{ label: string; href: string }> = [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <header
      className={`sticky top-0 z-50 bg-[var(--editable-nav-bg)]/95 text-[var(--editable-nav-text)] backdrop-blur-md transition duration-300 ${
        scrolled ? 'border-b border-[var(--editable-border)]' : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex min-h-[74px] w-full max-w-[var(--editable-container)] items-center gap-6 px-5 sm:px-8 lg:px-10">
        <Link href="/" className="group inline-flex shrink-0 items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center  border border-[var(--slot4-page-text)] bg-[var(--slot4-surface-bg)] transition group-hover:bg-[var(--slot4-page-text)]">
            <img
              src="/favicon.png?v=20260707"
              alt={SITE_CONFIG.name}
              className="h-11 w-11 object-contain transition group-hover:scale-110"
            />
          </span>
          <span className="hidden min-w-0 md:block">
            <span className="editable-display block max-w-[240px] truncate text-[15px] font-bold leading-none tracking-[-0.005em]">
              {SITE_CONFIG.name}
            </span>
            <span className="editable-mono mt-1 block max-w-[240px] truncate text-[9px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">
              {globalContent.nav?.tagline || SITE_CONFIG.tagline}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {staticLinks.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`editable-mono relative text-[11px] font-medium uppercase tracking-[0.24em] transition ${
                  active ? 'text-[var(--slot4-page-text)]' : 'text-[var(--slot4-muted-text)] hover:text-[var(--slot4-page-text)]'
                }`}
              >
                {item.label}
                {active ? (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-px bg-[var(--slot4-page-text)]" />
                ) : null}
              </Link>
            )
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/search"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-page-text)]"
          >
            <Search className="h-4 w-4" />
          </Link>

          {session ? (
            <>
              <Link
                href="/create"
                className="hidden items-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--editable-cta-bg)] px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--editable-cta-text)] editable-mono transition hover:bg-[var(--slot4-sub-black)] sm:inline-flex"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Submit
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden items-center gap-2 rounded-[var(--editable-radius-button)] border border-[var(--editable-border)] px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--slot4-muted-text)] editable-mono transition hover:border-[var(--slot4-page-text)] hover:text-[var(--slot4-page-text)] sm:inline-flex"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center gap-2 rounded-[var(--editable-radius-button)] border border-[var(--editable-border)] px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--slot4-muted-text)] editable-mono transition hover:border-[var(--slot4-page-text)] hover:text-[var(--slot4-page-text)] sm:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5" /> Sign in
              </Link>
              <Link
                href="/signup"
                className="hidden items-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--editable-cta-bg)] px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--editable-cta-text)] editable-mono transition hover:bg-[var(--slot4-sub-black)] sm:inline-flex"
              >
                <UserPlus className="h-3.5 w-3.5" /> Get started
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-[var(--editable-border)] bg-[var(--editable-nav-bg)] px-5 py-6 lg:hidden">
          <div className="grid gap-2">
            {[{ label: 'Home', href: '/' }, ...staticLinks, ...(session ? [{ label: 'Submit', href: '/create' }] : [{ label: 'Sign in', href: '/login' }, { label: 'Get started', href: '/signup' }])].map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`editable-mono border-l-2 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.22em] ${
                    active
                      ? 'border-[var(--slot4-page-text)] bg-[var(--slot4-panel-bg)] text-[var(--slot4-page-text)]'
                      : 'border-transparent text-[var(--slot4-muted-text)] hover:border-[var(--slot4-line)] hover:bg-[var(--slot4-panel-bg)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      ) : null}
    </header>
  )
}
