import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Comment from "./Comment.jsx";
import { LOGIN_ROUTE } from "../../constants/RouteConstants.jsx";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

function getContentField(container) {
  return container.querySelector('textarea[name="content"]');
}

describe("Comment", () => {
  beforeEach(() => {
    localStorage.clear();
    navigateMock.mockClear();
  });

  it("shows validation when both content and file are empty", async () => {
    const user = userEvent.setup();
    const { container } = render(<Comment parentid="p1" parentUsername="alice" />);

    const form = container.querySelector("form");
    expect(form).toBeTruthy();
    await user.click(form.querySelector('input[type="submit"]'));

    expect(
      await screen.findByText(/enter a comment or attach an image/i),
    ).toBeInTheDocument();
  });

  it("shows error when parentid is missing even with content", async () => {
    const user = userEvent.setup();
    const { container } = render(<Comment parentUsername="alice" />);

    const field = getContentField(container);
    expect(field).toBeTruthy();
    await user.type(field, "Hello");
    fireEvent.submit(container.querySelector("form"));

    expect(
      await screen.findByText(/cannot post comment without reference/i),
    ).toBeInTheDocument();
  });

  it("redirects to login when there is no access token", async () => {
    const user = userEvent.setup();
    const { container } = render(<Comment parentid="p1" parentUsername="bob" />);

    await user.type(getContentField(container), "A reply");
    fireEvent.submit(container.querySelector("form"));

    expect(navigateMock).toHaveBeenCalledWith(LOGIN_ROUTE);
  });

  it("rejects non-image file selection", () => {
    const { container } = render(<Comment parentid="p1" parentUsername="alice" />);

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeTruthy();

    const file = new File(["x"], "notes.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(
      screen.getByText(/only image files are allowed/i),
    ).toBeInTheDocument();
  });
});
