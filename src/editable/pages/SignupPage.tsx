import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/signup', title: 'Get started', description: pagesContent.auth.signup.metadataDescription })
}

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-[calc(100vh-4rem)] bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-[var(--editable-container)] items-center gap-16 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1fr] lg:gap-24 lg:px-10">
          <EditableReveal>
            <div className={`${dc.surface.card} p-8 sm:p-10`}>
              <h1 className="editable-display text-2xl font-bold tracking-[-0.01em]">{pagesContent.auth.signup.formTitle}</h1>
              <EditableLocalSignupForm />
              <p className="editable-mono mt-8 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--slot4-muted-text)]">
                Already have an account?{' '}
                <Link href="/login" className="text-[var(--slot4-page-text)] underline decoration-1 underline-offset-4">
                  {pagesContent.auth.signup.loginCta}
                </Link>
              </p>
            </div>
          </EditableReveal>
          <EditableReveal index={1}>
            <div>
              <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">{pagesContent.auth.signup.badge}</p>
              <h2 className={`${dc.type.heroTitle} mt-8 max-w-[18ch]`}>{pagesContent.auth.signup.title}</h2>
              <p className={`${dc.type.lead} mt-8 max-w-[42ch]`}>{pagesContent.auth.signup.description}</p>
            </div>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
