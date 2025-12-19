import {combineReducers} from 'redux';
import authSlice from '../slices/loginServices/authSlice';
import purchaseSlice from '../slices/purchase/purchaseSlice';

const appReducer = combineReducers({
  auth: authSlice,
  purchase: purchaseSlice,
});


export default appReducer;
