import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Share, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { ArrowLeft, Share2, Trash2, CheckCircle, XCircle, RefreshCcw, Building2, Save, Check, LayoutDashboard, History } from 'lucide-react-native';
import { useLanguageStore, useSettingsStore, useBusinessCalculatorStore, useZakatHistoryStore, getHijriDate, getHijriYear } from '@/lib/store';
import { useTranslation } from '@/lib/translations';

export default function BusinessResultsScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);

  const country = useSettingsStore((s) => s.country);
  const nisabThreshold = useSettingsStore((s) => s.nisabThreshold);
  const calendarType = useSettingsStore((s) => s.calendarType);

  const assets = useBusinessCalculatorStore((s) => s.assets);
  const getTotalZakatable = useBusinessCalculatorStore((s) => s.getTotalZakatable);
  const getTotalDeductible = useBusinessCalculatorStore((s) => s.getTotalDeductible);
  const getTotalExempt = useBusinessCalculatorStore((s) => s.getTotalExempt);
  const getZakatDue = useBusinessCalculatorStore((s) => s.getZakatDue);
  const resetCalculator = useBusinessCalculatorStore((s) => s.resetCalculator);

  const addEntry = useZakatHistoryStore((s) => s.addEntry);
  const historyEntries = useZakatHistoryStore((s) => s.entries);

  const [showClearModal, setShowClearModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const currencySymbol = country?.currencySymbol ?? '$';
  const totalZakatable = getTotalZakatable();
  const totalDeductible = getTotalDeductible();
  const totalExempt = getTotalExempt();
  const netWealth = totalZakatable - totalDeductible;
  const meetsNisab = netWealth >= nisabThreshold;
  const zakatDue = getZakatDue(nisabThreshold, calendarType);
  const zakatRate = calendarType === 'islamic' ? '2.5%' : '2.577%';

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Barakah Balance - Business Zakat Calculation\n\nCompany: ${assets.companyName}\nIndustry: ${assets.industryType}\n\nTotal Zakatable Assets: ${currencySymbol}${totalZakatable.toLocaleString()}\nTotal Deductible Liabilities: ${currencySymbol}${totalDeductible.toLocaleString()}\nNet Zakatable Wealth: ${currencySymbol}${netWealth.toLocaleString()}\nNisab Threshold: ${currencySymbol}${nisabThreshold.toLocaleString()}\n\nZakat Due (${zakatRate}): ${currencySymbol}${zakatDue.toLocaleString()}\n\nCalculated using Barakah Balance following AAOIFI standards`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleClearData = () => {
    resetCalculator();
    setShowClearModal(false);
    router.replace('/calculator-type');
  };

  const handleStartOver = () => {
    router.replace('/business/welcome');
  };

  const handleSaveToHistory = () => {
    if (saved) return;

    addEntry({
      date: new Date().toISOString(),
      hijriDate: getHijriDate(),
      year: new Date().getFullYear(),
      hijriYear: getHijriYear(),
      label: assets.companyName || 'Business Calculation',
      type: 'business',
      totalAssets: totalZakatable,
      totalDeductions: totalDeductible,
      netWealth,
      nisabThreshold,
      zakatDue,
      currency: country?.currency || 'USD',
      currencySymbol,
      calendarType,
      meetsNisab,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleViewHistory = () => {
    router.push('/zakat-history');
  };

  // Group line items by classification
  const zakatableItems = assets.lineItems.filter((i) => i.classification === 'zakatable');
  const deductibleItems = assets.lineItems.filter((i) => i.classification === 'deductible');
  const exemptItems = assets.lineItems.filter((i) => i.classification === 'exempt');
  const notDeductibleItems = assets.lineItems.filter((i) => i.classification === 'not_deductible');

  return (
    <View className="flex-1 bg-indigo-950">
      <LinearGradient
        colors={['#312e81', '#1e1b4b', '#0f0a1e']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className={`px-6 pt-4 flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Pressable
              onPress={handleBack}
              className={`p-2 rounded-full bg-white/10 active:bg-white/20 ${isRTL ? 'ml-4' : 'mr-4'}`}
            >
              <ArrowLeft
                size={24}
                color="white"
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              />
            </Pressable>
            <Text className="text-white text-lg font-semibold">
              {t('results')}
            </Text>
          </View>
          <Pressable
            onPress={handleShare}
            className="p-2 rounded-full bg-white/10 active:bg-white/20"
          >
            <Share2 size={20} color="white" />
          </Pressable>
        </Animated.View>

        <ScrollView
          className="flex-1 mt-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Company Info */}
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            className="mx-6 mb-4"
          >
            <View className="bg-indigo-900/50 rounded-xl p-4 flex-row items-center">
              <Building2 size={24} color="#a5b4fc" />
              <View className="ml-3">
                <Text className="text-white font-semibold">{assets.companyName}</Text>
                <Text className="text-indigo-300 text-sm capitalize">{assets.industryType}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Zakat Result Card */}
          <Animated.View
            entering={ZoomIn.delay(300).springify()}
            className="mx-6 mb-6"
          >
            <LinearGradient
              colors={meetsNisab ? ['#6366f1', '#4f46e5'] : ['#374151', '#1f2937']}
              style={{ borderRadius: 24, padding: 24, alignItems: 'center' }}
            >
              {meetsNisab ? (
                <CheckCircle size={48} color="#c7d2fe" />
              ) : (
                <XCircle size={48} color="#9ca3af" />
              )}
              <Text className="text-white/80 text-sm mt-4">
                {t('zakatDue')}
              </Text>
              <Text className="text-white text-4xl font-bold mt-2">
                {currencySymbol} {zakatDue.toLocaleString()}
              </Text>
              <View className="flex-row items-center mt-2">
                <Text className={`${meetsNisab ? 'text-indigo-200' : 'text-gray-400'} text-sm`}>
                  {t('meetsNisab')}: {meetsNisab ? t('yes') : t('no')} | Rate: {zakatRate}
                </Text>
              </View>

              {!meetsNisab && (
                <View className="mt-4 bg-black/20 rounded-xl p-3">
                  <Text className="text-gray-300 text-center text-sm">
                    {t('noZakatMessage')}
                  </Text>
                  <Text className="text-gray-400 text-center text-xs mt-2">
                    {t('encourageCharity')}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Summary Cards */}
          <Animated.View
            entering={FadeInUp.delay(400).springify()}
            className="mx-6 mb-4"
          >
            <View className="flex-row gap-3">
              <View className="flex-1 bg-emerald-900/50 rounded-xl p-4">
                <Text className="text-emerald-400 text-xs">{t('totalZakatable')}</Text>
                <Text className="text-white text-lg font-bold mt-1">
                  {currencySymbol} {totalZakatable.toLocaleString()}
                </Text>
              </View>
              <View className="flex-1 bg-blue-900/50 rounded-xl p-4">
                <Text className="text-blue-400 text-xs">{t('totalDeductibleItems')}</Text>
                <Text className="text-white text-lg font-bold mt-1">
                  -{currencySymbol} {totalDeductible.toLocaleString()}
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(500).springify()}
            className="mx-6 mb-6"
          >
            <View className="flex-row gap-3">
              <View className="flex-1 bg-indigo-800/50 rounded-xl p-4">
                <Text className="text-indigo-300 text-xs">{t('netWealth')}</Text>
                <Text className="text-white text-lg font-bold mt-1">
                  {currencySymbol} {netWealth.toLocaleString()}
                </Text>
              </View>
              <View className="flex-1 bg-amber-900/30 rounded-xl p-4">
                <Text className="text-amber-400 text-xs">{t('nisabThreshold')}</Text>
                <Text className="text-white text-lg font-bold mt-1">
                  {currencySymbol} {nisabThreshold.toLocaleString()}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Breakdown by Classification */}
          {zakatableItems.length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(600).springify()}
              className="mx-6 mb-4"
            >
              <Text className="text-emerald-400 font-semibold mb-2">
                {t('zakatable')} ({zakatableItems.length})
              </Text>
              <View className="bg-emerald-900/30 rounded-xl overflow-hidden">
                {zakatableItems.map((item, index) => (
                  <View
                    key={item.id}
                    className={`flex-row items-center justify-between p-3 ${
                      index < zakatableItems.length - 1 ? 'border-b border-emerald-800/30' : ''
                    }`}
                  >
                    <Text className="text-white">{item.name}</Text>
                    <Text className="text-emerald-300">
                      {currencySymbol} {(item.marketValue ?? item.amount).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {deductibleItems.length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(650).springify()}
              className="mx-6 mb-4"
            >
              <Text className="text-blue-400 font-semibold mb-2">
                {t('deductible')} ({deductibleItems.length})
              </Text>
              <View className="bg-blue-900/30 rounded-xl overflow-hidden">
                {deductibleItems.map((item, index) => (
                  <View
                    key={item.id}
                    className={`flex-row items-center justify-between p-3 ${
                      index < deductibleItems.length - 1 ? 'border-b border-blue-800/30' : ''
                    }`}
                  >
                    <Text className="text-white">{item.name}</Text>
                    <Text className="text-blue-300">
                      -{currencySymbol} {item.amount.toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {exemptItems.length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(700).springify()}
              className="mx-6 mb-4"
            >
              <Text className="text-gray-400 font-semibold mb-2">
                {t('exempt')} ({exemptItems.length})
              </Text>
              <View className="bg-gray-800/30 rounded-xl overflow-hidden">
                {exemptItems.map((item, index) => (
                  <View
                    key={item.id}
                    className={`flex-row items-center justify-between p-3 ${
                      index < exemptItems.length - 1 ? 'border-b border-gray-700/30' : ''
                    }`}
                  >
                    <Text className="text-white">{item.name}</Text>
                    <Text className="text-gray-400">
                      {currencySymbol} {item.amount.toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {notDeductibleItems.length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(750).springify()}
              className="mx-6 mb-4"
            >
              <Text className="text-red-400 font-semibold mb-2">
                {t('notDeductible')} ({notDeductibleItems.length})
              </Text>
              <View className="bg-red-900/30 rounded-xl overflow-hidden">
                {notDeductibleItems.map((item, index) => (
                  <View
                    key={item.id}
                    className={`flex-row items-center justify-between p-3 ${
                      index < notDeductibleItems.length - 1 ? 'border-b border-red-800/30' : ''
                    }`}
                  >
                    <Text className="text-white">{item.name}</Text>
                    <Text className="text-red-300">
                      {currencySymbol} {item.amount.toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* AAOIFI Note */}
          <Animated.View
            entering={FadeInUp.delay(800).springify()}
            className="mx-6 mt-4 mb-6"
          >
            <View className="bg-indigo-900/30 rounded-xl p-4 border border-indigo-700/50">
              <Text className="text-indigo-300 text-xs text-center">
                This calculation follows AAOIFI FAS 9 Islamic accounting standards for Zakat.
                For complex business structures, please consult a qualified Islamic scholar.
              </Text>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            entering={FadeInUp.delay(850).springify()}
            className="mx-6 gap-3"
          >
            {/* Save to History Button */}
            <Pressable
              onPress={handleSaveToHistory}
              className="bg-emerald-600 rounded-xl p-4 flex-row items-center justify-center active:bg-emerald-700"
            >
              {saved ? (
                <Check size={20} color="white" />
              ) : (
                <Save size={20} color="white" />
              )}
              <Text className="text-white font-bold ml-2">
                {saved ? 'Saved to History!' : 'Save to Profile'}
              </Text>
            </Pressable>

            {/* View History Button */}
            {historyEntries.length > 0 && (
              <Pressable
                onPress={handleViewHistory}
                className="bg-indigo-800/50 rounded-xl p-4 flex-row items-center justify-center active:bg-indigo-800"
              >
                <History size={20} color="#c7d2fe" />
                <Text className="text-indigo-200 font-medium ml-2">
                  View History ({historyEntries.length})
                </Text>
              </Pressable>
            )}

            {/* Go to Dashboard Button */}
            <Pressable
              onPress={handleGoToDashboard}
              className="bg-indigo-600 rounded-xl p-4 flex-row items-center justify-center active:bg-indigo-700"
            >
              <LayoutDashboard size={20} color="white" />
              <Text className="text-white font-bold ml-2">
                Go to Dashboard
              </Text>
            </Pressable>

            <Pressable
              onPress={handleStartOver}
              className="bg-indigo-800/50 rounded-xl p-4 flex-row items-center justify-center active:bg-indigo-800"
            >
              <RefreshCcw size={20} color="#c7d2fe" />
              <Text className="text-indigo-200 font-medium ml-2">
                {t('startOver')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowClearModal(true)}
              className="bg-red-900/30 rounded-xl p-4 flex-row items-center justify-center active:bg-red-900/50"
            >
              <Trash2 size={20} color="#fca5a5" />
              <Text className="text-red-300 font-medium ml-2">
                {t('clearAll')}
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>

        {/* Clear Confirmation Modal */}
        <Modal
          visible={showClearModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowClearModal(false)}
        >
          <View className="flex-1 bg-black/70 justify-center px-6">
            <View className="bg-indigo-900 rounded-2xl p-6">
              <Text className="text-white text-xl font-bold mb-4 text-center">
                {t('confirmClear')}
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setShowClearModal(false)}
                  className="flex-1 bg-indigo-800 rounded-xl py-3"
                >
                  <Text className="text-white text-center font-medium">{t('cancel')}</Text>
                </Pressable>
                <Pressable
                  onPress={handleClearData}
                  className="flex-1 bg-red-600 rounded-xl py-3"
                >
                  <Text className="text-white text-center font-bold">{t('confirm')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
