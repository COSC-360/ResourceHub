import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LOGIN_ROUTE } from "../../constants/RouteConstants.jsx";

const { navigateMock, apiClientMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  apiClientMock: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("../../lib/api-client", () => ({
  apiClient: apiClientMock,
}));

// Import after mocks are set up
import VoteControls from "./VoteControls.jsx";

describe("VoteControls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("access_token", "mock-token");
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders upvote and downvote buttons", () => {
    render(
      <VoteControls
        targetId="post1"
        targetType="Discussion"
        initialUpvotes={5}
        initialDownvotes={2}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
  });

  it("displays upvote and downvote counts", () => {
    render(
      <VoteControls
        targetId="post1"
        targetType="Discussion"
        initialUpvotes={10}
        initialDownvotes={3}
      />,
    );

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("applies active class when user has upvoted", () => {
    const { container } = render(
      <VoteControls
        targetId="post1"
        targetType="Discussion"
        initialUpvotes={5}
        initialDownvotes={2}
        initialHasUpvote={true}
        activeClassName="active"
      />,
    );

    const buttons = container.querySelectorAll("button");
    expect(buttons[0]).toHaveClass("active");
  });

  it("applies active class when user has downvoted", () => {
    const { container } = render(
      <VoteControls
        targetId="post1"
        targetType="Discussion"
        initialUpvotes={5}
        initialDownvotes={2}
        initialHasDownvote={true}
        activeClassName="active"
      />,
    );

    const buttons = container.querySelectorAll("button");
    expect(buttons[1]).toHaveClass("active");
  });

  it("uses custom button class name", () => {
    const { container } = render(
      <VoteControls
        targetId="post1"
        targetType="Discussion"
        buttonClassName="custom-vote-btn"
      />,
    );

    const buttons = container.querySelectorAll("button");
    buttons.forEach((btn) => {
      expect(btn).toHaveClass("custom-vote-btn");
    });
  });

  it("redirects to login when upvoting without token", async () => {
    const user = userEvent.setup();
    localStorage.clear();

    render(
      <VoteControls
        targetId="post1"
        targetType="Discussion"
        initialUpvotes={5}
        initialDownvotes={2}
      />,
    );

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);

    expect(navigateMock).toHaveBeenCalledWith(LOGIN_ROUTE);
  });

  it("redirects to login when downvoting without token", async () => {
    const user = userEvent.setup();
    localStorage.clear();

    render(
      <VoteControls
        targetId="post1"
        targetType="Discussion"
        initialUpvotes={5}
        initialDownvotes={2}
      />,
    );

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[1]);

    expect(navigateMock).toHaveBeenCalledWith(LOGIN_ROUTE);
  });

  it("calls API to upvote when not already upvoted", async () => {
    const user = userEvent.setup();
    apiClientMock.mockResolvedValue({});

    render(
      <VoteControls
        targetId="post1"
        targetType="Discussion"
        initialUpvotes={5}
        initialDownvotes={2}
      />,
    );

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);

    await waitFor(() => {
      expect(apiClientMock).toHaveBeenCalledWith("/api/vote/up", {
        method: "POST",
        body: { targetType: "Discussion", targetId: "post1" },
        headers: { Authorization: "Bearer mock-token" },
      });
    });
  });

  it("calls API to downvote when not already downvoted", async () => {
    const user = userEvent.setup();
    apiClientMock.mockResolvedValue({});

    render(
      <VoteControls
        targetId="post1"
        targetType="Discussion"
        initialUpvotes={5}
        initialDownvotes={2}
      />,
    );

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[1]);

    await waitFor(() => {
      expect(apiClientMock).toHaveBeenCalledWith("/api/vote/down", {
        method: "POST",
        body: { targetType: "Discussion", targetId: "post1" },
        headers: { Authorization: "Bearer mock-token" },
      });
    });
  });

  it("removes vote when clicking already active upvote", async () => {
    const user = userEvent.setup();
    apiClientMock.mockResolvedValue({});

    render(
      <VoteControls
        targetId="post1"
        targetType="Discussion"
        initialUpvotes={5}
        initialDownvotes={2}
        initialHasUpvote={true}
      />,
    );

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);

    await waitFor(() => {
      expect(apiClientMock).toHaveBeenCalledWith("/api/vote/remove", {
        method: "DELETE",
        body: { targetType: "Discussion", targetId: "post1" },
        headers: { Authorization: "Bearer mock-token" },
      });
    });
  });

  it("switches from downvote to upvote", async () => {
    const user = userEvent.setup();
    apiClientMock.mockResolvedValue({});

    render(
      <VoteControls
        targetId="post1"
        targetType="Discussion"
        initialUpvotes={5}
        initialDownvotes={2}
        initialHasDownvote={true}
      />,
    );

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]); // Click upvote

    await waitFor(() => {
      // Should first remove the downvote
      expect(apiClientMock).toHaveBeenCalledWith(
        "/api/vote/remove",
        expect.any(Object),
      );
      // Then add the upvote
      expect(apiClientMock).toHaveBeenCalledWith(
        "/api/vote/up",
        expect.any(Object),
      );
    });
  });

  it("uses default vote counts when not provided", () => {
    render(<VoteControls targetId="post1" targetType="Discussion" />);

    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(2); // upvotes and downvotes both default to 0
  });

  it("updates when targetId changes", async () => {
    const { rerender } = render(
      <VoteControls
        targetId="post1"
        targetType="Discussion"
        initialUpvotes={5}
      />,
    );

    expect(screen.getByText("5")).toBeInTheDocument();

    rerender(
      <VoteControls
        targetId="post2"
        targetType="Discussion"
        initialUpvotes={10}
      />,
    );

    expect(screen.getByText("10")).toBeInTheDocument();
  });
});
