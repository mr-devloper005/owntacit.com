import type { Metadata } from 'next'
import { SchemaJsonLd } from '@/components/seo/schema-jsonld'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { buildPageMetadata } from '@/lib/seo'
import { fetchHomeTaskFeed, fetchHomeTimeSections, type HomeTimeSection } from '@/lib/task-data'
import { pagesContent } from '@/editable/content/pages.content'
import type { SitePost } from '@/lib/site-connector'
import {
  EditableHomeCta,
  EditableHomeHero,
  EditableMagazineSplit,
  EditableStoryRail,
  EditableTimeCollections,
} from '@/editable/sections/HomeSections'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 300

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/',
    title: pagesContent.home.metadata.title,
    description: pagesContent.home.metadata.description,
    openGraphTitle: pagesContent.home.metadata.openGraphTitle,
    openGraphDescription: pagesContent.home.metadata.openGraphDescription,
    image: SITE_CONFIG.defaultOgImage,
    keywords: [...pagesContent.home.metadata.keywords],
  })
}

type TaskFeedItem = { task: (typeof SITE_CONFIG.tasks)[number]; posts: SitePost[] }

function uniquePosts(posts: SitePost[]) {
  return Array.from(new Map(posts.map((post) => [post.slug || post.id || post.title, post])).values())
}

/*
  Public surface centers on the Reference Library.
  We prefer the pdf task as the primary source; if it's not enabled, we fall
  back to the first enabled task — but no profile content is surfaced (Profile
  is direct-URL-only).
*/
function pickPrimaryTaskKey(): TaskKey {
  const preferred: TaskKey[] = ['pdf', 'article', 'sbm', 'image', 'listing', 'classified']
  for (const key of preferred) {
    if (SITE_CONFIG.tasks.some((t) => t.key === key && t.enabled)) return key
  }
  const first = SITE_CONFIG.tasks.find((t) => t.enabled)?.key
  return (first && first !== 'profile' ? first : 'article') as TaskKey
}

export default async function HomePage() {
  const primaryTask = pickPrimaryTaskKey()
  const primaryRoute = SITE_CONFIG.taskViews[primaryTask] || `/${primaryTask}`
  const taskFeed: TaskFeedItem[] = await fetchHomeTaskFeed(12, { timeoutMs: 2500 })
  const primaryPosts = uniquePosts(
    taskFeed.find(({ task }) => task.key === primaryTask)?.posts || taskFeed.flatMap(({ posts }) => posts)
  )
    // Drop any profile posts from the public feed.
    .filter((p) => {
      const c = (p.content && typeof p.content === 'object' ? p.content : {}) as Record<string, unknown>
      return typeof c.type !== 'string' || c.type.toLowerCase() !== 'profile'
    })
    .slice(0, 24)

  const timeSections: HomeTimeSection[] = await fetchHomeTimeSections(primaryTask, { limit: 8, timeoutMs: 2500 })
  const baseUrl = SITE_CONFIG.baseUrl.replace(/\/$/, '')

  return (
    <EditableSiteShell>
      <main>
        <SchemaJsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_CONFIG.name,
            url: baseUrl,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${baseUrl}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }}
        />
        <EditableHomeHero primaryTask={primaryTask} primaryRoute={primaryRoute} posts={primaryPosts} timeSections={timeSections} />

        {/* Only ad on the home page — header slot as per placement rules. */}
        <div className="mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-10">
          <div className="border-b border-[var(--editable-border)] py-6">
            <Ads slot="header" size={pickRandom(getSlotSizes('header'))} showLabel eager className="mx-auto w-full" />
          </div>
        </div>

        <EditableStoryRail primaryTask={primaryTask} primaryRoute={primaryRoute} posts={primaryPosts} timeSections={timeSections} />
        <EditableMagazineSplit primaryTask={primaryTask} primaryRoute={primaryRoute} posts={primaryPosts} timeSections={timeSections} />
        <EditableTimeCollections primaryTask={primaryTask} primaryRoute={primaryRoute} posts={primaryPosts} timeSections={timeSections} />
        <EditableHomeCta />
      </main>
    </EditableSiteShell>
  )
}
