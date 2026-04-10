import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GlobalApiError from "./GlobalApiError.jsx";
import { publishApiError } from "../../lib/api-error-bus.js";

describe("GlobalApiError", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders API errors from the bus and allows dismiss", async () => {
    const user = userEvent.setup();
    render(<GlobalApiError />);

    publishApiError({ message: "Something broke", status: 502 });

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/502/)).toBeInTheDocument();
    expect(screen.getByText(/something broke/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /dismiss error/i }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("ignores ACCOUNT_DISABLED errors", () => {
    render(<GlobalApiError />);
    publishApiError({
      message: "Disabled",
      status: 403,
      payload: { code: "ACCOUNT_DISABLED" },
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("auto-dismisses after five seconds", () => {
    vi.useFakeTimers();
    render(<GlobalApiError />);

    act(() => {
      publishApiError({ message: "Temporary", status: 400 });
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
