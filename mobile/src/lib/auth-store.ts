import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// User profile types
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  authMethod: 'google' | 'email';
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
}

// Zakat Portfolio types
export type PortfolioType = 'personal' | 'business';

export interface ZakatPortfolio {
  id: string;
  userId: string;
  name: string;
  type: PortfolioType;
  createdAt: string;
  updatedAt: string;
  // For business portfolios
  companyName?: string;
  industryType?: string;
  // Calculation history
  calculations: ZakatCalculation[];
}

export interface ZakatCalculation {
  id: string;
  portfolioId: string;
  date: string;
  totalAssets: number;
  totalDeductions: number;
  netWealth: number;
  zakatDue: number;
  calendarType: 'islamic' | 'western';
  currencySymbol: string;
  nisabThreshold: number;
  meetsNisab: boolean;
  // Detailed data snapshot
  assetsSnapshot: Record<string, unknown>;
  deductionsSnapshot?: Record<string, unknown>;
  lineItemsSnapshot?: LineItemSnapshot[];
}

export interface LineItemSnapshot {
  id: string;
  name: string;
  amount: number;
  classification: string;
  clarificationQuestion?: string;
  clarificationAnswer?: string;
  finalRuling?: string;
  includedInZakat: boolean;
  finalAmount: number;
}

// Auth store state
interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  portfolios: ZakatPortfolio[];
  activePortfolioId: string | null;

  // Auth actions
  signInWithGoogle: (email: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; needsVerification?: boolean }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ success: boolean; verificationSent?: boolean }>;
  verifyEmail: (code: string) => Promise<boolean>;
  signOut: () => void;

  // Portfolio actions
  createPortfolio: (name: string, type: PortfolioType, companyName?: string, industryType?: string) => string;
  updatePortfolio: (id: string, updates: Partial<ZakatPortfolio>) => void;
  deletePortfolio: (id: string) => void;
  setActivePortfolio: (id: string | null) => void;
  getActivePortfolio: () => ZakatPortfolio | null;

  // Calculation history actions
  saveCalculation: (portfolioId: string, calculation: Omit<ZakatCalculation, 'id' | 'portfolioId' | 'date'>) => void;
  getPortfolioHistory: (portfolioId: string) => ZakatCalculation[];
  deleteCalculation: (portfolioId: string, calculationId: string) => void;
}

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Simulated email/password storage (in production, use proper backend)
const emailPasswords: Record<string, { password: string; verified: boolean; verificationCode?: string }> = {};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      portfolios: [],
      activePortfolioId: null,

      // Auth actions
      signInWithGoogle: async (email, name) => {
        set({ isLoading: true });
        // Simulate Google auth delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const user: UserProfile = {
          id: generateId(),
          email,
          displayName: name,
          authMethod: 'google',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        set({ user, isAuthenticated: true, isLoading: false });

        // Create default personal portfolio if none exists
        const { portfolios, createPortfolio } = get();
        if (portfolios.length === 0) {
          createPortfolio('My Personal Zakat', 'personal');
        }
      },

      signInWithEmail: async (email, password) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));

        const stored = emailPasswords[email];
        if (!stored || stored.password !== password) {
          set({ isLoading: false });
          return { success: false };
        }

        if (!stored.verified) {
          set({ isLoading: false });
          return { success: false, needsVerification: true };
        }

        const user: UserProfile = {
          id: generateId(),
          email,
          displayName: email.split('@')[0],
          authMethod: 'email',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        set({ user, isAuthenticated: true, isLoading: false });

        // Create default personal portfolio if none exists
        const { portfolios, createPortfolio } = get();
        if (portfolios.length === 0) {
          createPortfolio('My Personal Zakat', 'personal');
        }

        return { success: true };
      },

      signUpWithEmail: async (email, password, name) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));

        if (emailPasswords[email]) {
          set({ isLoading: false });
          return { success: false };
        }

        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        emailPasswords[email] = {
          password,
          verified: false,
          verificationCode,
        };

        // In production, send actual email here
        console.log(`Verification code for ${email}: ${verificationCode}`);

        set({ isLoading: false });
        return { success: true, verificationSent: true };
      },

      verifyEmail: async (code) => {
        // Find user with matching code
        const email = Object.keys(emailPasswords).find(
          e => emailPasswords[e].verificationCode === code
        );

        if (!email) return false;

        emailPasswords[email].verified = true;
        delete emailPasswords[email].verificationCode;

        return true;
      },

      signOut: () => {
        set({
          user: null,
          isAuthenticated: false,
          activePortfolioId: null,
        });
      },

      // Portfolio actions
      createPortfolio: (name, type, companyName, industryType) => {
        const { user, portfolios } = get();
        if (!user) return '';

        const newPortfolio: ZakatPortfolio = {
          id: generateId(),
          userId: user.id,
          name,
          type,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          companyName,
          industryType,
          calculations: [],
        };

        set({ portfolios: [...portfolios, newPortfolio] });

        // Auto-set as active if first portfolio
        if (portfolios.length === 0) {
          set({ activePortfolioId: newPortfolio.id });
        }

        return newPortfolio.id;
      },

      updatePortfolio: (id, updates) => {
        set(state => ({
          portfolios: state.portfolios.map(p =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deletePortfolio: (id) => {
        const { activePortfolioId, portfolios } = get();
        set({
          portfolios: portfolios.filter(p => p.id !== id),
          activePortfolioId: activePortfolioId === id ? null : activePortfolioId,
        });
      },

      setActivePortfolio: (id) => {
        set({ activePortfolioId: id });
      },

      getActivePortfolio: () => {
        const { portfolios, activePortfolioId } = get();
        return portfolios.find(p => p.id === activePortfolioId) ?? null;
      },

      // Calculation history actions
      saveCalculation: (portfolioId, calculationData) => {
        const newCalculation: ZakatCalculation = {
          ...calculationData,
          id: generateId(),
          portfolioId,
          date: new Date().toISOString(),
        };

        set(state => ({
          portfolios: state.portfolios.map(p =>
            p.id === portfolioId
              ? {
                  ...p,
                  calculations: [newCalculation, ...p.calculations],
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }));
      },

      getPortfolioHistory: (portfolioId) => {
        const { portfolios } = get();
        const portfolio = portfolios.find(p => p.id === portfolioId);
        return portfolio?.calculations ?? [];
      },

      deleteCalculation: (portfolioId, calculationId) => {
        set(state => ({
          portfolios: state.portfolios.map(p =>
            p.id === portfolioId
              ? {
                  ...p,
                  calculations: p.calculations.filter(c => c.id !== calculationId),
                }
              : p
          ),
        }));
      },
    }),
    {
      name: 'barakah-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        portfolios: state.portfolios,
        activePortfolioId: state.activePortfolioId,
      }),
    }
  )
);
