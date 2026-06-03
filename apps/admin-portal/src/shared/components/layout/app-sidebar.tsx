"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  type LucideIcon,
  MoreVerticalIcon,
} from "lucide-react";

import { cn } from "@repo/ui/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@repo/ui/components/ui/sidebar";

import { favorites, mainMenu, type NavItem } from "./nav";

function isItemActive(pathname: string, item: NavItem) {
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function MenuItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isItemActive(pathname, item);
  const Icon = item.icon;

  if (item.items?.length) {
    return (
      <Collapsible asChild defaultOpen={active} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              isActive={active}
              tooltip={item.label}
            >
              <Icon />
              <span>{item.label}</span>
              <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
            <SidebarMenuSub>
              {item.items.map((sub) => (
                <SidebarMenuSubItem key={sub.href}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === sub.href}
                  >
                    <Link href={sub.href}>{sub.label}</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.label}
      >
        <Link href={item.href}>
          <Icon />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/** Square muted icon button used for the header collapse and footer expand controls. */
function RailToggleButton({
  icon: Icon,
  label,
  className,
}: {
  icon: LucideIcon;
  label: string;
  className?: string;
}) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={label}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-muted/80",
        className,
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { state, openMobile, isMobile } = useSidebar();
  // Desktop: open/collapsed from `state`. Mobile: from `openMobile` (defaults false ⇒
  // the rail starts collapsed) so the footer button can expand it.
  //
  // NOTE: `isMobile` is false during SSR/first paint then flips after mount, so a phone
  // briefly renders the expanded rail before snapping to the icon width (a one-frame flash).
  // Fixing it fully would require breakpoint info at SSR or changes to the shared primitive
  // (which we keep generic), so we accept it as a minor cosmetic tradeoff.
  const collapsed = isMobile ? !openMobile : state === "collapsed";

  return (
    // Built on the stock `collapsible="none"` variant (sidebar-09 pattern): we drive the
    // icon-collapse ourselves. This depends on `@repo/ui` internals — the `none` branch
    // spreading `{...props}` (so `data-collapsible` lands) and the prefixed sub-component
    // rules keying off the literal `ui:group` marker. `group` powers our own app-level
    // group-data variants; the `!` width override beats the branch's hardcoded width.
    // If those internals change, the collapse styling breaks silently (no type error).
    <Sidebar
      collapsible="none"
      data-collapsible={collapsed ? "icon" : ""}
      className={cn(
        "group ui:group h-svh border-r border-sidebar-border transition-[width] duration-200 ease-linear",
        collapsed ? "w-(--sidebar-width-icon)!" : "w-(--sidebar-width)",
      )}
    >
      <SidebarHeader className="border-b border-sidebar-border p-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-5">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <Image src="/logo-icon.svg" alt="Zello" width={34} height={34} priority />
            <span className="text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
              Zello
            </span>
          </Link>
          <RailToggleButton
            icon={ChevronLeftIcon}
            label="Collapse sidebar"
            className="group-data-[collapsible=icon]:hidden"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase tracking-wider">
            {mainMenu.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenu.items.map((item) => (
                <MenuItem key={item.href} item={item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="uppercase tracking-wider">
            {favorites.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {favorites.items.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <Link href={item.href}>
                        <Icon className="fill-amber-400 text-amber-400" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="group-data-[collapsible=icon]:border-t group-data-[collapsible=icon]:border-sidebar-border">
        <RailToggleButton
          icon={ChevronRightIcon}
          label="Expand sidebar"
          className="mx-auto hidden group-data-[collapsible=icon]:flex"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-lg p-1.5 text-left outline-hidden transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                "group-data-[collapsible=icon]:justify-center",
              )}
            >
              <Avatar className="size-8 rounded-full">
                <AvatarImage src="https://i.pravatar.cc/80?img=12" alt="John Will Palinsky" />
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-medium">John Will Palinsky</span>
                <span className="truncate text-xs text-muted-foreground">Manager</span>
              </div>
              <MoreVerticalIcon className="size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel>John Will Palinsky</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Account</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
