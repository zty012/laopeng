import NoteContent from "@/components/NoteContent";
import PortalLayout from "@/components/PortalLayout";

export default async function Page({
  params,
}: {
  params: Promise<{ title: string }>;
}) {
  const { title } = await params;

  return (
    <PortalLayout>
      <div className="h-full flex flex-col overflow-hidden">
        <NoteContent title={decodeURIComponent(title)} />
      </div>
    </PortalLayout>
  );
}
