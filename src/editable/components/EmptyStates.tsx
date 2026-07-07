import Link from 'next/link'
import { ArrowUpRight, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyState({
  title = 'Nothing filed here yet.',
  description = 'The shelf will fill as references are catalogued.',
  actionLabel = 'Return home',
  actionHref = '/',
  className,
}: EmptyStateProps) {
  return (
    <section className={cn('rounded-[var(--editable-radius-card)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-10 text-center', className)}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--editable-border)]">
        <SearchX className="h-5 w-5" />
      </div>
      <h2 className="editable-display mt-6 text-2xl font-bold tracking-[-0.01em]">{title}</h2>
      <p className="editable-mono mx-auto mt-4 max-w-xl text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--slot4-muted-text)]">{description}</p>
      <Link
        href={actionHref}
        className="editable-mono mt-8 inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] border border-[var(--editable-border)] px-5 py-3 text-[11px] font-medium uppercase tracking-[0.14em] transition hover:border-[var(--slot4-page-text)]"
      >
        {actionLabel}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </section>
  )
}

export function TaskEmptyState({ taskLabel = 'references', className }: { taskLabel?: string; className?: string }) {
  return (
    <EmptyState
      className={className}
      title={`No ${taskLabel} available yet`}
      description="This shelf will fill as new entries are catalogued."
      actionLabel="Browse the archive"
      actionHref="/"
    />
  )
}

export function ContactSuccessState({ className }: { className?: string }) {
  return (
    <EmptyState
      className={className}
      title="Message received"
      description="Your note has been received and will be read personally."
      actionLabel="Return home"
      actionHref="/"
    />
  )
}
