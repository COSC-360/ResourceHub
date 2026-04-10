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
import CourseMembershipButton from "./CourseMembershipButton.jsx";

describe("CourseMembershipButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock.mockClear();
    apiClientMock.mockClear();
    localStorage.clear();
    localStorage.setItem("access_token", "mock-token");
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders button with loading state initially", () => {
    apiClientMock.mockResolvedValue({ isMember: false });
    render(<CourseMembershipButton courseId="course1" />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows 'Join' text when user is not a member", async () => {
    apiClientMock.mockResolvedValue({ isMember: false });
    render(<CourseMembershipButton courseId="course1" />);

    await waitFor(() => {
      expect(screen.getByText("Join")).toBeInTheDocument();
    });
  });

  it("shows 'Leave' text when user is a member", async () => {
    apiClientMock.mockResolvedValue({ isMember: true });
    render(<CourseMembershipButton courseId="course1" />);

    await waitFor(() => {
      expect(screen.getByText("Leave")).toBeInTheDocument();
    });
  });

  it("redirects to login when no access token", async () => {
    localStorage.clear();
    render(<CourseMembershipButton courseId="course1" />);

    const button = screen.getByRole("button");
    await userEvent.click(button);

    expect(navigateMock).toHaveBeenCalledWith(LOGIN_ROUTE);
  });

  it("handles initial loading state properly", async () => {
    apiClientMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ isMember: false }), 100);
        }),
    );

    const { container } = render(<CourseMembershipButton courseId="course1" />);
    const button = container.querySelector("button");

    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it("calls onMembershipChanged callback when clicking button", async () => {
    const user = userEvent.setup();
    const onMembershipChanged = vi.fn();
    apiClientMock.mockResolvedValueOnce({ isMember: false });
    apiClientMock.mockResolvedValueOnce({ isMember: true, memberCount: 25 });

    render(
      <CourseMembershipButton
        courseId="course1"
        onMembershipChanged={onMembershipChanged}
      />,
    );

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByText("Join")).toBeInTheDocument();
    });

    // Click the button to trigger the callback
    const button = screen.getByRole("button");
    await user.click(button);

    // Now the callback should have been called
    await waitFor(() => {
      expect(onMembershipChanged).toHaveBeenCalled();
    });
  });

  it("handles API errors gracefully", async () => {
    apiClientMock
      .mockResolvedValueOnce({ isMember: false })
      .mockRejectedValueOnce(new Error("API Error"));

    const { rerender } = render(<CourseMembershipButton courseId="course1" />);

    await waitFor(() => {
      expect(screen.getByText("Join")).toBeInTheDocument();
    });

    const button = screen.getByRole("button");
    await userEvent.click(button);

    await waitFor(() => {
      // Button text returns to original
      expect(screen.getByText("Join")).toBeInTheDocument();
    });
  });

  it("updates button when courseId changes", async () => {
    apiClientMock.mockResolvedValue({ isMember: false });

    const { rerender } = render(<CourseMembershipButton courseId="course1" />);

    await waitFor(() => {
      expect(screen.getByText("Join")).toBeInTheDocument();
    });

    apiClientMock.mockResolvedValue({ isMember: true });
    rerender(<CourseMembershipButton courseId="course2" />);

    await waitFor(() => {
      expect(apiClientMock).toHaveBeenLastCalledWith(
        "/api/memberships/me/course2",
        expect.any(Object),
      );
    });
  });

  it("doesn't load membership status when no token", () => {
    localStorage.clear();
    render(<CourseMembershipButton courseId="course1" />);

    expect(apiClientMock).not.toHaveBeenCalled();
  });

  it("doesn't load membership status when no courseId", () => {
    render(<CourseMembershipButton />);

    expect(apiClientMock).not.toHaveBeenCalled();
  });
});
