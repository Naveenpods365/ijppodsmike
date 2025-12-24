import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./msw/server";

beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
    server.resetHandlers();
    cleanup();
});

afterAll(() => {
    server.close();
});

if (!("ResizeObserver" in globalThis)) {
    class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    }

    (
        globalThis as unknown as { ResizeObserver: typeof ResizeObserver }
    ).ResizeObserver = ResizeObserver;
}

if (!("matchMedia" in window)) {
    (
        window as unknown as { matchMedia: (query: string) => MediaQueryList }
    ).matchMedia = (query: string) =>
        ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList;
}

if (!navigator.clipboard) {
    (navigator as unknown as { clipboard: Clipboard }).clipboard = {
        writeText: vi.fn().mockResolvedValue(undefined),
    } as unknown as Clipboard;
}
