import {combineReducers} from 'redux';
import authSlice from '../slices/loginServices/authSlice';

const appReducer = combineReducers({
  auth: authSlice,
});


export default appReducer;
