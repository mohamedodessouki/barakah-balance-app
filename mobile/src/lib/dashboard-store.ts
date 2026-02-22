import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for Dashboard
export type ZakatStatus = 'paid' | 'due_soon' | 'overdue' | 'not_due';

export interface HawlInfo {
  startDate: string; // ISO date when wealth first exceeded Nisab
  endDate: string; // ISO date when Zakat becomes due
  preferredPaymentMonth?: number; // 1-12, many choose Ramadan
}

export interface ZakatPaymentRecord {
  id: string;
  date: string;
  amount: number;
  currency: string;
  notes?: string;
  recipients?: ZakatRecipient[];
}

export interface ZakatRecipient {
  category: ZakatCategory;
  name: string;
  amount: number;
  isOrganization: boolean;
}

export type ZakatCategory =
  | 'fuqara' // The Poor
  | 'masakin' // The Needy
  | 'amil' // Zakat Administrators
  | 'muallaf' // New Muslims
  | 'riqab' // Freeing Captives
  | 'gharimin' // Debtors
  | 'fisabilillah' // In Allah's Cause
  | 'ibnsabil'; // Travelers

export interface WealthSnapshot {
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  liquidAssets: number;
  investments: number;
  preciousMetals: number;
  realEstate: number;
  businessAssets: number;
  exemptAssets: number;
}

export interface AssetHealthScore {
  overall: number; // 0-100
  halalPurity: number;
  liquidity: number;
  diversification: number;
  debtRatio: number;
  zakatCompliance: number;
}

export interface PurificationItem {
  id: string;
  assetName: string;
  assetType: 'stock' | 'fund' | 'other';
  totalValue: number;
  purificationPercentage: number;
  purificationAmount: number;
  isPaid: boolean;
  paidDate?: string;
}

export interface Alert {
  id: string;
  type: 'hawl' | 'nisab' | 'deposit' | 'ramadan' | 'compliance' | 'reminder';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  date: string;
  isRead: boolean;
  actionRoute?: string;
}

export interface SadaqahRecord {
  id: string;
  date: string;
  amount: number;
  currency: string;
  recipientName: string;
  cause: 'education' | 'hunger' | 'masjid' | 'dawah' | 'emergency' | 'other';
  isRecurring: boolean;
  notes?: string;
}

export interface FinancialGoal {
  id: string;
  category: 'deen' | 'nafs' | 'aql' | 'nasl' | 'mal';
  name: string;
  nameAr: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate?: string;
  monthlyContribution?: number;
  icon: string;
}

// Net Worth tracking
export interface Liability {
  id: string;
  name: string;
  amount: number;
  currency: string;
  isIslamic: boolean; // Islamic financing vs conventional
  monthlyPayment?: number;
  interestRate?: number;
  endDate?: string;
}

interface DashboardState {
  // Hawl & Zakat Status
  hawlInfo: HawlInfo | null;
  zakatPayments: ZakatPaymentRecord[];
  nisabType: 'gold' | 'silver';
  currentGoldPrice: number; // per gram
  currentSilverPrice: number; // per gram

  // Wealth Snapshots
  wealthHistory: WealthSnapshot[];
  currentSnapshot: WealthSnapshot | null;

  // Health & Purification
  healthScore: AssetHealthScore | null;
  purificationItems: PurificationItem[];

  // Alerts
  alerts: Alert[];

  // Sadaqah
  sadaqahRecords: SadaqahRecord[];
  sadaqahGoal: number; // monthly/yearly target

  // Financial Goals
  financialGoals: FinancialGoal[];

  // Liabilities
  liabilities: Liability[];

  // Settings
  dashboardCurrency: string;

  // Actions
  setHawlInfo: (info: HawlInfo) => void;
  addZakatPayment: (payment: Omit<ZakatPaymentRecord, 'id'>) => void;
  removeZakatPayment: (id: string) => void;
  setNisabType: (type: 'gold' | 'silver') => void;
  setGoldPrice: (price: number) => void;
  setSilverPrice: (price: number) => void;
  addWealthSnapshot: (snapshot: Omit<WealthSnapshot, 'date'>) => void;
  updateHealthScore: (score: AssetHealthScore) => void;
  addPurificationItem: (item: Omit<PurificationItem, 'id'>) => void;
  markPurificationPaid: (id: string) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'isRead'>) => void;
  markAlertRead: (id: string) => void;
  dismissAlert: (id: string) => void;
  addSadaqah: (record: Omit<SadaqahRecord, 'id'>) => void;
  addFinancialGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  updateGoalProgress: (id: string, amount: number) => void;
  addLiability: (liability: Omit<Liability, 'id'>) => void;
  removeLiability: (id: string) => void;
  updateLiability: (id: string, updates: Partial<Liability>) => void;

  // Computed
  getZakatStatus: () => ZakatStatus;
  getDaysUntilHawl: () => number;
  getCurrentNisab: () => number;
  getNetWorth: () => number;
  getIslamicDebtRatio: () => number;
  getTotalSadaqahThisYear: () => number;
}

const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      hawlInfo: null,
      zakatPayments: [],
      nisabType: 'gold',
      currentGoldPrice: 70, // USD per gram default
      currentSilverPrice: 0.85, // USD per gram default
      wealthHistory: [],
      currentSnapshot: null,
      healthScore: null,
      purificationItems: [],
      alerts: [],
      sadaqahRecords: [],
      sadaqahGoal: 500,
      financialGoals: [],
      liabilities: [],
      dashboardCurrency: 'USD',

      setHawlInfo: (info) => set({ hawlInfo: info }),

      addZakatPayment: (payment) =>
        set((state) => ({
          zakatPayments: [
            ...state.zakatPayments,
            { ...payment, id: `zp-${Date.now()}` },
          ],
        })),

      removeZakatPayment: (id) =>
        set((state) => ({
          zakatPayments: state.zakatPayments.filter((p) => p.id !== id),
        })),

      setNisabType: (type) => set({ nisabType: type }),
      setGoldPrice: (price) => set({ currentGoldPrice: price }),
      setSilverPrice: (price) => set({ currentSilverPrice: price }),

      addWealthSnapshot: (snapshot) =>
        set((state) => ({
          wealthHistory: [
            ...state.wealthHistory,
            { ...snapshot, date: new Date().toISOString() },
          ],
          currentSnapshot: { ...snapshot, date: new Date().toISOString() },
        })),

      updateHealthScore: (score) => set({ healthScore: score }),

      addPurificationItem: (item) =>
        set((state) => ({
          purificationItems: [
            ...state.purificationItems,
            { ...item, id: `pur-${Date.now()}` },
          ],
        })),

      markPurificationPaid: (id) =>
        set((state) => ({
          purificationItems: state.purificationItems.map((item) =>
            item.id === id
              ? { ...item, isPaid: true, paidDate: new Date().toISOString() }
              : item
          ),
        })),

      addAlert: (alert) =>
        set((state) => ({
          alerts: [
            { ...alert, id: `alert-${Date.now()}`, isRead: false },
            ...state.alerts,
          ],
        })),

      markAlertRead: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, isRead: true } : a
          ),
        })),

      dismissAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        })),

      addSadaqah: (record) =>
        set((state) => ({
          sadaqahRecords: [
            ...state.sadaqahRecords,
            { ...record, id: `sad-${Date.now()}` },
          ],
        })),

      addFinancialGoal: (goal) =>
        set((state) => ({
          financialGoals: [
            ...state.financialGoals,
            { ...goal, id: `goal-${Date.now()}` },
          ],
        })),

      updateGoalProgress: (id, amount) =>
        set((state) => ({
          financialGoals: state.financialGoals.map((g) =>
            g.id === id ? { ...g, currentAmount: amount } : g
          ),
        })),

      addLiability: (liability) =>
        set((state) => ({
          liabilities: [
            ...state.liabilities,
            { ...liability, id: `liab-${Date.now()}` },
          ],
        })),

      removeLiability: (id) =>
        set((state) => ({
          liabilities: state.liabilities.filter((l) => l.id !== id),
        })),

      updateLiability: (id, updates) =>
        set((state) => ({
          liabilities: state.liabilities.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        })),

      getZakatStatus: () => {
        const { hawlInfo, zakatPayments, getCurrentNisab, currentSnapshot } = get();
        if (!hawlInfo || !currentSnapshot) return 'not_due';

        const netWorth = currentSnapshot.netWorth;
        const nisab = getCurrentNisab();
        if (netWorth < nisab) return 'not_due';

        const hawlEnd = new Date(hawlInfo.endDate);
        const now = new Date();
        const daysDiff = Math.ceil((hawlEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Check if paid this hawl cycle
        const lastPayment = zakatPayments[zakatPayments.length - 1];
        if (lastPayment) {
          const paymentDate = new Date(lastPayment.date);
          const hawlStart = new Date(hawlInfo.startDate);
          if (paymentDate >= hawlStart) return 'paid';
        }

        if (daysDiff < 0) return 'overdue';
        if (daysDiff <= 30) return 'due_soon';
        return 'not_due';
      },

      getDaysUntilHawl: () => {
        const { hawlInfo } = get();
        if (!hawlInfo) return 365;
        const hawlEnd = new Date(hawlInfo.endDate);
        const now = new Date();
        return Math.ceil((hawlEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      },

      getCurrentNisab: () => {
        const { nisabType, currentGoldPrice, currentSilverPrice } = get();
        return nisabType === 'gold'
          ? currentGoldPrice * GOLD_NISAB_GRAMS
          : currentSilverPrice * SILVER_NISAB_GRAMS;
      },

      getNetWorth: () => {
        const { currentSnapshot, liabilities } = get();
        if (!currentSnapshot) return 0;
        const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
        return currentSnapshot.totalAssets - totalLiabilities;
      },

      getIslamicDebtRatio: () => {
        const { liabilities } = get();
        const totalDebt = liabilities.reduce((sum, l) => sum + l.amount, 0);
        if (totalDebt === 0) return 100;
        const islamicDebt = liabilities
          .filter((l) => l.isIslamic)
          .reduce((sum, l) => sum + l.amount, 0);
        return Math.round((islamicDebt / totalDebt) * 100);
      },

      getTotalSadaqahThisYear: () => {
        const { sadaqahRecords } = get();
        const yearStart = new Date();
        yearStart.setMonth(0, 1);
        yearStart.setHours(0, 0, 0, 0);
        return sadaqahRecords
          .filter((r) => new Date(r.date) >= yearStart)
          .reduce((sum, r) => sum + r.amount, 0);
      },
    }),
    {
      name: 'barakah-dashboard',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Zakat category translations
export const ZAKAT_CATEGORIES: Record<ZakatCategory, { en: string; ar: string; icon: string }> = {
  fuqara: { en: 'The Poor', ar: 'الفقراء', icon: '🤲' },
  masakin: { en: 'The Needy', ar: 'المساكين', icon: '🏠' },
  amil: { en: 'Zakat Administrators', ar: 'العاملين عليها', icon: '📋' },
  muallaf: { en: 'New Muslims', ar: 'المؤلفة قلوبهم', icon: '🤝' },
  riqab: { en: 'Freeing Captives', ar: 'في الرقاب', icon: '🔓' },
  gharimin: { en: 'Debtors', ar: 'الغارمين', icon: '💳' },
  fisabilillah: { en: "In Allah's Cause", ar: 'في سبيل الله', icon: '🕌' },
  ibnsabil: { en: 'Travelers', ar: 'ابن السبيل', icon: '🧳' },
};

// Goal category translations
export const GOAL_CATEGORIES = {
  deen: { en: 'Religion', ar: 'الدين', icon: '🕌' },
  nafs: { en: 'Self/Life', ar: 'النفس', icon: '❤️' },
  aql: { en: 'Intellect', ar: 'العقل', icon: '🎓' },
  nasl: { en: 'Family', ar: 'النسل', icon: '👨‍👩‍👧‍👦' },
  mal: { en: 'Wealth', ar: 'المال', icon: '💰' },
};
