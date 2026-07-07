'use client'

import { Bookmark, Mail, Sparkles, FileText } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

// Reference-Library framing — every lane is about the archive itself.
const lanes = [
  { icon: FileText, title: 'File a reference', body: 'Submit a document, working paper, or downloadable resource for the shared shelves.' },
  { icon: Bookmark, title: 'Suggest a shelf', body: 'Recommend an additional category, curation, or organizing principle for the archive.' },
  { icon: Mail, title: 'Corrections & updates', body: 'Flag broken files, out-of-date references, or filing errors in the catalogue.' },
  { icon: Sparkles, title: 'Curator collaboration', body: 'Collaborate on curated collections, editorial notes, or long-form filing projects.' },
]

export default function ContactPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
          <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">
            <div>
              <EditableReveal>
                <div className="editable-mono flex items-center gap-4 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">
                  <span className="rounded-full border border-[var(--editable-border)] px-3 py-1">{pagesContent.contact.eyebrow}</span>
                  <span className="h-px flex-1 bg-[var(--editable-border)]" />
                </div>
              </EditableReveal>
              <EditableReveal index={1}>
                <h1 className={`${dc.type.heroTitle} mt-10 max-w-[18ch]`}>{pagesContent.contact.title}</h1>
              </EditableReveal>
              <EditableReveal index={2}>
                <p className={`${dc.type.lead} mt-10 max-w-[50ch]`}>{pagesContent.contact.description}</p>
              </EditableReveal>

              <div className="mt-12 grid gap-6 sm:grid-cols-2">
                {lanes.map((lane, i) => (
                  <EditableReveal key={lane.title} index={i}>
                    <div className={`${dc.surface.card} p-6`}>
                      <lane.icon className="h-5 w-5 text-[var(--slot4-page-text)]" />
                      <h2 className="editable-display mt-5 text-lg font-bold leading-[1.2] tracking-[-0.01em]">{lane.title}</h2>
                      <p className={`${dc.type.body} mt-4`}>{lane.body}</p>
                    </div>
                  </EditableReveal>
                ))}
              </div>
            </div>

            <EditableReveal index={3}>
              <div className={`${dc.surface.card} p-8 lg:sticky lg:top-24 lg:self-start`}>
                <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">Form</p>
                <h2 className="editable-display mt-5 text-[clamp(1.5rem,2.5vw,2rem)] font-bold tracking-[-0.01em]">{pagesContent.contact.formTitle}</h2>
                <EditableContactLeadForm />
              </div>
            </EditableReveal>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
