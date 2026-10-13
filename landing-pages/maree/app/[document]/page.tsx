import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { documents, credits } from "@/lib/documents";
type Key = keyof typeof documents;
export function generateStaticParams() {
  return Object.keys(documents).map((document) => ({ document }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ document: string }>;
}): Promise<Metadata> {
  const { document } = await params;
  return { title: documents[document as Key]?.title ?? "Not found" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ document: string }>;
}) {
  const { document } = await params;
  if (!Object.hasOwn(documents, document)) notFound();
  const d = documents[document as Key];
  return (
    <article className="inner-page legal-page">
      <header className="page-intro">
        <p className="eyebrow">The details matter</p>
        <h1>{d.title}</h1>
        <p>{d.intro}</p>
      </header>
      {d.sections.map(([title, text]) => (
        <section key={title}>
          <h2>{title}</h2>
          <p>{text}</p>
        </section>
      ))}
      {document === "credits" &&
        credits.map(([title, author, url, license, licenseUrl]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>
              Photograph by{" "}
              <a href={url} target="_blank" rel="noreferrer">
                {author}
              </a>
              . Used under the{" "}
              <a href={licenseUrl} target="_blank" rel="noreferrer">
                {license}
              </a>
              .
            </p>
          </section>
        ))}
    </article>
  );
}
