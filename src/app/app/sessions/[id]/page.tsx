import { notFound } from "next/navigation";
import { sessionById } from "@/lib/selectors";
import { SessionDetail } from "@/components/session-detail";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = sessionById(id);
  if (!session) notFound();
  return <SessionDetail id={id} />;
}
