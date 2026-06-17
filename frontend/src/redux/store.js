import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import driverReducer from "./slices/driverSlice";
import customerReducer from "./slices/customerSlice";
import userReducer from "./slices/userSlice";
import { setupAxiosInterceptors } from "../lib/axios";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
const persistConfig = {
    key: 'root',
    version: 1,
    storage,
}


import orderReducer from "./slices/orderSlice";
import assignmentReducer from "./slices/assignmentSlice";

const rootReducer = combineReducers({
    auth:authReducer,
    driver: driverReducer,
    customer: customerReducer,
    user: userReducer,
    order: orderReducer,
    assignment: assignmentReducer,
})


const persistedReducer = persistReducer(persistConfig, rootReducer)




const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);
export default store;
// Attach interceptors after store creation
setupAxiosInterceptors(store);
