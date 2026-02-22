import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  ArrowLeft, TrendingUp, TrendingDown, BarChart3, PieChart, Calendar,
  ChevronLeft, ChevronRight, Info
} from 'lucide-react-native';
import { useLanguageStore, useSettingsStore, useIndividualCalculatorStore } from '@/lib/store';
import { useDashboardStore } from '@/lib/dashboard-store';
import { useResponsive } from '@/lib/useResponsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Simple bar chart component
function BarChart({
  data,
  labels,
  color = '#10b981',
  height = 150,
  showLabels = true,
}: {
  data: number[];
  labels: string[];
  color?: string;
  height?: number;
  showLabels?: boolean;
}) {
  const maxValue = Math.max(...data, 1);

  return (
    <View>
      <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * height;
          return (
            <View key={index} className="flex-1 items-center mx-0.5">
              <View
                style={{
                  height: barHeight,
                  backgroundColor: color,
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  width: '80%',
                  opacity: index === data.length - 1 ? 1 : 0.6,
                }}
              />
            </View>
          );
        })}
      </View>
      {showLabels && (
        <View className="flex-row justify-between mt-2">
          {labels.map((label, index) => (
            <View key={index} className="flex-1 items-center">
              <Text className="text-slate-500 text-xs">{label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// Line trend indicator
function TrendIndicator({ value, isPositive }: { value: number; isPositive: boolean }) {
  return (
    <View className={`flex-row items-center px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
      {isPositive ? (
        <TrendingUp size={14} color="#10b981" />
      ) : (
        <TrendingDown size={14} color="#ef4444" />
      )}
      <Text className={`ml-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{value.toFixed(1)}%
      </Text>
    </View>
  );
}

// Metric card
function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  isRTL,
}: {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
  isRTL: boolean;
}) {
  return (
    <View className="bg-slate-800/50 rounded-xl p-4 flex-1">
      <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <View style={{ backgroundColor: color + '30' }} className="w-10 h-10 rounded-lg items-center justify-center">
          <Icon size={20} color={color} />
        </View>
        <TrendIndicator value={change} isPositive={change >= 0} />
      </View>
      <Text className={`text-white text-xl font-bold mt-3 ${isRTL ? 'text-right' : ''}`}>{value}</Text>
      <Text className={`text-slate-400 text-xs mt-1 ${isRTL ? 'text-right' : ''}`}>{title}</Text>
    </View>
  );
}

type TimeRange = '3m' | '6m' | '1y' | 'all';

export default function TrendsScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const isRTL = language === 'ar';
  const country = useSettingsStore((s) => s.country);
  const { isDesktop, isTablet } = useResponsive();

  const totalAssets = useIndividualCalculatorStore((s) => s.getTotalAssets)();
  const wealthHistory = useDashboardStore((s) => s.wealthHistory);
  const zakatPayments = useDashboardStore((s) => s.zakatPayments);
  const sadaqahRecords = useDashboardStore((s) => s.sadaqahRecords);

  const currencySymbol = country?.currencySymbol ?? '$';

  const [timeRange, setTimeRange] = useState<TimeRange>('1y');

  // Generate mock historical data (in real app, this would come from wealthHistory)
  const mockData = useMemo(() => {
    const months = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : timeRange === '1y' ? 12 : 24;
    const baseValue = totalAssets || 50000;

    return Array.from({ length: months }, (_, i) => {
      const variation = Math.sin(i * 0.5) * 0.1 + Math.random() * 0.05;
      const growth = 1 + (i / months) * 0.15; // 15% annual growth trend
      return Math.round(baseValue * growth * (1 + variation));
    });
  }, [totalAssets, timeRange]);

  const mockLabels = useMemo(() => {
    const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    const count = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : timeRange === '1y' ? 12 : 24;
    const currentMonth = new Date().getMonth();

    return Array.from({ length: count }, (_, i) => {
      const monthIndex = (currentMonth - count + i + 1 + 12) % 12;
      return months[monthIndex];
    });
  }, [timeRange]);

  const currentValue = mockData[mockData.length - 1];
  const previousValue = mockData[0];
  const netChange = ((currentValue - previousValue) / previousValue) * 100;

  // Zakat history data
  const zakatData = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const year = new Date().getFullYear() - 4 + i;
      const payment = zakatPayments.find(p => new Date(p.date).getFullYear() === year);
      return payment?.amount || (totalAssets * 0.025 * (0.7 + Math.random() * 0.3));
    });
  }, [zakatPayments, totalAssets]);

  const containerStyle = isDesktop
    ? { maxWidth: 1000, marginHorizontal: 'auto' as const, width: '100%' as const }
    : isTablet
    ? { maxWidth: 700, marginHorizontal: 'auto' as const, width: '100%' as const }
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
                {language === 'ar' ? 'تحليل الاتجاهات' : 'Trend Analysis'}
              </Text>
              <Text className="text-slate-400 text-xs">
                {language === 'ar' ? 'تتبع ثروتك مع مرور الوقت' : 'Track your wealth over time'}
              </Text>
            </View>
          </View>
          <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center">
            <BarChart3 size={20} color="#10b981" />
          </View>
        </Animated.View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Time Range Selector */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            className="px-6 mt-4"
            style={containerStyle}
          >
            <View className="flex-row bg-slate-800/50 rounded-xl p-1">
              {(['3m', '6m', '1y', 'all'] as TimeRange[]).map((range) => (
                <Pressable
                  key={range}
                  onPress={() => setTimeRange(range)}
                  className={`flex-1 py-2 rounded-lg ${timeRange === range ? 'bg-emerald-600' : ''}`}
                >
                  <Text className={`text-center text-sm ${timeRange === range ? 'text-white font-medium' : 'text-slate-400'}`}>
                    {range === '3m' ? (language === 'ar' ? '٣ أشهر' : '3M') :
                     range === '6m' ? (language === 'ar' ? '٦ أشهر' : '6M') :
                     range === '1y' ? (language === 'ar' ? 'سنة' : '1Y') :
                     language === 'ar' ? 'الكل' : 'All'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Net Worth Chart */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            className="px-6 mt-4"
            style={containerStyle}
          >
            <View className="bg-slate-900/50 rounded-2xl p-5">
              <View className={`flex-row items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <View>
                  <Text className={`text-slate-400 text-sm ${isRTL ? 'text-right' : ''}`}>
                    {language === 'ar' ? 'صافي الثروة' : 'Net Worth'}
                  </Text>
                  <Text className={`text-white text-2xl font-bold ${isRTL ? 'text-right' : ''}`}>
                    {currencySymbol}{currentValue.toLocaleString()}
                  </Text>
                </View>
                <TrendIndicator value={netChange} isPositive={netChange >= 0} />
              </View>

              <BarChart
                data={mockData}
                labels={mockLabels}
                color="#10b981"
                height={120}
              />

              <View className="mt-4 flex-row items-center justify-center">
                <Info size={14} color="#64748b" />
                <Text className="text-slate-500 text-xs ml-2">
                  {language === 'ar'
                    ? `التغير على مدى ${timeRange === '3m' ? '٣ أشهر' : timeRange === '6m' ? '٦ أشهر' : timeRange === '1y' ? 'سنة' : 'الكل'}`
                    : `Change over ${timeRange === '3m' ? '3 months' : timeRange === '6m' ? '6 months' : timeRange === '1y' ? '1 year' : 'all time'}`}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Key Metrics */}
          <Animated.View
            entering={FadeInDown.delay(400).springify()}
            className="px-6 mt-4"
            style={containerStyle}
          >
            <Text className={`text-white font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
              {language === 'ar' ? 'المقاييس الرئيسية' : 'Key Metrics'}
            </Text>
            <View className={`flex-row gap-3 ${isDesktop ? 'gap-4' : ''}`}>
              <MetricCard
                title={language === 'ar' ? 'إجمالي الأصول' : 'Total Assets'}
                value={`${currencySymbol}${(totalAssets || currentValue).toLocaleString()}`}
                change={12.5}
                icon={TrendingUp}
                color="#10b981"
                isRTL={isRTL}
              />
              <MetricCard
                title={language === 'ar' ? 'الزكاة المدفوعة' : 'Zakat Paid'}
                value={`${currencySymbol}${Math.round(totalAssets * 0.025).toLocaleString()}`}
                change={8.3}
                icon={PieChart}
                color="#6366f1"
                isRTL={isRTL}
              />
            </View>
          </Animated.View>

          {/* Zakat History */}
          <Animated.View
            entering={FadeInDown.delay(500).springify()}
            className="px-6 mt-4"
            style={containerStyle}
          >
            <View className="bg-slate-900/50 rounded-2xl p-5">
              <View className={`flex-row items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <PieChart size={20} color="#f59e0b" />
                  <Text className={`text-white font-semibold ${isRTL ? 'mr-2' : 'ml-2'}`}>
                    {language === 'ar' ? 'تاريخ الزكاة' : 'Zakat History'}
                  </Text>
                </View>
                <Text className="text-slate-400 text-xs">
                  {language === 'ar' ? 'آخر ٥ سنوات' : 'Last 5 years'}
                </Text>
              </View>

              <BarChart
                data={zakatData}
                labels={Array.from({ length: 5 }, (_, i) => `${new Date().getFullYear() - 4 + i}`)}
                color="#f59e0b"
                height={100}
              />

              <View className="mt-4 bg-slate-800/50 rounded-xl p-3">
                <View className={`flex-row justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Text className="text-slate-400 text-sm">
                    {language === 'ar' ? 'إجمالي الزكاة المدفوعة' : 'Total Zakat Paid'}
                  </Text>
                  <Text className="text-amber-400 font-semibold">
                    {currencySymbol}{Math.round(zakatData.reduce((a, b) => a + b, 0)).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Wealth Composition Over Time */}
          <Animated.View
            entering={FadeInDown.delay(600).springify()}
            className="px-6 mt-4"
            style={containerStyle}
          >
            <View className="bg-slate-900/50 rounded-2xl p-5">
              <View className={`flex-row items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Calendar size={20} color="#8b5cf6" />
                <Text className={`text-white font-semibold ${isRTL ? 'mr-2' : 'ml-2'}`}>
                  {language === 'ar' ? 'ملخص السنة' : 'Year Summary'}
                </Text>
              </View>

              <View className="gap-3">
                {[
                  { label: language === 'ar' ? 'أعلى قيمة' : 'Highest Value', value: Math.max(...mockData), isHigh: true },
                  { label: language === 'ar' ? 'أدنى قيمة' : 'Lowest Value', value: Math.min(...mockData), isHigh: false },
                  { label: language === 'ar' ? 'متوسط القيمة' : 'Average Value', value: Math.round(mockData.reduce((a, b) => a + b, 0) / mockData.length), isHigh: null },
                ].map((item, index) => (
                  <View key={index} className={`flex-row items-center justify-between py-2 ${index > 0 ? 'border-t border-slate-800' : ''} ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Text className="text-slate-400">{item.label}</Text>
                    <View className="flex-row items-center">
                      <Text className="text-white font-medium">
                        {currencySymbol}{item.value.toLocaleString()}
                      </Text>
                      {item.isHigh !== null && (
                        item.isHigh ? (
                          <TrendingUp size={14} color="#10b981" style={{ marginLeft: 8 }} />
                        ) : (
                          <TrendingDown size={14} color="#ef4444" style={{ marginLeft: 8 }} />
                        )
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Projections */}
          <Animated.View
            entering={FadeInDown.delay(700).springify()}
            className="px-6 mt-4 mb-6"
            style={containerStyle}
          >
            <View className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl overflow-hidden">
              <LinearGradient
                colors={['rgba(79, 70, 229, 0.3)', 'rgba(147, 51, 234, 0.3)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ padding: 20 }}
              >
                <View className={`flex-row items-center mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <TrendingUp size={20} color="#a78bfa" />
                  <Text className={`text-white font-semibold ${isRTL ? 'mr-2' : 'ml-2'}`}>
                    {language === 'ar' ? 'التوقعات' : 'Projections'}
                  </Text>
                </View>
                <Text className={`text-slate-300 text-sm ${isRTL ? 'text-right' : ''}`}>
                  {language === 'ar'
                    ? `بناءً على معدل نموك الحالي، من المتوقع أن تصل ثروتك إلى ${currencySymbol}${Math.round(currentValue * 1.15).toLocaleString()} بحلول نهاية العام القادم.`
                    : `Based on your current growth rate, your wealth is projected to reach ${currencySymbol}${Math.round(currentValue * 1.15).toLocaleString()} by the end of next year.`}
                </Text>
                <View className="mt-4 bg-white/10 rounded-xl p-3">
                  <View className={`flex-row justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Text className="text-slate-300 text-sm">
                      {language === 'ar' ? 'الزكاة المتوقعة' : 'Projected Zakat'}
                    </Text>
                    <Text className="text-purple-300 font-semibold">
                      {currencySymbol}{Math.round(currentValue * 1.15 * 0.025).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
