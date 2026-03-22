import { MessageListView } from "@/components/admin/messages/MessageViews";
import { loadMessageInboxData } from "@/components/admin/messages/message-data";
import { AdminPageHeader } from "@/components/admin/layout/AdminUi";

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const status = getSearchParam(resolvedSearchParams.status) ?? "all";
  const data = await loadMessageInboxData({
    status: status === "all" ? undefined : status,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Messages"
        title="Dashboard messages"
        description="Compose and review dashboard messaging in the shared Prototyper UI contract."
      />
      <MessageListView rows={data.rows} filters={{ status }} />
    </div>
  );
}
