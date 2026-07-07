import Link from 'next/link'
import { ArrowUpRight, FileText, Search } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { globalContent } from '@/editable/content/global.content'
import { getEditablePostImage, postHref, getEditableExcerpt, getEditableCategory } from '@/editable/cards/PostCards'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

/*
  Home page for a Reference-Library platform.
  Section order mirrors the kitpro-silentlab reference top-to-bottom:
    1. Hero: gigantic display h1, mono tagline chip, lead line
    2. Marquee tagline strip (horizontal loop)
    3. About / intro band with long-form lede
    4. Category / "shelves" grid
    5. Portfolio-style newest references (bordered cards)
    6. Time collections (from real time-window feeds)
    7. Big CTA marquee → footer

  Zero profile surfacing anywhere.
*/

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-10'

/* ------------------------------- HERO ------------------------------- */
export function EditableHomeHero({ primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const feature = pool[0]
  const supportingCount = pool.length
  const heroTitle =
    pagesContent.home.hero.title?.join(' ') ||
    `A quiet reference archive for the long read.`

  return (
    <section className="relative overflow-hidden border-b border-[var(--editable-border)] bg-[var(--slot4-page-bg)]">
      <div className={`${container} pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36`}>
        <EditableReveal index={0}>
          <div className="flex flex-wrap items-center gap-4 text-[10px] editable-mono uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">
            <span className="rounded-full border border-[var(--editable-border)] px-3 py-1">{pagesContent.home.hero.badge}</span>
            <span className="h-px flex-1 bg-[var(--editable-border)]" />
            <span>{SITE_CONFIG.name}</span>
          </div>
        </EditableReveal>

        <EditableReveal index={1}>
          <h1 className={`${dc.type.heroTitle} mt-10 max-w-[16ch] text-[var(--slot4-page-text)]`}>
            {heroTitle}
          </h1>
        </EditableReveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-16">
          <EditableReveal index={2}>
            <p className={`${dc.type.lead} max-w-[52ch]`}>
              {pagesContent.home.hero.description}
            </p>
          </EditableReveal>

          <EditableReveal index={3}>
            <div className="flex flex-wrap items-center gap-4">
              <Link href={pagesContent.home.hero.primaryCta.href} className={dc.button.primary}>
                {pagesContent.home.hero.primaryCta.label} <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href={pagesContent.home.hero.secondaryCta.href} className={dc.button.secondary}>
                <Search className="h-4 w-4" /> {pagesContent.home.hero.secondaryCta.label}
              </Link>
            </div>
          </EditableReveal>
        </div>

        {/* Feature reference "on the shelf" preview — real image, real title. */}
        {feature ? (
          <EditableReveal index={4}>
            <div className="mt-20 grid gap-8 border-t border-[var(--editable-border)] pt-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-12">
              <Link href={primaryRoute} className="group relative block overflow-hidden rounded-[var(--editable-radius-card)] border border-[var(--editable-border)]">
                <div className="relative aspect-[16/10] bg-[var(--slot4-media-bg)]">
                  <img
                    src={getEditablePostImage(feature)}
                    alt={feature.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.6))]" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-8">
                    <div>
                      <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.24em] text-white/70">{pagesContent.home.hero.featureCardBadge}</p>
                      <h3 className="editable-display mt-3 line-clamp-2 max-w-2xl text-[clamp(1.25rem,2vw,2rem)] font-bold leading-[1.1] tracking-[-0.01em] text-white">
                        {feature.title}
                      </h3>
                    </div>
                    <ArrowUpRight className="h-6 w-6 shrink-0 text-white transition group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>

              <div className="flex flex-col justify-between gap-6">
                <div>
                  <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">{pagesContent.home.hero.focusLabel}</p>
                  <p className={`${dc.type.lead} mt-5 max-w-[36ch]`}>
                    {pagesContent.home.hero.featureCardDescription}
                  </p>
                </div>
                <div className="grid grid-cols-3 border-t border-[var(--editable-border)] pt-6">
                  {[
                    { label: 'Filed', value: supportingCount },
                    { label: 'Shelves', value: SITE_CONFIG.tasks.filter((t) => t.enabled).length },
                    { label: 'Open', value: '24/7' },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="editable-display text-[clamp(1.5rem,2.4vw,2.4rem)] font-bold leading-none tracking-[-0.02em]">{item.value}</p>
                      <p className="editable-mono mt-3 text-[9px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </EditableReveal>
        ) : null}
      </div>
    </section>
  )
}

/* --------------------------- Tagline marquee --------------------------- */
export function EditableStoryRail({ primaryRoute }: HomeSectionProps) {
  const words = ['Filed slowly', 'Open to all', 'Reference-first', 'Downloadable', 'Kept legible', 'Quiet archive']
  return (
    <section className="relative overflow-hidden border-b border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] py-10">
      <div className="editable-marquee-track editable-display text-[clamp(1.75rem,4.5vw,4rem)] font-black leading-none tracking-[-0.015em] text-[var(--slot4-page-text)]">
        {Array.from({ length: 2 }).map((_, i) => (
          <span key={i} className="inline-flex items-center gap-14">
            {words.map((w, wi) => (
              <span key={`${i}-${wi}`} className="inline-flex items-center gap-14">
                <span>{w}</span>
                <span className="opacity-40">＊</span>
              </span>
            ))}
          </span>
        ))}
      </div>
      {/* Hidden accessible link to primaryRoute for SEO parity. */}
      <Link href={primaryRoute} className="sr-only">Enter the reference library</Link>
    </section>
  )
}

/* ----------------------- About / intro band ----------------------- */
export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const intro = pagesContent.home.intro
  const items = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)]).slice(0, 6)

  return (
    <section className="border-b border-[var(--editable-border)] bg-[var(--slot4-page-bg)]">
      <div className={`${container} py-20 sm:py-28 lg:py-36`}>
        <div className="grid gap-16 lg:grid-cols-[1fr_1.15fr] lg:gap-24">
          <EditableReveal index={0}>
            <div>
              <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">{intro.badge}</p>
              <h2 className={`${dc.type.sectionTitle} mt-8 max-w-[18ch] text-[var(--slot4-page-text)]`}>{intro.title}</h2>
            </div>
          </EditableReveal>

          <div>
            {intro.paragraphs.map((para, i) => (
              <EditableReveal key={para} index={i + 1}>
                <p className={`${dc.type.lead} mb-6 max-w-[54ch] last:mb-0`}>{para}</p>
              </EditableReveal>
            ))}
            <EditableReveal index={intro.paragraphs.length + 1}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href={intro.primaryLink.href} className={dc.button.primary}>
                  {intro.primaryLink.label} <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href={intro.secondaryLink.href} className={dc.button.ghost}>
                  {intro.secondaryLink.label}
                </Link>
              </div>
            </EditableReveal>
          </div>
        </div>

        {/* "On the shelf" preview grid — real posts. */}
        {items.length ? (
          <div className="mt-20 grid gap-6 border-t border-[var(--editable-border)] pt-14 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((post, i) => (
              <EditableReveal key={post.id || post.slug} index={i}>
                <Link
                  href={postHref(primaryTask, post, primaryRoute)}
                  className={`group block ${dc.surface.card} p-6 transition duration-500 hover:border-[var(--slot4-page-text)]`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--editable-border)] text-[var(--slot4-page-text)]">
                      <FileText className="h-3.5 w-3.5" />
                    </span>
                    <p className={dc.type.eyebrow}>{getEditableCategory(post)}</p>
                  </div>
                  <h3 className="editable-display mt-6 line-clamp-3 text-[clamp(1.1rem,1.5vw,1.4rem)] font-bold leading-[1.15] tracking-[-0.01em] text-[var(--slot4-page-text)]">
                    {post.title}
                  </h3>
                  <p className={`mt-4 line-clamp-3 ${dc.type.body}`}>{getEditableExcerpt(post, 140)}</p>
                  <span className="editable-mono mt-6 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-page-text)]">
                    Open <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </EditableReveal>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

/* ------------------------ Time-based collections ------------------------ */
const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: '(Newly filed)', title: 'Just added to the shelves.' },
  browse: { eyebrow: '(Well-read)', title: 'Frequently referenced this month.' },
  index: { eyebrow: '(Long-lived)', title: 'From the deeper archive.' },
}

function ShelfCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <EditableReveal index={index}>
      <Link
        href={href}
        className={`group block h-full ${dc.surface.card} overflow-hidden transition duration-500 hover:border-[var(--slot4-page-text)]`}
      >
        <div className={`${dc.media.frameFull} aspect-[4/3]`}>
          <img
            src={getEditablePostImage(post)}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-[1.04]"
            loading="lazy"
          />
          <span className="editable-mono absolute left-4 top-4 rounded-full border border-white/40 bg-black/40 px-3 py-1 text-[9px] font-medium uppercase tracking-[0.24em] text-white backdrop-blur">
            {getEditableCategory(post)}
          </span>
        </div>
        <div className="p-6">
          <h3 className="editable-display line-clamp-2 text-lg font-bold leading-[1.2] tracking-[-0.01em] text-[var(--slot4-page-text)]">
            {post.title}
          </h3>
          <p className={`mt-3 line-clamp-2 ${dc.type.body}`}>{getEditableExcerpt(post, 110)}</p>
          <span className="editable-mono mt-5 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-page-text)]">
            Open reference <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </EditableReveal>
  )
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((s) => s.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, i) => {
        const copy = sectionCopy[section.key] || { eyebrow: '(Discover)', title: 'More on the shelf.' }
        return (
          <section
            key={section.key}
            className={`border-b border-[var(--editable-border)] ${i % 2 === 0 ? 'bg-[var(--slot4-page-bg)]' : 'bg-[var(--slot4-panel-bg)]'}`}
          >
            <div className={`${container} py-20 sm:py-24 lg:py-28`}>
              <EditableReveal>
                <div className="flex flex-col gap-6 border-b border-[var(--editable-border)] pb-10 sm:flex-row sm:items-end sm:justify-between">
                  <div className="max-w-2xl">
                    <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">{copy.eyebrow}</p>
                    <h2 className={`${dc.type.sectionTitle} mt-6 text-[var(--slot4-page-text)]`}>{copy.title}</h2>
                  </div>
                  <Link href={section.href || primaryRoute} className={dc.button.secondary}>
                    {globalContent.commonLabels.viewAll} <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </EditableReveal>
              <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.posts.slice(0, 8).map((post, idx) => (
                  <ShelfCard
                    key={post.id || post.slug}
                    post={post}
                    href={postHref(primaryTask, post, primaryRoute)}
                    index={idx}
                  />
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

/* -------------------------------- CTA -------------------------------- */
export function EditableHomeCta() {
  const cta = pagesContent.home.cta
  return (
    <section id="get-app" className="scroll-mt-24 bg-[var(--slot4-dark-bg)] text-[var(--slot4-on-accent)]">
      <div className={`${container} py-24 sm:py-32 lg:py-40`}>
        <EditableReveal>
          <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.32em] text-white/50">{cta.badge}</p>
        </EditableReveal>
        <EditableReveal index={1}>
          <h2 className="editable-display mt-8 max-w-[18ch] text-[clamp(2.4rem,8vw,7rem)] font-black leading-[0.98] tracking-[-0.02em] text-white">
            {cta.title}
          </h2>
        </EditableReveal>
        <EditableReveal index={2}>
          <p className="mt-10 max-w-[52ch] text-[clamp(1rem,1.4vw,1.25rem)] leading-[1.7] text-white/70">{cta.description}</p>
        </EditableReveal>
        <EditableReveal index={3}>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link href={cta.primaryCta.href} className={dc.button.onDark}>
              {cta.primaryCta.label} <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href={cta.secondaryCta.href}
              className="editable-mono inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] border border-white/40 px-6 py-3 text-[13px] font-medium uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-[var(--slot4-page-text)]"
            >
              {cta.secondaryCta.label}
            </Link>
          </div>
        </EditableReveal>
      </div>
    </section>
  )
}
