import { AppNav, AppSidebar, AppTopBar } from "@/components/ui/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      {/* Mobile keeps the familiar centred phone frame. At lg the sidebar takes
          the left edge and the content shifts right and opens up to a real
          dashboard width instead of a floating phone column.

          Top and bottom clearance both live on <main> alone. This wrapper used
          to carry its own pt/pb as well, which stacked two paddings and left
          ~240px of dead space above the tab bar.

          AppTopBar is sticky inside this wrapper so it tracks the same content
          column as <main> (both max out at 1120px with identical gutters) and
          disappears entirely below lg, where ScreenHeader does its job.

          md only widens the single column (440 → 600px). Every screen in this
          app switches layout at lg — there is no sm/md two-column code to
          squeeze — so below lg they are plain stacks that simply get more room
          on a tablet instead of a lonely phone column in the middle of it. */}
      <div className="mx-auto w-full max-w-[440px] px-4 sm:px-6 md:max-w-[600px] lg:mx-0 lg:max-w-none lg:px-0 lg:pl-[248px] xl:pl-[264px]">
        <AppTopBar />
        <main className="px-4 pb-32 pt-[calc(env(safe-area-inset-top)+1rem)] lg:mx-auto lg:max-w-[1120px] lg:px-10 lg:pb-16 lg:pt-8 xl:px-14">
          {children}
        </main>
        <AppNav />
      </div>
    </>
  );
}
