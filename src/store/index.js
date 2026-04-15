import { configureStore } from "@reduxjs/toolkit";
import interactionReducer from "./slices/interactionSlice";
import hcpReducer from "./slices/hcpSlice";

const store = configureStore({
  reducer: {
    interactions: interactionReducer,
    hcp: hcpReducer,
  },
});

export default store;