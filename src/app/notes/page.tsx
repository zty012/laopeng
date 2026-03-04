import NoteContent from "@/components/NoteContent";
import PortalLayout from "@/components/PortalLayout";
import { Suspense } from "react";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ title?: string }>;
}) {
  const title = (await searchParams).title;

  return (
    <PortalLayout>
      <div className="h-full flex flex-col overflow-hidden">
        {title ? (
          <NoteContent title={decodeURIComponent(title)} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            请从侧边栏选择一个笔记查看
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
