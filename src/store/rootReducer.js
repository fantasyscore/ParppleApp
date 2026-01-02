import {combineReducers} from 'redux';
import authSlice from '../slices/loginServices/authSlice';
import purchaseSlice from '../slices/purchase/purchaseSlice';
import inAppNotificationSlice from '../slices/inAppNotificationSlice';

const appReducer = combineReducers({
  auth: authSlice,
  purchase: purchaseSlice,
  inAppNotification: inAppNotificationSlice,
});


export default appReducer;
