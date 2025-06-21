import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slice/gameSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
});