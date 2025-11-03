import authReducer from "../slices/loginServices/authSlice";
import { AnyAction, combineReducers, Reducer } from "@reduxjs/toolkit";

const combinedReducer = combineReducers({
  authReducer: authReducer,
});

export type RootState = ReturnType<typeof combinedReducer>;

const rootReducer: Reducer = (state: RootState, action: AnyAction) => {
  if (action.type === "auth/logout") {
    state = {} as RootState;
  }
  return combinedReducer(state, action);
};

// const rootReducer = combineReducers({
//   authReducer: authReducer,
// });

// export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;