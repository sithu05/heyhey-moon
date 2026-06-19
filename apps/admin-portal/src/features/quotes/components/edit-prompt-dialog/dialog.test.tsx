import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { EditPromptDialog } from "./dialog";
import { defaultValues } from "./schema";

afterEach(cleanup);

describe("EditPromptDialog", () => {
  it("renders the trigger button", () => {
    render(<EditPromptDialog />);
    expect(screen.getByRole("button", { name: /edit prompt/i })).toBeInTheDocument();
  });

  it("dialog is closed by default", () => {
    render(<EditPromptDialog />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("clicking the trigger opens the dialog", async () => {
    const user = userEvent.setup();
    render(<EditPromptDialog />);
    await user.click(screen.getByRole("button", { name: /edit prompt/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("AI tagging prompt")).toBeInTheDocument();
  });

  it("cancel closes the dialog", async () => {
    const user = userEvent.setup();
    render(<EditPromptDialog />);
    await user.click(screen.getByRole("button", { name: /edit prompt/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("save prompt closes the dialog", async () => {
    const user = userEvent.setup();
    render(<EditPromptDialog />);
    await user.click(screen.getByRole("button", { name: /edit prompt/i }));
    await user.click(screen.getByRole("button", { name: /save prompt/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("re-opening the dialog resets the prompt to defaults", async () => {
    const user = userEvent.setup();
    render(<EditPromptDialog />);

    // Open and edit the prompt
    await user.click(screen.getByRole("button", { name: /edit prompt/i }));
    const textarea = screen.getByRole("textbox", { name: /prompt/i });
    await user.clear(textarea);
    await user.type(textarea, "edited prompt text");

    // Cancel and reopen
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /edit prompt/i }));

    expect(screen.getByRole("textbox", { name: /prompt/i })).toHaveValue(defaultValues.prompt);
  });
});
