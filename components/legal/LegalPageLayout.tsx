import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Legal", href: "/legal/terms" }, { label: title }]} />
      <h1 className="mt-6 text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
      <p className="mt-2 text-xs text-muted">Last updated: {lastUpdated}</p>

      <div className="mt-4 rounded-md border border-warning/30 bg-warning/5 p-4 text-xs text-warning">
        This is template legal content for development purposes only. It has not been reviewed by a solicitor and
        must not be relied on as legal advice or published live before qualified legal review.
      </div>

      <div className="prose prose-neutral mt-8 max-w-none space-y-4 text-sm leading-relaxed text-muted [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1">
        {children}
      </div>
    </div>
  );
}
