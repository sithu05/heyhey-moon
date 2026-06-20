"use client";

import { WandSparkles } from "lucide-react";
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

export function AddQuoteDialog() {
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <WandSparkles />
          Add quote
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 sm:max-w-3xl gap-0">
        <DialogHeader className="gap-0 p-5 border-b">
          <DialogTitle className="text-lg font-semibold">
            Add a quote
          </DialogTitle>
          <DialogDescription className="text-sm">
            Enter the quote — AI assigns the attributes for you.
          </DialogDescription>
        </DialogHeader>
        {open && <AddQuoteForm onSubmit={handleSubmit} />}
      </DialogContent>
    </Dialog>
  );
}
