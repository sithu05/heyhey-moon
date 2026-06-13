"use client";

import { ChevronLeftIcon } from "lucide-react";

import { Button } from "@repo/ui/components/ui/button";
import { useSidebar } from "@repo/ui/components/ui/sidebar";

export function SidebarToggler() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="bg-[#F1F2F4]"
      onClick={toggleSidebar}
    >
      <ChevronLeftIcon />
    </Button>
  );
}
