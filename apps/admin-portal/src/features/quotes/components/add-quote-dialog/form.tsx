"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SparklesIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@repo/ui/components/ui/button";
import { DialogClose, DialogFooter } from "@repo/ui/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/ui/field";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@repo/ui/components/ui/toggle-group";

import { defaultValues } from "./constants";
import { addQuoteSchema } from "./schema";
import type { AddQuoteFormValues } from "./types";

const LANGUAGES = [
  { value: "en" as const, name: "English" },
  { value: "th" as const, name: "ไทย" },
  { value: "my" as const, name: "မြန်မာ" },
];

type AddQuoteFormProps = {
  onSubmit: (values: AddQuoteFormValues) => void;
};

export function AddQuoteForm({ onSubmit }: AddQuoteFormProps) {
  const { handleSubmit, control } = useForm<AddQuoteFormValues>({
    resolver: zodResolver(addQuoteSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      <FieldGroup className="grid grid-cols-2 gap-5 p-6">
        <Controller
          control={control}
          name="quote"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.isDirty} className="col-span-2">
              <FieldLabel htmlFor="quote">Quote</FieldLabel>
              <Textarea
                id="quote"
                placeholder="Paste or type the quote..."
                rows={5}
                className="resize-none h-20"
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="author"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.isDirty}>
              <FieldLabel htmlFor="author">Author</FieldLabel>
              <Input
                id="author"
                type="text"
                placeholder="e.g. Marcus Aurelius"
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="author"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.isDirty}>
              <FieldLabel htmlFor="source">Source</FieldLabel>
              <Input
                id="source"
                type="text"
                placeholder="e.g. Meditations"
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="language"
          render={({ field }) => (
            <Field className="col-span-2">
              <FieldLabel>Language</FieldLabel>
              <div>
                <ToggleGroup
                  type="single"
                  value={field.value}
                  onValueChange={(val) => {
                    if (val) field.onChange(val);
                  }}
                  className="bg-gray-100  p-1"
                >
                  {LANGUAGES.map((lang) => (
                    <ToggleGroupItem
                      key={lang.value}
                      value={lang.value}
                      className="data-[state=on]:bg-white cursor-pointer p-3 px-5 data-[state=on]:text-primary font-semibold"
                    >
                      <span>{lang.name}</span>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </Field>
          )}
        />

        <Controller
          control={control}
          name="context"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.isDirty} className="col-span-2">
              <div className="flex justify-between">
                <FieldLabel htmlFor="context">Context</FieldLabel>

                <Button
                  className="text-primary"
                  size="xs"
                  variant="outline"
                  type="button"
                >
                  Find context
                </Button>
              </div>
              <Textarea
                id="context"
                placeholder="Click 'Find context' to crawl the web, or write your own…"
                rows={5}
                className="resize-none h-20"
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <DialogFooter className="m-0 p-6">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">
          <SparklesIcon />
          Classify with AI
        </Button>
      </DialogFooter>
    </form>
  );
}
