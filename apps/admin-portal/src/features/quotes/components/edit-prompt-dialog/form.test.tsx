import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@repo/ui/components/ui/dialog";
import { EditPromptForm } from "./form";
import { defaultValues, editPromptSchema, type EditPromptFormValues } from "./schema";
import { DIMENSION_ORDER, DIMENSIONS } from "../../types";

afterEach(cleanup);

// DialogClose inside EditPromptForm needs a Dialog context to not throw.
// We wrap with <Dialog open> (no DialogContent) — provides context, renders no overlay.
function FormWrapper({
  onSubmit = vi.fn(),
  onReset = vi.fn(),
}: {
  onSubmit?: (values: EditPromptFormValues) => void;
  onReset?: () => void;
}) {
  const form = useForm<EditPromptFormValues>({
    resolver: zodResolver(editPromptSchema),
    defaultValues,
  });
  return (
    <Dialog open>
      <EditPromptForm form={form} onSubmit={onSubmit} onReset={onReset} />
    </Dialog>
  );
}

describe("EditPromptForm", () => {
  it("renders the prompt textarea", () => {
    render(<FormWrapper />);
    expect(screen.getByRole("textbox", { name: /prompt/i })).toBeInTheDocument();
  });

  it("textarea shows the default prompt text", () => {
    render(<FormWrapper />);
    expect(screen.getByRole("textbox", { name: /prompt/i })).toHaveValue(defaultValues.prompt);
  });

  it("Claude Sonnet 4.5 radio is selected by default", () => {
    render(<FormWrapper />);
    expect(screen.getByRole("radio", { name: /claude sonnet 4\.5/i })).toBeChecked();
  });

  it("clicking a different model selects it", async () => {
    const user = userEvent.setup();
    render(<FormWrapper />);
    await user.click(screen.getByRole("radio", { name: /gpt-4o/i }));
    expect(screen.getByRole("radio", { name: /gpt-4o/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /claude sonnet 4\.5/i })).not.toBeChecked();
  });

  it("calls onSubmit with form values on valid submit", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<FormWrapper onSubmit={handleSubmit} />);
    await user.click(screen.getByRole("button", { name: /save prompt/i }));
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ model: "claude-sonnet-4-5" }),
      );
    });
  });

  it("shows error and does not call onSubmit when prompt is empty", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<FormWrapper onSubmit={handleSubmit} />);
    await user.clear(screen.getByRole("textbox", { name: /prompt/i }));
    await user.click(screen.getByRole("button", { name: /save prompt/i }));
    await waitFor(() => {
      expect(screen.getByText("Prompt cannot be empty")).toBeInTheDocument();
    });
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("calls onReset when reset button is clicked", async () => {
    const user = userEvent.setup();
    const handleReset = vi.fn();
    render(<FormWrapper onReset={handleReset} />);
    await user.click(screen.getByRole("button", { name: /reset to default/i }));
    expect(handleReset).toHaveBeenCalledOnce();
  });

  it("renders all 7 dimension section labels", () => {
    render(<FormWrapper />);
    for (const key of DIMENSION_ORDER) {
      expect(
        screen.getByText(DIMENSIONS[key].label, { selector: "[data-dimension-label]" }),
      ).toBeInTheDocument();
    }
  });

  it("renders dimension chip values", () => {
    render(<FormWrapper />);
    expect(screen.getByText("Growth")).toBeInTheDocument();
    expect(screen.getByText("Stoic")).toBeInTheDocument();
    expect(screen.getByText("Energizing")).toBeInTheDocument();
  });
});
