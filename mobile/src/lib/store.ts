import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Language Store
export type SupportedLanguage = 'en' | 'ar';

interface LanguageState {
  language: SupportedLanguage | null;
  setLanguage: (lang: SupportedLanguage) => void;
  isRTL: boolean;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: null,
      isRTL: false,
      setLanguage: (lang) => set({ language: lang, isRTL: lang === 'ar' }),
    }),
    {
      name: 'barakah-language',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Calendar type for Zakat rate calculation
export type CalendarType = 'islamic' | 'western';

// Country and Currency data
export interface CountryData {
  code: string;
  name: string;
  nameAr: string;
  currency: string;
  currencySymbol: string;
  flag: string;
}

// Settings Store
interface SettingsState {
  country: CountryData | null;
  goldPricePerGram: number;
  calendarType: CalendarType;
  nisabThreshold: number;
  setCountry: (country: CountryData) => void;
  setGoldPrice: (price: number) => void;
  setCalendarType: (type: CalendarType) => void;
  calculateNisab: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      country: null,
      goldPricePerGram: 70, // Default USD price
      calendarType: 'islamic',
      nisabThreshold: 5950, // 85g * $70
      setCountry: (country) => set({ country }),
      setGoldPrice: (price) => {
        set({ goldPricePerGram: price });
        get().calculateNisab();
      },
      setCalendarType: (type) => set({ calendarType: type }),
      calculateNisab: () => {
        const { goldPricePerGram } = get();
        set({ nisabThreshold: goldPricePerGram * 85 });
      },
    }),
    {
      name: 'barakah-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Individual Calculator Store
export interface GoldEntry {
  karat: '24k' | '21k' | '18k';
  weightGrams: number;
  pricePerGram: number;
}

// Sub-entry for any asset field (for multiple items like multiple bonds)
export interface AssetSubEntry {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  convertedAmount: number;
}

// Supported currencies with their symbols
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar' },
  { code: 'OMR', symbol: 'ر.ع', name: 'Omani Rial' },
  { code: 'EGP', symbol: 'ج.م', name: 'Egyptian Pound' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
] as const;

export interface IndividualAssets {
  // Category A - Cash on Hand
  cashOnHand: number;
  cashOnHandEntries: AssetSubEntry[];
  // Category B - Bank Accounts
  savingsAccount: number;
  savingsAccountEntries: AssetSubEntry[];
  checkingAccount: number;
  checkingAccountEntries: AssetSubEntry[];
  certificatesOfDeposit: number;
  certificatesOfDepositEntries: AssetSubEntry[];
  highYieldAccounts: number;
  highYieldAccountsEntries: AssetSubEntry[];
  // Category C - Investments
  bonds: number;
  bondsEntries: AssetSubEntry[];
  sukuk: number;
  sukukEntries: AssetSubEntry[];
  tradingStocks: number;
  tradingStocksEntries: AssetSubEntry[];
  mutualFunds: number;
  mutualFundsEntries: AssetSubEntry[];
  etfs: number;
  etfsEntries: AssetSubEntry[];
  trustFunds: number;
  trustFundsEntries: AssetSubEntry[];
  // Category D - Digital Money
  prepaidCards: number;
  prepaidCardsEntries: AssetSubEntry[];
  digitalWallets: number; // PayPal, Venmo
  digitalWalletsEntries: AssetSubEntry[];
  cryptocurrency: number;
  cryptocurrencyEntries: AssetSubEntry[];
  rewardPoints: number;
  rewardPointsEntries: AssetSubEntry[];
  gamingWallets: number;
  gamingWalletsEntries: AssetSubEntry[];
  // Category E - Precious Metals
  gold: GoldEntry[];
  silver: number;
  silverEntries: AssetSubEntry[];
  goldInvestments: number;
  goldInvestmentsEntries: AssetSubEntry[];
  diamonds: number;
  diamondsEntries: AssetSubEntry[];
  platinum: number;
  platinumEntries: AssetSubEntry[];
  investmentJewelry: number;
  investmentJewelryEntries: AssetSubEntry[];
  // Category F - Real Estate
  investmentProperties: number;
  investmentPropertiesEntries: AssetSubEntry[];
  partialOwnership: number;
  partialOwnershipEntries: AssetSubEntry[];
  constructionProperties: number;
  constructionPropertiesEntries: AssetSubEntry[];
  // Category G - Money Owed
  lifeInsuranceCashValue: number;
  lifeInsuranceCashValueEntries: AssetSubEntry[];
  pensionFunds: number;
  pensionFundsEntries: AssetSubEntry[];
  receivableDebts: number;
  receivableDebtsEntries: AssetSubEntry[];
  // Category H - Commodities
  buildingMaterials: number;
  buildingMaterialsEntries: AssetSubEntry[];
  bulkFood: number;
  bulkFoodEntries: AssetSubEntry[];
  farmingSupplies: number;
  farmingSuppliesEntries: AssetSubEntry[];
  bulkClothing: number;
  bulkClothingEntries: AssetSubEntry[];
  electronicsInventory: number;
  electronicsInventoryEntries: AssetSubEntry[];
  // Category I - Unique Assets
  art: number;
  artEntries: AssetSubEntry[];
  rareStamps: number;
  rareStampsEntries: AssetSubEntry[];
  vintageCars: number;
  vintageCarsEntries: AssetSubEntry[];
  designerBags: number;
  designerBagsEntries: AssetSubEntry[];
  limitedSneakers: number;
  limitedSneakersEntries: AssetSubEntry[];
  carbonCredits: number;
  carbonCreditsEntries: AssetSubEntry[];
  intellectualProperty: number;
  intellectualPropertyEntries: AssetSubEntry[];
  horses: number;
  horsesEntries: AssetSubEntry[];
  livestock: number;
  livestockEntries: AssetSubEntry[];
  aircraft: number;
  aircraftEntries: AssetSubEntry[];
  boats: number;
  boatsEntries: AssetSubEntry[];
  farmland: number;
  farmlandEntries: AssetSubEntry[];
  crops: number;
  cropsEntries: AssetSubEntry[];
  // Category J - Extracted Resources (20% rate)
  minerals: number;
  mineralsEntries: AssetSubEntry[];
  oil: number;
  oilEntries: AssetSubEntry[];
  gas: number;
  gasEntries: AssetSubEntry[];
}

export interface IndividualDeductions {
  zakatAlreadyPaid: number;
  urgentDebts: number;
  goodReceivables: number;
}

interface IndividualCalculatorState {
  assets: IndividualAssets;
  deductions: IndividualDeductions;
  currentStep: number;
  baseCurrency: string;
  setAssetValue: <K extends keyof IndividualAssets>(key: K, value: IndividualAssets[K]) => void;
  setDeductionValue: <K extends keyof IndividualDeductions>(key: K, value: number) => void;
  addGoldEntry: (entry: GoldEntry) => void;
  removeGoldEntry: (index: number) => void;
  updateGoldEntry: (index: number, entry: GoldEntry) => void;
  addSubEntry: (fieldKey: string, entry: Omit<AssetSubEntry, 'id'>) => void;
  updateSubEntry: (fieldKey: string, entryId: string, updates: Partial<AssetSubEntry>) => void;
  removeSubEntry: (fieldKey: string, entryId: string) => void;
  setBaseCurrency: (currency: string) => void;
  setCurrentStep: (step: number) => void;
  resetCalculator: () => void;
  getTotalAssets: () => number;
  getTotalDeductions: () => number;
  getExtractedResourcesTotal: () => number;
  getFieldTotal: (fieldKey: string) => number;
  getZakatDue: (nisab: number, calendarType: CalendarType) => { total: number; regular: number; extracted: number };
}

const initialAssets: IndividualAssets = {
  cashOnHand: 0,
  cashOnHandEntries: [],
  savingsAccount: 0,
  savingsAccountEntries: [],
  checkingAccount: 0,
  checkingAccountEntries: [],
  certificatesOfDeposit: 0,
  certificatesOfDepositEntries: [],
  highYieldAccounts: 0,
  highYieldAccountsEntries: [],
  bonds: 0,
  bondsEntries: [],
  sukuk: 0,
  sukukEntries: [],
  tradingStocks: 0,
  tradingStocksEntries: [],
  mutualFunds: 0,
  mutualFundsEntries: [],
  etfs: 0,
  etfsEntries: [],
  trustFunds: 0,
  trustFundsEntries: [],
  prepaidCards: 0,
  prepaidCardsEntries: [],
  digitalWallets: 0,
  digitalWalletsEntries: [],
  cryptocurrency: 0,
  cryptocurrencyEntries: [],
  rewardPoints: 0,
  rewardPointsEntries: [],
  gamingWallets: 0,
  gamingWalletsEntries: [],
  gold: [],
  silver: 0,
  silverEntries: [],
  goldInvestments: 0,
  goldInvestmentsEntries: [],
  diamonds: 0,
  diamondsEntries: [],
  platinum: 0,
  platinumEntries: [],
  investmentJewelry: 0,
  investmentJewelryEntries: [],
  investmentProperties: 0,
  investmentPropertiesEntries: [],
  partialOwnership: 0,
  partialOwnershipEntries: [],
  constructionProperties: 0,
  constructionPropertiesEntries: [],
  lifeInsuranceCashValue: 0,
  lifeInsuranceCashValueEntries: [],
  pensionFunds: 0,
  pensionFundsEntries: [],
  receivableDebts: 0,
  receivableDebtsEntries: [],
  buildingMaterials: 0,
  buildingMaterialsEntries: [],
  bulkFood: 0,
  bulkFoodEntries: [],
  farmingSupplies: 0,
  farmingSuppliesEntries: [],
  bulkClothing: 0,
  bulkClothingEntries: [],
  electronicsInventory: 0,
  electronicsInventoryEntries: [],
  art: 0,
  artEntries: [],
  rareStamps: 0,
  rareStampsEntries: [],
  vintageCars: 0,
  vintageCarsEntries: [],
  designerBags: 0,
  designerBagsEntries: [],
  limitedSneakers: 0,
  limitedSneakersEntries: [],
  carbonCredits: 0,
  carbonCreditsEntries: [],
  intellectualProperty: 0,
  intellectualPropertyEntries: [],
  horses: 0,
  horsesEntries: [],
  livestock: 0,
  livestockEntries: [],
  aircraft: 0,
  aircraftEntries: [],
  boats: 0,
  boatsEntries: [],
  farmland: 0,
  farmlandEntries: [],
  crops: 0,
  cropsEntries: [],
  minerals: 0,
  mineralsEntries: [],
  oil: 0,
  oilEntries: [],
  gas: 0,
  gasEntries: [],
};

const initialDeductions: IndividualDeductions = {
  zakatAlreadyPaid: 0,
  urgentDebts: 0,
  goodReceivables: 0,
};

export const useIndividualCalculatorStore = create<IndividualCalculatorState>()(
  persist(
    (set, get) => ({
      assets: initialAssets,
      deductions: initialDeductions,
      currentStep: 0,
      baseCurrency: 'USD',
      setAssetValue: (key, value) =>
        set((state) => ({
          assets: { ...state.assets, [key]: value },
        })),
      setDeductionValue: (key, value) =>
        set((state) => ({
          deductions: { ...state.deductions, [key]: value },
        })),
      addGoldEntry: (entry) =>
        set((state) => ({
          assets: { ...state.assets, gold: [...state.assets.gold, entry] },
        })),
      removeGoldEntry: (index) =>
        set((state) => ({
          assets: {
            ...state.assets,
            gold: state.assets.gold.filter((_, i) => i !== index),
          },
        })),
      updateGoldEntry: (index, entry) =>
        set((state) => ({
          assets: {
            ...state.assets,
            gold: state.assets.gold.map((g, i) => (i === index ? entry : g)),
          },
        })),
      addSubEntry: (fieldKey, entry) =>
        set((state) => {
          const entriesKey = `${fieldKey}Entries` as keyof IndividualAssets;
          const currentEntries = (state.assets[entriesKey] as AssetSubEntry[]) || [];
          const newEntry: AssetSubEntry = {
            ...entry,
            id: `${fieldKey}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };
          // Also update the total value for that field
          const valueKey = fieldKey as keyof IndividualAssets;
          const currentValue = (state.assets[valueKey] as number) || 0;
          return {
            assets: {
              ...state.assets,
              [entriesKey]: [...currentEntries, newEntry],
              [valueKey]: currentValue + newEntry.convertedAmount,
            },
          };
        }),
      updateSubEntry: (fieldKey, entryId, updates) =>
        set((state) => {
          const entriesKey = `${fieldKey}Entries` as keyof IndividualAssets;
          const currentEntries = (state.assets[entriesKey] as AssetSubEntry[]) || [];
          const oldEntry = currentEntries.find((e) => e.id === entryId);
          const updatedEntries = currentEntries.map((e) =>
            e.id === entryId ? { ...e, ...updates } : e
          );
          // Recalculate total
          const valueKey = fieldKey as keyof IndividualAssets;
          const newTotal = updatedEntries.reduce((sum, e) => sum + e.convertedAmount, 0);
          return {
            assets: {
              ...state.assets,
              [entriesKey]: updatedEntries,
              [valueKey]: newTotal,
            },
          };
        }),
      removeSubEntry: (fieldKey, entryId) =>
        set((state) => {
          const entriesKey = `${fieldKey}Entries` as keyof IndividualAssets;
          const currentEntries = (state.assets[entriesKey] as AssetSubEntry[]) || [];
          const entryToRemove = currentEntries.find((e) => e.id === entryId);
          const updatedEntries = currentEntries.filter((e) => e.id !== entryId);
          // Recalculate total
          const valueKey = fieldKey as keyof IndividualAssets;
          const newTotal = updatedEntries.reduce((sum, e) => sum + e.convertedAmount, 0);
          return {
            assets: {
              ...state.assets,
              [entriesKey]: updatedEntries,
              [valueKey]: newTotal,
            },
          };
        }),
      setBaseCurrency: (currency) => set({ baseCurrency: currency }),
      setCurrentStep: (step) => set({ currentStep: step }),
      resetCalculator: () =>
        set({
          assets: initialAssets,
          deductions: initialDeductions,
          currentStep: 0,
        }),
      getTotalAssets: () => {
        const { assets } = get();
        let total = 0;

        // Add all numeric values except gold array and entries arrays
        Object.entries(assets).forEach(([key, value]) => {
          if (key !== 'gold' && !key.endsWith('Entries') && typeof value === 'number') {
            total += value;
          }
        });

        // Calculate gold value
        assets.gold.forEach((entry) => {
          const purityMultiplier = entry.karat === '24k' ? 1 : entry.karat === '21k' ? 0.875 : 0.75;
          total += entry.weightGrams * entry.pricePerGram * purityMultiplier;
        });

        return total;
      },
      getTotalDeductions: () => {
        const { deductions } = get();
        return deductions.zakatAlreadyPaid + deductions.urgentDebts + deductions.goodReceivables;
      },
      getExtractedResourcesTotal: () => {
        const { assets } = get();
        return assets.minerals + assets.oil + assets.gas;
      },
      getFieldTotal: (fieldKey) => {
        const { assets } = get();
        const entriesKey = `${fieldKey}Entries` as keyof IndividualAssets;
        const entries = (assets[entriesKey] as AssetSubEntry[]) || [];
        return entries.reduce((sum, e) => sum + e.convertedAmount, 0);
      },
      getZakatDue: (nisab, calendarType) => {
        const { getTotalAssets, getTotalDeductions, getExtractedResourcesTotal } = get();
        const totalAssets = getTotalAssets();
        const totalDeductions = getTotalDeductions();
        const extractedResources = getExtractedResourcesTotal();

        const netWealth = totalAssets - totalDeductions - extractedResources;
        const rate = calendarType === 'islamic' ? 0.025 : 0.02577;

        let regularZakat = 0;
        let extractedZakat = 0;

        if (netWealth >= nisab) {
          regularZakat = netWealth * rate;
        }

        // Extracted resources always have 20% rate
        extractedZakat = extractedResources * 0.2;

        return {
          total: regularZakat + extractedZakat,
          regular: regularZakat,
          extracted: extractedZakat,
        };
      },
    }),
    {
      name: 'barakah-individual-calculator',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Business Calculator Store
export type LineItemClassification = 'zakatable' | 'deductible' | 'exempt' | 'not_deductible' | 'needs_clarification';

export interface BusinessLineItem {
  id: string;
  name: string;
  amount: number;
  classification: LineItemClassification;
  clarificationQuestion?: string;
  clarificationAnswer?: string;
  marketValue?: number;
  islamicRuling?: string;
}

export interface BusinessAssets {
  companyName: string;
  industryType: string;
  cash: number;
  receivables: number;
  inventory: number;
  investments: number;
  lineItems: BusinessLineItem[];
}

interface BusinessCalculatorState {
  assets: BusinessAssets;
  currentStep: number;
  setCompanyName: (name: string) => void;
  setIndustryType: (type: string) => void;
  setAssetValue: (key: 'cash' | 'receivables' | 'inventory' | 'investments', value: number) => void;
  addLineItem: (item: BusinessLineItem) => void;
  updateLineItem: (id: string, updates: Partial<BusinessLineItem>) => void;
  removeLineItem: (id: string) => void;
  setLineItems: (items: BusinessLineItem[]) => void;
  setCurrentStep: (step: number) => void;
  resetCalculator: () => void;
  getTotalZakatable: () => number;
  getTotalDeductible: () => number;
  getTotalExempt: () => number;
  getPendingClarifications: () => BusinessLineItem[];
  getZakatDue: (nisab: number, calendarType: CalendarType) => number;
}

const initialBusinessAssets: BusinessAssets = {
  companyName: '',
  industryType: '',
  cash: 0,
  receivables: 0,
  inventory: 0,
  investments: 0,
  lineItems: [],
};

export const useBusinessCalculatorStore = create<BusinessCalculatorState>()(
  persist(
    (set, get) => ({
      assets: initialBusinessAssets,
      currentStep: 0,
      setCompanyName: (name) =>
        set((state) => ({
          assets: { ...state.assets, companyName: name },
        })),
      setIndustryType: (type) =>
        set((state) => ({
          assets: { ...state.assets, industryType: type },
        })),
      setAssetValue: (key, value) =>
        set((state) => ({
          assets: { ...state.assets, [key]: value },
        })),
      addLineItem: (item) =>
        set((state) => ({
          assets: {
            ...state.assets,
            lineItems: [...state.assets.lineItems, item],
          },
        })),
      updateLineItem: (id, updates) =>
        set((state) => ({
          assets: {
            ...state.assets,
            lineItems: state.assets.lineItems.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          },
        })),
      removeLineItem: (id) =>
        set((state) => ({
          assets: {
            ...state.assets,
            lineItems: state.assets.lineItems.filter((item) => item.id !== id),
          },
        })),
      setLineItems: (items) =>
        set((state) => ({
          assets: { ...state.assets, lineItems: items },
        })),
      setCurrentStep: (step) => set({ currentStep: step }),
      resetCalculator: () =>
        set({
          assets: initialBusinessAssets,
          currentStep: 0,
        }),
      getTotalZakatable: () => {
        const { assets } = get();
        const lineItemsTotal = assets.lineItems
          .filter((item) => item.classification === 'zakatable')
          .reduce((sum, item) => sum + (item.marketValue ?? item.amount), 0);
        return assets.cash + assets.receivables + assets.inventory + assets.investments + lineItemsTotal;
      },
      getTotalDeductible: () => {
        const { assets } = get();
        return assets.lineItems
          .filter((item) => item.classification === 'deductible')
          .reduce((sum, item) => sum + item.amount, 0);
      },
      getTotalExempt: () => {
        const { assets } = get();
        return assets.lineItems
          .filter((item) => item.classification === 'exempt')
          .reduce((sum, item) => sum + item.amount, 0);
      },
      getPendingClarifications: () => {
        const { assets } = get();
        return assets.lineItems.filter((item) => item.classification === 'needs_clarification');
      },
      getZakatDue: (nisab, calendarType) => {
        const { getTotalZakatable, getTotalDeductible } = get();
        const netWealth = getTotalZakatable() - getTotalDeductible();
        const rate = calendarType === 'islamic' ? 0.025 : 0.02577;

        if (netWealth >= nisab) {
          return netWealth * rate;
        }
        return 0;
      },
    }),
    {
      name: 'barakah-business-calculator',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Zakat History Store
export interface ZakatHistoryEntry {
  id: string;
  date: string;
  hijriDate?: string;
  year: number;
  hijriYear?: string;
  label: string;
  type: 'individual' | 'business';
  totalAssets: number;
  totalDeductions: number;
  netWealth: number;
  nisabThreshold: number;
  zakatDue: number;
  currency: string;
  currencySymbol: string;
  calendarType: CalendarType;
  meetsNisab: boolean;
}

interface ZakatHistoryState {
  entries: ZakatHistoryEntry[];
  addEntry: (entry: Omit<ZakatHistoryEntry, 'id'>) => void;
  removeEntry: (id: string) => void;
  updateEntry: (id: string, updates: Partial<ZakatHistoryEntry>) => void;
  clearHistory: () => void;
  getEntriesByYear: (year: number) => ZakatHistoryEntry[];
}

// Helper to get approximate Hijri year
const getHijriYear = (): string => {
  const now = new Date();
  const gregorianYear = now.getFullYear();
  // Approximate Hijri year calculation (not exact, but close)
  const hijriYear = Math.floor((gregorianYear - 622) * (33 / 32));
  return `${hijriYear} AH`;
};

// Helper to get Hijri date string (approximate)
const getHijriDate = (): string => {
  const hijriYear = getHijriYear();
  const months = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani',
                  'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah'];
  const now = new Date();
  const monthIndex = now.getMonth();
  return `${months[monthIndex]} ${hijriYear}`;
};

export const useZakatHistoryStore = create<ZakatHistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) => {
        const newEntry: ZakatHistoryEntry = {
          ...entry,
          id: `zakat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        set((state) => ({
          entries: [newEntry, ...state.entries],
        }));
      },
      removeEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
      },
      updateEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        }));
      },
      clearHistory: () => {
        set({ entries: [] });
      },
      getEntriesByYear: (year) => {
        const { entries } = get();
        return entries.filter((e) => e.year === year);
      },
    }),
    {
      name: 'barakah-zakat-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Export helpers
export { getHijriYear, getHijriDate };
