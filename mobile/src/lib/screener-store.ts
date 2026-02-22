import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ProductCategory =
  | 'savings'
  | 'investment'
  | 'credit_card'
  | 'mortgage'
  | 'auto_loan'
  | 'personal_loan'
  | 'insurance'
  | 'pension'
  | 'unknown';

export type ComplianceLevel = 'halal' | 'questionable' | 'haram';

export interface ComplianceIssue {
  issue: string;
  detail: string;
  standard: string;
  severity: 'critical' | 'major' | 'minor';
}

export interface ScreenerResult {
  score: number;
  complianceLevel: ComplianceLevel;
  productCategory: ProductCategory;
  productName: string;
  summary: string;
  complianceIssues: ComplianceIssue[];
  suggestedIslamicAlternative: string;
  overallAssessment: string;
}

export interface ScreeningRecord {
  id: string;
  date: string;
  inputMode: 'form' | 'text' | 'camera';
  productName: string;
  productCategory: ProductCategory;
  score: number;
  complianceLevel: ComplianceLevel;
  result: ScreenerResult;
}

export interface ProductFormData {
  category: ProductCategory;
  name: string;
  provider: string;
  interestRate: string;
  fees: string;
  terms: string;
  additionalDetails: string;
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface ScreenerState {
  screeningHistory: ScreeningRecord[];
  addScreening: (record: Omit<ScreeningRecord, 'id'>) => void;
  removeScreening: (id: string) => void;
  clearHistory: () => void;
}

export const useScreenerStore = create<ScreenerState>()(
  persist(
    (set) => ({
      screeningHistory: [],

      addScreening: (record) => {
        const id = `screen_${Date.now()}`;
        set((state) => ({
          screeningHistory: [
            { ...record, id },
            ...state.screeningHistory,
          ].slice(0, 50), // Max 50 records
        }));
      },

      removeScreening: (id) => {
        set((state) => ({
          screeningHistory: state.screeningHistory.filter((r) => r.id !== id),
        }));
      },

      clearHistory: () => set({ screeningHistory: [] }),
    }),
    {
      name: 'barakah-screener',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
