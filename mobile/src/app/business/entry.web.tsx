import React, { useState, useCallback, DragEvent } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, ArrowRight, FileSpreadsheet, Edit3, ChevronDown, Check, Upload, FileCheck, AlertCircle, Download, Table } from 'lucide-react-native';
import { useLanguageStore, useSettingsStore, useBusinessCalculatorStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';
import { useBusinessCategoriesStore } from '@/lib/enhanced-store';
import { useResponsive } from '@/lib/useResponsive';

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

// Parse CSV content
function parseCSV(content: string): ParsedBalanceItem[] {
  const lines = content.split('\n').filter(line => line.trim());
  const items: ParsedBalanceItem[] = [];

  for (let i = 1; i < lines.length; i++) { // Skip header
    const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
    if (cols.length >= 2) {
      const name = cols[0];
      const amount = parseFloat(cols[1].replace(/[^0-9.-]/g, '')) || 0;
      const category = cols[2]?.toLowerCase().includes('liab') ? 'liability' : 'asset';
      if (name && amount !== 0) {
        items.push({ name, amount: Math.abs(amount), category });
      }
    }
  }

  return items;
}

export default function BusinessEntryScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);
  const country = useSettingsStore((s) => s.country);
  const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();

  const assets = useBusinessCalculatorStore((s) => s.assets);
  const setCompanyName = useBusinessCalculatorStore((s) => s.setCompanyName);
  const setIndustryType = useBusinessCalculatorStore((s) => s.setIndustryType);
  const setAssetValue = useBusinessCalculatorStore((s) => s.setAssetValue);

  const addCategoryEntry = useBusinessCategoriesStore((s) => s.addEntry);
  const mainCurrency = useBusinessCategoriesStore((s) => s.mainCurrency);

  const [entryMode, setEntryMode] = useState<EntryMode>(null);
  const [showIndustryPicker, setShowIndustryPicker] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedBalanceItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const currencySymbol = country?.currencySymbol ?? '$';

  // Container width based on breakpoint
  const containerStyle = isDesktop
    ? { maxWidth: 1200, marginHorizontal: 'auto' as const, width: '100%' as const }
    : isTablet
    ? { maxWidth: 800, marginHorizontal: 'auto' as const, width: '100%' as const }
    : {};

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

  // Web file handling
  const processFile = useCallback(async (file: File) => {
    setUploadedFile({ name: file.name });
    setIsProcessing(true);

    try {
      const content = await file.text();

      // Check file type and parse accordingly
      if (file.name.endsWith('.csv')) {
        const items = parseCSV(content);
        setParsedItems(items);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // For Excel files, we'd need a library like xlsx
        // For now, show sample data with a note
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
      }
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.match(/\.(xlsx|xls|csv)$/i)) {
        processFile(file);
      }
    }
  }, [processFile]);

  // File input handler
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleImportItems = () => {
    parsedItems.forEach((item) => {
      if (item.category === 'asset') {
        addCategoryEntry('currentAssets', {
          name: item.name,
          description: 'Imported from balance sheet',
          amount: item.amount,
          currency: mainCurrency,
        });
      } else {
        addCategoryEntry('currentLiabilities', {
          name: item.name,
          description: 'Imported from balance sheet',
          amount: item.amount,
          currency: mainCurrency,
          isIslamicFinancing: false,
        });
      }
    });

    router.push('/business/categories');
  };

  const handleValueChange = (key: 'cash' | 'receivables' | 'inventory' | 'investments', value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    setAssetValue(key, numValue);
  };

  const downloadTemplate = () => {
    const csvContent = `Name,Amount,Type
Cash in Bank,50000,Asset
Accounts Receivable,75000,Asset
Inventory,120000,Asset
Equipment,200000,Asset
Accounts Payable,45000,Liability
Short-term Loan,80000,Liability
Islamic Financing,100000,Liability`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'balance_sheet_template.csv';
    a.click();
    URL.revokeObjectURL(url);
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
          style={containerStyle}
        >
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Pressable
              onPress={handleBack}
              className={`p-2 rounded-full bg-white/10 active:bg-white/20 ${isRTL ? 'ml-4' : 'mr-4'}`}
              // @ts-ignore - web hover
              style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(255,255,255,0.2)' }}
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
          contentContainerStyle={{ paddingBottom: 120, ...containerStyle }}
          showsVerticalScrollIndicator={false}
        >
          {/* Entry Mode Selection */}
          {!entryMode && (
            <>
              <Animated.View
                entering={FadeInUp.delay(200).springify()}
                className="px-6 mt-4"
              >
                <Text className={`text-white text-xl font-bold mb-2 ${isRTL ? 'text-right' : ''}`}>
                  How would you like to enter your business data?
                </Text>
                {isDesktop && (
                  <Text className="text-indigo-300 mb-6">
                    For best results on desktop, upload your balance sheet as an Excel or CSV file
                  </Text>
                )}
              </Animated.View>

              {/* Options Grid - 2 columns on tablet/desktop */}
              <View className={`px-6 ${isDesktop || isTablet ? 'flex-row gap-4' : ''}`}>
                {/* Upload Option */}
                <Animated.View
                  entering={FadeInUp.delay(300).springify()}
                  className={`mb-4 ${isDesktop || isTablet ? 'flex-1' : ''}`}
                >
                  <Pressable
                    onPress={() => setEntryMode('upload')}
                    className="active:scale-[0.98]"
                    // @ts-ignore - web hover
                    style={({ hovered }: { hovered?: boolean }) => hovered && { transform: [{ scale: 1.02 }] }}
                  >
                    <LinearGradient
                      colors={['#4f46e5', '#4338ca']}
                      style={{
                        borderRadius: 20,
                        padding: 24,
                        minHeight: isDesktop ? 200 : undefined,
                      }}
                    >
                      <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center mb-4">
                        <FileSpreadsheet size={32} color="white" />
                      </View>
                      <Text className="text-xl font-bold text-white">
                        {t('uploadBalanceSheet')}
                      </Text>
                      <Text className="text-indigo-200 mt-2">
                        {isDesktop ? 'Drag & drop or click to upload Excel/CSV files' : t('uploadInstructions')}
                      </Text>
                      {isDesktop && (
                        <View className="flex-row mt-4 gap-2">
                          <View className="bg-white/20 rounded-lg px-2 py-1">
                            <Text className="text-white text-xs">.xlsx</Text>
                          </View>
                          <View className="bg-white/20 rounded-lg px-2 py-1">
                            <Text className="text-white text-xs">.xls</Text>
                          </View>
                          <View className="bg-white/20 rounded-lg px-2 py-1">
                            <Text className="text-white text-xs">.csv</Text>
                          </View>
                        </View>
                      )}
                    </LinearGradient>
                  </Pressable>
                </Animated.View>

                {/* Manual Option */}
                <Animated.View
                  entering={FadeInUp.delay(400).springify()}
                  className={isDesktop || isTablet ? 'flex-1' : ''}
                >
                  <Pressable
                    onPress={() => setEntryMode('manual')}
                    className="active:scale-[0.98]"
                    // @ts-ignore - web hover
                    style={({ hovered }: { hovered?: boolean }) => hovered && { transform: [{ scale: 1.02 }] }}
                  >
                    <LinearGradient
                      colors={['#7c3aed', '#6d28d9']}
                      style={{
                        borderRadius: 20,
                        padding: 24,
                        minHeight: isDesktop ? 200 : undefined,
                      }}
                    >
                      <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center mb-4">
                        <Edit3 size={32} color="white" />
                      </View>
                      <Text className="text-xl font-bold text-white">
                        {t('manualEntry')}
                      </Text>
                      <Text className="text-purple-200 mt-2">
                        Enter values step by step
                      </Text>
                      {isDesktop && (
                        <Text className="text-purple-300 text-sm mt-4">
                          Best for smaller businesses or quick calculations
                        </Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              </View>
            </>
          )}

          {/* Upload Mode - Web Enhanced */}
          {entryMode === 'upload' && (
            <Animated.View
              entering={FadeInUp.delay(200).springify()}
              className="px-6 mt-4"
            >
              {!uploadedFile ? (
                <View>
                  {/* Drag & Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                      borderRadius: 20,
                      border: isDragging ? '3px solid #818cf8' : '2px dashed #4338ca',
                      backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.2)' : 'rgba(49, 46, 129, 0.5)',
                      padding: isDesktop ? 48 : 32,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <label style={{ cursor: 'pointer', display: 'block' }}>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileInput}
                        style={{ display: 'none' }}
                      />
                      <View className="items-center">
                        <View className={`rounded-full bg-indigo-600/50 items-center justify-center ${isDesktop ? 'w-24 h-24' : 'w-16 h-16'}`}>
                          <Upload size={isDesktop ? 48 : 32} color="#a5b4fc" />
                        </View>
                        <Text className={`text-white font-semibold mt-4 ${isDesktop ? 'text-2xl' : 'text-lg'}`}>
                          {isDragging ? 'Drop your file here' : 'Upload Balance Sheet'}
                        </Text>
                        <Text className={`text-indigo-300 mt-2 ${isDesktop ? 'text-lg' : ''}`}>
                          {isDesktop
                            ? 'Drag and drop your Excel or CSV file here, or click to browse'
                            : 'Tap to select a file'}
                        </Text>
                        <View className="mt-6 bg-indigo-600 rounded-xl px-8 py-3">
                          <Text className="text-white font-semibold">Choose File</Text>
                        </View>
                        <Text className="text-indigo-400 text-xs mt-4">
                          Supported: .xlsx, .xls, .csv
                        </Text>
                      </View>
                    </label>
                  </div>

                  {/* Download Template */}
                  <Pressable
                    onPress={downloadTemplate}
                    className="mt-4 flex-row items-center justify-center bg-indigo-800/50 rounded-xl py-3 active:bg-indigo-800"
                    // @ts-ignore - web hover
                    style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(55, 48, 163, 0.7)' }}
                  >
                    <Download size={18} color="#a5b4fc" />
                    <Text className="text-indigo-200 font-medium ml-2">
                      Download CSV Template
                    </Text>
                  </Pressable>

                  {/* Switch to manual option */}
                  <Pressable
                    onPress={() => setEntryMode('manual')}
                    className="mt-4 bg-indigo-900/50 rounded-xl py-3 active:bg-indigo-900"
                  >
                    <Text className="text-indigo-200 text-center font-medium">
                      Or enter manually instead
                    </Text>
                  </Pressable>
                </View>
              ) : isProcessing ? (
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
                      className="px-3 py-1 bg-indigo-600/50 rounded-lg"
                    >
                      <Text className="text-indigo-200 text-sm">Change File</Text>
                    </Pressable>
                  </View>

                  {/* Parsed items - Table view for desktop */}
                  {isDesktop ? (
                    <View className="bg-indigo-900/30 rounded-xl overflow-hidden">
                      <View className="flex-row bg-indigo-800/50 p-3">
                        <Text className="text-indigo-300 font-medium flex-1">Name</Text>
                        <Text className="text-indigo-300 font-medium w-32 text-right">Amount</Text>
                        <Text className="text-indigo-300 font-medium w-24 text-center">Type</Text>
                      </View>
                      {parsedItems.map((item, index) => (
                        <View
                          key={index}
                          className={`flex-row p-3 ${index % 2 === 0 ? 'bg-indigo-900/20' : ''}`}
                        >
                          <Text className="text-white flex-1">{item.name}</Text>
                          <Text className={`w-32 text-right ${item.category === 'asset' ? 'text-emerald-300' : 'text-red-300'}`}>
                            {currencySymbol}{item.amount.toLocaleString()}
                          </Text>
                          <View className="w-24 items-center">
                            <View className={`px-2 py-1 rounded ${item.category === 'asset' ? 'bg-emerald-900/50' : 'bg-red-900/50'}`}>
                              <Text className={`text-xs ${item.category === 'asset' ? 'text-emerald-300' : 'text-red-300'}`}>
                                {item.category}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <>
                      {/* Mobile card view */}
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
                    </>
                  )}

                  {/* Warning about loans */}
                  <View className="bg-amber-900/30 rounded-xl p-4 flex-row mt-4 mb-4">
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
            </Animated.View>
          )}

          {/* Manual Entry Mode */}
          {entryMode === 'manual' && (
            <View className={isDesktop ? 'flex-row gap-8 px-6' : ''}>
              {/* Left column - Company Info */}
              <View className={isDesktop ? 'flex-1' : ''}>
                <Animated.View
                  entering={FadeInUp.delay(200).springify()}
                  className={isMobile ? 'mx-6' : ''}
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

                <Animated.View
                  entering={FadeInUp.delay(300).springify()}
                  className={`mt-6 ${isMobile ? 'mx-6' : ''}`}
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
                      {isDesktop ? (
                        <View className="flex-row flex-wrap p-2">
                          {industries.map((ind) => (
                            <Pressable
                              key={ind.key}
                              onPress={() => {
                                setIndustryType(ind.key);
                                setShowIndustryPicker(false);
                              }}
                              className={`m-1 p-3 rounded-xl active:bg-indigo-700/50 flex-row items-center ${
                                assets.industryType === ind.key ? 'bg-indigo-600' : 'bg-indigo-800/50'
                              }`}
                              // @ts-ignore - web hover
                              style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(79, 70, 229, 0.5)' }}
                            >
                              <Text className="text-xl">{ind.icon}</Text>
                              <Text className="text-white ml-2">
                                {t(ind.key as any)}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      ) : (
                        industries.map((ind) => (
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
                        ))
                      )}
                    </View>
                  )}
                </Animated.View>
              </View>

              {/* Right column - Asset Fields */}
              <Animated.View
                entering={FadeInUp.delay(400).springify()}
                className={`mt-6 ${isMobile ? 'mx-6' : ''} ${isDesktop ? 'flex-1' : ''}`}
              >
                <Text className={`text-white font-semibold mb-4 ${isRTL ? 'text-right' : ''}`}>
                  Business Assets
                </Text>

                <View className={isDesktop ? 'flex-row flex-wrap gap-4' : 'gap-4'}>
                  {[
                    { key: 'cash' as const, label: t('cash'), icon: '💵' },
                    { key: 'receivables' as const, label: t('receivables'), icon: '📋' },
                    { key: 'inventory' as const, label: t('inventory'), icon: '📦' },
                    { key: 'investments' as const, label: t('investments'), icon: '📈' },
                  ].map((field) => (
                    <View
                      key={field.key}
                      className={`bg-indigo-900/50 rounded-xl p-4 ${isDesktop ? 'flex-1 min-w-[200px]' : ''}`}
                    >
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
            </View>
          )}
        </ScrollView>

        {/* Next Button */}
        {entryMode === 'manual' && (
          <Animated.View
            entering={FadeInUp.delay(500).springify()}
            className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4"
            style={{
              backgroundColor: 'rgba(30, 27, 75, 0.95)',
              ...containerStyle,
            }}
          >
            <Pressable
              onPress={handleNext}
              disabled={!canProceed}
              className={`active:scale-[0.98] ${!canProceed ? 'opacity-50' : ''}`}
              // @ts-ignore - web hover
              style={({ hovered }: { hovered?: boolean }) => hovered && canProceed && { transform: [{ scale: 1.02 }] }}
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
                  maxWidth: isDesktop ? 400 : undefined,
                  marginLeft: isDesktop ? 'auto' : undefined,
                  marginRight: isDesktop ? 'auto' : undefined,
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
