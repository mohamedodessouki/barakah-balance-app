import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  Layout,
} from 'react-native-reanimated';
import {
  ArrowLeft,
  Search,
  X,
  Plus,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Star,
  Globe,
  BarChart3,
} from 'lucide-react-native';
import { useLanguageStore, useSettingsStore } from '@/lib/store';
import { usePortfolioStore } from '@/lib/portfolio-store';

const BACKEND_URL =
  process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || 'http://localhost:3000';

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  latestTradingDay: string;
}

interface ShariahStatus {
  isCompliant: boolean | null;
  score: number | null;
  loading: boolean;
}

const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', region: 'US' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', region: 'US' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', region: 'US' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', region: 'US' },
  { symbol: 'TSLA', name: 'Tesla Inc.', region: 'US' },
  { symbol: 'META', name: 'Meta Platforms', region: 'US' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', region: 'US' },
  { symbol: '2222.SR', name: 'Saudi Aramco', region: 'Saudi Arabia' },
  { symbol: 'EMAAR.AE', name: 'Emaar Properties', region: 'UAE' },
];

// Stock card component
function StockCard({
  symbol,
  name,
  region,
  quote,
  shariahStatus,
  language,
  isRTL,
  currencySymbol,
  onAddToPortfolio,
  onCheckShariah,
  isInPortfolio,
}: {
  symbol: string;
  name: string;
  region: string;
  quote: StockQuote | null;
  shariahStatus: ShariahStatus;
  language: string;
  isRTL: boolean;
  currencySymbol: string;
  onAddToPortfolio: (symbol: string, name: string, price: number, currency: string) => void;
  onCheckShariah: (symbol: string) => void;
  isInPortfolio: boolean;
}) {
  const isPositive = (quote?.change ?? 0) >= 0;

  return (
    <Animated.View entering={FadeIn.duration(300)} layout={Layout.springify()}>
      <View className="bg-slate-900/60 rounded-2xl p-4 mb-3 border border-slate-800/50">
        <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Left: Info */}
          <View className={`flex-1 ${isRTL ? 'items-end' : 'items-start'}`}>
            <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <View className="w-10 h-10 rounded-xl bg-amber-500/20 items-center justify-center mr-3">
                <Text className="text-amber-400 font-bold text-xs">
                  {symbol.substring(0, 3)}
                </Text>
              </View>
              <View>
                <View className={`flex-row items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Text className="text-white font-semibold text-base">{symbol}</Text>
                  {/* Shariah indicator */}
                  {shariahStatus.loading ? (
                    <ActivityIndicator size={12} color="#818cf8" />
                  ) : shariahStatus.isCompliant === true ? (
                    <ShieldCheck size={14} color="#10b981" />
                  ) : shariahStatus.isCompliant === false ? (
                    <ShieldAlert size={14} color="#ef4444" />
                  ) : null}
                </View>
                <Text className="text-slate-400 text-xs" numberOfLines={1}>
                  {name}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <Globe size={10} color="#64748b" />
                  <Text className="text-slate-500 text-xs ml-1">{region}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right: Price + Actions */}
          <View className="items-end">
            {quote ? (
              <>
                <Text className="text-white font-bold text-lg">
                  ${quote.price.toFixed(2)}
                </Text>
                <View className="flex-row items-center">
                  {isPositive ? (
                    <TrendingUp size={12} color="#10b981" />
                  ) : (
                    <TrendingDown size={12} color="#ef4444" />
                  )}
                  <Text
                    className={`text-xs ml-1 font-medium ${
                      isPositive ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {quote.changePercent.toFixed(2)}%
                  </Text>
                </View>
              </>
            ) : (
              <Text className="text-slate-500 text-sm">--</Text>
            )}
          </View>
        </View>

        {/* Action row */}
        <View className="flex-row gap-2 mt-3">
          {/* Add to portfolio */}
          <Pressable
            onPress={() =>
              onAddToPortfolio(symbol, name, quote?.price ?? 0, 'USD')
            }
            disabled={isInPortfolio}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${
              isInPortfolio
                ? 'bg-emerald-600/10 border border-emerald-800/30'
                : 'bg-emerald-600/20 border border-emerald-700/30'
            }`}
          >
            {isInPortfolio ? (
              <>
                <ShieldCheck size={14} color="#10b981" />
                <Text className="text-emerald-500 text-xs font-medium ml-1.5">
                  {language === 'ar' ? 'في المحفظة' : 'In Portfolio'}
                </Text>
              </>
            ) : (
              <>
                <Plus size={14} color="#10b981" />
                <Text className="text-emerald-400 text-xs font-medium ml-1.5">
                  {language === 'ar' ? 'إضافة' : 'Add'}
                </Text>
              </>
            )}
          </Pressable>

          {/* Shariah check */}
          {shariahStatus.isCompliant === null && !shariahStatus.loading && (
            <Pressable
              onPress={() => onCheckShariah(symbol)}
              className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl bg-indigo-600/20 border border-indigo-700/30"
            >
              <ShieldQuestion size={14} color="#818cf8" />
              <Text className="text-indigo-400 text-xs font-medium ml-1.5">
                {language === 'ar' ? 'فحص شرعي' : 'Shariah Check'}
              </Text>
            </Pressable>
          )}

          {shariahStatus.isCompliant !== null && (
            <View
              className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${
                shariahStatus.isCompliant
                  ? 'bg-emerald-600/10 border border-emerald-800/30'
                  : 'bg-red-600/10 border border-red-800/30'
              }`}
            >
              {shariahStatus.isCompliant ? (
                <>
                  <ShieldCheck size={14} color="#10b981" />
                  <Text className="text-emerald-400 text-xs font-medium ml-1.5">
                    {language === 'ar' ? 'متوافق' : 'Compliant'}
                    {shariahStatus.score ? ` (${shariahStatus.score})` : ''}
                  </Text>
                </>
              ) : (
                <>
                  <ShieldAlert size={14} color="#ef4444" />
                  <Text className="text-red-400 text-xs font-medium ml-1.5">
                    {language === 'ar' ? 'غير متوافق' : 'Non-Compliant'}
                  </Text>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default function MarketScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const isRTL = useLanguageStore((s) => s.isRTL);
  const country = useSettingsStore((s) => s.country);
  const currencySymbol = country?.currencySymbol ?? '$';

  const holdings = usePortfolioStore((s) => s.holdings);
  const addHolding = usePortfolioStore((s) => s.addHolding);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [shariahStatuses, setShariahStatuses] = useState<Record<string, ShariahStatus>>({});
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const portfolioSymbols = useMemo(
    () => new Set(holdings.map((h) => h.symbol)),
    [holdings]
  );

  // Fetch quotes for popular stocks on mount
  const fetchPopularQuotes = useCallback(async () => {
    setLoadingQuotes(true);
    try {
      const symbols = POPULAR_STOCKS.map((s) => s.symbol).join(',');
      const response = await fetch(
        `${BACKEND_URL}/api/market/batch?symbols=${encodeURIComponent(symbols)}`
      );
      if (response.ok) {
        const data = await response.json();
        const quoteMap: Record<string, StockQuote> = {};
        (data.quotes ?? []).forEach((q: StockQuote) => {
          quoteMap[q.symbol] = q;
        });
        setQuotes(quoteMap);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingQuotes(false);
    }
  }, []);

  // Load quotes on first render
  React.useEffect(() => {
    fetchPopularQuotes();
  }, [fetchPopularQuotes]);

  // Search stocks
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
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

          // Fetch quotes for search results
          const symbols = (data.results ?? [])
            .slice(0, 5)
            .map((r: SearchResult) => r.symbol)
            .join(',');
          if (symbols) {
            const quoteRes = await fetch(
              `${BACKEND_URL}/api/market/batch?symbols=${encodeURIComponent(symbols)}`
            );
            if (quoteRes.ok) {
              const quoteData = await quoteRes.json();
              const newQuotes: Record<string, StockQuote> = { ...quotes };
              (quoteData.quotes ?? []).forEach((q: StockQuote) => {
                newQuotes[q.symbol] = q;
              });
              setQuotes(newQuotes);
            }
          }
        }
      } catch {
        // fallback
        setSearchResults([
          {
            symbol: query.toUpperCase(),
            name: `${query} Inc.`,
            type: 'stock',
            region: 'US',
            currency: 'USD',
          },
        ]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  }, [quotes]);

  // Check Shariah compliance
  const handleCheckShariah = useCallback(async (symbol: string) => {
    setShariahStatuses((prev) => ({
      ...prev,
      [symbol]: { isCompliant: null, score: null, loading: true },
    }));
    try {
      const response = await fetch(`${BACKEND_URL}/api/market/shariah-screen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      });
      if (response.ok) {
        const data = await response.json();
        setShariahStatuses((prev) => ({
          ...prev,
          [symbol]: {
            isCompliant: data.isCompliant ?? null,
            score: data.score ?? null,
            loading: false,
          },
        }));
      } else {
        setShariahStatuses((prev) => ({
          ...prev,
          [symbol]: { isCompliant: null, score: null, loading: false },
        }));
      }
    } catch {
      setShariahStatuses((prev) => ({
        ...prev,
        [symbol]: { isCompliant: null, score: null, loading: false },
      }));
    }
  }, []);

  // Add to portfolio
  const handleAddToPortfolio = useCallback(
    (symbol: string, name: string, price: number, currency: string) => {
      if (portfolioSymbols.has(symbol)) return;
      addHolding({
        symbol,
        name,
        shares: 1,
        avgCostPerShare: price || 100,
        currentPrice: price || 100,
        previousClose: price || 100,
        currency,
        isShariahCompliant: shariahStatuses[symbol]?.isCompliant ?? null,
        shariahScore: shariahStatuses[symbol]?.score ?? null,
        lastUpdated: new Date().toISOString(),
        type: 'stock',
      });
    },
    [portfolioSymbols, addHolding, shariahStatuses]
  );

  const showSearchResults = searchQuery.length >= 2 && searchResults.length > 0;

  return (
    <View className="flex-1 bg-slate-950">
      <LinearGradient
        colors={['#78350f', '#1c1917', '#020617']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 220 }}
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
            <View className={`${isRTL ? 'mr-3' : 'ml-3'}`}>
              <Text className="text-white text-lg font-bold">
                {language === 'ar' ? 'الأسواق' : 'Market'}
              </Text>
              <Text className="text-amber-300/60 text-xs">
                {language === 'ar' ? 'استكشاف الأسهم والصكوك' : 'Explore Stocks & Sukuk'}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push('/portfolio')}
            className="bg-emerald-600/20 px-3 py-2 rounded-xl flex-row items-center"
          >
            <BarChart3 size={16} color="#10b981" />
            <Text className="text-emerald-400 text-xs font-medium ml-1.5">
              {language === 'ar' ? 'المحفظة' : 'Portfolio'}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="mx-4 mt-3"
        >
          <View className="flex-row items-center bg-slate-900/80 rounded-2xl px-4 py-3 border border-slate-700/50">
            <Search size={20} color="#64748b" />
            <TextInput
              className="flex-1 text-white ml-3 text-base"
              placeholder={
                language === 'ar'
                  ? 'ابحث عن سهم، صكوك، أو صندوق...'
                  : 'Search stocks, sukuk, or funds...'
              }
              placeholderTextColor="#475569"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="characters"
            />
            {isSearching && <ActivityIndicator size="small" color="#f59e0b" />}
            {searchQuery.length > 0 && !isSearching && (
              <Pressable
                onPress={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <X size={18} color="#64748b" />
              </Pressable>
            )}
          </View>
        </Animated.View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Search Results */}
          {showSearchResults && (
            <Animated.View entering={FadeInUp.springify()} className="mx-4 mt-4">
              <Text className="text-white font-semibold text-base mb-3">
                {language === 'ar' ? 'نتائج البحث' : 'Search Results'}
              </Text>
              {searchResults.slice(0, 8).map((result) => (
                <StockCard
                  key={result.symbol}
                  symbol={result.symbol}
                  name={result.name}
                  region={result.region}
                  quote={quotes[result.symbol] ?? null}
                  shariahStatus={
                    shariahStatuses[result.symbol] ?? {
                      isCompliant: null,
                      score: null,
                      loading: false,
                    }
                  }
                  language={language ?? 'en'}
                  isRTL={isRTL}
                  currencySymbol={currencySymbol}
                  onAddToPortfolio={handleAddToPortfolio}
                  onCheckShariah={handleCheckShariah}
                  isInPortfolio={portfolioSymbols.has(result.symbol)}
                />
              ))}
            </Animated.View>
          )}

          {/* Popular Stocks */}
          {!showSearchResults && (
            <Animated.View entering={FadeInUp.delay(300).springify()} className="mx-4 mt-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Star size={18} color="#f59e0b" />
                  <Text className="text-white font-semibold text-base ml-2">
                    {language === 'ar' ? 'الأسهم الشائعة' : 'Popular Stocks'}
                  </Text>
                </View>
                {loadingQuotes && (
                  <ActivityIndicator size="small" color="#f59e0b" />
                )}
              </View>

              {POPULAR_STOCKS.map((stock, index) => (
                <Animated.View
                  key={stock.symbol}
                  entering={FadeInUp.delay(100 + index * 60).springify()}
                >
                  <StockCard
                    symbol={stock.symbol}
                    name={stock.name}
                    region={stock.region}
                    quote={quotes[stock.symbol] ?? null}
                    shariahStatus={
                      shariahStatuses[stock.symbol] ?? {
                        isCompliant: null,
                        score: null,
                        loading: false,
                      }
                    }
                    language={language ?? 'en'}
                    isRTL={isRTL}
                    currencySymbol={currencySymbol}
                    onAddToPortfolio={handleAddToPortfolio}
                    onCheckShariah={handleCheckShariah}
                    isInPortfolio={portfolioSymbols.has(stock.symbol)}
                  />
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {/* Islamic Finance note */}
          <Animated.View
            entering={FadeInUp.delay(500).springify()}
            className="mx-4 mt-4"
          >
            <View className="bg-amber-950/30 rounded-2xl p-4 border border-amber-900/30">
              <View className="flex-row items-start">
                <ShieldCheck size={20} color="#f59e0b" />
                <View className="flex-1 ml-3">
                  <Text className="text-amber-300 text-sm font-medium">
                    {language === 'ar'
                      ? 'الفحص الشرعي'
                      : 'Shariah Screening'}
                  </Text>
                  <Text className="text-amber-300/60 text-xs mt-1 leading-5">
                    {language === 'ar'
                      ? 'استخدم زر "فحص شرعي" للتحقق من مدى امتثال السهم لمعايير الشريعة الإسلامية بما في ذلك نسب الديون والإيرادات المحرمة.'
                      : 'Use the "Shariah Check" button to verify stock compliance with Islamic principles including debt ratios and haram revenue screening.'}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
