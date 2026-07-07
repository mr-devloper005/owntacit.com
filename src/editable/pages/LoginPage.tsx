import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/login', title: 'Sign in', description: pagesContent.auth.login.metadataDescription })
}

export default function LoginPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-[calc(100vh-4rem)] bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-[var(--editable-container)] items-center gap-16 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:gap-24 lg:px-10">
          <EditableReveal>
            <div>
              <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">{pagesContent.auth.login.badge}</p>
              <h1 className={`${dc.type.heroTitle} mt-8 max-w-[18ch]`}>{pagesContent.auth.login.title}</h1>
              <p className={`${dc.type.lead} mt-8 max-w-[42ch]`}>{pagesContent.auth.login.description}</p>
            </div>
          </EditableReveal>
          <EditableReveal index={1}>
            <div className={`${dc.surface.card} p-8 sm:p-10`}>
              <h2 className="editable-display text-2xl font-bold tracking-[-0.01em]">{pagesContent.auth.login.formTitle}</h2>
              <EditableLocalLoginForm />
              <p className="editable-mono mt-8 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--slot4-muted-text)]">
                New here?{' '}
                <Link href="/signup" className="text-[var(--slot4-page-text)] underline decoration-1 underline-offset-4">
                  {pagesContent.auth.login.createCta}
                </Link>
              </p>
            </div>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
