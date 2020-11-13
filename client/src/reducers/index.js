import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';
import profile from './profile';

//imports the various reducers existing in reducers/ and combines+exports them
export default combineReducers({
    alert,
    auth,
    profile
});