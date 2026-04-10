import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFound from "./NotFound.jsx";
import { HOMEROUTE } from "../../constants/RouteConstants.jsx";

vi.mock("../Header/Header", () => ({
  default: function MockHeader() {
    return <header data-testid="mock-header" />;
  },
}));

describe("NotFound", () => {
  it("shows 404 copy and a link home", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /404 - page not found/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/the page you are looking for does not exist/i),
    ).toBeInTheDocument();

    const home = screen.getByRole("link", { name: /go to home/i });
    expect(home).toHaveAttribute("href", HOMEROUTE);
  });
});
