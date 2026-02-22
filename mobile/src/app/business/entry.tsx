import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, ArrowRight, FileSpreadsheet, Edit3, ChevronDown, Check, Upload, FileCheck, AlertCircle } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useLanguageStore, useSettingsStore, useBusinessCalculatorStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';
import { useBusinessCategoriesStore } from '@/lib/enhanced-store';

type EntryMode = 'upload' | 'manual' | null;

interface ParsedBalanceItem {
  name: string;
  amount: number;
  category: 'asset' | 'liability';
}

const industries = [
  { key: 'restaurant', icon: '🍽️' },
  { key: 'retail', icon: '🛒' },
  { key: 'construction', icon: '🏗️' },
  { key: 'technology', icon: '💻' },
  { key: 'healthcare', icon: '🏥' },
  { key: 'manufacturing', icon: '🏭' },
  { key: 'services', icon: '🤝' },
  { key: 'other', icon: '📋' },
];

export default function BusinessEntryScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);
  const country = useSettingsStore((s) => s.country);

  const assets = useBusinessCalculatorStore((s) => s.assets);
  const setCompanyName = useBusinessCalculatorStore((s) => s.setCompanyName);
  const setIndustryType = useBusinessCalculatorStore((s) => s.setIndustryType);
  const setAssetValue = useBusinessCalculatorStore((s) => s.setAssetValue);
  const addLineItem = useBusinessCalculatorStore((s) => s.addLineItem);

  const addCategoryEntry = useBusinessCategoriesStore((s) => s.addEntry);
  const mainCurrency = useBusinessCategoriesStore((s) => s.mainCurrency);

  const [entryMode, setEntryMode] = useState<EntryMode>(null);
  const [showIndustryPicker, setShowIndustryPicker] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; uri: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedBalanceItem[]>([]);

  const currencySymbol = country?.currencySymbol ?? '$';

  const handleBack = () => {
    if (entryMode) {
      setEntryMode(null);
      setUploadedFile(null);
      setParsedItems([]);
    } else {
      router.back();
    }
  };

  const handleNext = () => {
    router.push('/business/analysis');
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
          'application/vnd.ms-excel', // xls
          'text/csv', // csv
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setUploadedFile({ name: file.name, uri: file.uri });

      // Simulate processing the file
      setIsProcessing(true);

      // In a real implementation, you would parse the Excel file here
      // For now, we'll simulate with sample data
      setTimeout(() => {
        const sampleItems: ParsedBalanceItem[] = [
          { name: 'Cash in Bank', amount: 50000, category: 'asset' },
          { name: 'Accounts Receivable', amount: 75000, category: 'asset' },
          { name: 'Inventory', amount: 120000, category: 'asset' },
          { name: 'Prepaid Expenses', amount: 15000, category: 'asset' },
          { name: 'Accounts Payable', amount: 45000, category: 'liability' },
          { name: 'Accrued Expenses', amount: 20000, category: 'liability' },
          { name: 'Short-term Loan', amount: 80000, category: 'liability' },
        ];
        setParsedItems(sampleItems);
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const handleImportItems = () => {
    // Import parsed items into the business calculator
    parsedItems.forEach((item) => {
      if (item.category === 'asset') {
        // Add to current assets category
        addCategoryEntry('currentAssets', {
          name: item.name,
          description: 'Imported from balance sheet',
          amount: item.amount,
          currency: mainCurrency,
        });
      } else {
        // Add to current liabilities - default to non-Islamic (needs clarification)
        addCategoryEntry('currentLiabilities', {
          name: item.name,
          description: 'Imported from balance sheet',
          amount: item.amount,
          currency: mainCurrency,
          isIslamicFinancing: false,
        });
      }
    });

    // Navigate to categories screen to review
    router.push('/business/categories');
  };

  const handleValueChange = (key: 'cash' | 'receivables' | 'inventory' | 'investments', value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    setAssetValue(key, numValue);
  };

  const totalAssets = assets.cash + assets.receivables + assets.inventory + assets.investments;
  const canProceed = entryMode === 'manual' && assets.companyName.trim().length > 0 && assets.industryType.length > 0;

  const selectedIndustry = industries.find((i) => i.key === assets.industryType);

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
              {entryMode === 'manual' ? t('manualEntry') : entryMode === 'upload' ? t('uploadBalanceSheet') : 'Entry Method'}
            </Text>
          </View>
          {entryMode === 'manual' && totalAssets > 0 && (
            <View className="bg-indigo-600/50 rounded-xl px-3 py-1">
              <Text className="text-indigo-200 text-sm">
                {currencySymbol} {totalAssets.toLocaleString()}
              </Text>
            </View>
          )}
        </Animated.View>

        <ScrollView
          className="flex-1 mt-4"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Entry Mode Selection */}
          {!entryMode && (
            <>
              <Animated.View
                entering={FadeInUp.delay(200).springify()}
                className="px-6 mt-4"
              >
                <Text className={`text-white text-xl font-bold mb-6 ${isRTL ? 'text-right' : ''}`}>
                  How would you like to enter your business data?
                </Text>
              </Animated.View>

              {/* Upload Option */}
              <Animated.View
                entering={FadeInUp.delay(300).springify()}
                className="mx-6 mb-4"
              >
                <Pressable
                  onPress={() => setEntryMode('upload')}
                  className="active:scale-[0.98]"
                >
                  <LinearGradient
                    colors={['#4f46e5', '#4338ca']}
                    style={{
                      borderRadius: 20,
                      padding: 24,
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                      alignItems: 'center',
                    }}
                  >
                    <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center">
                      <FileSpreadsheet size={32} color="white" />
                    </View>
                    <View className={`flex-1 ${isRTL ? 'mr-4 items-end' : 'ml-4'}`}>
                      <Text className={`text-xl font-bold text-white ${isRTL ? 'text-right' : ''}`}>
                        {t('uploadBalanceSheet')}
                      </Text>
                      <Text className={`text-indigo-200 mt-1 ${isRTL ? 'text-right' : ''}`}>
                        {t('uploadInstructions')}
                      </Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              </Animated.View>

              {/* Manual Option */}
              <Animated.View
                entering={FadeInUp.delay(400).springify()}
                className="mx-6"
              >
                <Pressable
                  onPress={() => setEntryMode('manual')}
                  className="active:scale-[0.98]"
                >
                  <LinearGradient
                    colors={['#7c3aed', '#6d28d9']}
                    style={{
                      borderRadius: 20,
                      padding: 24,
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                      alignItems: 'center',
                    }}
                  >
                    <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center">
                      <Edit3 size={32} color="white" />
                    </View>
                    <View className={`flex-1 ${isRTL ? 'mr-4 items-end' : 'ml-4'}`}>
                      <Text className={`text-xl font-bold text-white ${isRTL ? 'text-right' : ''}`}>
                        {t('manualEntry')}
                      </Text>
                      <Text className={`text-purple-200 mt-1 ${isRTL ? 'text-right' : ''}`}>
                        Enter values step by step
                      </Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </>
          )}

          {/* Upload Mode */}
          {entryMode === 'upload' && (
            <Animated.View
              entering={FadeInUp.delay(200).springify()}
              className="px-6 mt-4"
            >
              {!uploadedFile ? (
                // File picker UI
                <Pressable
                  onPress={handlePickDocument}
                  className="active:scale-[0.98]"
                >
                  <View className="bg-indigo-900/50 rounded-2xl p-8 items-center border-2 border-dashed border-indigo-700">
                    <Upload size={64} color="#a5b4fc" />
                    <Text className="text-white text-lg font-semibold mt-4">
                      Upload Balance Sheet
                    </Text>
                    <Text className="text-indigo-300 text-center mt-2">
                      Tap to select an Excel (.xlsx, .xls) or CSV file
                    </Text>
                    <View className="mt-6 bg-indigo-600 rounded-xl px-6 py-3">
                      <Text className="text-white font-semibold">Choose File</Text>
                    </View>
                    <Text className="text-indigo-400 text-xs mt-4 text-center">
                      Your file will be analyzed locally on your device
                    </Text>
                  </View>
                </Pressable>
              ) : isProcessing ? (
                // Processing UI
                <View className="bg-indigo-900/50 rounded-2xl p-8 items-center">
                  <ActivityIndicator size="large" color="#a5b4fc" />
                  <Text className="text-white text-lg font-semibold mt-4">
                    Processing File...
                  </Text>
                  <Text className="text-indigo-300 text-center mt-2">
                    Analyzing {uploadedFile.name}
                  </Text>
                </View>
              ) : (
                // Parsed results UI
                <View>
                  {/* File info */}
                  <View className="bg-emerald-900/30 rounded-xl p-4 flex-row items-center mb-4">
                    <FileCheck size={24} color="#6ee7b7" />
                    <View className="flex-1 ml-3">
                      <Text className="text-emerald-300 font-medium">{uploadedFile.name}</Text>
                      <Text className="text-emerald-400 text-sm">
                        {parsedItems.length} items found
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        setUploadedFile(null);
                        setParsedItems([]);
                      }}
                      className="p-2"
                    >
                      <Text className="text-indigo-300 text-sm">Change</Text>
                    </Pressable>
                  </View>

                  {/* Parsed items list */}
                  <Text className="text-white font-semibold mb-3">Parsed Items</Text>

                  {/* Assets */}
                  <View className="mb-4">
                    <Text className="text-emerald-400 text-sm mb-2">Assets</Text>
                    {parsedItems
                      .filter((item) => item.category === 'asset')
                      .map((item, index) => (
                        <View
                          key={index}
                          className="bg-emerald-900/30 rounded-xl p-3 mb-2 flex-row justify-between"
                        >
                          <Text className="text-white">{item.name}</Text>
                          <Text className="text-emerald-300">
                            {currencySymbol}{item.amount.toLocaleString()}
                          </Text>
                        </View>
                      ))}
                  </View>

                  {/* Liabilities */}
                  <View className="mb-4">
                    <Text className="text-red-400 text-sm mb-2">Liabilities</Text>
                    {parsedItems
                      .filter((item) => item.category === 'liability')
                      .map((item, index) => (
                        <View
                          key={index}
                          className="bg-red-900/30 rounded-xl p-3 mb-2 flex-row justify-between"
                        >
                          <Text className="text-white">{item.name}</Text>
                          <Text className="text-red-300">
                            {currencySymbol}{item.amount.toLocaleString()}
                          </Text>
                        </View>
                      ))}
                  </View>

                  {/* Warning about loans */}
                  <View className="bg-amber-900/30 rounded-xl p-4 flex-row mb-4">
                    <AlertCircle size={20} color="#fbbf24" />
                    <Text className="text-amber-200 text-sm flex-1 ml-3">
                      You'll need to specify which liabilities are Islamic financing (deductible) vs conventional loans (not deductible) in the next step.
                    </Text>
                  </View>

                  {/* Import button */}
                  <Pressable
                    onPress={handleImportItems}
                    className="active:scale-[0.98]"
                  >
                    <LinearGradient
                      colors={['#6366f1', '#4f46e5']}
                      style={{
                        borderRadius: 16,
                        padding: 18,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text className="text-white font-bold text-lg mr-2">
                        Import & Review
                      </Text>
                      <ArrowRight size={20} color="white" />
                    </LinearGradient>
                  </Pressable>
                </View>
              )}

              {/* Switch to manual option */}
              {!uploadedFile && (
                <View className="mt-6">
                  <Pressable
                    onPress={() => setEntryMode('manual')}
                    className="bg-indigo-800/50 rounded-xl py-3 active:bg-indigo-800"
                  >
                    <Text className="text-indigo-200 text-center font-medium">
                      Or enter manually instead
                    </Text>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          )}

          {/* Manual Entry Mode */}
          {entryMode === 'manual' && (
            <>
              {/* Company Info */}
              <Animated.View
                entering={FadeInUp.delay(200).springify()}
                className="mx-6"
              >
                <Text className={`text-white font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
                  {t('companyName')}
                </Text>
                <TextInput
                  value={assets.companyName}
                  onChangeText={setCompanyName}
                  placeholder="Enter company name"
                  placeholderTextColor="#6b7280"
                  className={`bg-indigo-800/50 rounded-xl px-4 py-3 text-white text-base ${isRTL ? 'text-right' : ''}`}
                  style={{ textAlign: isRTL ? 'right' : 'left' }}
                />
              </Animated.View>

              {/* Industry Type */}
              <Animated.View
                entering={FadeInUp.delay(300).springify()}
                className="mx-6 mt-6"
              >
                <Text className={`text-white font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
                  {t('industryType')}
                </Text>
                <Pressable
                  onPress={() => setShowIndustryPicker(!showIndustryPicker)}
                  className="bg-indigo-800/50 rounded-xl p-4 active:bg-indigo-800/70"
                >
                  <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {selectedIndustry ? (
                      <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Text className="text-2xl">{selectedIndustry.icon}</Text>
                        <Text className={`text-white text-base ${isRTL ? 'mr-3' : 'ml-3'}`}>
                          {t(selectedIndustry.key as any)}
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-white/50">Select industry</Text>
                    )}
                    <ChevronDown size={20} color="white" />
                  </View>
                </Pressable>

                {showIndustryPicker && (
                  <View className="bg-indigo-900/90 rounded-xl mt-2 overflow-hidden">
                    {industries.map((ind) => (
                      <Pressable
                        key={ind.key}
                        onPress={() => {
                          setIndustryType(ind.key);
                          setShowIndustryPicker(false);
                        }}
                        className={`p-4 border-b border-indigo-800/50 active:bg-indigo-700/50 flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <Text className="text-xl">{ind.icon}</Text>
                        <Text className={`text-white flex-1 ${isRTL ? 'mr-3 text-right' : 'ml-3'}`}>
                          {t(ind.key as any)}
                        </Text>
                        {assets.industryType === ind.key && (
                          <Check size={18} color="#a5b4fc" />
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}
              </Animated.View>

              {/* Asset Fields */}
              <Animated.View
                entering={FadeInUp.delay(400).springify()}
                className="mx-6 mt-6"
              >
                <Text className={`text-white font-semibold mb-4 ${isRTL ? 'text-right' : ''}`}>
                  Business Assets
                </Text>

                <View className="gap-4">
                  {[
                    { key: 'cash' as const, label: t('cash'), icon: '💵' },
                    { key: 'receivables' as const, label: t('receivables'), icon: '📋' },
                    { key: 'inventory' as const, label: t('inventory'), icon: '📦' },
                    { key: 'investments' as const, label: t('investments'), icon: '📈' },
                  ].map((field) => (
                    <View key={field.key} className="bg-indigo-900/50 rounded-xl p-4">
                      <View className={`flex-row items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Text className="text-xl">{field.icon}</Text>
                        <Text className={`text-white font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>
                          {field.label}
                        </Text>
                      </View>
                      <View className={`flex-row items-center bg-indigo-800/50 rounded-xl px-4 py-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Text className={`text-indigo-300 ${isRTL ? 'ml-2' : 'mr-2'}`}>
                          {currencySymbol}
                        </Text>
                        <TextInput
                          value={assets[field.key] > 0 ? String(assets[field.key]) : ''}
                          onChangeText={(v) => handleValueChange(field.key, v)}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#6b7280"
                          className={`flex-1 text-white text-lg ${isRTL ? 'text-right' : ''}`}
                          style={{ textAlign: isRTL ? 'right' : 'left' }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </Animated.View>
            </>
          )}
        </ScrollView>

        {/* Next Button */}
        {entryMode === 'manual' && (
          <Animated.View
            entering={FadeInUp.delay(500).springify()}
            className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4"
            style={{
              backgroundColor: 'rgba(30, 27, 75, 0.95)',
            }}
          >
            <Pressable
              onPress={handleNext}
              disabled={!canProceed}
              className={`active:scale-[0.98] ${!canProceed ? 'opacity-50' : ''}`}
            >
              <LinearGradient
                colors={canProceed ? ['#6366f1', '#4f46e5'] : ['#374151', '#1f2937']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 16,
                  padding: 18,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text className={`text-white font-bold text-lg ${isRTL ? 'ml-2' : 'mr-2'}`}>
                  Analyze Assets
                </Text>
                <ArrowRight
                  size={20}
                  color="white"
                  style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
                />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}
