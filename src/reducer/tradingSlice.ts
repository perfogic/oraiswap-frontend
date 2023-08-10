import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { RootState } from 'store/configure';
import { PairToken, TradingState } from './type';
import { pairsChart } from 'components/TVChartContainer/config';

const initialState: TradingState = {
  listToken: [],
  currentToken: pairsChart.find((pair) => pair.symbol === 'ORAI/USDT'),
  chartDataLength: -1
};

const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    setListToken: (state, action: PayloadAction<PairToken[]>) => {
      state.listToken = action.payload;
    },
    setCurrentToken: (state, action: PayloadAction<PairToken>) => {
      state.currentToken = action.payload;
    },
    setChartDataLength: (state, action: PayloadAction<number>) => {
      state.chartDataLength = action.payload;
    }
  }
});

// Action creators are generated for each case reducer function
export const { setCurrentToken, setListToken, setChartDataLength } = tradingSlice.actions;

export const selectCurrentToken = (state: RootState): PairToken => state.trading.currentToken;
export const selectListToken = (state: RootState): PairToken[] => state.trading.listToken;
export const selectChartDataLength = (state: RootState): number => state.trading.chartDataLength;

export default tradingSlice.reducer;