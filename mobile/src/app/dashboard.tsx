import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import {
  ArrowLeft, Plus, FileText, Calculator, Bell, Settings, TrendingUp, TrendingDown,
  PieChart, Calendar, Target, Heart, AlertTriangle, CheckCircle, Clock, ChevronRight,
  Wallet, Building2, Gem, Home, Briefcase, Ban, DollarSign, BarChart3,
  FileSearch, ShieldCheck
} from 'lucide-react-native';
import { useLanguageStore, useSettingsStore, useIndividualCalculatorStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';
import { useDashboardStore, ZAKAT_CATEGORIES, GOAL_CATEGORIES, ZakatStatus } from '@/lib/dashboard-store';
import { usePortfolioStore } from '@/lib/portfolio-store';
import { useResponsive } from '@/lib/useResponsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Circular progress component for Hawl countdown
function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 10,
  color = '#10b981',
  backgroundColor = '#064e3b',
  children,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute' }}>
        {/* Background circle */}
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          }}
        />
      </View>
      <View style={{ position: 'absolute' }}>
        {/* Progress circle - simplified for RN */}
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: 'transparent',
            borderRightColor: progress > 25 ? color : 'transparent',
            borderBottomColor: progress > 50 ? color : 'transparent',
            borderLeftColor: progress > 75 ? color : 'transparent',
            transform: [{ rotate: '-90deg' }],
          }}
        />
      </View>
      {children}
    </View>
  );
}

// Status badge component
function StatusBadge({ status, language }: { status: ZakatStatus; language: string }) {
  const config = {
    paid: { color: '#10b981', bg: '#064e3b', icon: CheckCircle, textEn: 'Zakat Paid', textAr: 'زكاة مدفوعة' },
    due_soon: { color: '#f59e0b', bg: '#78350f', icon: Clock, textEn: 'Due Soon', textAr: 'مستحقة قريباً' },
    overdue: { color: '#ef4444', bg: '#7f1d1d', icon: AlertTriangle, textEn: 'Overdue', textAr: 'متأخرة' },
    not_due: { color: '#6b7280', bg: '#1f2937', icon: Calendar, textEn: 'Not Yet Due', textAr: 'غير مستحقة بعد' },
  };

  const { color, bg, icon: Icon, textEn, textAr } = config[status];

  return (
    <View style={{ backgroundColor: bg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center' }}>
      <Icon size={14} color={color} />
      <Text style={{ color, marginLeft: 6, fontSize: 12, fontWeight: '600' }}>
        {language === 'ar' ? textAr : textEn}
      </Text>
    </View>
  );
}

// Wealth composition item
function WealthItem({
  icon: Icon,
  label,
  amount,
  percentage,
  color,
  currencySymbol,
  isExempt = false,
}: {
  icon: React.ElementType;
  label: string;
  amount: number;
  percentage: number;
  color: string;
  currencySymbol: string;
  isExempt?: boolean;
}) {
  return (
    <View className={`flex-row items-center py-2 ${isExempt ? 'opacity-50' : ''}`}>
      <View style={{ backgroundColor: color + '30', borderRadius: 8, padding: 8 }}>
        <Icon size={18} color={color} />
      </View>
      <View className="flex-1 ml-3">
        <Text className={`text-white text-sm ${isExempt ? 'line-through' : ''}`}>{label}</Text>
        <Text className="text-white/50 text-xs">{percentage.toFixed(1)}%</Text>
      </View>
      <Text className="text-white font-medium">{currencySymbol}{amount.toLocaleString()}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);
  const country = useSettingsStore((s) => s.country);
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const totalAssets = useIndividualCalculatorStore((s) => s.getTotalAssets)();

  const zakatStatus = useDashboardStore((s) => s.getZakatStatus)();
  const daysUntilHawl = useDashboardStore((s) => s.getDaysUntilHawl)();
  const currentNisab = useDashboardStore((s) => s.getCurrentNisab)();
  const netWorth = useDashboardStore((s) => s.getNetWorth)();
  const alerts = useDashboardStore((s) => s.alerts);
  const healthScore = useDashboardStore((s) => s.healthScore);
  const zakatPayments = useDashboardStore((s) => s.zakatPayments);
  const financialGoals = useDashboardStore((s) => s.financialGoals);
  const currentSnapshot = useDashboardStore((s) => s.currentSnapshot);
  const islamicDebtRatio = useDashboardStore((s) => s.getIslamicDebtRatio)();

  // Portfolio store
  const portfolioHoldings = usePortfolioStore((s) => s.holdings);
  const portfolioTotalValue = usePortfolioStore((s) => s.getTotalValue)();
  const portfolioGainLoss = usePortfolioStore((s) => s.getTotalGainLoss)();
  const portfolioGainLossPercent = usePortfolioStore((s) => s.getTotalGainLossPercent)();
  const shariahCompliantValue = usePortfolioStore((s) => s.getShariahCompliantValue)();
  const portfolioShariahPercent = portfolioTotalValue > 0
    ? Math.round((shariahCompliantValue / portfolioTotalValue) * 100)
    : 0;

  const currencySymbol = country?.currencySymbol ?? '$';

  // Calculate projected Zakat
  const projectedZakat = Math.max(0, (totalAssets - currentNisab) * 0.025);

  // Hawl progress (days passed / 354 lunar days)
  const hawlProgress = Math.max(0, Math.min(100, ((354 - daysUntilHawl) / 354) * 100));

  // Wealth composition mock data (will use real data from store)
  const wealthComposition = useMemo(() => {
    const snapshot = currentSnapshot || {
      liquidAssets: totalAssets * 0.3,
      investments: totalAssets * 0.35,
      preciousMetals: totalAssets * 0.1,
      realEstate: totalAssets * 0.15,
      businessAssets: totalAssets * 0.05,
      exemptAssets: totalAssets * 0.05,
    };
    const total = snapshot.liquidAssets + snapshot.investments + snapshot.preciousMetals +
                  snapshot.realEstate + snapshot.businessAssets;
    return [
      { icon: Wallet, label: language === 'ar' ? 'أصول سائلة' : 'Liquid Assets', amount: snapshot.liquidAssets, color: '#10b981', percentage: (snapshot.liquidAssets / total) * 100 },
      { icon: TrendingUp, label: language === 'ar' ? 'استثمارات' : 'Investments', amount: snapshot.investments, color: '#6366f1', percentage: (snapshot.investments / total) * 100 },
      { icon: Gem, label: language === 'ar' ? 'معادن ثمينة' : 'Precious Metals', amount: snapshot.preciousMetals, color: '#f59e0b', percentage: (snapshot.preciousMetals / total) * 100 },
      { icon: Home, label: language === 'ar' ? 'عقارات' : 'Real Estate', amount: snapshot.realEstate, color: '#ef4444', percentage: (snapshot.realEstate / total) * 100 },
      { icon: Briefcase, label: language === 'ar' ? 'أصول تجارية' : 'Business', amount: snapshot.businessAssets, color: '#8b5cf6', percentage: (snapshot.businessAssets / total) * 100 },
      { icon: Ban, label: language === 'ar' ? 'معفاة' : 'Exempt', amount: snapshot.exemptAssets, color: '#6b7280', percentage: 0, isExempt: true },
    ];
  }, [currentSnapshot, totalAssets, language]);

  // Unread alerts count
  const unreadAlerts = alerts.filter((a) => !a.isRead).length;

  // Container style for larger screens
  const containerStyle = isDesktop
    ? { maxWidth: 1400, marginHorizontal: 'auto' as const, width: '100%' as const }
    : isTablet
    ? { maxWidth: 900, marginHorizontal: 'auto' as const, width: '100%' as const }
    : {};

  return (
    <View className="flex-1 bg-slate-950">
      <LinearGradient
        colors={['#0f172a', '#020617', '#000']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className={`px-6 pt-4 flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
          style={containerStyle}
        >
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Pressable
              onPress={() => router.back()}
              className={`p-2 rounded-full bg-white/10 ${isRTL ? 'ml-4' : 'mr-4'}`}
            >
              <ArrowLeft size={24} color="white" style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
            </Pressable>
            <View>
              <Text className="text-white text-lg font-bold">
                {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
              </Text>
              <Text className="text-slate-400 text-xs">
                {language === 'ar' ? 'إدارة الثروة الإسلامية' : 'Islamic Wealth Management'}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.push('/alerts')}
              className="p-2 rounded-full bg-white/10 relative"
            >
              <Bell size={20} color="white" />
              {unreadAlerts > 0 && (
                <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 items-center justify-center">
                  <Text className="text-white text-xs font-bold">{unreadAlerts}</Text>
                </View>
              )}
            </Pressable>
            <Pressable className="p-2 rounded-full bg-white/10">
              <Settings size={20} color="white" />
            </Pressable>
          </View>
        </Animated.View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Main content grid */}
          <View style={{ ...containerStyle, paddingHorizontal: 16 }}>
            {/* Desktop/Tablet: 2-column layout */}
            <View className={isDesktop || isTablet ? 'flex-row gap-4' : ''}>
              {/* Left column */}
              <View className={isDesktop || isTablet ? 'flex-1' : ''}>
                {/* 1. Zakat Status Hero Card */}
                <Animated.View
                  entering={FadeInUp.delay(200).springify()}
                  className="mt-4"
                >
                  <LinearGradient
                    colors={['#064e3b', '#022c22']}
                    style={{ borderRadius: 24, padding: 20 }}
                  >
                    <View className={`flex-row items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <View className="flex-1">
                        <StatusBadge status={zakatStatus} language={language ?? 'en'} />
                        <Text className={`text-white/70 text-sm mt-4 ${isRTL ? 'text-right' : ''}`}>
                          {language === 'ar' ? 'صافي الثروة الزكوية' : 'Net Zakatable Wealth'}
                        </Text>
                        <Text className={`text-white text-3xl font-bold mt-1 ${isRTL ? 'text-right' : ''}`}>
                          {currencySymbol}{totalAssets.toLocaleString()}
                        </Text>

                        {/* Nisab comparison */}
                        <View className="mt-4">
                          <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Text className="text-emerald-400 text-xs">
                              {language === 'ar' ? 'النصاب' : 'Nisab'}: {currencySymbol}{currentNisab.toLocaleString()}
                            </Text>
                            <Text className={`text-xs ${totalAssets >= currentNisab ? 'text-emerald-400' : 'text-slate-400'}`}>
                              {totalAssets >= currentNisab
                                ? (language === 'ar' ? 'فوق النصاب ✓' : 'Above Nisab ✓')
                                : (language === 'ar' ? 'تحت النصاب' : 'Below Nisab')}
                            </Text>
                          </View>
                          <View className="h-2 bg-emerald-950 rounded-full mt-2 overflow-hidden">
                            <View
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(100, (totalAssets / currentNisab) * 100)}%` }}
                            />
                          </View>
                        </View>

                        {/* Projected Zakat */}
                        {projectedZakat > 0 && (
                          <View className="mt-4 bg-emerald-900/30 rounded-xl p-3">
                            <Text className={`text-emerald-300 text-xs ${isRTL ? 'text-right' : ''}`}>
                              {language === 'ar' ? 'الزكاة المتوقعة' : 'Projected Zakat Due'}
                            </Text>
                            <Text className={`text-emerald-400 text-xl font-bold ${isRTL ? 'text-right' : ''}`}>
                              {currencySymbol}{projectedZakat.toLocaleString()}
                            </Text>
                          </View>
                        )}

                        {/* Last payment */}
                        {zakatPayments.length > 0 && (
                          <View className={`flex-row items-center mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <CheckCircle size={14} color="#10b981" />
                            <Text className={`text-emerald-400 text-xs ${isRTL ? 'mr-2' : 'ml-2'}`}>
                              {language === 'ar' ? 'آخر دفعة: ' : 'Last payment: '}
                              {new Date(zakatPayments[zakatPayments.length - 1].date).toLocaleDateString()}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Hawl Countdown */}
                      <View className="items-center">
                        <CircularProgress
                          progress={hawlProgress}
                          size={100}
                          color="#10b981"
                          backgroundColor="#064e3b"
                        >
                          <View className="items-center">
                            <Text className="text-emerald-400 text-2xl font-bold">{daysUntilHawl}</Text>
                            <Text className="text-emerald-300 text-xs">
                              {language === 'ar' ? 'يوم' : 'days'}
                            </Text>
                          </View>
                        </CircularProgress>
                        <Text className="text-emerald-400 text-xs mt-2 text-center">
                          {language === 'ar' ? 'حتى الحول' : 'Until Hawl'}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </Animated.View>

                {/* Portfolio Snapshot - only show if user has holdings */}
                {portfolioHoldings.length > 0 && (
                  <Animated.View
                    entering={FadeInUp.delay(250).springify()}
                    className="mt-4"
                  >
                    <Pressable onPress={() => router.push('/portfolio')}>
                      <LinearGradient
                        colors={['#164e63', '#0c4a6e', '#0f172a']}
                        style={{ borderRadius: 20, padding: 18 }}
                      >
                        <View className={`flex-row items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Briefcase size={18} color="#22d3ee" />
                            <Text className={`text-cyan-300 text-sm font-semibold ${isRTL ? 'mr-2' : 'ml-2'}`}>
                              {language === 'ar' ? 'لقطة المحفظة' : 'Portfolio Snapshot'}
                            </Text>
                          </View>
                          <ChevronRight size={18} color="#22d3ee" style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
                        </View>
                        <Text className="text-white text-2xl font-bold">
                          {currencySymbol}{portfolioTotalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          {portfolioGainLoss >= 0 ? (
                            <TrendingUp size={14} color="#34d399" />
                          ) : (
                            <TrendingDown size={14} color="#f87171" />
                          )}
                          <Text className={`text-sm font-medium ml-1 ${portfolioGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {portfolioGainLoss >= 0 ? '+' : ''}{currencySymbol}{portfolioGainLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({portfolioGainLossPercent.toFixed(1)}%)
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-cyan-800/30">
                          <View className="items-center flex-1">
                            <Text className="text-cyan-300/60 text-xs">{language === 'ar' ? 'الحيازات' : 'Holdings'}</Text>
                            <Text className="text-white font-bold text-base mt-0.5">{portfolioHoldings.length}</Text>
                          </View>
                          <View className="w-px h-8 bg-cyan-800/30" />
                          <View className="items-center flex-1">
                            <Text className="text-cyan-300/60 text-xs">{language === 'ar' ? 'متوافق شرعيا' : 'Shariah OK'}</Text>
                            <Text className="text-emerald-400 font-bold text-base mt-0.5">{portfolioShariahPercent}%</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>
                )}

                {/* 2. Wealth Composition */}
                <Animated.View
                  entering={FadeInUp.delay(300).springify()}
                  className="mt-4"
                >
                  <View className="bg-slate-900/50 rounded-2xl p-5">
                    <View className={`flex-row items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <PieChart size={20} color="#6366f1" />
                        <Text className={`text-white font-semibold ${isRTL ? 'mr-2' : 'ml-2'}`}>
                          {language === 'ar' ? 'تكوين الثروة' : 'Wealth Composition'}
                        </Text>
                      </View>
                      <Pressable>
                        <ChevronRight size={20} color="#64748b" />
                      </Pressable>
                    </View>

                    {/* Simple donut representation */}
                    <View className="flex-row items-center mb-4">
                      <View className="w-24 h-24 rounded-full border-8 border-emerald-500 items-center justify-center mr-4">
                        <View className="w-16 h-16 rounded-full border-8 border-indigo-500 items-center justify-center">
                          <View className="w-8 h-8 rounded-full bg-amber-500" />
                        </View>
                      </View>
                      <View className="flex-1">
                        {wealthComposition.slice(0, 3).map((item, index) => (
                          <View key={index} className="flex-row items-center mb-1">
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
                            <Text className="text-white/70 text-xs ml-2 flex-1">{item.label}</Text>
                            <Text className="text-white text-xs">{item.percentage.toFixed(0)}%</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Wealth items list */}
                    <View className="border-t border-slate-800 pt-3">
                      {wealthComposition.map((item, index) => (
                        <WealthItem
                          key={index}
                          icon={item.icon}
                          label={item.label}
                          amount={item.amount}
                          percentage={item.percentage}
                          color={item.color}
                          currencySymbol={currencySymbol}
                          isExempt={item.isExempt}
                        />
                      ))}
                    </View>
                  </View>
                </Animated.View>

                {/* 3. Asset Health Score */}
                <Animated.View
                  entering={FadeInUp.delay(400).springify()}
                  className="mt-4"
                >
                  <View className="bg-slate-900/50 rounded-2xl p-5">
                    <View className={`flex-row items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Heart size={20} color="#ec4899" />
                        <Text className={`text-white font-semibold ${isRTL ? 'mr-2' : 'ml-2'}`}>
                          {language === 'ar' ? 'درجة صحة الأصول' : 'Asset Health Score'}
                        </Text>
                      </View>
                      <View className="bg-emerald-500/20 px-3 py-1 rounded-full">
                        <Text className="text-emerald-400 font-bold">
                          {healthScore?.overall ?? 78}/100
                        </Text>
                      </View>
                    </View>

                    {/* Score breakdown */}
                    <View className="gap-3">
                      {[
                        { label: language === 'ar' ? 'نقاء حلال' : 'Halal Purity', value: healthScore?.halalPurity ?? 85, weight: 30 },
                        { label: language === 'ar' ? 'السيولة' : 'Liquidity', value: healthScore?.liquidity ?? 70, weight: 20 },
                        { label: language === 'ar' ? 'التنويع' : 'Diversification', value: healthScore?.diversification ?? 65, weight: 15 },
                        { label: language === 'ar' ? 'نسبة الديون' : 'Debt Ratio', value: healthScore?.debtRatio ?? 90, weight: 15 },
                        { label: language === 'ar' ? 'امتثال الزكاة' : 'Zakat Compliance', value: healthScore?.zakatCompliance ?? 75, weight: 20 },
                      ].map((item, index) => (
                        <View key={index}>
                          <View className={`flex-row justify-between mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Text className="text-slate-400 text-xs">{item.label} ({item.weight}%)</Text>
                            <Text className="text-white text-xs">{item.value}%</Text>
                          </View>
                          <View className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <View
                              className={`h-full rounded-full ${
                                item.value >= 80 ? 'bg-emerald-500' :
                                item.value >= 60 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${item.value}%` }}
                            />
                          </View>
                        </View>
                      ))}
                    </View>

                    {/* Islamic debt ratio highlight */}
                    <View className="mt-4 bg-slate-800/50 rounded-xl p-3 flex-row items-center justify-between">
                      <Text className="text-slate-400 text-sm">
                        {language === 'ar' ? 'نسبة الدين الإسلامي' : 'Islamic Debt Ratio'}
                      </Text>
                      <Text className={`font-bold ${islamicDebtRatio >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {islamicDebtRatio}%
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              </View>

              {/* Right column */}
              <View className={isDesktop || isTablet ? 'flex-1' : ''}>
                {/* 4. Quick Actions */}
                <Animated.View
                  entering={FadeInUp.delay(250).springify()}
                  className="mt-4"
                >
                  <Text className={`text-white font-semibold mb-3 px-1 ${isRTL ? 'text-right' : ''}`}>
                    {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
                  </Text>
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() => router.push('/individual/assets')}
                      className="flex-1 bg-emerald-600/20 rounded-xl p-4 items-center"
                    >
                      <Plus size={24} color="#10b981" />
                      <Text className="text-emerald-400 text-xs mt-2 text-center">
                        {language === 'ar' ? 'إضافة أصل' : 'Add Asset'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => router.push('/calculator-type')}
                      className="flex-1 bg-indigo-600/20 rounded-xl p-4 items-center"
                    >
                      <Calculator size={24} color="#6366f1" />
                      <Text className="text-indigo-400 text-xs mt-2 text-center">
                        {language === 'ar' ? 'حساب الزكاة' : 'Calculate'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => router.push('/reports')}
                      className="flex-1 bg-amber-600/20 rounded-xl p-4 items-center"
                    >
                      <FileText size={24} color="#f59e0b" />
                      <Text className="text-amber-400 text-xs mt-2 text-center">
                        {language === 'ar' ? 'تقرير' : 'Report'}
                      </Text>
                    </Pressable>
                  </View>
                  <View className="flex-row gap-3 mt-3">
                    <Pressable
                      onPress={() => router.push('/portfolio')}
                      className="flex-1 bg-cyan-600/20 rounded-xl p-4 items-center"
                    >
                      <Briefcase size={24} color="#06b6d4" />
                      <Text className="text-cyan-400 text-xs mt-2 text-center">
                        {language === 'ar' ? 'المحفظة' : 'Portfolio'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => router.push('/contract-review')}
                      className="flex-1 bg-indigo-600/20 rounded-xl p-4 items-center"
                    >
                      <FileSearch size={24} color="#818cf8" />
                      <Text className="text-indigo-400 text-xs mt-2 text-center">
                        {language === 'ar' ? 'العقود' : 'Contracts'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => router.push('/market')}
                      className="flex-1 bg-amber-600/20 rounded-xl p-4 items-center"
                    >
                      <TrendingUp size={24} color="#f59e0b" />
                      <Text className="text-amber-400 text-xs mt-2 text-center">
                        {language === 'ar' ? 'الأسواق' : 'Market'}
                      </Text>
                    </Pressable>
                  </View>
                </Animated.View>

                {/* 5. Alerts & Reminders */}
                {alerts.length > 0 && (
                  <Animated.View
                    entering={FadeInUp.delay(350).springify()}
                    className="mt-4"
                  >
                    <View className="bg-slate-900/50 rounded-2xl p-5">
                      <View className={`flex-row items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Bell size={20} color="#f59e0b" />
                          <Text className={`text-white font-semibold ${isRTL ? 'mr-2' : 'ml-2'}`}>
                            {language === 'ar' ? 'تنبيهات' : 'Alerts'}
                          </Text>
                        </View>
                        <Pressable onPress={() => router.push('/alerts')}>
                          <Text className="text-indigo-400 text-sm">
                            {language === 'ar' ? 'عرض الكل' : 'View All'}
                          </Text>
                        </Pressable>
                      </View>

                      {alerts.slice(0, 3).map((alert, index) => (
                        <View
                          key={alert.id}
                          className={`flex-row items-start py-3 ${index > 0 ? 'border-t border-slate-800' : ''} ${isRTL ? 'flex-row-reverse' : ''}`}
                        >
                          <View className={`w-2 h-2 rounded-full mt-1.5 ${!alert.isRead ? 'bg-amber-500' : 'bg-slate-600'}`} />
                          <View className={`flex-1 ${isRTL ? 'mr-3' : 'ml-3'}`}>
                            <Text className={`text-white text-sm ${isRTL ? 'text-right' : ''}`}>
                              {language === 'ar' ? alert.titleAr : alert.title}
                            </Text>
                            <Text className={`text-slate-400 text-xs mt-1 ${isRTL ? 'text-right' : ''}`}>
                              {language === 'ar' ? alert.messageAr : alert.message}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </Animated.View>
                )}

                {/* 6. Financial Goals */}
                <Animated.View
                  entering={FadeInUp.delay(450).springify()}
                  className="mt-4"
                >
                  <View className="bg-slate-900/50 rounded-2xl p-5">
                    <View className={`flex-row items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Target size={20} color="#8b5cf6" />
                        <Text className={`text-white font-semibold ${isRTL ? 'mr-2' : 'ml-2'}`}>
                          {language === 'ar' ? 'الأهداف المالية' : 'Financial Goals'}
                        </Text>
                      </View>
                      <Pressable onPress={() => router.push('/goals')}>
                        <Plus size={20} color="#8b5cf6" />
                      </Pressable>
                    </View>

                    {financialGoals.length === 0 ? (
                      <View className="items-center py-6">
                        <Target size={40} color="#475569" />
                        <Text className="text-slate-400 text-sm mt-3 text-center">
                          {language === 'ar'
                            ? 'لم تحدد أهدافاً بعد'
                            : 'No goals set yet'}
                        </Text>
                        <Pressable
                          onPress={() => router.push('/goals')}
                          className="mt-3 bg-indigo-600/30 px-4 py-2 rounded-lg"
                        >
                          <Text className="text-indigo-400 text-sm">
                            {language === 'ar' ? 'إضافة هدف' : 'Add Goal'}
                          </Text>
                        </Pressable>
                      </View>
                    ) : (
                      financialGoals.slice(0, 3).map((goal, index) => {
                        const progress = (goal.currentAmount / goal.targetAmount) * 100;
                        const category = GOAL_CATEGORIES[goal.category];
                        return (
                          <View
                            key={goal.id}
                            className={`py-3 ${index > 0 ? 'border-t border-slate-800' : ''}`}
                          >
                            <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <Text className="text-lg">{goal.icon}</Text>
                                <View className={isRTL ? 'mr-2' : 'ml-2'}>
                                  <Text className={`text-white text-sm ${isRTL ? 'text-right' : ''}`}>
                                    {language === 'ar' ? goal.nameAr : goal.name}
                                  </Text>
                                  <Text className={`text-slate-400 text-xs ${isRTL ? 'text-right' : ''}`}>
                                    {language === 'ar' ? category.ar : category.en}
                                  </Text>
                                </View>
                              </View>
                              <Text className="text-white text-sm font-medium">
                                {progress.toFixed(0)}%
                              </Text>
                            </View>
                            <View className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                              <View
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${Math.min(100, progress)}%` }}
                              />
                            </View>
                            <Text className={`text-slate-400 text-xs mt-1 ${isRTL ? 'text-right' : ''}`}>
                              {currencySymbol}{goal.currentAmount.toLocaleString()} / {currencySymbol}{goal.targetAmount.toLocaleString()}
                            </Text>
                          </View>
                        );
                      })
                    )}
                  </View>
                </Animated.View>

                {/* 7. Trend Preview */}
                <Animated.View
                  entering={FadeInUp.delay(500).springify()}
                  className="mt-4"
                >
                  <View className="bg-slate-900/50 rounded-2xl p-5">
                    <View className={`flex-row items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <BarChart3 size={20} color="#10b981" />
                        <Text className={`text-white font-semibold ${isRTL ? 'mr-2' : 'ml-2'}`}>
                          {language === 'ar' ? 'تحليل الاتجاهات' : 'Trend Analysis'}
                        </Text>
                      </View>
                      <Pressable onPress={() => router.push('/trends')}>
                        <ChevronRight size={20} color="#64748b" />
                      </Pressable>
                    </View>

                    {/* Simple trend bars */}
                    <View className="flex-row items-end justify-between h-24 mb-2">
                      {[65, 70, 68, 75, 80, 78, 85, 90, 88, 95, 92, 100].map((value, index) => (
                        <View
                          key={index}
                          className="flex-1 mx-0.5 bg-emerald-500/50 rounded-t"
                          style={{ height: `${value}%` }}
                        />
                      ))}
                    </View>
                    <Text className="text-slate-400 text-xs text-center">
                      {language === 'ar' ? 'آخر 12 شهر' : 'Last 12 months'}
                    </Text>

                    {/* Net worth change */}
                    <View className="mt-4 flex-row items-center justify-center">
                      <TrendingUp size={16} color="#10b981" />
                      <Text className="text-emerald-400 text-sm font-medium ml-2">
                        +12.5% {language === 'ar' ? 'هذا العام' : 'this year'}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              </View>
            </View>

            {/* 8. Zakat Distribution Planner Preview */}
            <Animated.View
              entering={FadeInUp.delay(550).springify()}
              className="mt-4"
            >
              <Pressable
                onPress={() => router.push('/zakat-distribution')}
                className="bg-gradient-to-r from-emerald-900/50 to-indigo-900/50 rounded-2xl p-5"
              >
                <LinearGradient
                  colors={['rgba(6, 78, 59, 0.5)', 'rgba(49, 46, 129, 0.5)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 16, padding: 20, position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                />
                <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <View>
                    <Text className={`text-white font-semibold text-lg ${isRTL ? 'text-right' : ''}`}>
                      {language === 'ar' ? 'مخطط توزيع الزكاة' : 'Zakat Distribution Planner'}
                    </Text>
                    <Text className={`text-slate-300 text-sm mt-1 ${isRTL ? 'text-right' : ''}`}>
                      {language === 'ar' ? 'وزّع زكاتك على 8 مصارف شرعية' : 'Allocate to 8 eligible categories'}
                    </Text>
                  </View>
                  <ChevronRight size={24} color="white" />
                </View>
                <View className="flex-row flex-wrap gap-2 mt-4">
                  {Object.entries(ZAKAT_CATEGORIES).slice(0, 4).map(([key, cat]) => (
                    <View key={key} className="bg-white/10 rounded-lg px-2 py-1 flex-row items-center">
                      <Text className="text-sm">{cat.icon}</Text>
                      <Text className="text-white text-xs ml-1">
                        {language === 'ar' ? cat.ar : cat.en}
                      </Text>
                    </View>
                  ))}
                  <View className="bg-white/10 rounded-lg px-2 py-1">
                    <Text className="text-white text-xs">+4 more</Text>
                  </View>
                </View>
              </Pressable>
            </Animated.View>

            {/* 9. Knowledge Corner (Coming Soon) */}
            <Animated.View
              entering={FadeInUp.delay(600).springify()}
              className="mt-4 mb-8"
            >
              <View className="bg-slate-900/30 rounded-2xl p-5 border border-dashed border-slate-700">
                <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <View className="w-12 h-12 rounded-full bg-indigo-600/20 items-center justify-center">
                    <Text className="text-2xl">📚</Text>
                  </View>
                  <View className={`flex-1 ${isRTL ? 'mr-4' : 'ml-4'}`}>
                    <Text className={`text-white font-semibold ${isRTL ? 'text-right' : ''}`}>
                      {language === 'ar' ? 'ركن المعرفة' : 'Knowledge Corner'}
                    </Text>
                    <Text className={`text-slate-400 text-sm ${isRTL ? 'text-right' : ''}`}>
                      {language === 'ar' ? 'دورات التمويل الإسلامي والفتاوى' : 'Islamic finance courses & fatwas'}
                    </Text>
                  </View>
                  <View className="bg-indigo-600/30 px-3 py-1 rounded-full">
                    <Text className="text-indigo-400 text-xs">
                      {language === 'ar' ? 'قريباً' : 'Coming Soon'}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
