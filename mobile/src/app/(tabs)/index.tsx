import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  Calculator,
  FileSearch,
  TrendingUp,
  Calendar,
  Wallet,
  Building2,
  ChevronRight,
  Plus,
  Clock,
  ScanSearch,
} from 'lucide-react-native';
import { useLanguageStore, useSettingsStore, useIndividualCalculatorStore } from '@/lib/store';
import { useAppStore } from '@/lib/app-store';

export default function HomeTab() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const isRTL = useLanguageStore((s) => s.isRTL);
  const country = useSettingsStore((s) => s.country);
  const nisab = useSettingsStore((s) => s.nisabThreshold);
  const getTotalAssets = useIndividualCalculatorStore((s) => s.getTotalAssets);
  const getZakatDue = useIndividualCalculatorStore((s) => s.getZakatDue);
  const calendarType = useSettingsStore((s) => s.calendarType);

  const hawlStartDate = useAppStore((s) => s.hawlStartDate);
  const companies = useAppStore((s) => s.companies);
  const accountType = useAppStore((s) => s.accountType);
  const activeEntityId = useAppStore((s) => s.activeEntityId);
  const setActiveEntity = useAppStore((s) => s.setActiveEntity);
  const zakatRecords = useAppStore((s) => s.zakatRecords);

  const currencySymbol = country?.currencySymbol ?? '$';
  const totalAssets = getTotalAssets();
  const zakatResult = getZakatDue(nisab, calendarType);
  const zakatDue = zakatResult.total;
  const aboveNisab = totalAssets >= nisab;

  // Hawl countdown
  const daysUntilHawl = useMemo(() => {
    if (!hawlStartDate) return 0;
    const start = new Date(hawlStartDate);
    const hawlEnd = new Date(start);
    hawlEnd.setDate(hawlEnd.getDate() + 354); // Lunar year
    // If hawl already passed, calculate next one
    const now = new Date();
    while (hawlEnd < now) {
      hawlEnd.setDate(hawlEnd.getDate() + 354);
    }
    const diff = hawlEnd.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [hawlStartDate]);

  const hawlProgress = Math.max(0, Math.min(1, (354 - daysUntilHawl) / 354));

  // Entity tabs (Personal + companies)
  const entities = [
    { id: null, name: language === 'ar' ? 'شخصي' : 'Personal' },
    ...companies.map((c) => ({ id: c.id, name: c.name })),
  ];

  return (
    <View className="flex-1 bg-emerald-950">
      <LinearGradient
        colors={['#064e3b', '#022c22', '#011311']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            className="px-6 pt-4 pb-2"
          >
            <Text className="text-emerald-400 text-sm font-medium">
              {language === 'ar' ? 'ميزان البركة' : 'Barakah Balance'}
            </Text>
            <Text className="text-white text-2xl font-bold mt-1">
              {language === 'ar' ? 'مرحباً' : 'Welcome'}
            </Text>
          </Animated.View>

          {/* Entity Toggle */}
          {(companies.length > 0 || accountType === 'individual') && (
            <Animated.View entering={FadeInDown.delay(150).springify()} className="px-6 mt-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                {entities.map((entity) => (
                  <Pressable
                    key={entity.id ?? 'personal'}
                    onPress={() => setActiveEntity(entity.id)}
                    className={`mr-2 px-4 py-2 rounded-full border ${
                      activeEntityId === entity.id
                        ? 'bg-emerald-600 border-emerald-500'
                        : 'bg-emerald-900/40 border-emerald-700/50'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        activeEntityId === entity.id ? 'text-white' : 'text-emerald-300/60'
                      }`}
                    >
                      {entity.name}
                    </Text>
                  </Pressable>
                ))}
                {accountType === 'individual' && (
                  <Pressable
                    onPress={() => router.push('/(tabs)/zakat')}
                    className="mr-2 px-3 py-2 rounded-full border border-dashed border-emerald-700/50 flex-row items-center"
                  >
                    <Plus size={14} color="#6ee7b7" />
                    <Text className="text-emerald-300/60 text-sm ml-1">
                      {language === 'ar' ? 'شركة' : 'Company'}
                    </Text>
                  </Pressable>
                )}
              </ScrollView>
            </Animated.View>
          )}

          {/* Zakat Status Card */}
          <Animated.View entering={FadeInUp.delay(200).springify()} className="mx-6 mt-5">
            <LinearGradient
              colors={['#059669', '#047857', '#065f46']}
              style={{ borderRadius: 20, padding: 24 }}
            >
              {/* Total Assets */}
              <View className="mb-4">
                <Text className="text-emerald-200/60 text-xs font-medium uppercase tracking-wider">
                  {language === 'ar' ? 'إجمالي الأصول' : 'Total Assets'}
                </Text>
                <Text className="text-white text-3xl font-bold mt-1">
                  {currencySymbol} {totalAssets.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </Text>
              </View>

              {/* Nisab Status */}
              <View className="bg-white/10 rounded-xl p-3 mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-emerald-100/80 text-xs">
                    {language === 'ar' ? 'النصاب' : 'Nisab Threshold'}
                  </Text>
                  <Text className="text-emerald-100 text-xs font-medium">
                    {currencySymbol} {nisab.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Text>
                </View>
                <View className="bg-white/20 rounded-full h-2 overflow-hidden">
                  <View
                    className={`h-full rounded-full ${aboveNisab ? 'bg-amber-400' : 'bg-emerald-300'}`}
                    style={{ width: `${Math.min(100, (totalAssets / Math.max(nisab, 1)) * 100)}%` }}
                  />
                </View>
                <Text className="text-emerald-100/60 text-xs mt-1">
                  {aboveNisab
                    ? language === 'ar'
                      ? 'فوق النصاب — الزكاة واجبة'
                      : 'Above Nisab — Zakat is due'
                    : language === 'ar'
                    ? 'تحت النصاب — لا زكاة مطلوبة'
                    : 'Below Nisab — No Zakat required'}
                </Text>
              </View>

              {/* Zakat Due + Hawl */}
              <View className="flex-row gap-3">
                <View className="flex-1 bg-white/10 rounded-xl p-3">
                  <Text className="text-emerald-200/60 text-xs">
                    {language === 'ar' ? 'الزكاة المستحقة' : 'Zakat Due'}
                  </Text>
                  <Text className="text-white text-lg font-bold mt-1">
                    {currencySymbol} {zakatDue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Text>
                </View>
                <View className="flex-1 bg-white/10 rounded-xl p-3">
                  <Text className="text-emerald-200/60 text-xs">
                    {language === 'ar' ? 'الحول المتبقي' : 'Hawl Left'}
                  </Text>
                  <View className="flex-row items-end mt-1">
                    <Text className="text-white text-lg font-bold">{daysUntilHawl}</Text>
                    <Text className="text-emerald-200/60 text-xs mb-0.5 ml-1">
                      {language === 'ar' ? 'يوم' : 'days'}
                    </Text>
                  </View>
                  <View className="bg-white/20 rounded-full h-1.5 mt-2 overflow-hidden">
                    <View
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${hawlProgress * 100}%` }}
                    />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInUp.delay(300).springify()} className="mx-6 mt-6">
            <Text className="text-white text-base font-semibold mb-3">
              {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <Pressable
                onPress={() => router.push('/(tabs)/zakat')}
                className="bg-emerald-900/40 border border-emerald-700/40 rounded-2xl p-4 items-center"
                style={{ width: '47%' }}
              >
                <View className="w-12 h-12 rounded-xl bg-emerald-600/20 items-center justify-center mb-2">
                  <Calculator size={22} color="#34d399" />
                </View>
                <Text className="text-white text-xs font-medium text-center">
                  {language === 'ar' ? 'حساب الزكاة' : 'Calculate Zakat'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/(tabs)/screener')}
                className="bg-emerald-900/40 border border-emerald-700/40 rounded-2xl p-4 items-center"
                style={{ width: '47%' }}
              >
                <View className="w-12 h-12 rounded-xl bg-rose-600/20 items-center justify-center mb-2">
                  <ScanSearch size={22} color="#fb7185" />
                </View>
                <Text className="text-white text-xs font-medium text-center">
                  {language === 'ar' ? 'فحص منتج' : 'Screen Product'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/(tabs)/investments')}
                className="bg-emerald-900/40 border border-emerald-700/40 rounded-2xl p-4 items-center"
                style={{ width: '47%' }}
              >
                <View className="w-12 h-12 rounded-xl bg-amber-600/20 items-center justify-center mb-2">
                  <TrendingUp size={22} color="#fbbf24" />
                </View>
                <Text className="text-white text-xs font-medium text-center">
                  {language === 'ar' ? 'استثمارات حلال' : 'Halal Invest'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/(tabs)/contracts')}
                className="bg-emerald-900/40 border border-emerald-700/40 rounded-2xl p-4 items-center"
                style={{ width: '47%' }}
              >
                <View className="w-12 h-12 rounded-xl bg-indigo-600/20 items-center justify-center mb-2">
                  <FileSearch size={22} color="#818cf8" />
                </View>
                <Text className="text-white text-xs font-medium text-center">
                  {language === 'ar' ? 'مراجعة عقد' : 'Review Contract'}
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Recent Zakat History */}
          <Animated.View entering={FadeInUp.delay(400).springify()} className="mx-6 mt-6">
            <Text className="text-white text-base font-semibold mb-3">
              {language === 'ar' ? 'السجل' : 'History'}
            </Text>
            {zakatRecords.length === 0 ? (
              <View className="bg-emerald-900/30 rounded-2xl p-6 items-center border border-emerald-800/30">
                <Clock size={32} color="#6b7280" />
                <Text className="text-emerald-300/40 text-sm mt-3 text-center">
                  {language === 'ar'
                    ? 'لم يتم حساب الزكاة بعد.\nأدخل أصولك لحساب زكاتك.'
                    : 'No zakat calculations yet.\nEnter your assets to calculate your zakat.'}
                </Text>
              </View>
            ) : (
              zakatRecords.slice(0, 3).map((record, index) => (
                <View
                  key={record.id}
                  className="bg-emerald-900/30 rounded-xl p-4 mb-2 border border-emerald-800/30 flex-row items-center justify-between"
                >
                  <View>
                    <Text className="text-white text-sm font-medium">{record.entityName}</Text>
                    <Text className="text-emerald-300/50 text-xs mt-0.5">
                      {new Date(record.date).toLocaleDateString()} — {record.fiscalYear}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-emerald-400 text-sm font-bold">
                      {record.currency} {record.zakatDue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </Text>
                    <View className={`px-2 py-0.5 rounded-full mt-1 ${record.paid ? 'bg-emerald-600/30' : 'bg-amber-600/30'}`}>
                      <Text className={`text-xs ${record.paid ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {record.paid
                          ? language === 'ar' ? 'مدفوع' : 'Paid'
                          : language === 'ar' ? 'مستحق' : 'Due'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
