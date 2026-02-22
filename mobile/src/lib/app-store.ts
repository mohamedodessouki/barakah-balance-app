import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Account Type ────────────────────────────────────────────────────────────

export type AccountType = 'individual' | 'enterprise';

// ─── Company ─────────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  industry: string;
  cash: number;
  receivables: number;
  inventory: number;
  investments: number;
  otherCurrentAssets: number;
  currentLiabilities: number;
  islamicFinancing: number;
  conventionalDebt: number;
  hawlStartDate: string | null;
}

function createEmptyCompany(id: string, name: string): Company {
  return {
    id,
    name,
    industry: '',
    cash: 0,
    receivables: 0,
    inventory: 0,
    investments: 0,
    otherCurrentAssets: 0,
    currentLiabilities: 0,
    islamicFinancing: 0,
    conventionalDebt: 0,
    hawlStartDate: null,
  };
}

// ─── Zakat Calculation Record ────────────────────────────────────────────────

export interface ZakatRecord {
  id: string;
  date: string;
  fiscalYear: string;
  entityType: 'personal' | 'company';
  entityId: string | null; // null for personal
  entityName: string;
  totalAssets: number;
  totalDeductions: number;
  zakatableAmount: number;
  zakatDue: number;
  currency: string;
  paid: boolean;
}

// ─── App Store ───────────────────────────────────────────────────────────────

interface AppState {
  // Onboarding
  accountType: AccountType | null;
  onboardingComplete: boolean;
  hawlStartDate: string | null; // ISO date string for personal hawl

  // Companies
  companies: Company[];

  // Active view in zakat tab
  activeEntityId: string | null; // null = personal, company id = that company

  // Zakat history
  zakatRecords: ZakatRecord[];

  // Actions
  setAccountType: (type: AccountType) => void;
  completeOnboarding: () => void;
  setHawlStartDate: (date: string) => void;

  // Company management
  addCompany: (name: string) => string;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  removeCompany: (id: string) => void;

  // Active entity
  setActiveEntity: (id: string | null) => void;

  // Zakat records
  addZakatRecord: (record: Omit<ZakatRecord, 'id'>) => void;
  markZakatPaid: (recordId: string) => void;

  // Reset
  resetApp: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      accountType: null,
      onboardingComplete: false,
      hawlStartDate: null,
      companies: [],
      activeEntityId: null,
      zakatRecords: [],

      setAccountType: (type) => set({ accountType: type }),

      completeOnboarding: () => set({ onboardingComplete: true }),

      setHawlStartDate: (date) => set({ hawlStartDate: date }),

      addCompany: (name) => {
        const id = `company_${Date.now()}`;
        const newCompany = createEmptyCompany(id, name);
        set((state) => ({
          companies: [...state.companies, newCompany],
        }));
        return id;
      },

      updateCompany: (id, updates) => {
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      removeCompany: (id) => {
        set((state) => ({
          companies: state.companies.filter((c) => c.id !== id),
          activeEntityId: state.activeEntityId === id ? null : state.activeEntityId,
        }));
      },

      setActiveEntity: (id) => set({ activeEntityId: id }),

      addZakatRecord: (record) => {
        const id = `zakat_${Date.now()}`;
        set((state) => ({
          zakatRecords: [{ ...record, id }, ...state.zakatRecords],
        }));
      },

      markZakatPaid: (recordId) => {
        set((state) => ({
          zakatRecords: state.zakatRecords.map((r) =>
            r.id === recordId ? { ...r, paid: true } : r
          ),
        }));
      },

      resetApp: () =>
        set({
          accountType: null,
          onboardingComplete: false,
          hawlStartDate: null,
          companies: [],
          activeEntityId: null,
          zakatRecords: [],
        }),
    }),
    {
      name: 'barakah-app',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
