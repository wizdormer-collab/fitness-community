import { AppNav, AppSidebar } from "@/components/ui/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      {/* Mobile keeps the familiar centred phone frame. At lg the sidebar takes
          the left edge and the content shifts right and opens up to a real
          dashboard width instead of a floating phone column.

          Top and bottom clearance both live on <main> alone. This wrapper used
          to carry its own pt/pb as well, which stacked two paddings and left
          ~240px of dead space above the tab bar. */}
      <div className="mx-auto w-full max-w-[440px] px-4 sm:px-6 lg:mx-0 lg:max-w-none lg:px-0 lg:pl-[248px] xl:pl-[264px]">
        <main className="px-4 pb-32 pt-[calc(env(safe-area-inset-top)+1rem)] lg:mx-auto lg:max-w-[1120px] lg:px-10 lg:pb-16 lg:pt-10 xl:px-14">
          {children}
        </main>
        <AppNav />
      </div>
    </>
  );
}
