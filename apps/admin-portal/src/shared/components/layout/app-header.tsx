"use client";

import { BellIcon, CalendarIcon, MailIcon, PlusIcon, SearchIcon } from "lucide-react";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { SidebarTrigger } from "@repo/ui/components/ui/sidebar";

function NotificationButton({
  icon: Icon,
  count,
  label,
}: {
  icon: typeof BellIcon;
  count?: number;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      aria-label={label}
      className="relative rounded-xl text-muted-foreground"
    >
      <Icon className="size-5" />
      {count != null && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Button>
  );
}

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4 md:px-6">
      <SidebarTrigger className="text-muted-foreground md:hidden" />

      <div className="relative w-full max-w-md">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="h-10 rounded-full bg-muted/40 pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <NotificationButton icon={CalendarIcon} label="Calendar" />
        <NotificationButton icon={MailIcon} count={99} label="Messages" />
        <NotificationButton icon={BellIcon} count={99} label="Notifications" />

        <button
          type="button"
          aria-label="Language"
          className="flex size-9 items-center justify-center rounded-full text-lg leading-none transition-colors hover:bg-muted"
        >
          <span aria-hidden>🇺🇸</span>
        </button>

        <Button size="icon-lg" aria-label="Add" className="rounded-xl">
          <PlusIcon className="size-5" />
        </Button>
      </div>
    </header>
  );
}
