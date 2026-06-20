"use client";

import { PencilIcon } from "lucide-react";
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

type EditPromptDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function EditPromptDialog({
  open: controlledOpen,
  onOpenChange,
}: EditPromptDialogProps = {}) {
  const [open, setOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : open;

  function setIsOpen(value: boolean) {
    onOpenChange?.(value);
    if (controlledOpen === undefined) {
      setOpen(value);
    }
  }

  function handleSubmit() {
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PencilIcon />
          Edit prompt
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 gap-0 sm:max-w-4xl">
        <DialogHeader className="gap-0 p-5 border-b">
          <DialogTitle className="text-lg font-semibold">
            AI tagging prompt
          </DialogTitle>
          <DialogDescription className="text-sm">
            Instructions the model follows when classifying every quote.
          </DialogDescription>
        </DialogHeader>
        {isOpen && <EditPromptForm onSubmit={handleSubmit} />}
      </DialogContent>
    </Dialog>
  );
}
