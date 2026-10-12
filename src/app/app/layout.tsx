import { AppNav } from "@/components/ui/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[440px] px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))] safe-b sm:px-6">
      <div className="mx-auto min-h-dvh w-full max-w-md">
        <main className="px-4 pb-32 pt-[calc(env(safe-area-inset-top)+1rem)]">
          {children}
        </main>
        <AppNav />
      </div>
    </div>
  );
}
