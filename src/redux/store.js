import { configureStore } from "@reduxjs/toolkit";
import schedulerSlice from "./slice/schedulerSlice";

const store = configureStore({
	reducer: {
		scheduler: schedulerSlice,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export default store;
