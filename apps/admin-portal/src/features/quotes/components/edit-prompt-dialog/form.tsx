"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { DialogClose, DialogFooter } from "@repo/ui/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@repo/ui/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { cn } from "@repo/ui/lib/utils";

import { defaultValues } from "./constants";
import { editPromptSchema, MODELS } from "./schema";
import type { EditPromptFormValues } from "./types";
import { DIMENSION_VALUES } from "../../constants";
import { DIMENSION_ORDER, DIMENSIONS } from "../../types";

const MODEL_META: Record<
  (typeof MODELS)[number],
  {
    name: string;
    badge: { label: string; className: string } | null;
    provider: string;
    description: string;
  }
> = {
  "claude-sonnet-4-5": {
    name: "Claude Sonnet 4.5",
    badge: { label: "RECOMMENDED", className: "bg-green-100 text-green-700" },
    provider: "Anthropic",
    description:
      "Balanced quality and speed for nuanced, multi-dimension tagging.",
  },
  "claude-haiku-4-5": {
    name: "Claude Haiku 4.5",
    badge: { label: "FAST", className: "bg-gray-100 text-gray-600" },
    provider: "Anthropic",
    description: "Fastest and lowest cost — ideal for large import batches.",
  },
  "gpt-4o": {
    name: "GPT-4o",
    badge: null,
    provider: "OpenAI",
    description: "Strong general reasoning across varied phrasing.",
  },
  "gemini-2-5-pro": {
    name: "Gemini 2.5 Pro",
    badge: null,
    provider: "Google",
    description: "Long-context and robust multilingual handling.",
  },
};

type EditPromptFormProps = {
  onSubmit: (values: EditPromptFormValues) => void;
};

export function EditPromptForm({ onSubmit }: EditPromptFormProps) {
  const { control, handleSubmit, reset } = useForm<EditPromptFormValues>({
    resolver: zodResolver(editPromptSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      <FieldGroup className="flex flex-row lg:h-[980px]">
        <div className="flex flex-col flex-1 p-6 min-h-0">
          <Controller
            control={control}
            name="prompt"
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.isDirty}
                className="flex flex-col flex-1 min-h-0"
              >
                <div>
                  <FieldLabel htmlFor="prompt">Prompt</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Define how the model reads, weighs and tags each quote.
                  </p>
                </div>
                <Textarea
                  aria-label="Prompt"
                  className="resize-none font-mono text-sm h-full"
                  {...field}
                />
              </Field>
            )}
          />
        </div>

        <ScrollArea className="w-80 shrink-0 border-l bg-muted px-4 py-6 h-full">
          <Controller
            control={control}
            name="model"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.isDirty}>
                <div>
                  <FieldLabel htmlFor="model">Model</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Which model runs the classification.
                  </p>
                </div>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  className="gap-2"
                >
                  {MODELS.map((modelId) => {
                    const meta = MODEL_META[modelId];
                    const isSelected = field.value === modelId;
                    return (
                      <label
                        key={modelId}
                        htmlFor={`model-${modelId}`}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                          isSelected
                            ? "border-primary ring-1 ring-primary"
                            : "border-border hover:bg-muted/50",
                        )}
                      >
                        <RadioGroupItem
                          id={`model-${modelId}`}
                          value={modelId}
                          aria-label={meta.name}
                          className="mt-0.5 shrink-0"
                        />
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">
                              {meta.name}
                            </span>
                            {meta.badge && (
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                                  meta.badge.className,
                                )}
                              >
                                {meta.badge.label}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {meta.provider}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {meta.description}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </RadioGroup>
              </Field>
            )}
          />

          <div className="flex flex-col gap-3 mt-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Extraction Dimensions
              </p>
              <p className="text-xs text-muted-foreground">
                One tag per dimension — Tone allows up to three.
              </p>
            </div>
            {DIMENSION_ORDER.map((key) => {
              const dim = DIMENSIONS[key];
              return (
                <div key={key} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn("size-2 rounded-full", dim.dotClassName)}
                    />
                    <span
                      data-dimension-label
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {dim.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {DIMENSION_VALUES[key].map((val) => (
                      <Badge
                        key={val}
                        variant="outline"
                        className={cn(
                          "border-transparent text-xs",
                          dim.chipClassName,
                        )}
                      >
                        {val}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </FieldGroup>

      <DialogFooter className="m-0 p-6">
        <Button
          type="button"
          variant="ghost"
          className="text-primary mr-auto"
          onClick={() => reset(defaultValues)}
        >
          Reset to default
        </Button>
        <div className="flex gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">Save prompt</Button>
        </div>
      </DialogFooter>
    </form>
  );
}
