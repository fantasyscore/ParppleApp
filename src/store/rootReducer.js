import {combineReducers} from 'redux';
import authSlice from '../slices/loginServices/authSlice';
import purchaseSlice from '../slices/purchase/purchaseSlice';
import inAppNotificationSlice from '../slices/inAppNotificationSlice';

const appReducer = combineReducers({
  auth: authSlice,
  purchase: purchaseSlice,
  inAppNotification: inAppNotificationSlice,
});

// Reset ALL slices on logout
const rootReducer = (state, action) => {
  if (action?.type === 'auth/logout') {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
