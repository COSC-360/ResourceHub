import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Breadcrumbs from "./Breadcrumbs.jsx";
import { HOMEROUTE } from "../../constants/RouteConstants.jsx";

describe("Breadcrumbs", () => {
  const renderWithRoute = (path = "/") => {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <div>
          <Breadcrumbs />
        </div>
      </MemoryRouter>,
    );
  };

  it("shows 'Home' text when on home page", () => {
    renderWithRoute("/");
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("has correct CSS class for home page", () => {
    const { container } = renderWithRoute("/");
    expect(
      container.querySelector(".breadcrumbs.home-page"),
    ).toBeInTheDocument();
  });

  it("shows breadcrumbs on non-home routes", () => {
    renderWithRoute("/courses/123");
    expect(screen.getByText("Courses")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
  });

  it("has correct CSS class for breadcrumbs with content", () => {
    const { container } = renderWithRoute("/courses");
    expect(
      container.querySelector(".breadcrumbs.has-crumbs"),
    ).toBeInTheDocument();
  });

  it("renders home link as clickable on non-home routes", () => {
    renderWithRoute("/courses");
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).toHaveAttribute("href", HOMEROUTE);
  });

  it("formats segment labels with uppercase and space replacement", () => {
    renderWithRoute("/my-courses/details");
    expect(screen.getByText("My Courses")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("renders separators between breadcrumbs", () => {
    const { container } = renderWithRoute("/courses/123/discussions");
    const separators = container.querySelectorAll(".separator");
    // Should have separators between each segment
    expect(separators.length).toBeGreaterThan(0);
  });

  it("renders last segment as non-clickable span", () => {
    renderWithRoute("/courses/123");
    // 123 should be the last segment and displayed as text, not a link
    const links = screen.getAllByRole("link");
    const linkTexts = links.map((link) => link.textContent);
    expect(linkTexts).toContain("Home");
    expect(linkTexts).toContain("Courses");
    // 123 should not be a link
    expect(screen.getByText("123")).not.toHaveAttribute("href");
  });

  it("renders multiple levels correctly", () => {
    renderWithRoute("/courses/123/discussions/456");
    const crumbTexts = [
      screen.getByText("Home"),
      screen.getByText("Courses"),
      screen.getByText("123"),
      screen.getByText("Discussions"),
      screen.getByText("456"),
    ];
    crumbTexts.forEach((crumb) => {
      expect(crumb).toBeInTheDocument();
    });
  });
});
