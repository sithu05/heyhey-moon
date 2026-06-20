import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Dialog } from "@repo/ui/components/ui/dialog";

import { AddQuoteForm } from "./form";
import { type AddQuoteFormValues } from "./types";

afterEach(cleanup);

function FormWrapper({
  onSubmit = vi.fn(),
}: {
  onSubmit?: (values: AddQuoteFormValues) => void;
}) {
  return (
    <Dialog open>
      <AddQuoteForm onSubmit={onSubmit} />
    </Dialog>
  );
}

describe("AddQuoteForm", () => {
  it("renders the quote textarea", () => {
    render(<FormWrapper />);
    expect(screen.getByRole("textbox", { name: /quote/i })).toBeInTheDocument();
  });

  it("renders author and source inputs", () => {
    render(<FormWrapper />);
    expect(
      screen.getByRole("textbox", { name: /author/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /source/i }),
    ).toBeInTheDocument();
  });

  it("renders language buttons", () => {
    render(<FormWrapper />);
    expect(
      screen.getByRole("radio", { name: /english/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "ไทย" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "မြန်မာ" })).toBeInTheDocument();
  });

  it("renders context textarea and find context button", () => {
    render(<FormWrapper />);
    expect(
      screen.getByRole("textbox", { name: /context/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /find context/i }),
    ).toBeInTheDocument();
  });

  it("defaults language to English", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<FormWrapper onSubmit={handleSubmit} />);

    await user.type(
      screen.getByRole("textbox", { name: /quote/i }),
      "Quote text.",
    );
    await user.click(screen.getByRole("button", { name: /classify with ai/i }));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ language: "en" }),
      expect.anything(),
    );
  });

  it("submits with the selected language", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<FormWrapper onSubmit={handleSubmit} />);

    await user.type(
      screen.getByRole("textbox", { name: /quote/i }),
      "A great quote.",
    );
    await user.click(screen.getByRole("radio", { name: "ไทย" }));
    await user.click(screen.getByRole("button", { name: /classify with ai/i }));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ language: "th" }),
      expect.anything(),
    );
  });

  it("calls onSubmit with valid data", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<FormWrapper onSubmit={handleSubmit} />);

    await user.type(
      screen.getByRole("textbox", { name: /quote/i }),
      "A great quote.",
    );
    await user.type(
      screen.getByRole("textbox", { name: /author/i }),
      "Test Author",
    );
    await user.click(screen.getByRole("button", { name: /classify with ai/i }));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        quote: "A great quote.",
        author: "Test Author",
        language: "en",
      }),
      expect.anything(),
    );
  });

  it("shows error and does not call onSubmit when quote is empty", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<FormWrapper onSubmit={handleSubmit} />);

    await user.clear(screen.getByRole("textbox", { name: /quote/i }));
    await user.click(screen.getByRole("button", { name: /classify with ai/i }));

    await waitFor(() => {
      expect(screen.getByText("Quote is required")).toBeInTheDocument();
    });
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
