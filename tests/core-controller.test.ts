import { describe, expect, it } from "vitest";
import { PickerController } from "../src/core/controller";
import { RangeController } from "../src/core/rangeController";

describe("PickerController open state", () => {
  it("starts closed for non-inline when open is false", () => {
    const controller = new PickerController({
      mode: "date",
      inline: false,
      open: false,
    });
    expect(controller.getSnapshot().open).toBe(false);
  });

  it("starts open for inline pickers", () => {
    const controller = new PickerController({
      mode: "date",
      inline: true,
    });
    expect(controller.getSnapshot().open).toBe(true);
  });

  it("honors explicit open: true for overlay mode", () => {
    const controller = new PickerController({
      mode: "date",
      inline: false,
      open: true,
    });
    expect(controller.getSnapshot().open).toBe(true);
  });

  it("setOpen(false) updates snapshot", () => {
    const controller = new PickerController({
      mode: "date",
      inline: false,
      open: true,
    });
    controller.setOpen(false);
    expect(controller.getSnapshot().open).toBe(false);
  });
});

describe("RangeController open state", () => {
  it("starts closed for non-inline when open is false", () => {
    const controller = new RangeController({
      inline: false,
      open: false,
    });
    expect(controller.getSnapshot().open).toBe(false);
  });

  it("starts open for inline range pickers", () => {
    const controller = new RangeController({ inline: true });
    expect(controller.getSnapshot().open).toBe(true);
  });
});
