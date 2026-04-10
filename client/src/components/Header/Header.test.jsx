import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header.jsx";
import AuthContext from "../../AuthContext.jsx";

vi.mock("../SearchBar/SearchBar", () => ({
  SearchBar: function MockSearchBar() {
    return <input data-testid="mock-search-bar" placeholder="Search" />;
  },
}));

vi.mock("../ProfileHeader/ProfileHeader", () => ({
  ProfileHeader: function MockProfileHeader({ userType }) {
    return <div data-testid="mock-profile-header">Profile: {userType}</div>;
  },
}));

vi.mock("../Logo/Logo", () => ({
  Logo: function MockLogo() {
    return <div data-testid="mock-logo">Resource Hub</div>;
  },
}));

vi.mock("../Breadcrumbs/Breadcrumbs", () => ({
  default: function MockBreadcrumbs() {
    return <div data-testid="mock-breadcrumbs">Breadcrumbs</div>;
  },
}));

vi.mock("../Notifications/Notifications", () => ({
  default: function MockNotifications() {
    return <div data-testid="mock-notifications">Notifications</div>;
  },
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithAuth = (user = null) => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user }}>
          <Header />
        </AuthContext.Provider>
      </MemoryRouter>,
    );
  };

  it("renders all header sections", () => {
    renderWithAuth();
    expect(screen.getByTestId("mock-logo")).toBeInTheDocument();
    expect(screen.getByTestId("mock-breadcrumbs")).toBeInTheDocument();
    expect(screen.getByTestId("mock-search-bar")).toBeInTheDocument();
    expect(screen.getByTestId("mock-profile-header")).toBeInTheDocument();
  });

  it("renders header structure with correct classes", () => {
    const { container } = renderWithAuth();
    expect(container.querySelector(".headerDiv")).toBeInTheDocument();
    expect(container.querySelector(".combinedDiv")).toBeInTheDocument();
    expect(container.querySelector(".logoDiv")).toBeInTheDocument();
    expect(container.querySelector(".searchBarDiv")).toBeInTheDocument();
    expect(container.querySelector(".buttonDiv")).toBeInTheDocument();
    expect(container.querySelector(".headerRightSection")).toBeInTheDocument();
  });

  it("shows unregistered user profile when user is null", () => {
    renderWithAuth(null);
    expect(screen.getByTestId("mock-profile-header")).toHaveTextContent(
      /Profile:/,
    );
  });

  it("shows registered user profile when user is logged in", () => {
    const user = { id: "user1", name: "John Doe", admin: false };
    renderWithAuth(user);
    expect(screen.getByText("Profile: user")).toBeInTheDocument();
  });

  it("shows admin profile when user is admin", () => {
    const user = { id: "user1", name: "Admin User", admin: true };
    renderWithAuth(user);
    expect(screen.getByText("Profile: admin")).toBeInTheDocument();
  });

  it("does not render Notifications when no user is logged in", () => {
    renderWithAuth(null);
    expect(screen.queryByTestId("mock-notifications")).not.toBeInTheDocument();
  });

  it("renders Notifications when user is logged in", () => {
    const user = { id: "user1", name: "John Doe", admin: false };
    renderWithAuth(user);
    expect(screen.getByTestId("mock-notifications")).toBeInTheDocument();
  });

  it("renders Notifications for admin users", () => {
    const user = { id: "admin1", name: "Admin User", admin: true };
    renderWithAuth(user);
    expect(screen.getByTestId("mock-notifications")).toBeInTheDocument();
  });

  it("passes correct userType to ProfileHeader", () => {
    const user = { id: "user1", name: "John", admin: false };
    renderWithAuth(user);
    expect(screen.getByText("Profile: user")).toBeInTheDocument();
  });

  it("passes admin userType to ProfileHeader when admin", () => {
    const user = { id: "admin1", name: "Admin", admin: true };
    renderWithAuth(user);
    expect(screen.getByText("Profile: admin")).toBeInTheDocument();
  });

  it("displays search bar component", () => {
    renderWithAuth();
    const searchBar = screen.getByTestId("mock-search-bar");
    expect(searchBar).toHaveAttribute("placeholder", "Search");
  });

  it("maintains structure for multiple renders", () => {
    const { rerender } = renderWithAuth(null);
    expect(screen.getByTestId("mock-logo")).toBeInTheDocument();

    const user = { id: "user1", admin: false };
    rerender(
      <MemoryRouter>
        <AuthContext.Provider value={{ user }}>
          <Header />
        </AuthContext.Provider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("mock-logo")).toBeInTheDocument();
  });
});
