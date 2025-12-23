import api from "@/lib/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
    isOpenScrapperSelectPopup: false,
    isOpenAddSchedulerPopup: false,
    scrapeCostcoLoading: false,
    scrapeBestBuyLoading: false,
    scrapeWalmartLoading: false,
    scrapeError: null,
    // Scheduled Jobs
    scheduledJobs: [],
    scheduledJobsLoading: false,
    scheduledJobsError: null,
    // Schedule API
    scheduleCostcoLoading: false,
    scheduleBestBuyLoading: false,
    scheduleWalmartLoading: false,
    scheduleError: null,
    // Recent Runs
    recentRuns: [],
    recentRunsLoading: false,
    recentRunsError: null,
    // Run Deals (Popup)
    runDeals: [],
    runDealsLoading: false,
    runDealsError: null,
    runDetails: null,
};

export const getScheduledJobs = createAsyncThunk(
    "scheduler/getScheduledJobs",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/schedule/jobs");
            return data;
        } catch (error) {
            console.error("Error fetching scheduled jobs:", error);
            return rejectWithValue(error.response?.data || "Unknown error");
        }
    }
);

export const getRecentRuns = createAsyncThunk(
    "scheduler/getRecentRuns",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/schedule/recent-runs");
            return data;
        } catch (error) {
            console.error("Error fetching recent runs:", error);
            return rejectWithValue(error.response?.data || "Unknown error");
        }
    }
);

export const getRunDeals = createAsyncThunk(
    "scheduler/getRunDeals",
    async (runId, { rejectWithValue }) => {
        try {
            const { data } = await api.get(
                `/runs/${encodeURIComponent(runId)}/deals`
            );
            return data;
        } catch (error) {
            console.error("Error fetching run deals:", error);
            return rejectWithValue(error.response?.data || "Unknown error");
        }
    }
);

export const scrapeCostco = createAsyncThunk(
    "scheduler/scrapeCostco",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/scrape/costco", payload);
            return data;
        } catch (error) {
            console.error("Error scraping Costco:", error);
            return rejectWithValue(error.response?.data || "Unknown error");
        }
    }
);

export const scrapeBestBuy = createAsyncThunk(
    "scheduler/scrapeBestBuy",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/scrape/bestbuy", payload);
            return data;
        } catch (error) {
            console.error("Error scraping BestBuy:", error);
            return rejectWithValue(error.response?.data || "Unknown error");
        }
    }
);

export const scrapeWalmart = createAsyncThunk(
    "scheduler/scrapeWalmart",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/scrape/walmart", payload);
            return data;
        } catch (error) {
            console.error("Error scraping Walmart:", error);
            return rejectWithValue(error.response?.data || "Unknown error");
        }
    }
);

export const scheduleCostco = createAsyncThunk(
    "scheduler/scheduleCostco",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/schedule/costco", payload);
            return data;
        } catch (error) {
            console.error("Error scheduling Costco:", error);
            return rejectWithValue(error.response?.data || "Unknown error");
        }
    }
);

export const scheduleBestBuy = createAsyncThunk(
    "scheduler/scheduleBestBuy",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/schedule/bestbuy", payload);
            return data;
        } catch (error) {
            console.error("Error scheduling Best Buy:", error);
            return rejectWithValue(error.response?.data || "Unknown error");
        }
    }
);

export const scheduleWalmart = createAsyncThunk(
    "scheduler/scheduleWalmart",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/schedule/walmart", payload);
            return data;
        } catch (error) {
            console.error("Error scheduling Walmart:", error);
            return rejectWithValue(error.response?.data || "Unknown error");
        }
    }
);

export const toggleSchedule = createAsyncThunk(
    "scheduler/toggleSchedule",
    async ({ id, is_active }, { rejectWithValue }) => {
        try {
            const { data } = await api.patch(
                `/schedule/${encodeURIComponent(id)}/toggle`,
                { is_active }
            );
            return { id, is_active };
        } catch (error) {
            console.error("Error toggling schedule:", error);
            return rejectWithValue(error.response?.data || "Unknown error");
        }
    }
);

const schedulerSlice = createSlice({
    name: "scheduler",
    initialState,
    reducers: {
        setIsOpenScrapperSelectPopup: (state, action) => {
            state.isOpenScrapperSelectPopup = action.payload;
        },
        setIsOpenAddSchedulerPopup: (state, action) => {
            state.isOpenAddSchedulerPopup = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Scheduled Jobs
            .addCase(getScheduledJobs.pending, (state) => {
                state.scheduledJobsLoading = true;
                state.scheduledJobsError = null;
            })
            .addCase(getScheduledJobs.fulfilled, (state, { payload }) => {
                state.scheduledJobsLoading = false;
                state.scheduledJobs = payload;
            })
            .addCase(getScheduledJobs.rejected, (state, { payload }) => {
                state.scheduledJobsLoading = false;
                state.scheduledJobsError = payload;
            })
            // Recent Runs
            .addCase(getRecentRuns.pending, (state) => {
                state.recentRunsLoading = true;
                state.recentRunsError = null;
            })
            .addCase(getRecentRuns.fulfilled, (state, { payload }) => {
                state.recentRunsLoading = false;
                state.recentRuns = payload;
            })
            .addCase(getRecentRuns.rejected, (state, { payload }) => {
                state.recentRunsLoading = false;
                state.recentRunsError = payload;
            })
            // Run Deals
            .addCase(getRunDeals.pending, (state) => {
                state.runDealsLoading = true;
                state.runDealsError = null;
                state.runDetails = null;
            })
            .addCase(getRunDeals.fulfilled, (state, { payload }) => {
                state.runDealsLoading = false;
                const items =
                    payload &&
                    typeof payload === "object" &&
                    Array.isArray(payload.items)
                        ? payload.items
                        : payload;
                state.runDetails =
                    payload &&
                    typeof payload === "object" &&
                    !Array.isArray(payload)
                        ? payload
                        : null;
                state.runDeals = items;
            })
            .addCase(getRunDeals.rejected, (state, { payload }) => {
                state.runDealsLoading = false;
                state.runDealsError = payload;
                state.runDetails = null;
            })
            // Costco Scrape
            .addCase(scrapeCostco.pending, (state) => {
                state.scrapeCostcoLoading = true;
                state.scrapeError = null;
            })
            .addCase(scrapeCostco.fulfilled, (state) => {
                state.scrapeCostcoLoading = false;
            })
            .addCase(scrapeCostco.rejected, (state, { payload }) => {
                state.scrapeCostcoLoading = false;
                state.scrapeError = payload;
            })
            // Best Buy Scrape
            .addCase(scrapeBestBuy.pending, (state) => {
                state.scrapeBestBuyLoading = true;
                state.scrapeError = null;
            })
            .addCase(scrapeBestBuy.fulfilled, (state) => {
                state.scrapeBestBuyLoading = false;
            })
            .addCase(scrapeBestBuy.rejected, (state, { payload }) => {
                state.scrapeBestBuyLoading = false;
                state.scrapeError = payload;
            })
            // Walmart Scrape
            .addCase(scrapeWalmart.pending, (state) => {
                state.scrapeWalmartLoading = true;
                state.scrapeError = null;
            })
            .addCase(scrapeWalmart.fulfilled, (state) => {
                state.scrapeWalmartLoading = false;
            })
            .addCase(scrapeWalmart.rejected, (state, { payload }) => {
                state.scrapeWalmartLoading = false;
                state.scrapeError = payload;
            })
            // Schedule Costco
            .addCase(scheduleCostco.pending, (state) => {
                state.scheduleCostcoLoading = true;
                state.scheduleError = null;
            })
            .addCase(scheduleCostco.fulfilled, (state) => {
                state.scheduleCostcoLoading = false;
            })
            .addCase(scheduleCostco.rejected, (state, { payload }) => {
                state.scheduleCostcoLoading = false;
                state.scheduleError = payload;
            })
            // Schedule Best Buy
            .addCase(scheduleBestBuy.pending, (state) => {
                state.scheduleBestBuyLoading = true;
                state.scheduleError = null;
            })
            .addCase(scheduleBestBuy.fulfilled, (state) => {
                state.scheduleBestBuyLoading = false;
            })
            .addCase(scheduleBestBuy.rejected, (state, { payload }) => {
                state.scheduleBestBuyLoading = false;
                state.scheduleError = payload;
            })
            // Schedule Walmart
            .addCase(scheduleWalmart.pending, (state) => {
                state.scheduleWalmartLoading = true;
                state.scheduleError = null;
            })
            .addCase(scheduleWalmart.fulfilled, (state) => {
                state.scheduleWalmartLoading = false;
            })
            .addCase(scheduleWalmart.rejected, (state, { payload }) => {
                state.scheduleWalmartLoading = false;
                state.scheduleError = payload;
            })
            // Toggle Schedule
            .addCase(toggleSchedule.pending, (state, action) => {
                const index = state.scheduledJobs.findIndex(
                    (job) => job.id === action.meta.arg.id
                );
                if (index !== -1) {
                    state.scheduledJobs[index].is_active =
                        action.meta.arg.is_active;
                }
            })
            .addCase(toggleSchedule.fulfilled, (state, { payload }) => {
                const index = state.scheduledJobs.findIndex(
                    (job) => job.id === payload.id
                );
                if (index !== -1) {
                    state.scheduledJobs[index].is_active = payload.is_active;
                }
            })
            .addCase(toggleSchedule.rejected, (state, action) => {
                console.error(
                    "Toggle schedule failed:",
                    action.payload || action.error
                );
                const index = state.scheduledJobs.findIndex(
                    (job) => job.id === action.meta.arg.id
                );
                if (index !== -1) {
                    // Revert to the opposite of what was attempted
                    state.scheduledJobs[index].is_active =
                        !action.meta.arg.is_active;
                }
            });
    },
});

export const { setIsOpenScrapperSelectPopup, setIsOpenAddSchedulerPopup } =
    schedulerSlice.actions;
export default schedulerSlice.reducer;
