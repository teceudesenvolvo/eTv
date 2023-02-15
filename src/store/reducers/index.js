import { clickReducer } from './clickReducer';
import userReducer from './userReducer'
import { combineReducers } from 'redux';

export const Reducers = combineReducers({
  course: clickReducer,
  user: userReducer
});