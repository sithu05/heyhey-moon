import { AppHeader } from "@/shared/components/ui/app-header";
import { AppSidebar } from "@/shared/components/ui/app-sidebar";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/ui/sidebar";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16.5rem",
            "--sidebar-width-icon": "4.625rem",
          } as React.CSSProperties
        }
        className="bg-sidebar"
      >
        <AppSidebar variant="inset" className="p-0" />
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 overflow-auto px-6 py-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
