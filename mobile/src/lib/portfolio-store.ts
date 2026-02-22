import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StockHolding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgCostPerShare: number;
  currentPrice: number;
  previousClose: number;
  currency: string;
  isShariahCompliant: boolean | null;
  shariahScore: number | null;
  lastUpdated: string;
  type: 'stock' | 'etf' | 'sukuk' | 'bond' | 'mutual_fund';
}

interface PortfolioState {
  holdings: StockHolding[];
  watchlist: string[];
  totalPortfolioValue: number;
  totalGainLoss: number;
  lastRefreshed: string | null;

  // Actions
  addHolding: (holding: Omit<StockHolding, 'id'>) => void;
  updateHolding: (id: string, updates: Partial<StockHolding>) => void;
  removeHolding: (id: string) => void;
  updatePrices: (quotes: { symbol: string; price: number; change: number }[]) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;

  // Computed
  getTotalValue: () => number;
  getTotalGainLoss: () => number;
  getTotalGainLossPercent: () => number;
  getHoldingsByType: (type: string) => StockHolding[];
  getShariahCompliantValue: () => number;
}

const generateId = () =>
  `holding-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      holdings: [],
      watchlist: [],
      totalPortfolioValue: 0,
      totalGainLoss: 0,
      lastRefreshed: null,

      addHolding: (holding) => {
        const newHolding: StockHolding = {
          ...holding,
          id: generateId(),
        };
        set((state) => {
          const updatedHoldings = [...state.holdings, newHolding];
          const totalValue = updatedHoldings.reduce(
            (sum, h) => sum + h.shares * h.currentPrice,
            0
          );
          const totalCost = updatedHoldings.reduce(
            (sum, h) => sum + h.shares * h.avgCostPerShare,
            0
          );
          return {
            holdings: updatedHoldings,
            totalPortfolioValue: totalValue,
            totalGainLoss: totalValue - totalCost,
          };
        });
      },

      updateHolding: (id, updates) => {
        set((state) => {
          const updatedHoldings = state.holdings.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          );
          const totalValue = updatedHoldings.reduce(
            (sum, h) => sum + h.shares * h.currentPrice,
            0
          );
          const totalCost = updatedHoldings.reduce(
            (sum, h) => sum + h.shares * h.avgCostPerShare,
            0
          );
          return {
            holdings: updatedHoldings,
            totalPortfolioValue: totalValue,
            totalGainLoss: totalValue - totalCost,
          };
        });
      },

      removeHolding: (id) => {
        set((state) => {
          const updatedHoldings = state.holdings.filter((h) => h.id !== id);
          const totalValue = updatedHoldings.reduce(
            (sum, h) => sum + h.shares * h.currentPrice,
            0
          );
          const totalCost = updatedHoldings.reduce(
            (sum, h) => sum + h.shares * h.avgCostPerShare,
            0
          );
          return {
            holdings: updatedHoldings,
            totalPortfolioValue: totalValue,
            totalGainLoss: totalValue - totalCost,
          };
        });
      },

      updatePrices: (quotes) => {
        set((state) => {
          const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));
          const updatedHoldings = state.holdings.map((h) => {
            const quote = quoteMap.get(h.symbol);
            if (quote) {
              return {
                ...h,
                previousClose: h.currentPrice,
                currentPrice: quote.price,
                lastUpdated: new Date().toISOString(),
              };
            }
            return h;
          });
          const totalValue = updatedHoldings.reduce(
            (sum, h) => sum + h.shares * h.currentPrice,
            0
          );
          const totalCost = updatedHoldings.reduce(
            (sum, h) => sum + h.shares * h.avgCostPerShare,
            0
          );
          return {
            holdings: updatedHoldings,
            totalPortfolioValue: totalValue,
            totalGainLoss: totalValue - totalCost,
            lastRefreshed: new Date().toISOString(),
          };
        });
      },

      addToWatchlist: (symbol) => {
        set((state) => {
          if (state.watchlist.includes(symbol)) return state;
          return { watchlist: [...state.watchlist, symbol] };
        });
      },

      removeFromWatchlist: (symbol) => {
        set((state) => ({
          watchlist: state.watchlist.filter((s) => s !== symbol),
        }));
      },

      getTotalValue: () => {
        const { holdings } = get();
        return holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0);
      },

      getTotalGainLoss: () => {
        const { holdings } = get();
        return holdings.reduce(
          (sum, h) => sum + h.shares * (h.currentPrice - h.avgCostPerShare),
          0
        );
      },

      getTotalGainLossPercent: () => {
        const { holdings } = get();
        const totalCost = holdings.reduce(
          (sum, h) => sum + h.shares * h.avgCostPerShare,
          0
        );
        if (totalCost === 0) return 0;
        const totalValue = holdings.reduce(
          (sum, h) => sum + h.shares * h.currentPrice,
          0
        );
        return ((totalValue - totalCost) / totalCost) * 100;
      },

      getHoldingsByType: (type) => {
        const { holdings } = get();
        return holdings.filter((h) => h.type === type);
      },

      getShariahCompliantValue: () => {
        const { holdings } = get();
        return holdings
          .filter((h) => h.isShariahCompliant === true)
          .reduce((sum, h) => sum + h.shares * h.currentPrice, 0);
      },
    }),
    {
      name: 'barakah-portfolio',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
