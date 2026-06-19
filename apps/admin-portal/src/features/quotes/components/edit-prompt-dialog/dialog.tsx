"use client";

import { AlignLeftIcon, PencilIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";

import { EditPromptForm } from "./form";

export function EditPromptDialog() {
  const [open, setOpen] = useState(false);

  function handleSubmit() {
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <PencilIcon className="size-4" />
          Edit prompt
        </Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <AlignLeftIcon className="size-4" />
          </div>
          <div>
            <DialogTitle>AI tagging prompt</DialogTitle>
            <DialogDescription>
              Instructions the model follows when classifying every quote.
            </DialogDescription>
          </div>
        </DialogHeader>
        {open && <EditPromptForm onSubmit={handleSubmit} />}
      </DialogContent>
    </Dialog>
  );
}
