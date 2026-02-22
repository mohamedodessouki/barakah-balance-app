import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Share, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { ArrowLeft, Share2, Trash2, CheckCircle, XCircle, RefreshCcw, Copy, Check, Save, History, LayoutDashboard, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useLanguageStore, useSettingsStore, useIndividualCalculatorStore, useZakatHistoryStore, getHijriYear, getHijriDate } from '@/lib/store';
import { useTranslation } from '@/lib/translations';
import * as Clipboard from 'expo-clipboard';

export default function ResultsScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);

  const country = useSettingsStore((s) => s.country);
  const nisabThreshold = useSettingsStore((s) => s.nisabThreshold);
  const calendarType = useSettingsStore((s) => s.calendarType);

  const assets = useIndividualCalculatorStore((s) => s.assets);
  const getTotalAssets = useIndividualCalculatorStore((s) => s.getTotalAssets);
  const getTotalDeductions = useIndividualCalculatorStore((s) => s.getTotalDeductions);
  const getExtractedResourcesTotal = useIndividualCalculatorStore((s) => s.getExtractedResourcesTotal);
  const getZakatDue = useIndividualCalculatorStore((s) => s.getZakatDue);
  const resetCalculator = useIndividualCalculatorStore((s) => s.resetCalculator);

  const addHistoryEntry = useZakatHistoryStore((s) => s.addEntry);
  const historyEntries = useZakatHistoryStore((s) => s.entries);

  const [showClearModal, setShowClearModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const currencySymbol = country?.currencySymbol ?? '$';
  const totalAssets = getTotalAssets();
  const totalDeductions = getTotalDeductions();
  const extractedResources = getExtractedResourcesTotal();
  const netWealth = totalAssets - totalDeductions;
  const meetsNisab = netWealth >= nisabThreshold;
  const zakatResult = getZakatDue(nisabThreshold, calendarType);
  const zakatRate = calendarType === 'islamic' ? '2.5%' : '2.577%';

  const getShareMessage = () => {
    return `Barakah Balance - Zakat Calculation\n\nTotal Assets: ${currencySymbol}${totalAssets.toLocaleString()}\nTotal Deductions: ${currencySymbol}${totalDeductions.toLocaleString()}\nNet Zakatable Wealth: ${currencySymbol}${netWealth.toLocaleString()}\nNisab Threshold: ${currencySymbol}${nisabThreshold.toLocaleString()}\n\nZakat Due: ${currencySymbol}${zakatResult.total.toLocaleString()}\n\nCalculated using Barakah Balance`;
  };

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    const message = getShareMessage();

    // Check if Share is available (not supported on web)
    if (Platform.OS === 'web') {
      // Use clipboard on web
      try {
        await Clipboard.setStringAsync(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    } else {
      // Use native share on mobile
      try {
        await Share.share({ message });
      } catch (error) {
        // Fallback to clipboard if share fails
        try {
          await Clipboard.setStringAsync(message);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (clipError) {
          console.error('Error sharing:', error);
        }
      }
    }
  };

  const handleClearData = () => {
    resetCalculator();
    setShowClearModal(false);
    router.replace('/calculator-type');
  };

  const handleStartOver = () => {
    router.replace('/individual/welcome');
  };

  const handleSaveToHistory = () => {
    const now = new Date();
    const year = now.getFullYear();
    const hijriYear = getHijriYear();
    const hijriDate = getHijriDate();

    addHistoryEntry({
      date: now.toISOString(),
      hijriDate,
      year,
      hijriYear,
      label: `Zakat ${year} / ${hijriYear}`,
      type: 'individual',
      totalAssets,
      totalDeductions,
      netWealth,
      nisabThreshold,
      zakatDue: zakatResult.total,
      currency: country?.currency || 'USD',
      currencySymbol: country?.currencySymbol || '$',
      calendarType,
      meetsNisab,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleViewHistory = () => {
    router.push('/zakat-history');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  // Calculate category breakdowns with sub-items
  const categoryBreakdowns = [
    {
      name: t('categoryA'),
      value: assets.cashOnHand,
      icon: '💵',
      subItems: [{ name: t('cashOnHand'), value: assets.cashOnHand }].filter((i) => i.value > 0),
    },
    {
      name: t('categoryB'),
      value: assets.savingsAccount + assets.checkingAccount + assets.certificatesOfDeposit + assets.highYieldAccounts,
      icon: '🏦',
      subItems: [
        { name: t('savingsAccount'), value: assets.savingsAccount },
        { name: t('checkingAccount'), value: assets.checkingAccount },
        { name: t('certificatesOfDeposit'), value: assets.certificatesOfDeposit },
        { name: t('highYieldAccounts'), value: assets.highYieldAccounts },
      ].filter((i) => i.value > 0),
    },
    {
      name: t('categoryC'),
      value: assets.bonds + assets.sukuk + assets.tradingStocks + assets.mutualFunds + assets.etfs + assets.trustFunds,
      icon: '📈',
      subItems: [
        { name: t('bonds'), value: assets.bonds },
        { name: t('sukuk'), value: assets.sukuk },
        { name: t('tradingStocks'), value: assets.tradingStocks },
        { name: t('mutualFunds'), value: assets.mutualFunds },
        { name: t('etfs'), value: assets.etfs },
        { name: t('trustFunds'), value: assets.trustFunds },
      ].filter((i) => i.value > 0),
    },
    {
      name: t('categoryD'),
      value: assets.prepaidCards + assets.digitalWallets + assets.cryptocurrency + assets.rewardPoints + assets.gamingWallets,
      icon: '💳',
      subItems: [
        { name: t('prepaidCards'), value: assets.prepaidCards },
        { name: t('digitalWallets'), value: assets.digitalWallets },
        { name: t('cryptocurrency'), value: assets.cryptocurrency },
        { name: t('rewardPoints'), value: assets.rewardPoints },
        { name: t('gamingWallets'), value: assets.gamingWallets },
      ].filter((i) => i.value > 0),
    },
    {
      name: t('categoryE'),
      value:
        assets.gold.reduce((sum, g) => {
          const purity = g.karat === '24k' ? 1 : g.karat === '21k' ? 0.875 : 0.75;
          return sum + g.weightGrams * g.pricePerGram * purity;
        }, 0) +
        assets.silver +
        assets.goldInvestments +
        assets.diamonds +
        assets.platinum +
        assets.investmentJewelry,
      icon: '💎',
      subItems: [
        {
          name: t('gold'),
          value: assets.gold.reduce((sum, g) => {
            const purity = g.karat === '24k' ? 1 : g.karat === '21k' ? 0.875 : 0.75;
            return sum + g.weightGrams * g.pricePerGram * purity;
          }, 0),
        },
        { name: t('silver'), value: assets.silver },
        { name: t('goldInvestments'), value: assets.goldInvestments },
        { name: t('diamonds'), value: assets.diamonds },
        { name: t('platinum'), value: assets.platinum },
        { name: t('investmentJewelry'), value: assets.investmentJewelry },
      ].filter((i) => i.value > 0),
    },
    {
      name: t('categoryF'),
      value: assets.investmentProperties + assets.partialOwnership + assets.constructionProperties,
      icon: '🏠',
      subItems: [
        { name: t('investmentProperties'), value: assets.investmentProperties },
        { name: t('partialOwnership'), value: assets.partialOwnership },
        { name: t('constructionProperties'), value: assets.constructionProperties },
      ].filter((i) => i.value > 0),
    },
    {
      name: t('categoryG'),
      value: assets.lifeInsuranceCashValue + assets.pensionFunds + assets.receivableDebts,
      icon: '🤝',
      subItems: [
        { name: t('lifeInsuranceCashValue'), value: assets.lifeInsuranceCashValue },
        { name: t('pensionFunds'), value: assets.pensionFunds },
        { name: t('receivableDebts'), value: assets.receivableDebts },
      ].filter((i) => i.value > 0),
    },
    {
      name: t('categoryH'),
      value: assets.buildingMaterials + assets.bulkFood + assets.farmingSupplies + assets.bulkClothing + assets.electronicsInventory,
      icon: '📦',
      subItems: [
        { name: t('buildingMaterials'), value: assets.buildingMaterials },
        { name: t('bulkFood'), value: assets.bulkFood },
        { name: t('farmingSupplies'), value: assets.farmingSupplies },
        { name: t('bulkClothing'), value: assets.bulkClothing },
        { name: t('electronicsInventory'), value: assets.electronicsInventory },
      ].filter((i) => i.value > 0),
    },
    {
      name: t('categoryI'),
      value:
        assets.art +
        assets.rareStamps +
        assets.vintageCars +
        assets.designerBags +
        assets.limitedSneakers +
        assets.carbonCredits +
        assets.intellectualProperty +
        assets.horses +
        assets.livestock +
        assets.aircraft +
        assets.boats +
        assets.farmland +
        assets.crops,
      icon: '🎨',
      subItems: [
        { name: t('art'), value: assets.art },
        { name: t('rareStamps'), value: assets.rareStamps },
        { name: t('vintageCars'), value: assets.vintageCars },
        { name: t('designerBags'), value: assets.designerBags },
        { name: t('limitedSneakers'), value: assets.limitedSneakers },
        { name: t('carbonCredits'), value: assets.carbonCredits },
        { name: t('intellectualProperty'), value: assets.intellectualProperty },
        { name: t('horses'), value: assets.horses },
        { name: t('livestock'), value: assets.livestock },
        { name: t('aircraft'), value: assets.aircraft },
        { name: t('boats'), value: assets.boats },
        { name: t('farmland'), value: assets.farmland },
        { name: t('crops'), value: assets.crops },
      ].filter((i) => i.value > 0),
    },
    {
      name: t('categoryJ'),
      value: assets.minerals + assets.oil + assets.gas,
      icon: '⛏️',
      specialRate: true,
      subItems: [
        { name: t('minerals'), value: assets.minerals },
        { name: t('oil'), value: assets.oil },
        { name: t('gas'), value: assets.gas },
      ].filter((i) => i.value > 0),
    },
  ].filter((cat) => cat.value > 0);

  return (
    <View className="flex-1 bg-emerald-950">
      <LinearGradient
        colors={['#064e3b', '#022c22', '#011311']}
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
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleShare}
              className="p-2 rounded-full bg-white/10 active:bg-white/20"
            >
              {copied ? (
                <Check size={20} color="#34d399" />
              ) : Platform.OS === 'web' ? (
                <Copy size={20} color="white" />
              ) : (
                <Share2 size={20} color="white" />
              )}
            </Pressable>
          </View>
        </Animated.View>

        <ScrollView
          className="flex-1 mt-4"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Zakat Result Card */}
          <Animated.View
            entering={ZoomIn.delay(200).springify()}
            className="mx-6 mb-6"
          >
            <LinearGradient
              colors={meetsNisab ? ['#059669', '#047857'] : ['#374151', '#1f2937']}
              style={{ borderRadius: 24, padding: 24, alignItems: 'center' }}
            >
              {meetsNisab ? (
                <CheckCircle size={48} color="#a7f3d0" />
              ) : (
                <XCircle size={48} color="#9ca3af" />
              )}
              <Text className="text-white/80 text-sm mt-4">
                {t('zakatDue')}
              </Text>
              <Text className="text-white text-4xl font-bold mt-2">
                {currencySymbol} {zakatResult.total.toLocaleString()}
              </Text>
              <View className="flex-row items-center mt-2">
                <Text className={`${meetsNisab ? 'text-emerald-200' : 'text-gray-400'} text-sm`}>
                  {t('meetsNisab')}: {meetsNisab ? t('yes') : t('no')}
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

              {meetsNisab && zakatResult.extracted > 0 && (
                <View className="mt-4 w-full">
                  <View className="flex-row justify-between">
                    <Text className="text-emerald-200 text-sm">{t('regularZakat')}</Text>
                    <Text className="text-white">{currencySymbol} {zakatResult.regular.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-emerald-200 text-sm">{t('extractedZakat')}</Text>
                    <Text className="text-white">{currencySymbol} {zakatResult.extracted.toLocaleString()}</Text>
                  </View>
                </View>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Summary Cards */}
          <Animated.View
            entering={FadeInUp.delay(300).springify()}
            className="mx-6 mb-4"
          >
            <View className="flex-row gap-3">
              <View className="flex-1 bg-emerald-900/50 rounded-xl p-4">
                <Text className="text-emerald-400 text-xs">{t('totalAssets')}</Text>
                <Text className="text-white text-lg font-bold mt-1">
                  {currencySymbol} {totalAssets.toLocaleString()}
                </Text>
              </View>
              <View className="flex-1 bg-red-900/30 rounded-xl p-4">
                <Text className="text-red-400 text-xs">{t('totalDeductions')}</Text>
                <Text className="text-white text-lg font-bold mt-1">
                  -{currencySymbol} {totalDeductions.toLocaleString()}
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(400).springify()}
            className="mx-6 mb-6"
          >
            <View className="flex-row gap-3">
              <View className="flex-1 bg-emerald-800/50 rounded-xl p-4">
                <Text className="text-emerald-300 text-xs">{t('netWealth')}</Text>
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

          {/* Category Breakdown */}
          {categoryBreakdowns.length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(500).springify()}
              className="mx-6"
            >
              <View className={`flex-row items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Text className={`text-white font-semibold text-lg ${isRTL ? 'text-right' : ''}`}>
                  {t('breakdown')}
                </Text>
                <Pressable
                  onPress={() => {
                    if (expandedCategories.length === categoryBreakdowns.length) {
                      setExpandedCategories([]);
                    } else {
                      setExpandedCategories(categoryBreakdowns.map((c) => c.name));
                    }
                  }}
                  className="p-1"
                >
                  {expandedCategories.length === categoryBreakdowns.length ? (
                    <ChevronUp size={20} color="#6ee7b7" />
                  ) : (
                    <ChevronDown size={20} color="#6ee7b7" />
                  )}
                </Pressable>
              </View>
              <View className="bg-emerald-900/50 rounded-xl overflow-hidden">
                {categoryBreakdowns.map((cat, index) => {
                  const isExpanded = expandedCategories.includes(cat.name);
                  const hasSubItems = cat.subItems && cat.subItems.length > 1;

                  return (
                    <View key={cat.name}>
                      <Pressable
                        onPress={() => hasSubItems && toggleCategoryExpansion(cat.name)}
                        className={`flex-row items-center justify-between p-4 ${
                          index < categoryBreakdowns.length - 1 && !isExpanded ? 'border-b border-emerald-800/50' : ''
                        } ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <View className={`flex-row items-center flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {hasSubItems && (
                            isExpanded ? (
                              <ChevronUp size={16} color="#6ee7b7" />
                            ) : (
                              <ChevronDown size={16} color="#6ee7b7" />
                            )
                          )}
                          <Text className={`text-xl ${hasSubItems ? (isRTL ? 'mr-2' : 'ml-2') : ''}`}>{cat.icon}</Text>
                          <Text className={`text-white ${isRTL ? 'mr-3' : 'ml-3'}`}>
                            {cat.name}
                          </Text>
                          {cat.specialRate && (
                            <View className={`bg-amber-600/50 rounded px-2 py-0.5 ${isRTL ? 'mr-2' : 'ml-2'}`}>
                              <Text className="text-amber-200 text-xs">20%</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-emerald-300">
                          {currencySymbol} {cat.value.toLocaleString()}
                        </Text>
                      </Pressable>

                      {/* Sub-items */}
                      {isExpanded && cat.subItems && cat.subItems.length > 0 && (
                        <View className="bg-emerald-950/50 px-4 pb-3">
                          {cat.subItems.map((subItem, subIndex) => (
                            <View
                              key={subItem.name}
                              className={`flex-row items-center justify-between py-2 ${isRTL ? 'flex-row-reverse' : ''} ${
                                subIndex < cat.subItems.length - 1 ? 'border-b border-emerald-800/30' : ''
                              }`}
                            >
                              <Text className={`text-emerald-400 text-sm ${isRTL ? 'text-right mr-8' : 'ml-8'}`}>
                                {subItem.name}
                              </Text>
                              <Text className="text-emerald-300 text-sm">
                                {currencySymbol} {subItem.value.toLocaleString()}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                      {index < categoryBreakdowns.length - 1 && isExpanded && (
                        <View className="h-px bg-emerald-800/50" />
                      )}
                    </View>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* Action Buttons */}
          <Animated.View
            entering={FadeInUp.delay(600).springify()}
            className="mx-6 mt-6 gap-3"
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
                className="bg-emerald-800/50 rounded-xl p-4 flex-row items-center justify-center active:bg-emerald-800"
              >
                <History size={20} color="#a7f3d0" />
                <Text className="text-emerald-200 font-medium ml-2">
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
              className="bg-emerald-800/50 rounded-xl p-4 flex-row items-center justify-center active:bg-emerald-800"
            >
              <RefreshCcw size={20} color="#a7f3d0" />
              <Text className="text-emerald-200 font-medium ml-2">
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
            <View className="bg-emerald-900 rounded-2xl p-6">
              <Text className="text-white text-xl font-bold mb-4 text-center">
                {t('confirmClear')}
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setShowClearModal(false)}
                  className="flex-1 bg-emerald-800 rounded-xl py-3"
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
