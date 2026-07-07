import Link from 'next/link'
import { ArrowUpRight, ChevronDown, Download, FileText, Filter, Globe, MapPin, Phone, Search, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) =>
  post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const images = Array.isArray(content.images)
    ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const getSummary = (post: SitePost) =>
  stripHtml(
    post.summary ||
      asText(getContent(post).description) ||
      asText(getContent(post).excerpt) ||
      asText(getContent(post).body)
  )
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  listing: 'grid gap-5 xl:grid-cols-2',
  classified: 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-5 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

const cardBase =
  'group block rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:border-[var(--tk-text)]'

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return (
    <TaskArchiveView
      task={task}
      posts={posts}
      pagination={pagination}
      category={category}
      basePath={basePath || taskConfig?.route || `/${task}`}
    />
  )
}

export function TaskArchiveView({
  task,
  posts,
  pagination,
  category,
  basePath,
}: {
  task: TaskKey
  posts: SitePost[]
  pagination: SiteFeedPagination
  category: string
  basePath: string
}) {
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = theme.kicker
  const categoryLabel =
    category === 'all' ? 'All shelves' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {/* Archive header */}
        <header className="relative overflow-hidden border-b border-[var(--tk-line)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:px-8 sm:py-28 lg:px-10 lg:py-36">
            <EditableReveal>
              <div className="editable-mono flex items-center gap-4 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--tk-muted)]">
                <span className="rounded-full border border-[var(--tk-line)] px-3 py-1">{voice?.eyebrow || `(${label})`}</span>
                <span className="h-px flex-1 bg-[var(--tk-line)]" />
                <span>{label}</span>
              </div>
            </EditableReveal>

            <EditableReveal index={1}>
              <h1 className="editable-display mt-10 max-w-[18ch] text-[clamp(2.4rem,8vw,7rem)] font-black leading-[0.98] tracking-[-0.02em] text-[var(--tk-text)]">
                {voice?.headline || `Browse the ${label}`}
              </h1>
            </EditableReveal>

            <EditableReveal index={2}>
              <p className="mt-10 max-w-[54ch] text-[clamp(1rem,1.35vw,1.25rem)] leading-[1.7] text-[var(--tk-muted)]">
                {voice?.description || theme.note}
              </p>
            </EditableReveal>

            {voice?.chips?.length ? (
              <EditableReveal index={3}>
                <div className="mt-10 flex flex-wrap gap-2.5">
                  {voice.chips.map((chip) => (
                    <span
                      key={chip}
                      className="editable-mono rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </EditableReveal>
            ) : null}

            <EditableReveal index={4}>
              <div className="mt-16 flex flex-col gap-4 border-t border-[var(--tk-line)] pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)]">
                  <span className="text-[var(--tk-text)]">{String(posts.length).padStart(2, '0')}</span> filed · {categoryLabel}
                </p>
                <form action={basePath} className="flex items-center gap-2.5">
                  <div className="relative">
                    <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--tk-muted)]" />
                    <select
                      name="category"
                      defaultValue={category}
                      className="editable-mono h-11 appearance-none rounded-[var(--editable-radius-input)] border border-[var(--tk-line)] bg-[var(--tk-surface)] pl-9 pr-9 text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-text)]"
                      aria-label={voice?.filterLabel || 'Filter shelf'}
                    >
                      <option value="all">All shelves</option>
                      {CATEGORY_OPTIONS.map((item) => (
                        <option key={item.slug} value={item.slug}>{item.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                  </div>
                  <button className="editable-mono inline-flex h-11 items-center rounded-[var(--editable-radius-button)] bg-[var(--tk-accent)] px-5 text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--tk-on-accent)] transition hover:opacity-90">
                    Filter
                  </button>
                </form>
              </div>
            </EditableReveal>
          </div>
        </header>

        {/* Ads: single header slot ONLY on the Reference Library (pdf) archive. */}
        {task === 'pdf' ? (
          <div className="border-b border-[var(--tk-line)]">
            <div className="mx-auto w-full max-w-[var(--editable-container)] px-5 py-6 sm:px-8 lg:px-10">
              <Ads slot="header" size={pickRandom(getSlotSizes('header'))} showLabel eager className="mx-auto w-full" />
            </div>
          </div>
        ) : null}

        <section className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
          {posts.length ? (
            <div className={taskGrid[task]}>
              {posts.map((post, index) => (
                <EditableReveal key={post.id || post.slug} index={index}>
                  <ArchivePostCard post={post} task={task} basePath={basePath} index={index} />
                </EditableReveal>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-[var(--tk-radius)] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-20 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-6 text-2xl font-bold tracking-[-0.01em]">Nothing filed here yet.</h2>
              <p className={`mt-3 text-sm leading-6 text-[var(--tk-muted)] editable-mono uppercase tracking-[0.14em]`}>
                Check back after new {label.toLowerCase()} entries are filed.
              </p>
            </div>
          )}

          {posts.length ? (
            <nav className="editable-mono mt-20 flex items-center justify-center gap-3 text-[11px] font-medium uppercase tracking-[0.16em]">
              {pagination.hasPrevPage ? (
                <Link
                  href={pageHref(basePath, category, page - 1)}
                  className="rounded-[var(--editable-radius-button)] border border-[var(--tk-line)] px-5 py-3 transition hover:border-[var(--tk-text)]"
                >
                  ← Previous
                </Link>
              ) : null}
              <span className="rounded-[var(--editable-radius-button)] border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-3 text-[var(--tk-muted)]">
                Page {String(page).padStart(2, '0')} / {String(pagination.totalPages || 1).padStart(2, '0')}
              </span>
              {pagination.hasNextPage ? (
                <Link
                  href={pageHref(basePath, category, page + 1)}
                  className="rounded-[var(--editable-radius-button)] border border-[var(--tk-line)] px-5 py-3 transition hover:border-[var(--tk-text)]"
                >
                  Next →
                </Link>
              ) : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} index={index} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

/* ------------------------------ Cards ------------------------------ */

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Note')
  return (
    <Link href={href} className={`${cardBase} overflow-hidden`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="p-7">
        <p className="editable-mono flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)]">
          <span>No. {String(index + 1).padStart(2, '0')}</span>
          <span className="opacity-40">·</span>
          <span>{category}</span>
        </p>
        <h2 className="editable-display mt-5 line-clamp-3 text-[clamp(1.25rem,1.6vw,1.6rem)] font-bold leading-[1.15] tracking-[-0.01em]">
          {post.title}
        </h2>
        <p className="mt-4 line-clamp-2 text-[14px] leading-[1.7] text-[var(--tk-muted)]">{getSummary(post)}</p>
        <span className="editable-mono mt-6 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--tk-text)]">
          Read note <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} className={`${cardBase} flex items-center gap-6 p-6 sm:p-7`}>
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <FileText className="h-9 w-9 text-[var(--tk-muted)]" />}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="editable-display truncate text-xl font-bold tracking-[-0.01em]">{post.title}</h2>
        <p className="mt-3 line-clamp-1 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="editable-mono mt-4 flex flex-wrap gap-4 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--tk-muted)]">
          {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {location}</span> : null}
          {phone ? <span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3" /> {phone}</span> : null}
          {website ? <span className="inline-flex items-center gap-1.5"><Globe className="h-3 w-3" /> Website</span> : null}
        </div>
      </div>
      <ArrowUpRight className="h-5 w-5 shrink-0 text-[var(--tk-muted)] transition group-hover:text-[var(--tk-text)]" />
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-7`}>
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-3xl font-black tracking-[-0.02em]">{price || 'Open'}</span>
        {condition ? (
          <span className="editable-mono rounded-full border border-[var(--tk-line)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--tk-muted)]">
            {condition}
          </span>
        ) : null}
      </div>
      <h2 className="editable-display mt-6 text-xl font-bold leading-snug tracking-[-0.01em]">{post.title}</h2>
      <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <div className="editable-mono mt-6 flex items-center justify-between border-t border-[var(--tk-line)] pt-4 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--tk-muted)]">
        <span className="inline-flex items-center gap-1.5">
          {location ? <><MapPin className="h-3 w-3" /> {location}</> : 'Details inside'}
        </span>
        <ArrowUpRight className="h-3.5 w-3.5 text-[var(--tk-text)]" />
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link
      href={href}
      className="group mb-5 block break-inside-avoid overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:border-[var(--tk-text)]"
    >
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(0,0,0,0.75))] transition group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h2 className="editable-display line-clamp-2 text-lg font-bold leading-snug tracking-[-0.01em] text-white">
            {post.title}
          </h2>
          <span className="editable-mono mt-3 inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/80">
            View visual <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className={`${cardBase} flex gap-5 p-6`}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--tk-line)] text-[var(--tk-text)]">
        <Globe className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="editable-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
          Bookmark · {String(index + 1).padStart(2, '0')}
        </span>
        <h2 className="editable-display mt-2 text-lg font-bold leading-snug tracking-[-0.01em]">{post.title}</h2>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        {website ? (
          <p className="editable-mono mt-3 truncate text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--tk-text)]">
            {cleanDomain(website)}
          </p>
        ) : null}
      </div>
    </Link>
  )
}

/* ---------- Reference Library card (pdf) — the public star ---------- */
function PdfArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const category = getCategory(post, 'Reference')
  const format = (getField(post, ['format']) || 'PDF').toUpperCase()
  const pages = getField(post, ['pages', 'pageCount'])
  const fileSize = getField(post, ['size', 'fileSize'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col overflow-hidden`}>
      {/* Document glyph face — mirrors the reference's card treatment */}
      <div className="relative aspect-[4/3] overflow-hidden border-b border-[var(--tk-line)] bg-[var(--tk-raised)]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="editable-display text-[clamp(3rem,7vw,6rem)] font-black leading-none tracking-[-0.02em] text-[var(--tk-text)]/85">
            {format}
          </div>
        </div>
        <div className="editable-mono absolute left-4 top-4 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3 py-1 text-[9px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)]">
          Ref. {String(index + 1).padStart(3, '0')}
        </div>
        <div className="editable-mono absolute right-4 top-4 rounded-full bg-[var(--tk-accent)] px-3 py-1 text-[9px] font-medium uppercase tracking-[0.24em] text-[var(--tk-on-accent)]">
          {category}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-7">
        <h2 className="editable-display line-clamp-3 text-[clamp(1.25rem,1.7vw,1.65rem)] font-bold leading-[1.12] tracking-[-0.01em]">
          {post.title}
        </h2>
        <p className="mt-4 line-clamp-3 flex-1 text-[14px] leading-[1.7] text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="editable-mono mt-6 flex items-center justify-between border-t border-[var(--tk-line)] pt-5 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
          <span>{[pages && `${pages} pp`, fileSize].filter(Boolean).join(' · ') || 'Download'}</span>
          <span className="inline-flex items-center gap-1.5 text-[var(--tk-text)]">
            Open <Download className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ---------- Profile archive card — stays functional in code but is NOT
     surfaced publicly. The Profile archive page is not linked anywhere in
     nav / footer / home / cards / search. Kept for byte-identical wiring. ---------- */
function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col items-center p-8 text-center`}>
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />}
      </div>
      <h2 className="editable-display mt-6 text-lg font-bold tracking-[-0.01em]">{post.title}</h2>
      {role ? <p className="editable-mono mt-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">{role}</p> : null}
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}
