import Link from 'next/link'
import { ArrowUpRight, FileText } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'

/*
  Card visual language (kitpro-silentlab):
  - Bordered surfaces, subtle radius, no drop shadow
  - Mono metadata chips (DM Mono), display titles (Public Sans, tight tracking)
  - Editorial hero card = big display type + soft image lift on hover
  - Signatures kept byte-identical so downstream pages don't break
*/

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Filed'
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

/* ------------------------------ Hero card ------------------------------ */
export function EditorialFeatureCard({ post, href, label = 'Featured reference' }: { post: SitePost; href: string; label?: string }) {
  return (
    <Link href={href} className={`group block min-w-0 overflow-hidden ${dc.surface.dark} transition duration-500 hover:-translate-y-1`}>
      <div className="relative min-h-[520px] p-8 sm:p-10 lg:min-h-[620px] lg:p-14">
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-700 group-hover:opacity-55 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.85))]" />
        <div className="relative z-10 flex h-full min-h-[460px] flex-col justify-between lg:min-h-[560px]">
          <div className="flex items-center gap-3">
            <span className={`editable-mono text-[10px] font-medium uppercase tracking-[0.28em] ${pal.accentSoftText}`}>{label}</span>
            <span className="h-px flex-1 bg-white/30" />
            <span className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-white/60">{getEditableCategory(post)}</span>
          </div>
          <div>
            <h3 className="editable-display max-w-3xl text-[clamp(2rem,5vw,4.2rem)] font-black leading-[0.98] tracking-[-0.02em] text-white">
              {post.title}
            </h3>
            <p className="mt-6 max-w-2xl text-sm leading-8 text-white/70 sm:text-base">{getEditableExcerpt(post, 200)}</p>
            <span className={`mt-10 inline-flex w-fit items-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--slot4-on-accent)] px-6 py-3 text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--slot4-page-text)] editable-mono transition group-hover:bg-white`}>
              Open reference <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ------------------------------ Rail card ------------------------------ */
export function RailPostCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      className={`group ${dc.layout.minRailCard} block overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}
    >
      <div className={`${dc.media.frameFull} ${dc.media.ratio}`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
        />
        <span className="editable-mono absolute left-4 top-4 rounded-full border border-white/40 bg-black/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-white backdrop-blur">
          No. {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="p-6">
        <p className={`${dc.type.eyebrow}`}>{getEditableCategory(post)}</p>
        <h3 className="editable-display mt-4 line-clamp-3 text-[clamp(1.25rem,1.5vw,1.5rem)] font-bold leading-[1.15] tracking-[-0.01em] text-[var(--slot4-page-text)]">
          {post.title}
        </h3>
        <p className={`mt-4 line-clamp-3 text-[13px] leading-[1.7] ${pal.mutedText}`}>{getEditableExcerpt(post, 140)}</p>
      </div>
    </Link>
  )
}

/* ---------------------------- Compact index card ---------------------------- */
export function CompactIndexCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      className={`group block min-w-0 ${dc.surface.soft} p-6 transition duration-500 hover:bg-[var(--slot4-surface-bg)]`}
    >
      <div className="flex items-start gap-5">
        <span className="editable-mono flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--slot4-page-text)] bg-transparent text-[11px] font-medium text-[var(--slot4-page-text)]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <p className={`flex items-center gap-2 ${dc.type.eyebrow}`}>
            <FileText className="h-3 w-3" /> {getEditableCategory(post)}
          </p>
          <h3 className="editable-display mt-3 line-clamp-2 text-xl font-bold leading-[1.2] tracking-[-0.01em] text-[var(--slot4-page-text)]">
            {post.title}
          </h3>
          <p className={`mt-2 line-clamp-2 text-[13px] leading-[1.6] ${pal.mutedText}`}>{getEditableExcerpt(post, 110)}</p>
        </div>
      </div>
    </Link>
  )
}

/* ---------------------------- Long list card ---------------------------- */
export function ArticleListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      className={`group grid min-w-0 gap-6 overflow-hidden ${dc.surface.card} p-5 transition duration-500 hover:border-[var(--slot4-page-text)] sm:grid-cols-[240px_minmax(0,1fr)]`}
    >
      <div className={`${dc.media.frameFull} aspect-[16/12] sm:aspect-auto sm:min-h-[200px]`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <div className="min-w-0 p-2 sm:py-5 sm:pr-6">
        <p className={`${dc.type.eyebrow}`}>Entry {String(index + 1).padStart(2, '0')} · {getEditableCategory(post)}</p>
        <h2 className="editable-display mt-4 line-clamp-3 text-[clamp(1.5rem,2vw,2rem)] font-bold leading-[1.12] tracking-[-0.015em] text-[var(--slot4-page-text)] group-hover:underline underline-offset-4 decoration-1">
          {post.title}
        </h2>
        <p className={`mt-5 line-clamp-3 text-[14px] leading-[1.75] ${pal.mutedText}`}>{getEditableExcerpt(post, 200)}</p>
        <span className="editable-mono mt-6 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-page-text)]">
          Open reference <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  )
}
