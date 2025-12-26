import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { within } from "@testing-library/react";

import { Header } from "./Header";
import { useAuth } from "@/contexts/AuthContext";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual =
        await vi.importActual<typeof import("react-router-dom")>(
            "react-router-dom"
        );

    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock("@/contexts/AuthContext", () => {
    return {
        useAuth: vi.fn(),
    };
});

describe("Header", () => {
    beforeEach(() => {
        mockNavigate.mockReset();

        vi.mocked(useAuth).mockReturnValue({
            user: null,
            loading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });
    });

    it("renders default title, subtitle and search input", () => {
        render(<Header />);

        expect(
            screen.getByRole("heading", { name: /dashboard/i })
        ).toBeInTheDocument();
        expect(
            screen.getByText(/welcome back! here's your deals overview\./i)
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText(/search deals\.{3}/i)
        ).toBeInTheDocument();
    });

    it("renders custom title and subtitle when provided", () => {
        render(<Header title="My Page" subtitle="Hello there" />);

        expect(
            screen.getByRole("heading", { name: /my page/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/hello there/i)).toBeInTheDocument();
    });

    it("navigates to settings when Settings is clicked", async () => {
        const user = userEvent.setup();

        render(<Header />);

        await user.click(screen.getByRole("button", { name: /user menu/i }));

        await user.click(
            await screen.findByRole("menuitem", { name: /settings/i })
        );

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith("/settings");
    });

    it("calls logout and navigates to login when Logout is clicked", async () => {
        const user = userEvent.setup();
        const logout = vi.fn();

        vi.mocked(useAuth).mockReturnValue({
            user: { email: "admin@example.com", username: "Admin" },
            loading: false,
            login: vi.fn(),
            logout,
        });

        render(<Header />);

        await user.click(screen.getByRole("button", { name: /user menu/i }));
        await user.click(
            await screen.findByRole("menuitem", { name: /logout/i })
        );

        expect(logout).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
    });

    it("shows user name and email in the menu when user exists", async () => {
        const user = userEvent.setup();

        vi.mocked(useAuth).mockReturnValue({
            user: { email: "john@example.com", username: "John" },
            loading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        render(<Header />);

        await user.click(screen.getByRole("button", { name: /user menu/i }));

        const menu = await screen.findByRole("menu");
        expect(within(menu).getByText(/^John$/)).toBeInTheDocument();
        expect(
            within(menu).getByText(/^john@example\.com$/)
        ).toBeInTheDocument();
    });
});
