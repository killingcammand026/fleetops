import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import driverReducer from "./slices/driverSlice";
import customerReducer from "./slices/customerSlice";
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


const rootReducer = combineReducers({
    auth:authReducer,
    driver: driverReducer,
    customer: customerReducer,
})


const persistedReducer = persistReducer(persistConfig, rootReducer)


//  const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     driver: driverReducer,
//      customer: customerReducer,
//   },
// });


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
