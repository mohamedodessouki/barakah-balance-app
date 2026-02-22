import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  SlideInRight,
  Layout,
} from 'react-native-reanimated';
import {
  ArrowLeft,
  RefreshCw,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  TrendingUp,
  TrendingDown,
  Briefcase,
  BarChart3,
  CheckCircle,
} from 'lucide-react-native';
import { useLanguageStore, useSettingsStore } from '@/lib/store';
import { usePortfolioStore, StockHolding } from '@/lib/portfolio-store';

const BACKEND_URL =
  process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || 'http://localhost:3000';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Type options for the add holding form
const HOLDING_TYPES: { value: StockHolding['type']; label: string; labelAr: string }[] = [
  { value: 'stock', label: 'Stock', labelAr: 'سهم' },
  { value: 'etf', label: 'ETF', labelAr: 'صندوق مؤشر' },
  { value: 'sukuk', label: 'Sukuk', labelAr: 'صكوك' },
  { value: 'bond', label: 'Bond', labelAr: 'سند' },
  { value: 'mutual_fund', label: 'Mutual Fund', labelAr: 'صندوق استثمار' },
];

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

interface ShariahResult {
  symbol: string;
  isCompliant: boolean;
  score: number;
  concerns: string[];
  details: string;
}

// Shariah compliance badge
function ShariahBadge({ status }: { status: boolean | null }) {
  if (status === true) {
    return (
      <View className="flex-row items-center bg-emerald-500/20 px-2 py-0.5 rounded-full">
        <ShieldCheck size={12} color="#10b981" />
        <Text className="text-emerald-400 text-xs ml-1">Halal</Text>
      </View>
    );
  }
  if (status === false) {
    return (
      <View className="flex-row items-center bg-red-500/20 px-2 py-0.5 rounded-full">
        <ShieldAlert size={12} color="#ef4444" />
        <Text className="text-red-400 text-xs ml-1">Non-Compliant</Text>
      </View>
    );
  }
  return (
    <View className="flex-row items-center bg-slate-500/20 px-2 py-0.5 rounded-full">
      <ShieldQuestion size={12} color="#94a3b8" />
      <Text className="text-slate-400 text-xs ml-1">Unscreened</Text>
    </View>
  );
}

// Individual holding card
function HoldingCard({
  holding,
  currencySymbol,
  isRTL,
  language,
  onRemove,
  onShariahCheck,
  isCheckingCompliance,
}: {
  holding: StockHolding;
  currencySymbol: string;
  isRTL: boolean;
  language: string;
  onRemove: (id: string) => void;
  onShariahCheck: (holding: StockHolding) => void;
  isCheckingCompliance: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const totalValue = holding.shares * holding.currentPrice;
  const totalCost = holding.shares * holding.avgCostPerShare;
  const gainLoss = totalValue - totalCost;
  const gainLossPercent = totalCost > 0 ? ((gainLoss / totalCost) * 100) : 0;
  const isPositive = gainLoss >= 0;

  const dailyChange = holding.currentPrice - holding.previousClose;
  const dailyChangePercent =
    holding.previousClose > 0
      ? ((dailyChange / holding.previousClose) * 100)
      : 0;
  const isDailyPositive = dailyChange >= 0;

  return (
    <Animated.View entering={FadeInDown.springify()} layout={Layout.springify()}>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="bg-slate-900/60 rounded-2xl mb-3 overflow-hidden border border-slate-800/50"
      >
        {/* Main row */}
        <View className="p-4">
          <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <View className={`flex-row items-center flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <View className="w-10 h-10 rounded-xl bg-emerald-500/20 items-center justify-center">
                <Text className="text-emerald-400 font-bold text-xs">
                  {holding.symbol.substring(0, 3)}
                </Text>
              </View>
              <View className={`flex-1 ${isRTL ? 'mr-3' : 'ml-3'}`}>
                <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Text className="text-white font-semibold text-base">{holding.symbol}</Text>
                  <View className={`${isRTL ? 'mr-2' : 'ml-2'}`}>
                    <ShariahBadge status={holding.isShariahCompliant} />
                  </View>
                </View>
                <Text className="text-slate-400 text-xs" numberOfLines={1}>
                  {holding.name}
                </Text>
                <Text className="text-slate-500 text-xs">
                  {holding.shares} {language === 'ar' ? 'سهم' : 'shares'} @ {currencySymbol}
                  {holding.avgCostPerShare.toFixed(2)}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-white font-semibold">
                {currencySymbol}
                {totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </Text>
              <View className="flex-row items-center">
                {isDailyPositive ? (
                  <TrendingUp size={12} color="#10b981" />
                ) : (
                  <TrendingDown size={12} color="#ef4444" />
                )}
                <Text
                  className={`text-xs ml-1 ${isDailyPositive ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  {isDailyPositive ? '+' : ''}
                  {dailyChangePercent.toFixed(2)}%
                </Text>
              </View>
              <Text
                className={`text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}
              >
                {isPositive ? '+' : ''}
                {currencySymbol}
                {gainLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })} (
                {gainLossPercent.toFixed(1)}%)
              </Text>
            </View>
          </View>
        </View>

        {/* Expanded details */}
        {expanded && (
          <Animated.View entering={FadeIn.duration(200)}>
            <View className="border-t border-slate-800 px-4 pb-4 pt-3">
              <View className="flex-row flex-wrap gap-3 mb-3">
                <View className="flex-1 bg-slate-800/50 rounded-xl p-3 min-w-[140px]">
                  <Text className="text-slate-400 text-xs">
                    {language === 'ar' ? 'متوسط التكلفة' : 'Avg Cost'}
                  </Text>
                  <Text className="text-white font-medium mt-1">
                    {currencySymbol}{holding.avgCostPerShare.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-1 bg-slate-800/50 rounded-xl p-3 min-w-[140px]">
                  <Text className="text-slate-400 text-xs">
                    {language === 'ar' ? 'السعر الحالي' : 'Current Price'}
                  </Text>
                  <Text className="text-white font-medium mt-1">
                    {currencySymbol}{holding.currentPrice.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-1 bg-slate-800/50 rounded-xl p-3 min-w-[140px]">
                  <Text className="text-slate-400 text-xs">
                    {language === 'ar' ? 'القيمة الإجمالية' : 'Total Value'}
                  </Text>
                  <Text className="text-white font-medium mt-1">
                    {currencySymbol}
                    {totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </Text>
                </View>
                <View className="flex-1 bg-slate-800/50 rounded-xl p-3 min-w-[140px]">
                  <Text className="text-slate-400 text-xs">
                    {language === 'ar' ? 'الربح/الخسارة' : 'Total Gain/Loss'}
                  </Text>
                  <Text
                    className={`font-medium mt-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}
                  >
                    {isPositive ? '+' : ''}
                    {currencySymbol}
                    {gainLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>

              {/* Shariah status */}
              {holding.isShariahCompliant !== null && holding.shariahScore !== null && (
                <View className="bg-emerald-950/50 rounded-xl p-3 mb-3 border border-emerald-900/50">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-emerald-300 text-sm font-medium">
                      {language === 'ar' ? 'درجة الامتثال الشرعي' : 'Shariah Compliance Score'}
                    </Text>
                    <Text className="text-emerald-400 font-bold">
                      {holding.shariahScore}/100
                    </Text>
                  </View>
                </View>
              )}

              {/* Action buttons */}
              <View className="flex-row gap-3">
                {holding.isShariahCompliant === null && (
                  <Pressable
                    onPress={() => onShariahCheck(holding)}
                    disabled={isCheckingCompliance}
                    className="flex-1 bg-emerald-600/30 rounded-xl py-3 flex-row items-center justify-center"
                  >
                    {isCheckingCompliance ? (
                      <ActivityIndicator size="small" color="#10b981" />
                    ) : (
                      <>
                        <ShieldCheck size={16} color="#10b981" />
                        <Text className="text-emerald-400 text-sm font-medium ml-2">
                          {language === 'ar' ? 'فحص شرعي' : 'Check Shariah'}
                        </Text>
                      </>
                    )}
                  </Pressable>
                )}
                <Pressable
                  onPress={() => onRemove(holding.id)}
                  className="bg-red-600/20 rounded-xl py-3 px-4 flex-row items-center justify-center"
                >
                  <Trash2 size={16} color="#ef4444" />
                  <Text className="text-red-400 text-sm font-medium ml-2">
                    {language === 'ar' ? 'حذف' : 'Remove'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function PortfolioScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const isRTL = useLanguageStore((s) => s.isRTL);
  const country = useSettingsStore((s) => s.country);
  const currencySymbol = country?.currencySymbol ?? '$';

  const holdings = usePortfolioStore((s) => s.holdings);
  const addHolding = usePortfolioStore((s) => s.addHolding);
  const removeHolding = usePortfolioStore((s) => s.removeHolding);
  const updateHolding = usePortfolioStore((s) => s.updateHolding);
  const updatePrices = usePortfolioStore((s) => s.updatePrices);
  const lastRefreshed = usePortfolioStore((s) => s.lastRefreshed);

  const [showAddModal, setShowAddModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkingComplianceId, setCheckingComplianceId] = useState<string | null>(null);

  // Add modal state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null);
  const [sharesInput, setSharesInput] = useState('');
  const [avgCostInput, setAvgCostInput] = useState('');
  const [selectedType, setSelectedType] = useState<StockHolding['type']>('stock');
  const [isAdding, setIsAdding] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Computed values
  const sortedHoldings = useMemo(
    () =>
      [...holdings].sort(
        (a, b) => b.shares * b.currentPrice - a.shares * a.currentPrice
      ),
    [holdings]
  );

  const totalValue = useMemo(
    () => holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0),
    [holdings]
  );

  const totalCost = useMemo(
    () => holdings.reduce((sum, h) => sum + h.shares * h.avgCostPerShare, 0),
    [holdings]
  );

  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? ((totalGainLoss / totalCost) * 100) : 0;
  const isPortfolioPositive = totalGainLoss >= 0;

  const shariahCompliantCount = holdings.filter(
    (h) => h.isShariahCompliant === true
  ).length;
  const shariahPercent =
    holdings.length > 0
      ? Math.round((shariahCompliantCount / holdings.length) * 100)
      : 0;

  const bestPerformer = useMemo(() => {
    if (holdings.length === 0) return null;
    return holdings.reduce((best, h) => {
      const bestGain =
        best.avgCostPerShare > 0
          ? ((best.currentPrice - best.avgCostPerShare) / best.avgCostPerShare) * 100
          : 0;
      const hGain =
        h.avgCostPerShare > 0
          ? ((h.currentPrice - h.avgCostPerShare) / h.avgCostPerShare) * 100
          : 0;
      return hGain > bestGain ? h : best;
    }, holdings[0]);
  }, [holdings]);

  const bestPerformerGain = bestPerformer
    ? bestPerformer.avgCostPerShare > 0
      ? (
          ((bestPerformer.currentPrice - bestPerformer.avgCostPerShare) /
            bestPerformer.avgCostPerShare) *
          100
        ).toFixed(1)
      : '0.0'
    : '0.0';

  // Search stocks
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedStock(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/market/search?query=${encodeURIComponent(query)}`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.results ?? []);
        }
      } catch {
        // Fallback mock results for development
        setSearchResults([
          { symbol: query.toUpperCase(), name: `${query} Inc.`, type: 'stock', region: 'US', currency: 'USD' },
        ]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  }, []);

  // Refresh prices
  const handleRefresh = useCallback(async () => {
    if (holdings.length === 0) return;
    setIsRefreshing(true);
    try {
      const symbols = holdings.map((h) => h.symbol).join(',');
      const response = await fetch(
        `${BACKEND_URL}/api/market/batch?symbols=${encodeURIComponent(symbols)}`
      );
      if (response.ok) {
        const data = await response.json();
        const quotes = (data.quotes ?? []).map(
          (q: { symbol: string; price: number; change: number }) => ({
            symbol: q.symbol,
            price: q.price,
            change: q.change,
          })
        );
        updatePrices(quotes);
      }
    } catch {
      // silently fail for refresh
    } finally {
      setIsRefreshing(false);
    }
  }, [holdings, updatePrices]);

  // Check Shariah compliance
  const handleShariahCheck = useCallback(
    async (holding: StockHolding) => {
      setCheckingComplianceId(holding.id);
      try {
        const response = await fetch(`${BACKEND_URL}/api/market/shariah-screen`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: holding.symbol }),
        });
        if (response.ok) {
          const result: ShariahResult = await response.json();
          updateHolding(holding.id, {
            isShariahCompliant: result.isCompliant,
            shariahScore: result.score,
          });
        }
      } catch {
        // Fallback: mark as null if check fails
      } finally {
        setCheckingComplianceId(null);
      }
    },
    [updateHolding]
  );

  // Add holding
  const handleAddHolding = useCallback(async () => {
    if (!selectedStock || !sharesInput || !avgCostInput) return;
    setIsAdding(true);
    let currentPrice = parseFloat(avgCostInput);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/market/quote?symbol=${encodeURIComponent(selectedStock.symbol)}`
      );
      if (response.ok) {
        const data = await response.json();
        currentPrice = data.price ?? currentPrice;
      }
    } catch {
      // use average cost as fallback
    }
    addHolding({
      symbol: selectedStock.symbol,
      name: selectedStock.name,
      shares: parseFloat(sharesInput),
      avgCostPerShare: parseFloat(avgCostInput),
      currentPrice,
      previousClose: currentPrice,
      currency: selectedStock.currency ?? 'USD',
      isShariahCompliant: null,
      shariahScore: null,
      lastUpdated: new Date().toISOString(),
      type: selectedType,
    });
    // Reset modal
    setIsAdding(false);
    setShowAddModal(false);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedStock(null);
    setSharesInput('');
    setAvgCostInput('');
    setSelectedType('stock');
  }, [selectedStock, sharesInput, avgCostInput, selectedType, addHolding]);

  return (
    <View className="flex-1 bg-slate-950">
      <LinearGradient
        colors={['#064e3b', '#0f172a', '#020617']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 300 }}
      />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className={`px-5 pt-3 pb-2 flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Pressable
              onPress={() => router.back()}
              className="p-2 rounded-full bg-white/10"
            >
              <ArrowLeft
                size={22}
                color="white"
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              />
            </Pressable>
            <Text className={`text-white text-lg font-bold ${isRTL ? 'mr-3' : 'ml-3'}`}>
              {language === 'ar' ? 'محفظتي' : 'My Portfolio'}
            </Text>
          </View>
          <Pressable
            onPress={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-full bg-white/10"
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <RefreshCw size={20} color="white" />
            )}
          </Pressable>
        </Animated.View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Portfolio Summary Card */}
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            className="mx-4 mt-2"
          >
            <LinearGradient
              colors={['#065f46', '#064e3b', '#022c22']}
              style={{ borderRadius: 24, padding: 24 }}
            >
              <Text className="text-emerald-300/70 text-sm">
                {language === 'ar' ? 'القيمة الإجمالية للمحفظة' : 'Total Portfolio Value'}
              </Text>
              <Text className="text-white text-4xl font-bold mt-1">
                {currencySymbol}
                {totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </Text>

              <View className="flex-row items-center mt-2">
                {isPortfolioPositive ? (
                  <TrendingUp size={18} color="#34d399" />
                ) : (
                  <TrendingDown size={18} color="#f87171" />
                )}
                <Text
                  className={`text-base font-semibold ml-2 ${
                    isPortfolioPositive ? 'text-emerald-300' : 'text-red-300'
                  }`}
                >
                  {isPortfolioPositive ? '+' : ''}
                  {currencySymbol}
                  {totalGainLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })} (
                  {totalGainLossPercent.toFixed(2)}%)
                </Text>
              </View>

              {/* Mini bar chart representation */}
              <View className="flex-row items-end h-12 mt-4 gap-1">
                {sortedHoldings.slice(0, 8).map((h, i) => {
                  const pct = totalValue > 0 ? (h.shares * h.currentPrice) / totalValue : 0;
                  return (
                    <View
                      key={h.id}
                      className="rounded-t"
                      style={{
                        flex: pct,
                        height: `${Math.max(20, pct * 100)}%`,
                        backgroundColor:
                          h.isShariahCompliant === true
                            ? '#10b981'
                            : h.isShariahCompliant === false
                            ? '#ef4444'
                            : '#64748b',
                        opacity: 0.6 + i * 0.05,
                      }}
                    />
                  );
                })}
              </View>

              {lastRefreshed && (
                <Text className="text-emerald-300/40 text-xs mt-3">
                  {language === 'ar' ? 'آخر تحديث: ' : 'Last refreshed: '}
                  {new Date(lastRefreshed).toLocaleTimeString()}
                </Text>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Quick Stats Row */}
          <Animated.View
            entering={FadeInUp.delay(300).springify()}
            className="flex-row gap-3 mx-4 mt-4"
          >
            {/* Holdings count */}
            <View className="flex-1 bg-slate-900/60 rounded-2xl p-4 border border-slate-800/50">
              <Briefcase size={20} color="#06b6d4" />
              <Text className="text-white text-2xl font-bold mt-2">
                {holdings.length}
              </Text>
              <Text className="text-slate-400 text-xs">
                {language === 'ar' ? 'الحيازات' : 'Holdings'}
              </Text>
            </View>

            {/* Shariah compliant */}
            <View className="flex-1 bg-slate-900/60 rounded-2xl p-4 border border-slate-800/50">
              <ShieldCheck size={20} color="#10b981" />
              <Text className="text-white text-2xl font-bold mt-2">
                {shariahPercent}%
              </Text>
              <Text className="text-slate-400 text-xs">
                {language === 'ar' ? 'متوافق شرعيا' : 'Shariah OK'}
              </Text>
            </View>

            {/* Best performer */}
            <View className="flex-1 bg-slate-900/60 rounded-2xl p-4 border border-slate-800/50">
              <TrendingUp size={20} color="#f59e0b" />
              <Text className="text-white text-lg font-bold mt-2" numberOfLines={1}>
                {bestPerformer?.symbol ?? '--'}
              </Text>
              <Text className="text-emerald-400 text-xs">
                {bestPerformer ? `+${bestPerformerGain}%` : '--'}
              </Text>
            </View>
          </Animated.View>

          {/* Holdings List */}
          <Animated.View
            entering={FadeInUp.delay(400).springify()}
            className="mx-4 mt-6"
          >
            <Text className={`text-white font-semibold text-base mb-3 ${isRTL ? 'text-right' : ''}`}>
              {language === 'ar' ? 'الحيازات' : 'Holdings'}
            </Text>

            {sortedHoldings.length === 0 ? (
              <View className="bg-slate-900/40 rounded-2xl p-8 items-center border border-dashed border-slate-700">
                <Briefcase size={48} color="#475569" />
                <Text className="text-slate-400 text-base mt-4 text-center">
                  {language === 'ar'
                    ? 'لا توجد حيازات بعد'
                    : 'No holdings yet'}
                </Text>
                <Text className="text-slate-500 text-sm mt-1 text-center">
                  {language === 'ar'
                    ? 'اضغط + لإضافة أول أصل'
                    : 'Tap + to add your first asset'}
                </Text>
              </View>
            ) : (
              sortedHoldings.map((holding) => (
                <HoldingCard
                  key={holding.id}
                  holding={holding}
                  currencySymbol={currencySymbol}
                  isRTL={isRTL}
                  language={language ?? 'en'}
                  onRemove={removeHolding}
                  onShariahCheck={handleShariahCheck}
                  isCheckingCompliance={checkingComplianceId === holding.id}
                />
              ))
            )}
          </Animated.View>
        </ScrollView>

        {/* FAB */}
        <Pressable
          onPress={() => setShowAddModal(true)}
          className="absolute bottom-8 right-6"
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#10b981',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Plus size={28} color="white" />
          </LinearGradient>
        </Pressable>

        {/* Add Holding Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowAddModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
          >
            <View className="flex-1 bg-slate-950">
              <SafeAreaView className="flex-1">
                {/* Modal header */}
                <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-slate-800">
                  <Pressable onPress={() => setShowAddModal(false)}>
                    <X size={24} color="#94a3b8" />
                  </Pressable>
                  <Text className="text-white text-lg font-semibold">
                    {language === 'ar' ? 'إضافة أصل' : 'Add Holding'}
                  </Text>
                  <View style={{ width: 24 }} />
                </View>

                <ScrollView
                  className="flex-1 px-5"
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 40 }}
                >
                  {/* Search */}
                  <Text className="text-slate-400 text-sm mt-5 mb-2">
                    {language === 'ar' ? 'البحث عن سهم' : 'Search Stock'}
                  </Text>
                  <View className="flex-row items-center bg-slate-900 rounded-xl px-4 py-3 border border-slate-700">
                    <Search size={18} color="#64748b" />
                    <TextInput
                      className="flex-1 text-white ml-3 text-base"
                      placeholder={
                        language === 'ar'
                          ? 'ابحث عن رمز أو اسم...'
                          : 'Search symbol or name...'
                      }
                      placeholderTextColor="#475569"
                      value={searchQuery}
                      onChangeText={handleSearch}
                      autoCapitalize="characters"
                    />
                    {isSearching && (
                      <ActivityIndicator size="small" color="#10b981" />
                    )}
                  </View>

                  {/* Search results */}
                  {searchResults.length > 0 && !selectedStock && (
                    <View className="bg-slate-900 rounded-xl mt-2 border border-slate-700 overflow-hidden">
                      {searchResults.slice(0, 5).map((result, index) => (
                        <Pressable
                          key={`${result.symbol}-${index}`}
                          onPress={() => {
                            setSelectedStock(result);
                            setSearchQuery(result.symbol);
                          }}
                          className={`p-4 flex-row items-center justify-between ${
                            index > 0 ? 'border-t border-slate-800' : ''
                          }`}
                        >
                          <View>
                            <Text className="text-white font-semibold">
                              {result.symbol}
                            </Text>
                            <Text className="text-slate-400 text-sm" numberOfLines={1}>
                              {result.name}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text className="text-slate-500 text-xs">
                              {result.region}
                            </Text>
                            <Text className="text-slate-400 text-xs">
                              {result.currency}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {/* Selected stock indicator */}
                  {selectedStock && (
                    <View className="bg-emerald-900/30 rounded-xl p-4 mt-3 flex-row items-center border border-emerald-800/50">
                      <CheckCircle size={20} color="#10b981" />
                      <View className="ml-3 flex-1">
                        <Text className="text-white font-semibold">
                          {selectedStock.symbol}
                        </Text>
                        <Text className="text-emerald-300/70 text-sm">
                          {selectedStock.name}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => {
                          setSelectedStock(null);
                          setSearchQuery('');
                        }}
                      >
                        <X size={18} color="#94a3b8" />
                      </Pressable>
                    </View>
                  )}

                  {/* Shares input */}
                  <Text className="text-slate-400 text-sm mt-5 mb-2">
                    {language === 'ar' ? 'عدد الأسهم' : 'Number of Shares'}
                  </Text>
                  <TextInput
                    className="bg-slate-900 rounded-xl px-4 py-3 text-white text-base border border-slate-700"
                    placeholder="e.g. 100"
                    placeholderTextColor="#475569"
                    keyboardType="decimal-pad"
                    value={sharesInput}
                    onChangeText={setSharesInput}
                  />

                  {/* Avg cost input */}
                  <Text className="text-slate-400 text-sm mt-5 mb-2">
                    {language === 'ar' ? 'متوسط التكلفة لكل سهم' : 'Avg Cost per Share'}
                  </Text>
                  <TextInput
                    className="bg-slate-900 rounded-xl px-4 py-3 text-white text-base border border-slate-700"
                    placeholder={`e.g. 150.00 (${currencySymbol})`}
                    placeholderTextColor="#475569"
                    keyboardType="decimal-pad"
                    value={avgCostInput}
                    onChangeText={setAvgCostInput}
                  />

                  {/* Type selector */}
                  <Text className="text-slate-400 text-sm mt-5 mb-2">
                    {language === 'ar' ? 'نوع الأصل' : 'Asset Type'}
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {HOLDING_TYPES.map((ht) => (
                      <Pressable
                        key={ht.value}
                        onPress={() => setSelectedType(ht.value)}
                        className={`px-4 py-2.5 rounded-xl border ${
                          selectedType === ht.value
                            ? 'bg-emerald-600/30 border-emerald-500'
                            : 'bg-slate-900 border-slate-700'
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            selectedType === ht.value
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {language === 'ar' ? ht.labelAr : ht.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Add button */}
                  <Pressable
                    onPress={handleAddHolding}
                    disabled={!selectedStock || !sharesInput || !avgCostInput || isAdding}
                    className="mt-8 rounded-2xl overflow-hidden"
                    style={{ opacity: !selectedStock || !sharesInput || !avgCostInput ? 0.4 : 1 }}
                  >
                    <LinearGradient
                      colors={['#10b981', '#059669']}
                      style={{
                        paddingVertical: 16,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                      }}
                    >
                      {isAdding ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Plus size={20} color="white" />
                          <Text className="text-white text-base font-semibold ml-2">
                            {language === 'ar' ? 'إضافة للمحفظة' : 'Add to Portfolio'}
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </ScrollView>
              </SafeAreaView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
