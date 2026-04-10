import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "./SearchBar.jsx";
import { searchPathWithTerm } from "../../constants/RouteConstants.jsx";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../constants/RouteConstants.jsx", () => ({
  searchPathWithTerm: (term) => `/search?q=${term}`,
}));

describe("SearchBar", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders search form with input and button", () => {
    render(<SearchBar />);
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
  });

  it("navigates to search page when form is submitted", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const input = screen.getByPlaceholderText("Search");
    await user.type(input, "react");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(navigateMock).toHaveBeenCalledWith("/search?q=react");
  });

  it("clears input after search", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const input = screen.getByPlaceholderText("Search");
    await user.type(input, "test search");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(input.value).toBe("");
  });

  it("trims whitespace from search term", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const input = screen.getByPlaceholderText("Search");
    await user.type(input, "  query  ");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(navigateMock).toHaveBeenCalledWith("/search?q=query");
  });

  it("does not navigate when search term is empty", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("does not navigate when search term is only whitespace", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const input = screen.getByPlaceholderText("Search");
    await user.type(input, "   ");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("enforces max length of 200 characters", () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search");
    expect(input).toHaveAttribute("maxLength", "200");
  });

  it("has correct CSS classes", () => {
    const { container } = render(<SearchBar />);
    expect(container.querySelector(".searchBarContainer")).toBeInTheDocument();
    expect(container.querySelector(".searchIcon")).toBeInTheDocument();
  });
});
