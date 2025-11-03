import {configureStore} from '@reduxjs/toolkit';
import {setAutoFreeze} from 'immer';
import appReducer from './rootReducer';
setAutoFreeze(false);
const store = configureStore({
  reducer: appReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;