import { configureStore } from "@reduxjs/toolkit";
import counterReducer from '@/app/redux/slice/CounterSlice'
import userReducer from '@/app/redux/slice/UserSlice'
import loggedInreducer from '@/app/redux/slice/LoggedInSlice'


export const store = configureStore({
  reducer: {
    counter:counterReducer,
    user:userReducer,
    loggedIn : loggedInreducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;