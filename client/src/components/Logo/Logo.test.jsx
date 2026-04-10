import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "./Logo.jsx";
import { HOMEROUTE } from "../../constants/RouteConstants.jsx";

vi.mock("../../constants/RouteConstants.jsx", () => ({
  HOMEROUTE: "/home",
}));

describe("Logo", () => {
  it("renders the logo with correct text", () => {
    render(<Logo />);
    expect(screen.getByText("Resource Hub")).toBeInTheDocument();
  });

  it("renders as a link with correct href", () => {
    render(<Logo />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", HOMEROUTE);
  });

  it("has the correct CSS class", () => {
    render(<Logo />);
    const link = screen.getByRole("link");
    expect(link).toHaveClass("logo");
  });
});
