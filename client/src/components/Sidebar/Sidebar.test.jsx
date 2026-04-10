import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sidebar from "./Sidebar.jsx";

vi.mock("./SideBarNav", () => ({
  default: function MockSideBarNav({ active, setActive }) {
    return (
      <nav data-testid="sidebar-nav">
        <button
          onClick={() => setActive("home")}
          data-active={active === "home"}
        >
          Home
        </button>
        <button
          onClick={() => setActive("courses")}
          data-active={active === "courses"}
        >
          Courses
        </button>
      </nav>
    );
  },
}));

describe("Sidebar", () => {
  it("renders sidebar element", () => {
    const { container } = render(<Sidebar />);
    expect(container.querySelector(".sidebar")).toBeInTheDocument();
  });

  it("renders SideBarNav component", () => {
    render(<Sidebar />);
    expect(screen.getByTestId("sidebar-nav")).toBeInTheDocument();
  });

  it("starts with active state set to 'home'", () => {
    render(<Sidebar />);
    const homeButton = screen.getByRole("button", { name: "Home" });
    expect(homeButton).toHaveAttribute("data-active", "true");
  });

  it("updates active state when nav item is clicked", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const coursesButton = screen.getByRole("button", { name: "Courses" });
    await user.click(coursesButton);

    expect(coursesButton).toHaveAttribute("data-active", "true");
    expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute(
      "data-active",
      "false",
    );
  });

  it("renders as aside element for semantic HTML", () => {
    const { container } = render(<Sidebar />);
    const asideElement = container.querySelector("aside");
    expect(asideElement).toHaveClass("sidebar");
  });
});
