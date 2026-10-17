import {combineReducers} from 'redux';
import authSlice, {logout} from '../slices/loginServices/authSlice';
import purchaseSlice from '../slices/purchase/purchaseSlice';
import inAppNotificationSlice from '../slices/inAppNotificationSlice';

const appReducer = combineReducers({
  auth: authSlice,
  purchase: purchaseSlice,
  inAppNotification: inAppNotificationSlice,
});

// Logging out resets EVERY slice, so the next account never sees the previous user's data.
const rootReducer = (state, action) => {
  if (logout.match(action)) {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
