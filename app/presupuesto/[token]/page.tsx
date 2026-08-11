import { getQuoteByToken } from "@/app/actions/quotes";
import { notFound } from "next/navigation";
import { QuoteView } from "./quote-view";

export const dynamic = "force-dynamic";

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const quote = await getQuoteByToken(token);

  if (!quote) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-brand-blue/30 selection:text-slate-950 hover:bg-brand-cyan">
      <QuoteView quote={quote} token={token} />
    </div>
  );
}
