import { http, HttpResponse } from "msw";

export const handlers = [
    http.get("*/runs/:runId/deals", () => {
        return HttpResponse.json({ items: [] }, { status: 200 });
    }),
];
