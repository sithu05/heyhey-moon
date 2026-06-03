"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, MoreVerticalIcon } from "lucide-react";

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

export function AppSidebar() {
  const pathname = usePathname();
  const { state, isMobile, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-5">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          {collapsed ? (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              className="flex items-center"
            >
              <Image src="/logo-icon.svg" alt="Zello" width={34} height={34} priority />
            </button>
          ) : (
            <Link href="/" className="flex items-center gap-2 overflow-hidden">
              <Image src="/logo-icon.svg" alt="Zello" width={34} height={34} priority />
              <span className="text-lg font-semibold tracking-tight">Zello</span>
            </Link>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
          )}
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

      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-lg p-1.5 text-left outline-hidden transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                state === "collapsed" && "justify-center",
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
