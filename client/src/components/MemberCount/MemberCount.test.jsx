import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MemberCount from "./MemberCount.jsx";

describe("MemberCount", () => {
  it("renders member count with default value", () => {
    render(<MemberCount />);
    expect(screen.getByText("0 members")).toBeInTheDocument();
  });

  it("renders member count with provided count", () => {
    render(<MemberCount count={42} />);
    expect(screen.getByText("42 members")).toBeInTheDocument();
  });

  it("renders with singular member text when count is 1", () => {
    render(<MemberCount count={1} />);
    expect(screen.getByText("1 members")).toBeInTheDocument();
  });

  it("renders with correct aria-label", () => {
    render(<MemberCount count={10} />);
    expect(screen.getByLabelText("member count")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<MemberCount count={5} className="custom-class" />);
    const span = screen.getByLabelText("member count");
    expect(span).toHaveClass("custom-class");
  });

  it("renders large member counts correctly", () => {
    render(<MemberCount count={1000} />);
    expect(screen.getByText("1000 members")).toBeInTheDocument();
  });
});
