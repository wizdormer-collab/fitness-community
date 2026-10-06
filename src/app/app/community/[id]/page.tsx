import { notFound } from "next/navigation";
import { communityById } from "@/lib/selectors";
import { CommunityDetail } from "@/components/community-detail";

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const community = communityById(id);
  if (!community) notFound();
  return <CommunityDetail id={id} />;
}
