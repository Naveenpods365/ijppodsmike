import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

vi.mock("@/contexts/AuthContext", async () => {
    const actual = await vi.importActual<
        typeof import("@/contexts/AuthContext")
    >("@/contexts/AuthContext");
    return {
        ...actual,
        useAuth: vi.fn(),
    };
});

const LoginSpy = () => {
    const location = useLocation();

    return (
        <div>
            <h1>Login Page</h1>
            <div>
                From:{" "}
                {location.state?.from?.pathname
                    ? location.state.from.pathname
                    : "—"}
            </div>
        </div>
    );
};

const renderRoutes = (initialEntry: string) => {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path="/login" element={<LoginSpy />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/private" element={<h2>Private Content</h2>} />
                </Route>
            </Routes>
        </MemoryRouter>
    );
};

describe("ProtectedRoute", () => {
    it("shows a loading state while auth is initializing", async () => {
        // Arrange
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            loading: true,
            login: vi.fn(),
            logout: vi.fn(),
        });

        // Act
        renderRoutes("/private");

        // Assert
        expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
    });

    it("redirects unauthenticated users to /login and preserves the 'from' location", async () => {
        // Arrange
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            loading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        // Act
        renderRoutes("/private");

        // Assert
        expect(
            await screen.findByRole("heading", { name: /login page/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/from: \/private/i)).toBeInTheDocument();
    });

    it("renders the protected content when the user is authenticated", async () => {
        // Arrange
        vi.mocked(useAuth).mockReturnValue({
            user: { email: "test@example.com" },
            loading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        // Act
        renderRoutes("/private");

        // Assert
        expect(
            await screen.findByRole("heading", { name: /private content/i })
        ).toBeInTheDocument();
    });
});
