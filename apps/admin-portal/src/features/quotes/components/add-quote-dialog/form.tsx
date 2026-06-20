"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SparklesIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@repo/ui/components/ui/button";
import { DialogClose, DialogFooter } from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";

import {
  addQuoteSchema,
  defaultValues,
  type AddQuoteFormValues,
} from "./schema";

const LANGUAGES = [
  { value: "en" as const, code: "EN", name: "English" },
  { value: "th" as const, code: "TH", name: "ไทย" },
  { value: "my" as const, code: "MY", name: "မြန်မာ" },
];

type AddQuoteFormProps = {
  onSubmit: (values: AddQuoteFormValues) => void;
  onEditPrompt?: () => void;
};

export function AddQuoteForm({ onSubmit, onEditPrompt }: AddQuoteFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddQuoteFormValues>({
    resolver: zodResolver(addQuoteSchema),
    defaultValues,
  });

  const selectedLanguage = watch("language");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col flex-1 min-h-0"
    >
      <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
        {/* QUOTE */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Quote
          </p>
          <Textarea
            {...register("quote")}
            aria-label="Quote"
            placeholder="Paste or type the quote…"
            className="min-h-[100px] resize-none"
          />
          {errors.quote && (
            <p className="text-xs text-destructive">{errors.quote.message}</p>
          )}
        </div>

        {/* AUTHOR / SOURCE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Author
            </p>
            <Input
              {...register("author")}
              aria-label="Author"
              placeholder="e.g. Marcus Aurelius"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Source
            </p>
            <Input
              {...register("source")}
              aria-label="Source"
              placeholder="e.g. Meditations"
            />
          </div>
        </div>

        {/* LANGUAGE */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Language
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.value;
              return (
                <Button
                  key={lang.value}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() =>
                    setValue("language", lang.value, { shouldValidate: true })
                  }
                >
                  <span className="font-bold">{lang.code}</span> {lang.name}
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Auto-detected from the text — adjust if needed.
          </p>
        </div>

        {/* CONTEXT */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Context
              </p>
              <p className="text-xs text-muted-foreground">
                Crawled background that sharpens the AI tags.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm">
              Find context
            </Button>
          </div>
          <Textarea
            {...register("context")}
            aria-label="Context"
            placeholder="Click 'Find context' to crawl the web, or write your own…"
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* AI Tagging Banner */}
        {onEditPrompt && (
          <div className="rounded-lg bg-muted/50 p-3 flex items-center gap-3">
            <SparklesIcon className="size-4 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground flex-1">
              Tagged automatically with Claude Sonnet 4.5 using your saved
              prompt.
            </p>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="px-0"
              onClick={onEditPrompt}
            >
              Edit prompt
            </Button>
          </div>
        )}
      </div>

      <DialogFooter className="flex-row justify-between items-center">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">Classify with AI</Button>
      </DialogFooter>
    </form>
  );
}