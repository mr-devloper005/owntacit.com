'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, FileText, Lock, Send } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { getTaskTheme } from '@/editable/theme/task-themes'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const fieldClass =
  'editable-mono rounded-[var(--editable-radius-input)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-3 text-[13px] text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-soft-muted-text)] focus:border-[var(--slot4-page-text)]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

/*
  Public Create UI centers on Reference-Library submission.
  We hide the 'profile' task from the public picker so we never promote
  profile creation. Internally, all task keys still work.
*/
export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const publicTasks = useMemo(
    () => SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'profile'),
    []
  )
  const defaultKey =
    (publicTasks.find((t) => t.key === 'pdf')?.key || publicTasks[0]?.key || 'article') as TaskKey
  const [task, setTask] = useState<TaskKey>(defaultKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTheme = getTaskTheme(task)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
          <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div className="flex h-full min-h-72 items-center justify-center rounded-[var(--editable-radius-card)] bg-[var(--slot4-dark-bg)] text-[var(--slot4-on-accent)]">
                <Lock className="h-16 w-16 opacity-70" />
              </div>
              <div className="self-center">
                <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">{pagesContent.create.locked.badge}</p>
                <h1 className={`${dc.type.heroTitle} mt-8 max-w-[18ch]`}>{pagesContent.create.locked.title}</h1>
                <p className={`${dc.type.lead} mt-8 max-w-[42ch]`}>{pagesContent.create.locked.description}</p>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Link href="/login" className={dc.button.primary}>Sign in <ArrowUpRight className="h-4 w-4" /></Link>
                  <Link href="/signup" className={dc.button.secondary}>Get started</Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <aside>
              <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">{pagesContent.create.hero.badge}</p>
              <h1 className={`${dc.type.heroTitle} mt-8 max-w-[18ch]`}>{pagesContent.create.hero.title}</h1>
              <p className={`${dc.type.lead} mt-8 max-w-[42ch]`}>{pagesContent.create.hero.description}</p>
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {publicTasks.map((item) => {
                  const active = item.key === task
                  const theme = getTaskTheme(item.key)
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTask(item.key)}
                      className={`text-left transition duration-500 ${dc.surface.card} p-5 ${
                        active ? 'border-[var(--slot4-page-text)] bg-[var(--slot4-panel-bg)]' : 'hover:border-[var(--slot4-page-text)]'
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="editable-display mt-4 block text-base font-bold leading-tight tracking-[-0.01em]">{theme.kicker}</span>
                      <span className="editable-mono mt-2 block text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-muted-text)]">
                        {item.description}
                      </span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <form onSubmit={submit} className={`${dc.surface.soft} p-6 sm:p-8`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">
                    File a {activeTheme.kicker.toLowerCase()}
                  </p>
                  <h2 className="editable-display mt-3 text-[clamp(1.5rem,2.5vw,2rem)] font-bold tracking-[-0.01em]">
                    {pagesContent.create.formTitle}
                  </h2>
                </div>
                <span className="editable-mono rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.18em]">
                  {session.name}
                </span>
              </div>

              <div className="mt-8 grid gap-4">
                <input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input className={fieldClass} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Shelf / category" />
                  <input className={fieldClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Source or file URL" />
                </div>
                <input className={fieldClass} value={image} onChange={(e) => setImage(e.target.value)} placeholder="Cover image URL" />
                <textarea className={`${fieldClass} min-h-24`} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Filing note (short summary)" required />
                <textarea className={`${fieldClass} min-h-48`} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Full description, details, notes" required />
              </div>

              {created ? (
                <div className="editable-mono mt-6 flex items-center gap-2 rounded-[var(--editable-radius-card)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-5 text-[11px] font-medium uppercase tracking-[0.18em]">
                  <CheckCircle2 className="h-4 w-4" /> {pagesContent.create.successTitle}
                </div>
              ) : null}

              <button type="submit" className={`${dc.button.primary} mt-8 w-full`}>
                <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
              </button>
            </form>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
