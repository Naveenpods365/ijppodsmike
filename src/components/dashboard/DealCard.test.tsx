import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DealCard } from "./DealCard";

describe("DealCard", () => {
    it("renders title, retailer, category and discount", () => {
        render(
            <DealCard
                title="Sony WH-1000XM5 Wireless Headphones"
                discount="35%"
                category="Electronics"
                retailer="Amazon.ca"
            />
        );

        expect(
            screen.getByRole("heading", {
                name: /sony wh-1000xm5 wireless headphones/i,
            })
        ).toBeInTheDocument();
        expect(screen.getByText(/amazon\.ca/i)).toBeInTheDocument();
        expect(screen.getByText(/electronics/i)).toBeInTheDocument();
        expect(screen.getByText(/35% off/i)).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /preview deals/i })
        ).toBeInTheDocument();
    });

    it("calls onPreview with category when Preview Deals is clicked", async () => {
        const onPreview = vi.fn();
        const user = userEvent.setup();

        render(
            <DealCard
                title="Deal"
                discount="10%"
                category="Beauty"
                retailer="Walmart"
                onPreview={onPreview}
            />
        );

        await user.click(
            screen.getByRole("button", { name: /preview deals/i })
        );

        expect(onPreview).toHaveBeenCalledTimes(1);
        expect(onPreview).toHaveBeenCalledWith("Beauty");
    });

    it("does not throw if onPreview is not provided", async () => {
        const user = userEvent.setup();

        render(
            <DealCard
                title="Deal"
                discount="10%"
                category="Beauty"
                retailer="Walmart"
            />
        );

        await expect(
            user.click(screen.getByRole("button", { name: /preview deals/i }))
        ).resolves.not.toThrow();
    });
});
