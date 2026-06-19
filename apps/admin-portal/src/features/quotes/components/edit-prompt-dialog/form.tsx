"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { DialogClose } from "@repo/ui/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { cn } from "@repo/ui/lib/utils";
import { Controller, type UseFormReturn } from "react-hook-form";
import { DIMENSION_VALUES } from "../../constants";
import { DIMENSION_ORDER, DIMENSIONS } from "../../types";
import { MODELS, type EditPromptFormValues } from "./schema";

const MODEL_META: Record<
  (typeof MODELS)[number],
  { name: string; badge: { label: string; className: string } | null; provider: string; description: string }
> = {
  "claude-sonnet-4-5": {
    name: "Claude Sonnet 4.5",
    badge: { label: "RECOMMENDED", className: "bg-green-100 text-green-700" },
    provider: "Anthropic",
    description: "Balanced quality and speed for nuanced, multi-dimension tagging.",
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
  form: UseFormReturn<EditPromptFormValues>;
  onSubmit: (values: EditPromptFormValues) => void;
  onReset: () => void;
};

export function EditPromptForm({ form, onSubmit, onReset }: EditPromptFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-6">
        {/* Left: prompt textarea */}
        <div className="flex flex-1 flex-col gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Prompt
            </p>
            <p className="text-xs text-muted-foreground">
              Define how the model reads, weighs and tags each quote.
            </p>
          </div>
          <Textarea
            {...register("prompt")}
            aria-label="Prompt"
            className="min-h-[300px] flex-1 resize-none font-mono text-sm"
          />
          {errors.prompt && (
            <p className="text-xs text-destructive">{errors.prompt.message}</p>
          )}
        </div>

        {/* Vertical divider */}
        <div className="w-px bg-border" />

        {/* Right panel */}
        <div className="flex w-72 flex-col gap-6 overflow-y-auto">
          {/* Model picker */}
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Model
              </p>
              <p className="text-xs text-muted-foreground">
                Which model runs the classification.
              </p>
            </div>
            <Controller
              control={control}
              name="model"
              render={({ field }) => (
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
                            <span className="text-sm font-medium">{meta.name}</span>
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
                          <span className="text-xs text-muted-foreground">{meta.provider}</span>
                          <span className="text-xs text-muted-foreground">{meta.description}</span>
                        </div>
                      </label>
                    );
                  })}
                </RadioGroup>
              )}
            />
          </div>

          {/* Extraction dimensions (read-only) */}
          <div className="flex flex-col gap-3">
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
                      <span className={cn("size-2 rounded-full", dim.dotClassName)} />
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
                          className={cn("border-transparent text-xs", dim.chipClassName)}
                        >
                          {val}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="-mx-4 -mb-4 mt-4 flex items-center justify-between rounded-b-xl border-t bg-muted/50 px-4 py-3">
        <Button type="button" variant="ghost" className="text-primary" onClick={onReset}>
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
      </div>
    </form>
  );
}
