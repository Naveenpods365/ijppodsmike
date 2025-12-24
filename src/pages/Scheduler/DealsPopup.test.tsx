import { describe, expect, it, vi } from "vitest";
import type React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { http, HttpResponse } from "msw";

import DealsPopup from "./DealsPopup";
import schedulerReducer from "@/redux/slice/schedulerSlice";
import { server } from "@/test/msw/server";

type SchedulerState = {
    runDeals: unknown[];
    runDealsLoading: boolean;
    runDealsError: unknown;
    runDetails: any;
};

const createStore = (scheduler: Partial<SchedulerState> = {}) => {
    const preloadedState = {
        scheduler: {
            runDeals: [],
            runDealsLoading: false,
            runDealsError: null,
            runDetails: null,
            ...scheduler,
        },
    };

    return configureStore({
        reducer: { scheduler: schedulerReducer },
        preloadedState,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({ serializableCheck: false }),
    });
};

const renderDealsPopup = (ui: React.ReactElement, store = createStore()) => {
    return render(<Provider store={store}>{ui}</Provider>);
};

describe("DealsPopup", () => {
    it("renders the dialog title and 'No run selected' when open but no runId is provided", () => {
        // Arrange
        const store = createStore();

        // Act
        renderDealsPopup(
            <DealsPopup open={true} onOpenChange={() => {}} runId={null} />,
            store
        );

        // Assert
        expect(
            screen.getByRole("heading", { name: /recent run deals/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/no run selected\./i)).toBeInTheDocument();
    });

    it("shows loading state when runDealsLoading is true (preloaded)", async () => {
        // Arrange
        const store = createStore({ runDealsLoading: true });

        // Act
        renderDealsPopup(
            <DealsPopup open={true} onOpenChange={() => {}} runId={null} />,
            store
        );

        // Assert
        // NOTE: Radix Dialog renders content in a portal (outside the RTL container).
        // NOTE: Loader icon has no accessible name; we assert via a stable CSS class.
        await waitFor(() => {
            expect(document.body.querySelector(".animate-spin")).toBeTruthy();
        });
    });

    it("fetches run deals and shows 'No deals found' when API returns empty items", async () => {
        // Arrange
        server.use(
            http.get("*/runs/:runId/deals", ({ params }) => {
                expect(params.runId).toBe("run-123");
                return HttpResponse.json(
                    {
                        shopping_platform: "Costco",
                        status: "success",
                        started_at: "2025-01-01T10:00:00.000Z",
                        finished_at: "2025-01-01T10:05:00.000Z",
                        items: [],
                    },
                    { status: 200 }
                );
            })
        );

        const store = createStore();

        // Act
        renderDealsPopup(
            <DealsPopup
                open={true}
                onOpenChange={() => {}}
                runId={"run-123"}
            />,
            store
        );

        // Assert
        expect(
            await screen.findByText(/no deals found for this run\./i)
        ).toBeInTheDocument();
        expect(screen.getByText(/platform/i)).toBeInTheDocument();
        expect(screen.getByText("Costco")).toBeInTheDocument();
    });

    it("renders a table of deals when API returns items", async () => {
        // Arrange
        server.use(
            http.get("*/runs/:runId/deals", () => {
                return HttpResponse.json(
                    {
                        shopping_platform: "BestBuy",
                        status: "success",
                        started_at: "2025-01-01T10:00:00.000Z",
                        finished_at: "2025-01-01T10:05:00.000Z",
                        items: [
                            {
                                id: 1,
                                preview_message: "Noise Cancelling Headphones",
                                shopping_platform: "bestbuy",
                                price: 19.99,
                                discounted: 9.99,
                                status: "Sent",
                                org_link: "https://example.com/deal/1",
                                created_at: "2025-01-01T10:02:00.000Z",
                                image_url: "https://example.com/image.jpg",
                            },
                        ],
                    },
                    { status: 200 }
                );
            })
        );

        const store = createStore();

        // Act
        renderDealsPopup(
            <DealsPopup
                open={true}
                onOpenChange={() => {}}
                runId={"run-999"}
            />,
            store
        );

        // Assert
        const table = await screen.findByRole("table");
        expect(
            within(table).getByRole("columnheader", { name: /product/i })
        ).toBeInTheDocument();

        expect(
            within(table).getByText(/noise cancelling headphones/i)
        ).toBeInTheDocument();

        // Discounted and original prices are shown.
        expect(within(table).getByText("$9.99")).toBeInTheDocument();
        expect(within(table).getByText("$19.99")).toBeInTheDocument();

        // Status badge.
        expect(within(table).getByText("Sent")).toBeInTheDocument();
    });

    it("shows an error message when the run deals request fails", async () => {
        // Arrange
        server.use(
            http.get("*/runs/:runId/deals", () => {
                return HttpResponse.json(
                    { message: "Server error" },
                    { status: 500 }
                );
            })
        );

        const store = createStore();

        // Act
        renderDealsPopup(
            <DealsPopup
                open={true}
                onOpenChange={() => {}}
                runId={"run-err"}
            />,
            store
        );

        // Assert
        expect(
            await screen.findByText(/failed to load run data\./i)
        ).toBeInTheDocument();
    });

    it("calls onOpenChange(false) when the user closes the dialog", async () => {
        // Arrange
        const onOpenChange = vi.fn();
        const user = userEvent.setup();
        const store = createStore();

        // Act
        renderDealsPopup(
            <DealsPopup open={true} onOpenChange={onOpenChange} runId={null} />,
            store
        );

        await user.click(screen.getByRole("button", { name: /close/i }));

        // Assert
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });
});
