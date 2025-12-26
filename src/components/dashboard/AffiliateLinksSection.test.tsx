import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AffiliateLinksSection } from "./AffiliateLinksSection";
import api from "@/lib/axiosInstance";
import { useToast } from "@/hooks/use-toast";

vi.mock("@/lib/axiosInstance", () => {
    return {
        default: {
            get: vi.fn(),
            post: vi.fn(),
            patch: vi.fn(),
        },
    };
});

vi.mock("@/hooks/use-toast", async () => {
    const actual =
        await vi.importActual<typeof import("@/hooks/use-toast")>(
            "@/hooks/use-toast"
        );
    return {
        ...actual,
        useToast: vi.fn(),
    };
});

afterEach(() => {
    vi.clearAllMocks();
});

describe("AffiliateLinksSection", () => {
    it("renders empty state after loading with no links", async () => {
        const toastMock = vi.fn();
        vi.mocked(useToast).mockReturnValue({ toast: toastMock } as any);
        (api as any).get.mockResolvedValueOnce({ data: [] });

        render(<AffiliateLinksSection />);

        expect(
            await screen.findByText(/no affiliate links yet/i)
        ).toBeInTheDocument();
        expect((api as any).get).toHaveBeenCalledWith("/affiliate");
    });

    it("renders links returned from the API", async () => {
        const toastMock = vi.fn();
        vi.mocked(useToast).mockReturnValue({ toast: toastMock } as any);
        (api as any).get.mockResolvedValueOnce({
            data: [
                {
                    id: "1",
                    url: "https://example.com/p/1",
                    title: "Product A",
                    retailer: "Amazon",
                    category: "Electronics",
                    discount_label: "10% OFF",
                },
            ],
        });

        render(<AffiliateLinksSection />);

        expect(await screen.findByText("Product A")).toBeInTheDocument();
        expect(screen.getByText("Amazon")).toBeInTheDocument();
        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("10% OFF")).toBeInTheDocument();
    });

    it("validates URL (trimmed) and shows a toast when URL is missing", async () => {
        const toastMock = vi.fn();
        vi.mocked(useToast).mockReturnValue({ toast: toastMock } as any);
        (api as any).get.mockResolvedValueOnce({ data: [] });

        const user = userEvent.setup();
        render(<AffiliateLinksSection />);
        await screen.findByText(/no affiliate links yet/i);

        await user.click(
            screen.getByRole("button", { name: /add new affiliate link/i })
        );

        const urlInput = screen.getByLabelText(/affiliate link url/i);
        await user.clear(urlInput);
        await user.type(urlInput, "   ");

        await user.click(screen.getByRole("button", { name: /^save$/i }));

        expect((api as any).post).not.toHaveBeenCalled();
        expect(toastMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Affiliate Link URL is required",
                variant: "destructive",
            })
        );
    });

    it("creates a new affiliate link (POST) and shows it in the table", async () => {
        const toastMock = vi.fn();
        vi.mocked(useToast).mockReturnValue({ toast: toastMock } as any);
        (api as any).get.mockResolvedValueOnce({ data: [] });
        (api as any).post.mockResolvedValueOnce({
            data: {
                id: "2",
                url: "https://example.com/p/2",
                title: "New Product",
                retailer: "Amazon.ca",
                category: "Gadgets",
                discount_label: "35% OFF",
            },
        });

        const user = userEvent.setup();
        render(<AffiliateLinksSection />);
        await screen.findByText(/no affiliate links yet/i);

        await user.click(
            screen.getByRole("button", { name: /add new affiliate link/i })
        );

        const dialog = await screen.findByRole("dialog");
        const dialogUi = within(dialog);

        await user.type(
            dialogUi.getByLabelText(/affiliate link url/i),
            "  https://example.com/p/2  "
        );
        await user.type(
            dialogUi.getByLabelText(/product title/i),
            "New Product"
        );
        await user.type(dialogUi.getByLabelText(/retailer/i), "Amazon.ca");
        await user.type(dialogUi.getByLabelText(/category/i), "Gadgets");
        await user.type(dialogUi.getByLabelText(/discount amount/i), "35% OFF");

        await user.click(dialogUi.getByRole("button", { name: /^save$/i }));

        expect((api as any).post).toHaveBeenCalledWith("/affiliate", {
            url: "https://example.com/p/2",
            title: "New Product",
            retailer: "Amazon.ca",
            category: "Gadgets",
            discount_label: "35% OFF",
        });

        await waitFor(() => {
            expect(toastMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: "Affiliate link added",
                })
            );
        });

        expect(await screen.findByText("New Product")).toBeInTheDocument();
    }, 15000);

    it("edits an existing affiliate link (PATCH), updates table, and disables Telegram send when toggled off", async () => {
        const toastMock = vi.fn();
        vi.mocked(useToast).mockReturnValue({ toast: toastMock } as any);
        (api as any).get.mockResolvedValueOnce({
            data: [
                {
                    id: "1",
                    url: "https://example.com/p/1",
                    title: "Old Product",
                    retailer: "Amazon",
                    category: "Electronics",
                    discount_label: "10% OFF",
                },
            ],
        });
        (api as any).patch.mockResolvedValueOnce({
            data: {
                id: "1",
                url: "https://example.com/p/1",
                title: "Updated Product",
                retailer: "Amazon",
                category: "Electronics",
                discount_label: "10% OFF",
            },
        });

        const openSpy = vi
            .spyOn(window, "open")
            .mockImplementation(() => null as any);

        const user = userEvent.setup();
        render(<AffiliateLinksSection />);

        expect(await screen.findByText("Old Product")).toBeInTheDocument();
        const oldRow = screen.getByText("Old Product").closest("tr");
        expect(oldRow).not.toBeNull();

        const rowButtons = within(oldRow as HTMLElement).getAllByRole("button");
        await user.click(rowButtons[0]);

        expect(
            await screen.findByRole("heading", { name: /edit affiliate link/i })
        ).toBeInTheDocument();

        const dialog = await screen.findByRole("dialog");
        const dialogUi = within(dialog);

        expect(
            (dialogUi.getByLabelText(/affiliate link url/i) as HTMLInputElement)
                .value
        ).toBe("https://example.com/p/1");

        const titleInput = dialogUi.getByLabelText(/product title/i);
        await user.clear(titleInput);
        await user.type(titleInput, "Updated Product");

        const switches = dialogUi.getAllByRole("switch");
        await user.click(switches[0]);

        await user.click(dialogUi.getByRole("button", { name: /^update$/i }));

        expect((api as any).patch).toHaveBeenCalledWith(
            "/affiliate/1",
            expect.objectContaining({
                url: "https://example.com/p/1",
                title: "Updated Product",
                retailer: "Amazon",
                category: "Electronics",
                discount_label: "10% OFF",
            })
        );

        await waitFor(() => {
            expect(toastMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: "Affiliate link updated",
                })
            );
        });

        expect(await screen.findByText("Updated Product")).toBeInTheDocument();

        const updatedRow = screen.getByText("Updated Product").closest("tr");
        expect(updatedRow).not.toBeNull();

        const updatedButtons = within(updatedRow as HTMLElement).getAllByRole(
            "button"
        );
        expect(updatedButtons[1]).toBeDisabled();

        await user.click(updatedButtons[3]);
        expect(openSpy).toHaveBeenCalledWith(
            "https://example.com/p/1",
            "_blank",
            "noopener,noreferrer"
        );

        openSpy.mockRestore();
    }, 15000);

    it("shows a toast when loading affiliate links fails", async () => {
        const toastMock = vi.fn();
        vi.mocked(useToast).mockReturnValue({ toast: toastMock } as any);

        (api as any).get.mockRejectedValueOnce({
            message: "Network",
            response: { data: { message: "Backend down" } },
        });

        render(<AffiliateLinksSection />);

        expect(
            await screen.findByText(/no affiliate links yet/i)
        ).toBeInTheDocument();

        expect(toastMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Failed to load affiliate links",
                description: "Backend down",
                variant: "destructive",
            })
        );
    });

    it("supports nested API data shape (res.data.data)", async () => {
        const toastMock = vi.fn();
        vi.mocked(useToast).mockReturnValue({ toast: toastMock } as any);

        (api as any).get.mockResolvedValueOnce({
            data: {
                data: [
                    {
                        id: "1",
                        url: "https://example.com/p/1",
                        title: "Nested",
                        retailer: "Amazon",
                        category: "Electronics",
                        discount_label: "10% OFF",
                    },
                ],
            },
        });

        render(<AffiliateLinksSection />);

        expect(await screen.findByText("Nested")).toBeInTheDocument();
        expect(screen.getByText("Amazon")).toBeInTheDocument();
        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("10% OFF")).toBeInTheDocument();
    });

    it("creates a new link with fallback id when API returns no id", async () => {
        const toastMock = vi.fn();
        vi.mocked(useToast).mockReturnValue({ toast: toastMock } as any);

        (api as any).get.mockResolvedValueOnce({ data: [] });
        (api as any).post.mockResolvedValueOnce({ data: {} });

        const openSpy = vi
            .spyOn(window, "open")
            .mockImplementation(() => null as any);

        const user = userEvent.setup();
        render(<AffiliateLinksSection />);
        await screen.findByText(/no affiliate links yet/i);

        await user.click(
            screen.getByRole("button", { name: /add new affiliate link/i })
        );

        const dialog = await screen.findByRole("dialog");
        const dialogUi = within(dialog);

        await user.type(
            dialogUi.getByLabelText(/affiliate link url/i),
            "https://example.com/fallback"
        );
        await user.click(dialogUi.getByRole("button", { name: /^save$/i }));

        await waitFor(() => {
            expect(toastMock).toHaveBeenCalledWith(
                expect.objectContaining({ title: "Affiliate link added" })
            );
        });

        // It should still appear in the table even without an API-provided id.
        // The table doesn't render the raw URL as text, so verify via the ExternalLink action.
        const rows = await screen.findAllByRole("row");
        expect(rows.length).toBeGreaterThan(1);

        const firstDataRow = rows[1];
        const rowButtons = within(firstDataRow).getAllByRole("button");
        // buttons: edit, telegram, whatsapp, external
        await user.click(rowButtons[3]);

        expect(openSpy).toHaveBeenCalledWith(
            "https://example.com/fallback",
            "_blank",
            "noopener,noreferrer"
        );

        openSpy.mockRestore();
    });

    it("shows toast on PATCH error and leaves dialog open", async () => {
        const toastMock = vi.fn();
        vi.mocked(useToast).mockReturnValue({ toast: toastMock } as any);

        (api as any).get.mockResolvedValueOnce({
            data: [
                {
                    id: "1",
                    url: "https://example.com/p/1",
                    title: "Old Product",
                    retailer: "Amazon",
                    category: "Electronics",
                    discount_label: "10% OFF",
                },
            ],
        });
        (api as any).patch.mockRejectedValueOnce({
            message: "Bad",
            response: { data: { message: "Update failed" } },
        });

        const user = userEvent.setup();
        render(<AffiliateLinksSection />);

        expect(await screen.findByText("Old Product")).toBeInTheDocument();

        const row = screen.getByText("Old Product").closest("tr");
        expect(row).not.toBeNull();
        const rowButtons = within(row as HTMLElement).getAllByRole("button");
        await user.click(rowButtons[0]);

        const dialog = await screen.findByRole("dialog");
        const dialogUi = within(dialog);

        await user.click(dialogUi.getByRole("button", { name: /^update$/i }));

        expect(toastMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Failed to update affiliate link",
                description: "Update failed",
                variant: "destructive",
            })
        );

        // Dialog still open
        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("builds share URLs for Telegram and WhatsApp, and shows toast when url is missing", async () => {
        const toastMock = vi.fn();
        vi.mocked(useToast).mockReturnValue({ toast: toastMock } as any);

        (api as any).get.mockResolvedValueOnce({
            data: [
                {
                    id: "1",
                    url: "https://example.com/p/1",
                    title: "Product A",
                    retailer: "Amazon",
                    category: "Electronics",
                    discount_label: "10% OFF",
                },
                {
                    id: "2",
                    url: "",
                    title: "No Url",
                    retailer: "",
                    category: "",
                    discount_label: "",
                },
            ],
        });

        const openSpy = vi
            .spyOn(window, "open")
            .mockImplementation(() => null as any);

        const user = userEvent.setup();
        render(<AffiliateLinksSection />);

        expect(await screen.findByText("Product A")).toBeInTheDocument();

        const productRow = screen.getByText("Product A").closest("tr");
        expect(productRow).not.toBeNull();
        const productButtons = within(productRow as HTMLElement).getAllByRole(
            "button"
        );

        // buttons: edit, telegram, whatsapp, external
        await user.click(productButtons[1]);
        expect(openSpy).toHaveBeenCalledWith(
            expect.stringContaining("https://t.me/share/url?url="),
            "_blank",
            "noopener,noreferrer"
        );

        await user.click(productButtons[2]);
        expect(openSpy).toHaveBeenCalledWith(
            expect.stringContaining("https://wa.me/?text="),
            "_blank",
            "noopener,noreferrer"
        );

        const noUrlRow = screen.getByText("No Url").closest("tr");
        expect(noUrlRow).not.toBeNull();
        const noUrlButtons = within(noUrlRow as HTMLElement).getAllByRole(
            "button"
        );

        await user.click(noUrlButtons[1]);
        await user.click(noUrlButtons[2]);

        expect(toastMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Link is missing",
                variant: "destructive",
            })
        );

        openSpy.mockRestore();
    });

    it("Cancel button closes dialog and resets form", async () => {
        const toastMock = vi.fn();
        vi.mocked(useToast).mockReturnValue({ toast: toastMock } as any);
        (api as any).get.mockResolvedValueOnce({ data: [] });

        const user = userEvent.setup();
        render(<AffiliateLinksSection />);
        await screen.findByText(/no affiliate links yet/i);

        await user.click(
            screen.getByRole("button", { name: /add new affiliate link/i })
        );

        const dialog = await screen.findByRole("dialog");
        const dialogUi = within(dialog);

        await user.type(
            dialogUi.getByLabelText(/affiliate link url/i),
            "https://example.com/cancel"
        );

        await user.click(dialogUi.getByRole("button", { name: /cancel/i }));

        await waitFor(() => {
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });

        // Re-open should show cleared input (resetForm)
        await user.click(
            screen.getByRole("button", { name: /add new affiliate link/i })
        );
        const dialog2 = await screen.findByRole("dialog");
        const dialog2Ui = within(dialog2);
        expect(
            (
                dialog2Ui.getByLabelText(
                    /affiliate link url/i
                ) as HTMLInputElement
            ).value
        ).toBe("");
    });
});
