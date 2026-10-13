import { notFound } from "next/navigation";
import { brand, documents } from "@/lib/content";
export function generateStaticParams() {
  return Object.keys(documents).map((document) => ({ document }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ document: string }>;
}) {
  const { document } = await params;
  return { title: documents[document]?.title ?? "Not found" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ document: string }>;
}) {
  const { document } = await params;
  const doc = documents[document];
  if (!doc) notFound();
  return (
    <article className="inner-page prose">
      <p className="eyebrow">{brand.name} / Information</p>
      <h1>{doc.title}</h1>
      {doc.sections.map(([title, text]) => (
        <section key={title}>
          <h2>{title}</h2>
          <p>{text}</p>
        </section>
      ))}
    </article>
  );
}
