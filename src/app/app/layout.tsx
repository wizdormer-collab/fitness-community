import { AppNav } from "@/components/ui/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md">
      <main className="px-4 pb-32 pt-[calc(env(safe-area-inset-top)+1rem)]">
        {children}
      </main>
      <AppNav />
    </div>
  );
}
