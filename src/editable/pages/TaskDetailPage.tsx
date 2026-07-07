import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Building2,
  Camera,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { SITE_CONFIG, getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

/* ------------------------------ helpers ------------------------------ */

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const images = Array.isArray(content.images)
    ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar']
    .map((key) => asText(content[key]))
    .filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const safeUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : '#')

const linkifyMarkdown = (value: string) =>
  value.replace(
    /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi,
    (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`
  )

const linkifyText = (value: string) =>
  linkifyMarkdown(value).replace(
    /(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi,
    (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`
  )

const hardenLinks = (html: string) =>
  html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
    let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    if (!/\starget=/i.test(next)) next += ' target="_blank"'
    if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
    return `<a ${next}>`
  })

const sanitizeHtml = (html: string) =>
  hardenLinks(
    html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"')
  )

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) =>
  post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback

// Format a raw byte count into a compact "12.4 MB" / "820 KB" string.
const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return ''
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i += 1
  }
  const precision = i > 0 && value < 10 ? 1 : 0
  return `${value.toFixed(precision)} ${units[i]}`
}

// Server-side HEAD probe to pull real Content-Length off the referenced file.
// Cached by Next.js fetch cache; falls back silently on any failure.
const fetchFileSize = async (url: string): Promise<string> => {
  if (!url || !/^https?:\/\//i.test(url)) return ''
  try {
    const res = await fetch(url, { method: 'HEAD', next: { revalidate: 3600 } })
    if (!res.ok) return ''
    const len = res.headers.get('content-length')
    if (!len) return ''
    return formatBytes(Number(len))
  } catch {
    return ''
  }
}

const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

/* ------------------------------ Root ------------------------------ */
export function TaskDetailView({
  task,
  post,
  related,
  comments = [],
}: {
  task: TaskKey
  post: SitePost
  related: SitePost[]
  comments?: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

function Kicker({ task, children }: { task: TaskKey; children: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="editable-mono flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--tk-text)]">
      <span className="rounded-full border border-[var(--tk-line)] px-3 py-1">{theme.kicker}</span>
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

function BackLink({ task, fallbackHref }: { task: TaskKey; fallbackHref?: string }) {
  const taskConfig = getTaskConfig(task)
  // Never link back to a profile archive — send those back to home instead.
  const href = task === 'profile' ? '/' : taskConfig?.route || fallbackHref || '/'
  const label = task === 'profile' ? 'Return home' : `Back to ${getTaskTheme(task).kicker}`
  return (
    <Link
      href={href}
      className="editable-mono inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> {label}
    </Link>
  )
}

/* ------------------------------ Article ------------------------------ */
function ArticleDetail({
  post,
  related,
  comments,
}: {
  post: SitePost
  related: SitePost[]
  comments: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <BackLink task="article" />
        <p className="editable-mono mt-14 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--tk-text)]">
          {categoryOf(post, 'Note')}
        </p>
        <h1 className="editable-display mt-6 text-balance text-[clamp(2rem,5.5vw,4.5rem)] font-black leading-[1.02] tracking-[-0.02em]">
          {post.title}
        </h1>
        {images[0] ? (
          <img src={images[0]} alt="" className="mt-14 aspect-[16/9] w-full rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" />
        ) : null}
        <BodyContent post={post} />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

/* ------------------------------ Listing ------------------------------ */
function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
      <BackLink task="listing" />
      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
        <article className="min-w-0">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
              {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-12 w-12 text-[var(--tk-muted)]" />}
            </div>
            <div className="min-w-0">
              <Kicker task="listing">{categoryOf(post, 'Entry')}</Kicker>
              <h1 className="editable-display mt-5 text-[clamp(2rem,4.5vw,3.5rem)] font-black leading-[1.05] tracking-[-0.015em]">{post.title}</h1>
            </div>
          </div>
          {leadText(post) ? <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
          <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
          <Divider />
          <BodyContent post={post} />
          <ImageStrip images={images.slice(1)} label="Showcase" />
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
          <ContactAction website={website} phone={phone} email={email} />
        </aside>
      </div>
      <RelatedStrip task="listing" related={related} />
    </section>
  )
}

/* ------------------------------ Classified ------------------------------ */
function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BackLink task="classified" />
          <div className="mt-8 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8">
            <Kicker task="classified">{categoryOf(post, 'Notice')}</Kicker>
            <h1 className="editable-display mt-5 text-2xl font-bold leading-tight tracking-[-0.01em]">{post.title}</h1>
            <p className="editable-display mt-6 text-4xl font-black tracking-[-0.02em]">{price || 'Open offer'}</p>
            <div className="mt-6 space-y-2.5">
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {phone ? <a href={`tel:${phone}`} className="editable-mono inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--tk-accent)] px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--tk-on-accent)] transition hover:opacity-90"><Phone className="h-3.5 w-3.5" /> Call</a> : null}
              {email ? <a href={`mailto:${email}`} className="editable-mono inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] border border-[var(--tk-line)] px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] transition hover:border-[var(--tk-text)]"><Mail className="h-3.5 w-3.5" /> Email</a> : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          <ImageStrip images={images} label="Offer visuals" large />
          <BodyContent post={post} />
          <ContactAction website={website} phone={phone} email={email} />
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

/* ------------------------------ Image ------------------------------ */
function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <BackLink task="image" />
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Kicker task="image">
              <Camera className="mr-1 inline h-3 w-3" /> Visual entry
            </Kicker>
            <h1 className="editable-display mt-6 text-[clamp(2rem,4vw,3.2rem)] font-black leading-[1.05] tracking-[-0.015em]">{post.title}</h1>
            {leadText(post) ? <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

/* ------------------------------ Bookmark ------------------------------ */
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <BackLink task="sbm" />
        <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--tk-line)] text-[var(--tk-text)]">
          <Bookmark className="h-6 w-6" />
        </div>
        <div className="mt-8"><Kicker task="sbm">{categoryOf(post, 'Bookmark')}</Kicker></div>
        <h1 className="editable-display mt-5 text-[clamp(2rem,5vw,3.8rem)] font-black leading-[1.05] tracking-[-0.02em]">{post.title}</h1>
        {leadText(post) ? <p className="mt-8 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
        {website ? (
          <Link
            href={website}
            target="_blank"
            rel="noreferrer"
            className="editable-mono mt-10 inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--tk-accent)] px-5 py-3 text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--tk-on-accent)] transition hover:opacity-90"
          >
            Open resource <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
        <BodyContent post={post} />
      </article>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

/* ============================================================================
   Detail pages — library-catalog / spec-sheet layout
   ============================================================================
   Shared across PDF and Profile:
   - Slim breadcrumb strip at the top
   - Title band: LEFT big block-letter glyph (format code or initials) +
     RIGHT stacked title + horizontal mono "spec sheet" strip
   - Working canvas: LEFT sticky spine (identity/CTA/jump-nav/trust/ad)
     + RIGHT numbered sections ([01/06] markers, hairline dividers)
   - Bottom mono "colophon" strip: filename/uid + back-to-top link
   - PDF ad slot lives inside the left spine as "article-bottom"
   - Profile ad slot lives inside the left spine as "sidebar"
   - NO date/publication timestamps rendered anywhere on either
============================================================================ */

// Shared numbered section marker for the right reading column.
function SectionMarker({ index, total, label }: { index: number; total: number; label: string }) {
  return (
    <div className="mb-8 flex items-baseline gap-6 border-b border-[var(--tk-line)] pb-4">
      <span className="editable-mono text-[10px] font-medium tracking-[0.28em] text-[var(--tk-muted)]">
        [{String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}]
      </span>
      <h2 className="editable-display text-[clamp(1.35rem,2.4vw,2rem)] font-bold leading-[1.1] tracking-[-0.01em] text-[var(--tk-text)]">
        {label}
      </h2>
    </div>
  )
}

// Shared block-letter glyph for the title band (PDF: format code; Profile: initials).
function BlockGlyph({ text }: { text: string }) {
  return (
    <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-text)] bg-[var(--tk-text)] text-[var(--tk-on-accent)] sm:max-w-[260px]">
      <span className="editable-display text-[clamp(3rem,7vw,6rem)] font-black leading-none tracking-[-0.03em]">
        {text}
      </span>
    </div>
  )
}

// Shared spec-sheet strip under the title (horizontal, mono, three chips).
function SpecStrip({ items }: { items: Array<[string, string]> }) {
  const visible = items.filter(([, v]) => v)
  if (!visible.length) return null
  return (
    <dl className="editable-mono mt-10 grid gap-4 border-t border-b border-[var(--tk-line)] py-6 text-[10px] font-medium uppercase tracking-[0.22em] sm:grid-cols-3">
      {visible.map(([label, value]) => (
        <div key={label} className="flex items-baseline gap-3">
          <dt className="text-[var(--tk-muted)]">{label}</dt>
          <dd className="truncate text-[var(--tk-text)]">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

// Shared "colophon" strip at the bottom of each detail page.
function Colophon({ uid, label }: { uid: string; label: string }) {
  return (
    <div className="mt-24 border-t border-[var(--tk-line)] pt-8">
      <div className="editable-mono flex flex-wrap items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)]">
        <span className="truncate">{label} · <span className="text-[var(--tk-text)]">{uid}</span></span>
        <a href="#top" className="inline-flex items-center gap-2 text-[var(--tk-text)]">↑ Back to top</a>
      </div>
    </div>
  )
}

// Spine jump-nav item (visual only — no client script; anchor-based jump).
function SpineNavItem({ index, label, id }: { index: number; label: string; id: string }) {
  return (
    <a
      href={`#${id}`}
      className="group flex items-baseline gap-3 border-b border-[var(--tk-line)] py-3 text-[11px] font-medium editable-mono uppercase tracking-[0.18em] text-[var(--tk-muted)] transition last:border-b-0 hover:text-[var(--tk-text)]"
    >
      <span className="text-[10px] tracking-[0.24em]">{String(index).padStart(2, '0')}</span>
      <span className="flex-1 truncate">{label}</span>
      <span className="opacity-0 transition group-hover:opacity-100">→</span>
    </a>
  )
}

async function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  const filename = getField(post, ['filename', 'fileName']) || `${post.slug}.pdf`
  const category = categoryOf(post, 'Reference')
  const pages = getField(post, ['pages', 'pageCount'])
  // Prefer the explicit size on the post; otherwise probe the real file with HEAD.
  const fileSize = getField(post, ['size', 'fileSize']) || (await fetchFileSize(fileUrl))
  // Same fallback for each related item, resolved in parallel.
  const relatedSizes = await Promise.all(
    related.map(async (item) => {
      const explicit = getField(item, ['size', 'fileSize'])
      if (explicit) return explicit
      const url = getField(item, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
      return url ? await fetchFileSize(url) : ''
    })
  )
  const format = (getField(post, ['format']) || 'PDF').toUpperCase()
  const uploader = getField(post, ['uploader', 'author', 'contributor', 'source'])
  const inside = (getField(post, ['sections', 'contents']) || '')
    .split(/\n|,|;/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6)
  const uid = post.slug || post.id || 'REF-XXXX'

  const spineNav: Array<[number, string, string]> = [
    [1, 'Overview', 'sec-01'],
    [2, 'Preview', 'sec-02'],
    [3, "What's inside", 'sec-03'],
    [4, 'Tags', 'sec-04'],
    [5, 'Take it with you', 'sec-05'],
    [6, 'Related', 'sec-06'],
  ]

  return (
    <section id="top" className="mx-auto max-w-[var(--editable-container)] px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      {/* Slim breadcrumb strip */}
      <div className="flex items-center justify-between border-b border-[var(--tk-line)] pb-4">
        <BackLink task="pdf" />
        <span className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--tk-muted)]">
          Ref · {uid}
        </span>
      </div>

      {/* Title band: block glyph LEFT + stacked title RIGHT */}
      <EditableReveal>
        <header className="mt-12 grid gap-10 sm:mt-16 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
          <BlockGlyph text={format} />
          <div className="flex flex-col justify-end">
            <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--tk-muted)]">
              Reference document
            </p>
            <h1 className="editable-display mt-6 text-balance text-[clamp(2.2rem,6.5vw,5.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
              {post.title}
            </h1>
          </div>
        </header>
      </EditableReveal>

      {/* Spec-sheet strip */}
      <SpecStrip
        items={[
          ['Shelf', category],
          ['Extent', [pages && `${pages}pp`, fileSize].filter(Boolean).join(' · ') || format],
          ['UID', uid],
        ]}
      />

      {/* Working canvas: LEFT sticky spine + RIGHT numbered sections */}
      <div className="mt-16 grid gap-14 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-20">
        {/* -------- LEFT SPINE -------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {/* Identity + primary CTA */}
          <div className="border-t-2 border-[var(--tk-text)] pt-6">
            <p className="editable-mono truncate text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)]">
              {filename}
            </p>
            <dl className="editable-mono mt-6 grid gap-3 text-[11px] font-medium uppercase tracking-[0.18em]">
              <SidebarRow label="Format" value={format} />
              
              <SidebarRow label="Size" value={fileSize || '—'} />
              {uploader ? <SidebarRow label="Filed" value={uploader} /> : null}
            </dl>
            {fileUrl ? (
              <div className="mt-6 flex flex-col gap-2">
                <a
                  href={fileUrl}
                  download
                  className="editable-mono inline-flex items-center justify-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--tk-accent)] px-5 py-3 text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--tk-on-accent)] transition hover:opacity-90"
                >
                  <Download className="h-4 w-4" /> Download
                </a>
                <Link
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="editable-mono inline-flex items-center justify-center gap-2 rounded-[var(--editable-radius-button)] border border-[var(--tk-line)] px-5 py-3 text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--tk-text)] transition hover:border-[var(--tk-text)]"
                >
                  Open in new tab <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : null}
          </div>

          {/* Jump-nav */}
          <div className="mt-10 border-t border-[var(--tk-line)] pt-6">
            <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--tk-muted)]">
              On this page
            </p>
            <nav className="mt-4">
              {spineNav.map(([n, label, id]) => (
                <SpineNavItem key={id} index={n} label={label} id={id} />
              ))}
            </nav>
          </div>

          {/* Trust chips */}
          <div className="editable-mono mt-10 flex flex-wrap gap-2 border-t border-[var(--tk-line)] pt-6">
            <span className="rounded-[var(--editable-radius-tag)] border border-[var(--tk-line)] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
              Filed
            </span>
            <span className="rounded-[var(--editable-radius-tag)] border border-[var(--tk-line)] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
              Open access
            </span>
            <span className="rounded-[var(--editable-radius-tag)] border border-[var(--tk-line)] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
              {SITE_CONFIG.name}
            </span>
          </div>

          {/* Ad — moved into the spine (article-bottom slot) */}
          <div className="mt-10 border-t border-[var(--tk-line)] pt-8">
            <Ads
              slot="article-bottom"
              size={pickRandom(getSlotSizes('article-bottom'))}
              showLabel
              className="w-full"
            />
          </div>
        </aside>

        {/* -------- RIGHT NUMBERED SECTIONS -------- */}
        <div className="min-w-0">
          {/* 01 Overview */}
          <section id="sec-01" className="scroll-mt-24">
            <SectionMarker index={1} total={6} label="Overview" />
            {leadText(post) ? (
              <p className="editable-display max-w-[64ch] text-[clamp(1.15rem,1.6vw,1.4rem)] italic font-medium leading-[1.55] text-[var(--tk-text)]">
                {leadText(post)}
              </p>
            ) : null}
            <div className="mt-8">
              <BodyContent post={post} />
            </div>
          </section>

          {/* 02 Preview */}
          {fileUrl ? (
            <section id="sec-02" className="mt-24 scroll-mt-24">
              <SectionMarker index={2} total={6} label="Preview" />
              <EditableReveal>
                <div className="overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                  <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                    <span className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                      Document preview
                    </span>
                    <span className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                      {format} · {filename}
                    </span>
                  </div>
                  <iframe
                    src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    title={post.title}
                    className="h-[78vh] w-full bg-[var(--tk-raised)]"
                  />
                </div>
              </EditableReveal>
            </section>
          ) : null}

          {/* 03 What's inside */}
          <section id="sec-03" className="mt-24 scroll-mt-24">
            <SectionMarker index={3} total={6} label="What's inside" />
            {inside.length ? (
              <ol className="editable-mono grid gap-3 sm:grid-cols-2">
                {inside.map((s, i) => (
                  <li
                    key={`${s}-${i}`}
                    className="flex items-baseline gap-4 border-l-2 border-[var(--tk-line)] pl-4 text-[13px] leading-6"
                  >
                    <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)]">
                      §{String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[var(--tk-text)]">{s}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
                Filed under {SITE_CONFIG.name} — sections not itemised.
              </p>
            )}
          </section>

          {/* 04 Tags */}
          {post.tags?.length ? (
            <section id="sec-04" className="mt-24 scroll-mt-24">
              <SectionMarker index={4} total={6} label="Tags" />
              <div className="editable-mono flex flex-wrap gap-2">
                {post.tags.slice(0, 12).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--tk-line)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {/* 05 Take it with you (repeated CTA) */}
          {fileUrl ? (
            <section id="sec-05" className="mt-24 scroll-mt-24">
              <SectionMarker index={5} total={6} label="Take it with you" />
              <div className="flex flex-col gap-4 rounded-[var(--tk-radius)] border-2 border-dashed border-[var(--tk-line)] p-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--tk-muted)]">
                    Offline copy
                  </p>
                  <p className="editable-display mt-3 max-w-lg text-[clamp(1.25rem,2.2vw,1.75rem)] font-bold leading-[1.15] tracking-[-0.01em]">
                    Take this reference with you.
                  </p>
                </div>
                <a
                  href={fileUrl}
                  download
                  className="editable-mono inline-flex shrink-0 items-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--tk-accent)] px-6 py-3 text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--tk-on-accent)] transition hover:opacity-90"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </a>
              </div>
            </section>
          ) : null}

          {/* 06 Related — horizontal list rather than a grid, so it feels different */}
          {related.length ? (
            <section id="sec-06" className="mt-24 scroll-mt-24">
              <SectionMarker index={6} total={6} label="Related references" />
              <ul className="divide-y divide-[var(--tk-line)] border-y border-[var(--tk-line)]">
                {related.map((item, i) => (
                  <li key={item.id || item.slug}>
                    <Link
                      href={`${getTaskConfig('pdf')?.route || '/pdf'}/${item.slug}`}
                      className="group grid items-center gap-6 py-5 sm:grid-cols-[60px_minmax(0,1fr)_120px_20px]"
                    >
                      <span className="editable-mono text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="editable-display line-clamp-2 text-[clamp(1rem,1.6vw,1.35rem)] font-bold leading-[1.15] tracking-[-0.01em] text-[var(--tk-text)] group-hover:underline underline-offset-4 decoration-1">
                        {item.title}
                      </h3>
                      <span className="editable-mono hidden text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)] sm:block">
                        {(getField(item, ['format']) || 'PDF').toUpperCase()} · {relatedSizes[i] || '—'}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-[var(--tk-muted)] transition group-hover:text-[var(--tk-text)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex justify-end">
                <Link
                  href={getTaskConfig('pdf')?.route || '/'}
                  className="editable-mono inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-text)]"
                >
                  See the shelf <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <Colophon uid={uid} label={filename} />
    </section>
  )
}

/* ============================================================================
   Profile detail — PREMIUM but DIRECT-URL-ONLY
   ============================================================================
   Reachable at its route. Never linked or surfaced anywhere else in the UI.
   - Hero band with prominent avatar + display-scale h1 name
   - Bio / lead paragraph
   - Quick-facts / contact strip
   - Sanitized bio body + tag chips
   - "Their references" grid → links INTO the Reference Library (never to
     other profiles)
   - Inline map if lat/lng or address
   - Sticky right sidebar: contact card + primary CTA + trust panel (3 items)
   - One <Ads slot="sidebar"> inside the sidebar
   - NO "more profiles" strip anywhere — optional bottom strip points to Library
============================================================================ */
function ProfileDetail({ post, related: _related }: { post: SitePost; related: SitePost[] }) {
  // `_related` is preserved on the signature but intentionally not rendered.
  void _related
  const images = getImages(post)
  const avatar = images[0]
  const role = getField(post, ['role', 'designation', 'title'])
  const org = getField(post, ['company', 'organization', 'affiliation'])
  const location = getField(post, ['location', 'city', 'address'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  const phone = getField(post, ['phone'])
  const links = (getField(post, ['links']) || '')
    .split(/\n|,|;/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6)
  const verified = String(getField(post, ['verified'])).toLowerCase() === 'true'
  const mapSrc = mapSrcFor(post)
  const uid = post.slug || post.id || 'REC-XXXX'
  const initials = post.title
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'C'

  const totalSections = mapSrc ? 5 : 4
  const spineNav: Array<[number, string, string]> = [
    [1, 'Bio', 'sec-01'],
    [2, 'Contact channels', 'sec-02'],
    [3, 'Tags', 'sec-03'],
    ...(mapSrc ? ([[4, 'Location', 'sec-04']] as Array<[number, string, string]>) : []),
    [mapSrc ? 5 : 4, 'Record integrity', mapSrc ? 'sec-05' : 'sec-04'],
  ]

  return (
    <section id="top" className="mx-auto max-w-[var(--editable-container)] px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      {/* Slim breadcrumb strip */}
      <div className="flex items-center justify-between border-b border-[var(--tk-line)] pb-4">
        <BackLink task="profile" />
        <span className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--tk-muted)]">
          Rec · {uid}
        </span>
      </div>

      {/* Title band: block glyph LEFT + stacked title RIGHT */}
      <EditableReveal>
        <header className="mt-12 grid gap-10 sm:mt-16 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
          {avatar ? (
            <div className="aspect-square w-full overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)] sm:max-w-[260px]">
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <BlockGlyph text={initials} />
          )}
          <div className="flex flex-col justify-end">
            <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--tk-muted)]">
              Contributor · Direct-link record
            </p>
            <h1 className="editable-display mt-6 text-balance text-[clamp(2.2rem,6.5vw,5.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
              {post.title}
            </h1>
            {(role || org) ? (
              <p className="editable-mono mt-6 text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                {[role, org].filter(Boolean).join(' · ')}
              </p>
            ) : null}
          </div>
        </header>
      </EditableReveal>

      {/* Spec-sheet strip */}
      <SpecStrip
        items={[
          ['Role', role || org || '—'],
          ['Location', location || '—'],
          ['UID', uid],
        ]}
      />

      {/* Working canvas: LEFT sticky spine + RIGHT numbered sections */}
      <div className="mt-16 grid gap-14 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-20">
        {/* -------- LEFT SPINE -------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {/* Identity + primary CTA */}
          <div className="border-t-2 border-[var(--tk-text)] pt-6">
            <p className="editable-mono truncate text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)]">
              Contact card
            </p>
            <dl className="editable-mono mt-6 grid gap-3 text-[11px] font-medium uppercase tracking-[0.18em]">
              {role ? <SidebarRow label="Role" value={role} /> : null}
              {org ? <SidebarRow label="Org" value={org} /> : null}
              {location ? <SidebarRow label="Where" value={location} /> : null}
              <SidebarRow label="Status" value={verified ? 'Verified' : 'Filed'} />
            </dl>
            {(website || email) ? (
              <a
                href={website || `mailto:${email}`}
                target={website ? '_blank' : undefined}
                rel={website ? 'noreferrer' : undefined}
                className="editable-mono mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--tk-accent)] px-5 py-3 text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--tk-on-accent)] transition hover:opacity-90"
              >
                {website ? 'Open website' : 'Send email'} <ArrowUpRight className="h-4 w-4" />
              </a>
            ) : null}
          </div>

          {/* Jump-nav */}
          <div className="mt-10 border-t border-[var(--tk-line)] pt-6">
            <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--tk-muted)]">
              On this record
            </p>
            <nav className="mt-4">
              {spineNav.map(([n, label, id]) => (
                <SpineNavItem key={id} index={n} label={label} id={id} />
              ))}
            </nav>
          </div>

          {/* Trust chips */}
          <div className="editable-mono mt-10 flex flex-wrap gap-2 border-t border-[var(--tk-line)] pt-6">
            <span className="rounded-[var(--editable-radius-tag)] border border-[var(--tk-line)] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
              Unlisted
            </span>
            <span className="rounded-[var(--editable-radius-tag)] border border-[var(--tk-line)] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
              Direct link only
            </span>
            <span className="rounded-[var(--editable-radius-tag)] border border-[var(--tk-line)] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
              {verified ? 'Verified' : 'Filed'}
            </span>
          </div>

          {/* Ad — moved into the spine (sidebar slot) */}
          <div className="mt-10 border-t border-[var(--tk-line)] pt-8">
            <Ads slot="sidebar" size={pickRandom(getSlotSizes('sidebar'))} showLabel className="w-full" />
          </div>
        </aside>

        {/* -------- RIGHT NUMBERED SECTIONS -------- */}
        <div className="min-w-0">
          {/* 01 Bio */}
          <section id="sec-01" className="scroll-mt-24">
            <SectionMarker index={1} total={totalSections} label="Bio" />
            {leadText(post) ? (
              <p className="editable-display max-w-[64ch] text-[clamp(1.15rem,1.6vw,1.4rem)] italic font-medium leading-[1.55] text-[var(--tk-text)]">
                {leadText(post)}
              </p>
            ) : null}
            <div className="mt-8">
              <BodyContent post={post} />
            </div>
          </section>

          {/* 02 Contact channels */}
          {(location || phone || email || website || links.length) ? (
            <section id="sec-02" className="mt-24 scroll-mt-24">
              <SectionMarker index={2} total={totalSections} label="Contact channels" />
              <dl className="editable-mono grid gap-0 sm:grid-cols-2">
                {location ? <ChannelRow icon={MapPin} label="Location" value={location} /> : null}
                {phone ? <ChannelRow icon={Phone} label="Phone" value={phone} href={`tel:${phone}`} /> : null}
                {email ? <ChannelRow icon={Mail} label="Email" value={email} href={`mailto:${email}`} /> : null}
                {website ? <ChannelRow icon={Globe2} label="Website" value={website.replace(/^https?:\/\//, '')} href={website} external /> : null}
                {links.map((link, i) => (
                  <ChannelRow key={i} icon={ExternalLink} label={`Link 0${i + 1}`} value={link.replace(/^https?:\/\//, '')} href={link} external />
                ))}
              </dl>
            </section>
          ) : null}

          {/* 03 Tags */}
          {post.tags?.length ? (
            <section id="sec-03" className="mt-24 scroll-mt-24">
              <SectionMarker index={3} total={totalSections} label="Tags" />
              <div className="editable-mono flex flex-wrap gap-2">
                {post.tags.slice(0, 12).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--tk-line)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {/* 04 Location (only when mapSrc) */}
          {mapSrc ? (
            <section id="sec-04" className="mt-24 scroll-mt-24">
              <SectionMarker index={4} total={totalSections} label="Location" />
              <MapBox src={mapSrc} label={location || post.title} />
            </section>
          ) : null}

          {/* 05 Record integrity (04 when there's no Location) */}
          <section id={mapSrc ? 'sec-05' : 'sec-04'} className="mt-24 scroll-mt-24">
            <SectionMarker index={mapSrc ? 5 : 4} total={totalSections} label="Record integrity" />
            <ul className="grid gap-4 sm:grid-cols-3">
              {[
                'Direct-link only record',
                'Not surfaced in feeds or search',
                verified ? 'Verified by the archive' : 'Filed by the archive',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-[var(--tk-radius)] border border-[var(--tk-line)] p-5"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--tk-text)]" />
                  <span className="editable-mono text-[11px] font-medium uppercase tracking-[0.16em] leading-[1.5] text-[var(--tk-text)]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <Colophon uid={uid} label={`Contributor · ${post.title}`} />
    </section>
  )
}

/* Channel row used inside the Profile "Contact channels" section — mono, hairline. */
function ChannelRow({
  icon: Icon,
  label,
  value,
  href,
  external = false,
}: {
  icon: typeof MapPin
  label: string
  value: string
  href?: string
  external?: boolean
}) {
  const body = (
    <div className="grid grid-cols-[24px_90px_minmax(0,1fr)] items-center gap-4 border-b border-[var(--tk-line)] py-4">
      <Icon className="h-4 w-4 text-[var(--tk-muted)]" />
      <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)]">{label}</span>
      <span className="truncate text-[12px] font-medium text-[var(--tk-text)]">{value}</span>
    </div>
  )
  if (!href) return body
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="block transition hover:opacity-80">
      {body}
    </a>
  )
}

/* ------------------------------ Shared blocks ------------------------------ */
function Divider() {
  return <div className="my-12 h-px bg-[var(--tk-line)]" />
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-10 max-w-none text-[var(--tk-text)] ${
        compact ? 'text-[15px] leading-[1.7]' : 'text-[16px] leading-[1.8]'
      }`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5">
          <div className="editable-mono flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
            <Icon className="h-3.5 w-3.5" /> {label}
          </div>
          <p className="mt-3 break-words text-sm font-medium leading-6">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-12">
      <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)]">{label}</p>
      <div className={`mt-5 grid gap-4 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => (
          <img
            key={`${image}-${index}`}
            src={image}
            alt=""
            className="aspect-[4/3] rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover"
          />
        ))}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <div className="editable-mono flex items-center gap-2 border-b border-[var(--tk-line)] p-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
        <MapPin className="h-3.5 w-3.5" /> {label || 'Map'}
      </div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? (
        <Link href={website} target="_blank" rel="noreferrer" className="editable-mono inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--tk-accent)] px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--tk-on-accent)] transition hover:opacity-90">
          Website <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      ) : null}
      {phone ? (
        <a href={`tel:${phone}`} className="editable-mono inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] border border-[var(--tk-line)] px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] transition hover:border-[var(--tk-text)]">
          <Phone className="h-3.5 w-3.5" /> Call
        </a>
      ) : null}
      {email ? (
        <a href={`mailto:${email}`} className="editable-mono inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] border border-[var(--tk-line)] px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] transition hover:border-[var(--tk-text)]">
          <Mail className="h-3.5 w-3.5" /> Email
        </a>
      ) : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)]">Quick actions</p>
      <div className="mt-5">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm">
      <span className="editable-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--tk-muted)]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function SidebarRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--tk-line)] pb-3 last:border-b-0 last:pb-0">
      <dt className="text-[10px] text-[var(--tk-muted)]">{label}</dt>
      <dd className="text-[11px] text-[var(--tk-text)]">{value}</dd>
    </div>
  )
}

/* -------- Related strip for non-pdf tasks (article/listing/image/sbm) -------- */
function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="flex items-center justify-between">
          <h2 className="editable-display text-[clamp(1.5rem,3vw,2.4rem)] font-bold tracking-[-0.01em]">
            More {getTaskTheme(task).kicker.toLowerCase()}
          </h2>
          <Link href={taskConfig?.route || '/'} className="editable-mono inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-text)]">
            See all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <RelatedCard key={item.id || item.slug} task={task} post={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post }: { task: TaskKey; post: SitePost }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:border-[var(--tk-text)]"
    >
      <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="h-7 w-7 text-[var(--tk-muted)]" />
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="editable-display line-clamp-2 text-base font-bold leading-snug tracking-[-0.01em]">{post.title}</h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}
