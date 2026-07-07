import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
          <EditableReveal>
            <div className="editable-mono flex items-center gap-4 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">
              <span className="rounded-full border border-[var(--editable-border)] px-3 py-1">{pagesContent.about.badge}</span>
              <span className="h-px flex-1 bg-[var(--editable-border)]" />
              <span>{SITE_CONFIG.name}</span>
            </div>
          </EditableReveal>
          <EditableReveal index={1}>
            <h1 className={`${dc.type.heroTitle} mt-10 max-w-[18ch]`}>{pagesContent.about.title}</h1>
          </EditableReveal>

          <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
            <div>
              <EditableReveal>
                <p className={`${dc.type.lead} max-w-[50ch]`}>{pagesContent.about.description}</p>
              </EditableReveal>
              {pagesContent.about.paragraphs.map((paragraph, i) => (
                <EditableReveal key={paragraph} index={i + 1}>
                  <p className={`${dc.type.body} mt-8 max-w-[50ch]`}>{paragraph}</p>
                </EditableReveal>
              ))}
            </div>
            <div className="space-y-6">
              {pagesContent.about.values.map((value, i) => (
                <EditableReveal key={value.title} index={i}>
                  <div className={`${dc.surface.card} p-8`}>
                    <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-muted-text)]">0{i + 1}</p>
                    <h2 className="editable-display mt-6 text-[clamp(1.25rem,2vw,1.75rem)] font-bold leading-[1.15] tracking-[-0.01em]">{value.title}</h2>
                    <p className={`${dc.type.body} mt-5`}>{value.description}</p>
                  </div>
                </EditableReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
