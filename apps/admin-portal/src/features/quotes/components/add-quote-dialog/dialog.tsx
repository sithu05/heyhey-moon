"use client";

import { PlusIcon } from "lucide-react";
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

import { AddQuoteForm } from "./form";
import { type AddQuoteFormValues } from "./schema";

type AddQuoteDialogProps = {
  onSubmit: (values: AddQuoteFormValues) => void;
  onEditPrompt?: () => void;
};

export function AddQuoteDialog({
  onSubmit,
  onEditPrompt,
}: AddQuoteDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (values: AddQuoteFormValues) => {
    onSubmit(values);
    setOpen(false);
  };

  const handleEditPrompt = () => {
    onEditPrompt?.();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <PlusIcon className="size-4" />
          Add quote
        </Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PlusIcon className="size-4" />
          </div>
          <div>
            <DialogTitle>Add a quote</DialogTitle>
            <DialogDescription>
              Enter the quote — AI assigns the attributes for you.
            </DialogDescription>
          </div>
        </DialogHeader>
        {open && (
          <AddQuoteForm
            onSubmit={handleSubmit}
            onEditPrompt={onEditPrompt ? handleEditPrompt : undefined}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}