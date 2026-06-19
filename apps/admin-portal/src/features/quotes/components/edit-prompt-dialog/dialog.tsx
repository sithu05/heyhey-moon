"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { AlignLeftIcon, PencilIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { EditPromptForm } from "./form";
import { defaultValues, editPromptSchema, type EditPromptFormValues } from "./schema";

export function EditPromptDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<EditPromptFormValues>({
    resolver: zodResolver(editPromptSchema),
    defaultValues,
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) form.reset(defaultValues);
  }

  function handleSubmit(_values: EditPromptFormValues) {
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <PencilIcon className="size-4" />
          Edit prompt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl sm:max-w-4xl">
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
        <EditPromptForm
          form={form}
          onSubmit={handleSubmit}
          onReset={() => form.reset(defaultValues)}
        />
      </DialogContent>
    </Dialog>
  );
}
