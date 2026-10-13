import { CommissionForm } from "@/components/commission-form";
export const metadata = { title: "Make it yours" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ piece?: string; finish?: string }>;
}) {
  const { piece, finish } = await searchParams;
  return (
    <section className="inner-page">
      <p className="eyebrow">GOOD IDEAS START SOMEWHERE.</p>
      <h1>
        A little brief.
        <br />
        <em>A lot of possibility.</em>
      </h1>
      <CommissionForm initialPiece={piece} initialFinish={finish} />
    </section>
  );
}
