import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Filter, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { Ads, getSlotSizes } from '@/lib/ads'
import { getTaskTheme } from '@/editable/theme/task-themes'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) =>
  typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? (content.images.find((item) => typeof item === 'string') as string | undefined) : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const compactRaw = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const summaryOf = (post: SitePost) =>
  post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || ''

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  // Never surface profile results publicly.
  if (typeText === 'profile') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (derivedTask === 'profile') return false
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function ResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const label = task ? getTaskTheme(task).kicker : 'Filed'
  const wide = index % 5 === 0

  return (
    <EditableReveal index={index}>
      <Link
        href={href}
        className={`group block overflow-hidden rounded-[var(--editable-radius-card)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-500 hover:border-[var(--slot4-page-text)] ${wide ? 'md:col-span-2' : ''}`}
      >
        {image ? (
          <div className={`relative overflow-hidden bg-[var(--slot4-media-bg)] ${wide ? 'aspect-[16/7]' : 'aspect-[16/10]'}`}>
            <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
            <span className="editable-mono absolute left-4 top-4 rounded-full border border-white/40 bg-black/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-white backdrop-blur">
              {label}
            </span>
          </div>
        ) : null}
        <div className="p-6 sm:p-7">
          {!image ? (
            <span className="editable-mono rounded-full border border-[var(--editable-border)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-muted-text)]">
              {label}
            </span>
          ) : null}
          <h2 className="editable-display mt-5 line-clamp-3 text-[clamp(1.25rem,1.7vw,1.75rem)] font-bold leading-[1.15] tracking-[-0.01em]">
            {post.title}
          </h2>
          {summary ? (
            <p className="mt-4 line-clamp-3 text-[14px] leading-[1.7] text-[var(--slot4-muted-text)]">{summary}</p>
          ) : null}
          <span className="editable-mono mt-6 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-page-text)]">
            Open reference <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </EditableReveal>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }>
}) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(
    useMaster ? 1000 : 300,
    useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined
  )
  const posts = feed?.posts?.length
    ? feed.posts
    : useMaster
    ? []
    : SITE_CONFIG.tasks
        .filter((item) => item.enabled && item.key !== 'profile')
        .flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  // Task filter dropdown — exclude profile so it never appears as an option.
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled && item.key !== 'profile')

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <EditableReveal>
            <div className="editable-mono flex items-center gap-4 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">
              <span className="rounded-full border border-[var(--editable-border)] px-3 py-1">{pagesContent.search.hero.badge}</span>
              <span className="h-px flex-1 bg-[var(--editable-border)]" />
            </div>
          </EditableReveal>

          <EditableReveal index={1}>
            <h1 className="editable-display mt-10 max-w-[18ch] text-[clamp(2.4rem,7vw,6rem)] font-black leading-[0.98] tracking-[-0.02em]">
              {pagesContent.search.hero.title}
            </h1>
          </EditableReveal>

          <EditableReveal index={2}>
            <p className="mt-10 max-w-[54ch] text-[clamp(1rem,1.35vw,1.2rem)] leading-[1.7] text-[var(--slot4-muted-text)]">
              {pagesContent.search.hero.description}
            </p>
          </EditableReveal>

          <EditableReveal index={3}>
            <form action="/search" className="mt-12 rounded-[var(--editable-radius-card)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-5 sm:p-6">
              <input type="hidden" name="master" value="1" />
              <label className="flex items-center gap-3 border-b border-[var(--editable-border)] pb-4">
                <Search className="h-5 w-5 text-[var(--slot4-muted-text)]" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder={pagesContent.search.hero.placeholder}
                  className="editable-mono min-w-0 flex-1 bg-transparent text-[14px] font-normal outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
                />
              </label>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <label className="editable-mono flex items-center gap-2 rounded-[var(--editable-radius-input)] border border-[var(--editable-border)] px-4 py-3 text-[12px] font-medium uppercase tracking-[0.14em]">
                  <Filter className="h-3.5 w-3.5 text-[var(--slot4-muted-text)]" />
                  <input
                    name="category"
                    defaultValue={category}
                    placeholder="Shelf"
                    className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
                  />
                </label>
                <select
                  name="task"
                  defaultValue={task}
                  className="editable-mono rounded-[var(--editable-radius-input)] border border-[var(--editable-border)] px-4 py-3 text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-page-text)] outline-none"
                >
                  <option value="">All content types</option>
                  {enabledTasks.map((item) => (
                    <option key={item.key} value={item.key}>{getTaskTheme(item.key).kicker}</option>
                  ))}
                </select>
                <button type="submit" className={dc.button.primary}>Search</button>
              </div>
            </form>
          </EditableReveal>

          <div className="mt-16 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--editable-border)] pb-10">
            <div>
              <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">
                {String(results.length).padStart(3, '0')} results
              </p>
              <h2 className="editable-display mt-4 text-[clamp(1.5rem,2.6vw,2.2rem)] font-bold tracking-[-0.01em]">
                {query ? `Results for "${query}"` : pagesContent.search.resultsTitle}
              </h2>
            </div>
          </div>

          {results.length ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((post, index) => (
                <ResultCard key={post.id || post.slug} post={post} index={index} />
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-[var(--editable-radius-card)] border border-dashed border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-16 text-center">
              <p className="editable-display text-2xl font-bold tracking-[-0.01em]">Nothing matches that yet.</p>
              <p className="editable-mono mt-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">
                Try a different keyword or a wider shelf.
              </p>
            </div>
          )}

          {/* Search page ad: footer slot */}
          <div className="mt-20 border-t border-[var(--editable-border)] pt-10">
            <Ads slot="footer" size={pickRandom(getSlotSizes('footer'))} showLabel className="mx-auto w-full" />
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
