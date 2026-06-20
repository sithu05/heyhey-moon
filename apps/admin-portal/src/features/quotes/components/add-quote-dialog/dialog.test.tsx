import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AddQuoteDialog } from "./dialog";
import { defaultValues } from "./schema";

afterEach(cleanup);

describe("AddQuoteDialog", () => {
  it("renders the trigger button", () => {
    render(<AddQuoteDialog onSubmit={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /add quote/i }),
    ).toBeInTheDocument();
  });

  it("dialog is closed by default", () => {
    render(<AddQuoteDialog onSubmit={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("clicking the trigger opens the dialog", async () => {
    const user = userEvent.setup();
    render(<AddQuoteDialog onSubmit={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /add quote/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Add a quote")).toBeInTheDocument();
  });

  it("cancel closes the dialog", async () => {
    const user = userEvent.setup();
    render(<AddQuoteDialog onSubmit={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /add quote/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("submitting closes the dialog", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<AddQuoteDialog onSubmit={handleSubmit} />);
    await user.click(screen.getByRole("button", { name: /add quote/i }));
    await user.type(
      screen.getByRole("textbox", { name: /quote/i }),
      "Test quote",
    );
    await user.click(screen.getByRole("button", { name: /classify with ai/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ quote: "Test quote" }),
    );
  });

  it("calls onEditPrompt when edit prompt is clicked within the dialog", async () => {
    const user = userEvent.setup();
    const handleEditPrompt = vi.fn();
    render(<AddQuoteDialog onSubmit={vi.fn()} onEditPrompt={handleEditPrompt} />);
    await user.click(screen.getByRole("button", { name: /add quote/i }));
    await user.click(screen.getByRole("button", { name: /edit prompt/i }));
    expect(handleEditPrompt).toHaveBeenCalled();
  });

  it("re-opening the dialog resets the form to defaults", async () => {
    const user = userEvent.setup();
    render(<AddQuoteDialog onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /add quote/i }));
    const quoteTextarea = screen.getByRole("textbox", { name: /quote/i });
    await user.clear(quoteTextarea);
    await user.type(quoteTextarea, "custom quote text");

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: /add quote/i }));
    expect(screen.getByRole("textbox", { name: /quote/i })).toHaveValue(
      defaultValues.quote,
    );
  });
});