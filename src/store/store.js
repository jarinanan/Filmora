import { configureStore } from '@reduxjs/toolkit'
import movieoReducer from './movieoSlice'
import userReducer from './userSlice'

// Custom middleware to catch undefined actions
const undefinedActionMiddleware = (store) => (next) => (action) => {
  if (action === undefined) {
    console.error('Undefined action dispatched!');
    return;
  }
  if (!action || typeof action !== 'object') {
    console.error('Invalid action dispatched:', action);
    return;
  }
  if (!action.type) {
    console.error('Action without type dispatched:', action);
    return;
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    movieoData : movieoReducer,
    user: userReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(undefinedActionMiddleware),
})