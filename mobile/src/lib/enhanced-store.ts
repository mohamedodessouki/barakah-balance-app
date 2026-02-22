import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enhanced Asset Entry with description, currency, and conversion
export interface AssetEntry {
  id: string;
  description: string;
  amount: number;
  currency: string;
  convertedAmount: number; // Amount in main currency
  exchangeRate: number;
}

// Category with multiple entries
export interface AssetCategory {
  categoryId: string;
  entries: AssetEntry[];
}

// Store for enhanced individual calculator
interface EnhancedIndividualState {
  mainCurrency: string;
  mainCurrencySymbol: string;
  assetCategories: Record<string, AssetEntry[]>;

  // Actions
  setMainCurrency: (currency: string, symbol: string) => void;
  addAssetEntry: (categoryId: string, entry: Omit<AssetEntry, 'id' | 'convertedAmount'>) => void;
  updateAssetEntry: (categoryId: string, entryId: string, updates: Partial<AssetEntry>) => void;
  removeAssetEntry: (categoryId: string, entryId: string) => void;
  getCategoryTotal: (categoryId: string) => number;
  getAllAssetsTotal: () => number;
  resetAll: () => void;
}

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Exchange rates (simplified - in production use real API)
const exchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  SAR: 0.27,
  AED: 0.27,
  KWD: 3.26,
  QAR: 0.27,
  BHD: 2.65,
  OMR: 2.60,
  JOD: 1.41,
  EGP: 0.032,
  MAD: 0.10,
  TRY: 0.031,
  PKR: 0.0036,
  INR: 0.012,
  MYR: 0.21,
  IDR: 0.000063,
  SGD: 0.74,
  CAD: 0.74,
  AUD: 0.65,
};

export const getExchangeRate = (fromCurrency: string, toCurrency: string): number => {
  const fromRate = exchangeRates[fromCurrency] || 1;
  const toRate = exchangeRates[toCurrency] || 1;
  return fromRate / toRate;
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  const rate = getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
};

export const useEnhancedIndividualStore = create<EnhancedIndividualState>()(
  persist(
    (set, get) => ({
      mainCurrency: 'USD',
      mainCurrencySymbol: '$',
      assetCategories: {},

      setMainCurrency: (currency, symbol) => {
        set({ mainCurrency: currency, mainCurrencySymbol: symbol });
        // Recalculate all converted amounts
        const { assetCategories, mainCurrency } = get();
        const updated: Record<string, AssetEntry[]> = {};
        Object.keys(assetCategories).forEach((categoryId) => {
          updated[categoryId] = assetCategories[categoryId].map((entry) => ({
            ...entry,
            convertedAmount: convertCurrency(entry.amount, entry.currency, currency),
          }));
        });
        set({ assetCategories: updated });
      },

      addAssetEntry: (categoryId, entry) => {
        const { assetCategories, mainCurrency } = get();
        const newEntry: AssetEntry = {
          ...entry,
          id: generateId(),
          convertedAmount: convertCurrency(entry.amount, entry.currency, mainCurrency),
        };
        const categoryEntries = assetCategories[categoryId] || [];
        set({
          assetCategories: {
            ...assetCategories,
            [categoryId]: [...categoryEntries, newEntry],
          },
        });
      },

      updateAssetEntry: (categoryId, entryId, updates) => {
        const { assetCategories, mainCurrency } = get();
        const categoryEntries = assetCategories[categoryId] || [];
        set({
          assetCategories: {
            ...assetCategories,
            [categoryId]: categoryEntries.map((entry) => {
              if (entry.id !== entryId) return entry;
              const updated = { ...entry, ...updates };
              // Recalculate converted amount if amount or currency changed
              if (updates.amount !== undefined || updates.currency !== undefined) {
                updated.convertedAmount = convertCurrency(
                  updated.amount,
                  updated.currency,
                  mainCurrency
                );
              }
              return updated;
            }),
          },
        });
      },

      removeAssetEntry: (categoryId, entryId) => {
        const { assetCategories } = get();
        const categoryEntries = assetCategories[categoryId] || [];
        set({
          assetCategories: {
            ...assetCategories,
            [categoryId]: categoryEntries.filter((e) => e.id !== entryId),
          },
        });
      },

      getCategoryTotal: (categoryId) => {
        const { assetCategories } = get();
        const entries = assetCategories[categoryId] || [];
        return entries.reduce((sum, entry) => sum + entry.convertedAmount, 0);
      },

      getAllAssetsTotal: () => {
        const { assetCategories } = get();
        let total = 0;
        Object.values(assetCategories).forEach((entries) => {
          entries.forEach((entry) => {
            total += entry.convertedAmount;
          });
        });
        return total;
      },

      resetAll: () => {
        set({ assetCategories: {} });
      },
    }),
    {
      name: 'barakah-enhanced-individual',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Business Zakat Categories Store - Updated Structure
export type BusinessCategory =
  | 'currentAssets'
  | 'fixedAssets'
  | 'currentLiabilities'
  | 'longTermLiabilities';

export type AssetSubCategory =
  | 'cash'
  | 'accountsReceivable'
  | 'investments'
  | 'inventory'
  | 'land'
  | 'equipment'
  | 'otherAssets';

export interface BusinessCategoryEntry {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  convertedAmount: number;
  isIslamicFinancing?: boolean; // For liabilities - only islamic financing is deductible
  subCategory?: AssetSubCategory;
  needsClarification?: boolean;
  termType?: 'short' | 'long'; // User-selected term classification
  clarificationQuestion?: string;
  clarificationAnswer?: string;
  finalRuling?: string;
}

interface BusinessCategoriesState {
  companyName: string;
  industryType: string;
  mainCurrency: string;
  mainCurrencySymbol: string;
  categories: Record<BusinessCategory, BusinessCategoryEntry[]>;

  // Actions
  setCompanyInfo: (name: string, industry: string) => void;
  setMainCurrency: (currency: string, symbol: string) => void;
  addEntry: (category: BusinessCategory, entry: Omit<BusinessCategoryEntry, 'id' | 'convertedAmount'>) => void;
  updateEntry: (category: BusinessCategory, entryId: string, updates: Partial<BusinessCategoryEntry>) => void;
  removeEntry: (category: BusinessCategory, entryId: string) => void;
  getCategoryTotal: (category: BusinessCategory) => number;
  getDeductibleLiabilities: () => number; // Only Islamic financing
  getNonDeductibleLiabilities: () => number; // Conventional loans
  getNetZakatableAmount: () => number;
  resetAll: () => void;
}

export const useBusinessCategoriesStore = create<BusinessCategoriesState>()(
  persist(
    (set, get) => ({
      companyName: '',
      industryType: '',
      mainCurrency: 'USD',
      mainCurrencySymbol: '$',
      categories: {
        currentAssets: [],
        fixedAssets: [],
        currentLiabilities: [],
        longTermLiabilities: [],
      },

      setCompanyInfo: (name, industry) => set({ companyName: name, industryType: industry }),

      setMainCurrency: (currency, symbol) => {
        set({ mainCurrency: currency, mainCurrencySymbol: symbol });
        // Recalculate all converted amounts
        const { categories } = get();
        const updated: Record<BusinessCategory, BusinessCategoryEntry[]> = {
          currentAssets: [],
          fixedAssets: [],
          currentLiabilities: [],
          longTermLiabilities: [],
        };
        (Object.keys(categories) as BusinessCategory[]).forEach((cat) => {
          updated[cat] = categories[cat].map((entry) => ({
            ...entry,
            convertedAmount: convertCurrency(entry.amount, entry.currency, currency),
          }));
        });
        set({ categories: updated });
      },

      addEntry: (category, entry) => {
        const { categories, mainCurrency } = get();
        const newEntry: BusinessCategoryEntry = {
          ...entry,
          id: generateId(),
          convertedAmount: convertCurrency(entry.amount, entry.currency, mainCurrency),
        };
        set({
          categories: {
            ...categories,
            [category]: [...categories[category], newEntry],
          },
        });
      },

      updateEntry: (category, entryId, updates) => {
        const { categories, mainCurrency } = get();
        set({
          categories: {
            ...categories,
            [category]: categories[category].map((entry) => {
              if (entry.id !== entryId) return entry;
              const updated = { ...entry, ...updates };
              if (updates.amount !== undefined || updates.currency !== undefined) {
                updated.convertedAmount = convertCurrency(
                  updated.amount,
                  updated.currency,
                  mainCurrency
                );
              }
              return updated;
            }),
          },
        });
      },

      removeEntry: (category, entryId) => {
        const { categories } = get();
        set({
          categories: {
            ...categories,
            [category]: categories[category].filter((e) => e.id !== entryId),
          },
        });
      },

      getCategoryTotal: (category) => {
        const { categories } = get();
        return categories[category].reduce((sum, entry) => sum + entry.convertedAmount, 0);
      },

      // Only Islamic financing is deductible from zakat
      getDeductibleLiabilities: () => {
        const { categories } = get();
        return categories.currentLiabilities
          .filter((entry) => entry.isIslamicFinancing === true)
          .reduce((sum, entry) => sum + entry.convertedAmount, 0);
      },

      // Conventional loans are NOT deductible
      getNonDeductibleLiabilities: () => {
        const { categories } = get();
        return categories.currentLiabilities
          .filter((entry) => entry.isIslamicFinancing !== true)
          .reduce((sum, entry) => sum + entry.convertedAmount, 0);
      },

      getNetZakatableAmount: () => {
        const { getCategoryTotal, getDeductibleLiabilities } = get();
        const currentAssets = getCategoryTotal('currentAssets');
        const fixedAssets = getCategoryTotal('fixedAssets');
        const deductibleLiabilities = getDeductibleLiabilities();

        // Net = Current Assets (zakatable) - Islamic Financing Liabilities
        // Fixed Assets are generally not zakatable unless held for sale
        return currentAssets - deductibleLiabilities;
      },

      resetAll: () => {
        set({
          companyName: '',
          industryType: '',
          categories: {
            currentAssets: [],
            fixedAssets: [],
            currentLiabilities: [],
            longTermLiabilities: [],
          },
        });
      },
    }),
    {
      name: 'barakah-business-categories',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Available currencies for selection
export const availableCurrencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal' },
  { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar' },
  { code: 'OMR', symbol: 'ر.ع', name: 'Omani Rial' },
  { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar' },
  { code: 'EGP', symbol: 'ج.م', name: 'Egyptian Pound' },
  { code: 'MAD', symbol: 'د.م', name: 'Moroccan Dirham' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];
