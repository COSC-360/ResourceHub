import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotAuthorized from "./NotAuthorized.jsx";
import { HOMEROUTE } from "../../constants/RouteConstants.jsx";

describe("NotAuthorized", () => {
  it("renders 403 error heading", () => {
    render(
      <MemoryRouter>
        <NotAuthorized />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /403 - not authorized/i }),
    ).toBeInTheDocument();
  });

  it("renders appropriate error message", () => {
    render(
      <MemoryRouter>
        <NotAuthorized />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(/you are not authorized to access this route/i),
    ).toBeInTheDocument();
  });

  it("renders a link to home page", () => {
    render(
      <MemoryRouter>
        <NotAuthorized />
      </MemoryRouter>,
    );
    const homeLink = screen.getByRole("link", { name: /go to home/i });
    expect(homeLink).toHaveAttribute("href", HOMEROUTE);
  });

  it("has correct CSS classes applied", () => {
    const { container } = render(
      <MemoryRouter>
        <NotAuthorized />
      </MemoryRouter>,
    );
    expect(
      container.querySelector(".not-authorized-container"),
    ).toBeInTheDocument();
    expect(
      container.querySelector(".not-authorized-title"),
    ).toBeInTheDocument();
    expect(
      container.querySelector(".not-authorized-message"),
    ).toBeInTheDocument();
    expect(container.querySelector(".not-authorized-link")).toBeInTheDocument();
  });
});
