import React, { useRef } from 'react';
import { View, Text, Pressable, ScrollView, Share, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  ChevronLeft,
  Printer,
  Share2,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
} from 'lucide-react-native';
import { useLanguageStore, useSettingsStore, useBusinessCalculatorStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';
import { useBusinessCategoriesStore } from '@/lib/enhanced-store';

interface ReportLineItem {
  id: string;
  name: string;
  amount: number;
  clarificationNeeded: boolean;
  clarificationQuestion?: string;
  clarificationAnswer?: string;
  finalRuling: string;
  includedInZakat: boolean;
  finalAmount: number;
}

export default function BusinessReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);

  const country = useSettingsStore((s) => s.country);
  const nisabThreshold = useSettingsStore((s) => s.nisabThreshold);
  const calendarType = useSettingsStore((s) => s.calendarType);

  // Get data from both stores
  const businessAssets = useBusinessCalculatorStore((s) => s.assets);
  const getTotalZakatable = useBusinessCalculatorStore((s) => s.getTotalZakatable);
  const getTotalDeductible = useBusinessCalculatorStore((s) => s.getTotalDeductible);
  const getZakatDue = useBusinessCalculatorStore((s) => s.getZakatDue);

  const categoriesData = useBusinessCategoriesStore((s) => s.categories);
  const companyName = useBusinessCategoriesStore((s) => s.companyName) || businessAssets.companyName;
  const industryType = useBusinessCategoriesStore((s) => s.industryType) || businessAssets.industryType;

  const currencySymbol = country?.currencySymbol ?? '$';
  const totalZakatable = getTotalZakatable();
  const totalDeductible = getTotalDeductible();
  const netWealth = totalZakatable - totalDeductible;
  const meetsNisab = netWealth >= nisabThreshold;
  const zakatDue = getZakatDue(nisabThreshold, calendarType);
  const zakatRate = calendarType === 'islamic' ? '2.5%' : '2.577%';

  // Generate report data from line items
  const generateReportItems = (): ReportLineItem[] => {
    const items: ReportLineItem[] = [];

    // From business calculator store
    businessAssets.lineItems.forEach((item) => {
      items.push({
        id: item.id,
        name: item.name,
        amount: item.amount,
        clarificationNeeded: !!item.clarificationQuestion,
        clarificationQuestion: item.clarificationQuestion,
        clarificationAnswer: item.clarificationAnswer,
        finalRuling: getRulingText(item.classification),
        includedInZakat: item.classification === 'zakatable',
        finalAmount: item.classification === 'zakatable' ? (item.marketValue ?? item.amount) : 0,
      });
    });

    // From categories store
    Object.entries(categoriesData).forEach(([category, entries]) => {
      entries.forEach((entry) => {
        const isDeductible = category === 'currentLiabilities' && entry.isIslamicFinancing;
        const isZakatable = category === 'currentAssets' || category === 'adjustments';
        const isExempt = category === 'exemptions' || (category === 'currentLiabilities' && !entry.isIslamicFinancing);

        items.push({
          id: entry.id,
          name: entry.name,
          amount: entry.convertedAmount,
          clarificationNeeded: !!entry.clarificationQuestion,
          clarificationQuestion: entry.clarificationQuestion,
          clarificationAnswer: entry.clarificationAnswer,
          finalRuling: isZakatable ? 'Zakatable' : isDeductible ? 'Deductible' : isExempt ? 'Exempt/Not Deductible' : 'Exempt',
          includedInZakat: isZakatable,
          finalAmount: isZakatable ? entry.convertedAmount : isDeductible ? -entry.convertedAmount : 0,
        });
      });
    });

    return items;
  };

  const getRulingText = (classification: string): string => {
    switch (classification) {
      case 'zakatable':
        return 'Zakatable - Included in zakat base';
      case 'deductible':
        return 'Deductible - Reduces zakat base';
      case 'exempt':
        return 'Exempt - Not subject to zakat';
      case 'not_deductible':
        return 'Not Deductible - Conventional loan';
      default:
        return 'Pending clarification';
    }
  };

  const reportItems = generateReportItems();
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleShare = async () => {
    const reportText = generateTextReport();
    try {
      await Share.share({
        message: reportText,
        title: 'Zakat Calculation Report',
      });
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  const generateTextReport = (): string => {
    let report = `
═══════════════════════════════════════════════════
       BARAKAH BALANCE - ZAKAT CALCULATION REPORT
═══════════════════════════════════════════════════

Report Date: ${reportDate}
Company: ${companyName || 'N/A'}
Industry: ${industryType || 'N/A'}

═══════════════════════════════════════════════════
                    SUMMARY
═══════════════════════════════════════════════════

Total Zakatable Assets:     ${currencySymbol}${totalZakatable.toLocaleString()}
Total Deductible:          -${currencySymbol}${totalDeductible.toLocaleString()}
Net Zakatable Wealth:       ${currencySymbol}${netWealth.toLocaleString()}
Nisab Threshold:            ${currencySymbol}${nisabThreshold.toLocaleString()}
Meets Nisab:                ${meetsNisab ? 'Yes' : 'No'}
Zakat Rate:                 ${zakatRate}

ZAKAT DUE:                  ${currencySymbol}${zakatDue.toLocaleString()}

═══════════════════════════════════════════════════
                 DETAILED BREAKDOWN
═══════════════════════════════════════════════════

`;

    reportItems.forEach((item, index) => {
      report += `
${index + 1}. ${item.name}
   Amount: ${currencySymbol}${item.amount.toLocaleString()}
   Clarification Required: ${item.clarificationNeeded ? 'Yes' : 'No'}`;

      if (item.clarificationNeeded) {
        report += `
   Question: ${item.clarificationQuestion || 'N/A'}
   Answer: ${item.clarificationAnswer || 'N/A'}`;
      }

      report += `
   Final Ruling: ${item.finalRuling}
   Included in Zakat: ${item.includedInZakat ? 'Yes' : 'No'}
   Final Amount: ${currencySymbol}${item.finalAmount.toLocaleString()}
───────────────────────────────────────────────────`;
    });

    report += `

═══════════════════════════════════════════════════
                    DISCLAIMER
═══════════════════════════════════════════════════

This calculation follows AAOIFI FAS 9 standards.
For complex business structures, please consult a
qualified Islamic scholar.

Generated by Barakah Balance
═══════════════════════════════════════════════════
`;

    return report;
  };

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
              onPress={() => router.back()}
              className={`p-2 rounded-full bg-white/10 active:bg-white/20 ${isRTL ? 'ml-4' : 'mr-4'}`}
            >
              <ChevronLeft
                size={24}
                color="white"
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              />
            </Pressable>
            <Text className="text-white text-lg font-semibold">
              {language === 'ar' ? 'تقرير الزكاة' : 'Zakat Report'}
            </Text>
          </View>
          <View className="flex-row">
            <Pressable
              onPress={handleShare}
              className="p-2 rounded-full bg-white/10 active:bg-white/20 mr-2"
            >
              <Share2 size={20} color="white" />
            </Pressable>
            <Pressable
              onPress={handleShare}
              className="p-2 rounded-full bg-white/10 active:bg-white/20"
            >
              <Printer size={20} color="white" />
            </Pressable>
          </View>
        </Animated.View>

        <ScrollView
          className="flex-1 mt-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Report Header */}
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            className="mx-6 mb-4"
          >
            <View className="bg-white rounded-2xl p-6">
              {/* Company Header */}
              <View className="items-center mb-4 pb-4 border-b border-gray-200">
                <Text className="text-2xl font-bold text-indigo-900">BARAKAH BALANCE</Text>
                <Text className="text-indigo-600 text-sm">Zakat Calculation Report</Text>
              </View>

              {/* Company Info */}
              <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-200">
                <View>
                  <Text className="text-gray-500 text-xs">Company</Text>
                  <Text className="text-gray-900 font-semibold">{companyName || 'N/A'}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-gray-500 text-xs">Report Date</Text>
                  <Text className="text-gray-900 font-semibold">{reportDate}</Text>
                </View>
              </View>

              {/* Summary */}
              <View className="bg-indigo-50 rounded-xl p-4 mb-4">
                <Text className="text-indigo-900 font-bold text-center mb-3">SUMMARY</Text>
                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Total Zakatable Assets</Text>
                    <Text className="text-gray-900 font-medium">{currencySymbol}{totalZakatable.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Total Deductible</Text>
                    <Text className="text-red-600 font-medium">-{currencySymbol}{totalDeductible.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row justify-between pt-2 border-t border-indigo-200">
                    <Text className="text-gray-900 font-semibold">Net Zakatable Wealth</Text>
                    <Text className="text-gray-900 font-bold">{currencySymbol}{netWealth.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Nisab Threshold</Text>
                    <Text className="text-gray-900">{currencySymbol}{nisabThreshold.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-600">Meets Nisab</Text>
                    <View className={`flex-row items-center px-2 py-1 rounded-full ${meetsNisab ? 'bg-emerald-100' : 'bg-red-100'}`}>
                      {meetsNisab ? (
                        <CheckCircle size={14} color="#059669" />
                      ) : (
                        <XCircle size={14} color="#dc2626" />
                      )}
                      <Text className={`text-xs ml-1 ${meetsNisab ? 'text-emerald-700' : 'text-red-700'}`}>
                        {meetsNisab ? 'Yes' : 'No'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Zakat Due */}
              <View className={`rounded-xl p-4 mb-4 ${meetsNisab ? 'bg-emerald-500' : 'bg-gray-400'}`}>
                <Text className="text-white text-center text-sm">ZAKAT DUE ({zakatRate})</Text>
                <Text className="text-white text-center text-3xl font-bold mt-1">
                  {currencySymbol}{zakatDue.toLocaleString()}
                </Text>
              </View>

              {/* Detailed Breakdown Table */}
              <Text className="text-indigo-900 font-bold mb-3">DETAILED BREAKDOWN</Text>

              {/* Table Header */}
              <View className="bg-indigo-100 rounded-t-lg p-2">
                <View className="flex-row">
                  <Text className="flex-1 text-indigo-900 font-semibold text-xs">Item</Text>
                  <Text className="w-20 text-indigo-900 font-semibold text-xs text-right">Amount</Text>
                  <Text className="w-16 text-indigo-900 font-semibold text-xs text-center">Clarified</Text>
                  <Text className="w-20 text-indigo-900 font-semibold text-xs text-right">Final</Text>
                </View>
              </View>

              {/* Table Body */}
              {reportItems.length === 0 ? (
                <View className="p-4 items-center">
                  <Text className="text-gray-400">No items to display</Text>
                </View>
              ) : (
                reportItems.map((item, index) => (
                  <View
                    key={item.id}
                    className={`p-3 border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <View className="flex-row items-center">
                      <View className="flex-1">
                        <Text className="text-gray-900 text-sm font-medium" numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text className="text-gray-500 text-xs" numberOfLines={1}>
                          {item.finalRuling}
                        </Text>
                      </View>
                      <Text className="w-20 text-gray-700 text-sm text-right">
                        {currencySymbol}{item.amount.toLocaleString()}
                      </Text>
                      <View className="w-16 items-center">
                        {item.clarificationNeeded ? (
                          <AlertCircle size={16} color="#f59e0b" />
                        ) : (
                          <CheckCircle size={16} color="#10b981" />
                        )}
                      </View>
                      <Text
                        className={`w-20 text-sm text-right font-medium ${
                          item.finalAmount > 0
                            ? 'text-emerald-600'
                            : item.finalAmount < 0
                            ? 'text-red-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {item.finalAmount !== 0
                          ? `${item.finalAmount < 0 ? '-' : ''}${currencySymbol}${Math.abs(item.finalAmount).toLocaleString()}`
                          : '-'}
                      </Text>
                    </View>
                    {item.clarificationNeeded && item.clarificationAnswer && (
                      <View className="mt-2 bg-amber-50 rounded-lg p-2">
                        <Text className="text-amber-800 text-xs">
                          Q: {item.clarificationQuestion}
                        </Text>
                        <Text className="text-amber-900 text-xs font-medium">
                          A: {item.clarificationAnswer}
                        </Text>
                      </View>
                    )}
                  </View>
                ))
              )}

              {/* Footer */}
              <View className="mt-4 pt-4 border-t border-gray-200">
                <Text className="text-gray-500 text-xs text-center leading-4">
                  This calculation follows AAOIFI FAS 9 Islamic accounting standards.
                  For complex business structures, please consult a qualified Islamic scholar.
                </Text>
                <Text className="text-indigo-600 text-xs text-center mt-2 font-medium">
                  Generated by Barakah Balance
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            entering={FadeInUp.delay(400).springify()}
            className="mx-6 gap-3"
          >
            <Pressable
              onPress={handleShare}
              className="active:scale-[0.98]"
            >
              <LinearGradient
                colors={['#6366f1', '#4f46e5']}
                style={{
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Share2 size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">
                  {language === 'ar' ? 'مشاركة التقرير' : 'Share Report'}
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              className="bg-indigo-800/50 rounded-xl p-4 flex-row items-center justify-center active:bg-indigo-800"
            >
              <Text className="text-indigo-200 font-medium">
                {language === 'ar' ? 'العودة للنتائج' : 'Back to Results'}
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
