import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  gameState: {
    // Your initial game state here
    players_online : 0,
    players_in_queue : 0,
    players_playing : 0
  }
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    updateGameState: (state, action) => {
      state.gameState = { ...state.gameState, ...action.payload };
    },
    // Add other reducers as needed
  },
});

export const { updateGameState } = gameSlice.actions;
export default gameSlice.reducer;