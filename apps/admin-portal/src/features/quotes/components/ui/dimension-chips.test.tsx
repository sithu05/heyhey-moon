import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { DimensionChips } from "./dimension-chips";
import type { QuoteAttributes } from "../../types";

afterEach(cleanup);

const SAMPLE_ATTRIBUTES: QuoteAttributes = {
  mindset: "Growth",
  worldview: "Stoic",
  motivation: "Intrinsic",
  tone: ["Energizing", "Resolute"],
  theme: "Resilience",
  timeframe: "Present",
  agency: "Self",
};

describe("DimensionChips", () => {
  test("renders one chip per dimension value, in dimension order", () => {
    const { container } = render(
      <DimensionChips attributes={SAMPLE_ATTRIBUTES} />,
    );

    const chips = container.querySelectorAll('[data-slot="badge"]');
    expect(Array.from(chips).map((chip) => chip.textContent)).toEqual([
      "Growth",
      "Stoic",
      "Intrinsic",
      "Energizing",
      "Resolute",
      "Resilience",
      "Present",
      "Self",
    ]);
  });

  test("renders both values for a multi-value dimension like tone", () => {
    const { getAllByText } = render(
      <DimensionChips attributes={SAMPLE_ATTRIBUTES} />,
    );

    expect(getAllByText("Energizing")).toHaveLength(1);
    expect(getAllByText("Resolute")).toHaveLength(1);
  });
});
