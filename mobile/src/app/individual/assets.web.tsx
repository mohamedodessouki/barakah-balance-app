import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, ArrowRight, Plus, Trash2, ChevronDown, ChevronUp, Video, X, Search, Filter } from 'lucide-react-native';
import { useLanguageStore, useSettingsStore, useIndividualCalculatorStore, GoldEntry, AssetSubEntry, SUPPORTED_CURRENCIES } from '@/lib/store';
import { useTranslation } from '@/lib/translations';
import { useResponsive } from '@/lib/useResponsive';

interface AssetField {
  key: string;
  translationKey: string;
}

interface AssetCategory {
  id: string;
  icon: string;
  titleKey: string;
  descKey: string;
  fields: AssetField[];
  color: readonly [string, string];
  videoUrl?: string;
}

const assetCategories: AssetCategory[] = [
  {
    id: 'A',
    icon: '💵',
    titleKey: 'categoryA',
    descKey: 'categoryADesc',
    color: ['#059669', '#047857'] as [string, string],
    fields: [{ key: 'cashOnHand', translationKey: 'cashOnHand' }],
    videoUrl: 'https://www.youtube.com/watch?v=zakat-cash',
  },
  {
    id: 'B',
    icon: '🏦',
    titleKey: 'categoryB',
    descKey: 'categoryBDesc',
    color: ['#0891b2', '#0e7490'] as [string, string],
    fields: [
      { key: 'savingsAccount', translationKey: 'savingsAccount' },
      { key: 'checkingAccount', translationKey: 'checkingAccount' },
      { key: 'certificatesOfDeposit', translationKey: 'certificatesOfDeposit' },
      { key: 'highYieldAccounts', translationKey: 'highYieldAccounts' },
    ],
    videoUrl: 'https://www.youtube.com/watch?v=zakat-bank',
  },
  {
    id: 'C',
    icon: '📈',
    titleKey: 'categoryC',
    descKey: 'categoryCDesc',
    color: ['#7c3aed', '#6d28d9'] as [string, string],
    fields: [
      { key: 'bonds', translationKey: 'bonds' },
      { key: 'sukuk', translationKey: 'sukuk' },
      { key: 'tradingStocks', translationKey: 'tradingStocks' },
      { key: 'mutualFunds', translationKey: 'mutualFunds' },
      { key: 'etfs', translationKey: 'etfs' },
      { key: 'trustFunds', translationKey: 'trustFunds' },
    ],
    videoUrl: 'https://www.youtube.com/watch?v=zakat-investments',
  },
  {
    id: 'D',
    icon: '💳',
    titleKey: 'categoryD',
    descKey: 'categoryDDesc',
    color: ['#db2777', '#be185d'] as [string, string],
    fields: [
      { key: 'prepaidCards', translationKey: 'prepaidCards' },
      { key: 'digitalWallets', translationKey: 'digitalWallets' },
      { key: 'cryptocurrency', translationKey: 'cryptocurrency' },
      { key: 'rewardPoints', translationKey: 'rewardPoints' },
      { key: 'gamingWallets', translationKey: 'gamingWallets' },
    ],
    videoUrl: 'https://www.youtube.com/watch?v=zakat-digital',
  },
  {
    id: 'E',
    icon: '💎',
    titleKey: 'categoryE',
    descKey: 'categoryEDesc',
    color: ['#f59e0b', '#d97706'] as [string, string],
    fields: [
      { key: 'silver', translationKey: 'silver' },
      { key: 'goldInvestments', translationKey: 'goldInvestments' },
      { key: 'diamonds', translationKey: 'diamonds' },
      { key: 'platinum', translationKey: 'platinum' },
      { key: 'investmentJewelry', translationKey: 'investmentJewelry' },
    ],
    videoUrl: 'https://www.youtube.com/watch?v=zakat-gold-silver',
  },
  {
    id: 'F',
    icon: '🏠',
    titleKey: 'categoryF',
    descKey: 'categoryFDesc',
    color: ['#ef4444', '#dc2626'] as [string, string],
    fields: [
      { key: 'investmentProperties', translationKey: 'investmentProperties' },
      { key: 'partialOwnership', translationKey: 'partialOwnership' },
      { key: 'constructionProperties', translationKey: 'constructionProperties' },
    ],
    videoUrl: 'https://www.youtube.com/watch?v=zakat-real-estate',
  },
  {
    id: 'G',
    icon: '🤝',
    titleKey: 'categoryG',
    descKey: 'categoryGDesc',
    color: ['#14b8a6', '#0d9488'] as [string, string],
    fields: [
      { key: 'lifeInsuranceCashValue', translationKey: 'lifeInsuranceCashValue' },
      { key: 'pensionFunds', translationKey: 'pensionFunds' },
      { key: 'receivableDebts', translationKey: 'receivableDebts' },
    ],
    videoUrl: 'https://www.youtube.com/watch?v=zakat-debts-insurance',
  },
  {
    id: 'H',
    icon: '📦',
    titleKey: 'categoryH',
    descKey: 'categoryHDesc',
    color: ['#8b5cf6', '#7c3aed'] as [string, string],
    fields: [
      { key: 'buildingMaterials', translationKey: 'buildingMaterials' },
      { key: 'bulkFood', translationKey: 'bulkFood' },
      { key: 'farmingSupplies', translationKey: 'farmingSupplies' },
      { key: 'bulkClothing', translationKey: 'bulkClothing' },
      { key: 'electronicsInventory', translationKey: 'electronicsInventory' },
    ],
    videoUrl: 'https://www.youtube.com/watch?v=zakat-commodities',
  },
  {
    id: 'I',
    icon: '🎨',
    titleKey: 'categoryI',
    descKey: 'categoryIDesc',
    color: ['#ec4899', '#db2777'] as [string, string],
    fields: [
      { key: 'art', translationKey: 'art' },
      { key: 'rareStamps', translationKey: 'rareStamps' },
      { key: 'vintageCars', translationKey: 'vintageCars' },
      { key: 'designerBags', translationKey: 'designerBags' },
      { key: 'limitedSneakers', translationKey: 'limitedSneakers' },
      { key: 'carbonCredits', translationKey: 'carbonCredits' },
      { key: 'intellectualProperty', translationKey: 'intellectualProperty' },
      { key: 'horses', translationKey: 'horses' },
      { key: 'livestock', translationKey: 'livestock' },
      { key: 'aircraft', translationKey: 'aircraft' },
      { key: 'boats', translationKey: 'boats' },
      { key: 'farmland', translationKey: 'farmland' },
      { key: 'crops', translationKey: 'crops' },
    ],
    videoUrl: 'https://www.youtube.com/watch?v=zakat-unique-assets',
  },
  {
    id: 'J',
    icon: '⛏️',
    titleKey: 'categoryJ',
    descKey: 'categoryJDesc',
    color: ['#6366f1', '#4f46e5'] as [string, string],
    fields: [
      { key: 'minerals', translationKey: 'minerals' },
      { key: 'oil', translationKey: 'oil' },
      { key: 'gas', translationKey: 'gas' },
    ],
    videoUrl: 'https://www.youtube.com/watch?v=zakat-extracted-resources',
  },
];

export default function AssetsScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);
  const country = useSettingsStore((s) => s.country);
  const { isMobile, isTablet, isDesktop, columns } = useResponsive();

  const assets = useIndividualCalculatorStore((s) => s.assets);
  const addGoldEntry = useIndividualCalculatorStore((s) => s.addGoldEntry);
  const removeGoldEntry = useIndividualCalculatorStore((s) => s.removeGoldEntry);
  const addSubEntry = useIndividualCalculatorStore((s) => s.addSubEntry);
  const removeSubEntry = useIndividualCalculatorStore((s) => s.removeSubEntry);
  const getTotalAssets = useIndividualCalculatorStore((s) => s.getTotalAssets);

  const [expandedCategories, setExpandedCategories] = useState<string[]>(['A']);
  const [expandedFields, setExpandedFields] = useState<string[]>([]);
  const [showGoldModal, setShowGoldModal] = useState(false);
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [activeFieldKey, setActiveFieldKey] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newGoldEntry, setNewGoldEntry] = useState<GoldEntry>({
    karat: '24k',
    weightGrams: 0,
    pricePerGram: 0,
  });
  const [newEntry, setNewEntry] = useState({
    name: '',
    description: '',
    amount: '',
    currency: country?.currency || 'USD',
    exchangeRate: '1',
  });

  const currencySymbol = country?.currencySymbol ?? '$';

  // Container style for centering on large screens
  const containerStyle = isDesktop
    ? { maxWidth: 1400, marginHorizontal: 'auto' as const, width: '100%' as const }
    : isTablet
    ? { maxWidth: 900, marginHorizontal: 'auto' as const, width: '100%' as const }
    : {};

  // Filter categories based on search
  const filteredCategories = searchQuery
    ? assetCategories.filter(
        (cat) =>
          t(cat.titleKey as any).toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.fields.some((f) =>
            t(f.translationKey as any).toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : assetCategories;

  const handleBack = () => router.back();
  const handleNext = () => router.push('/individual/deductions');

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleField = (key: string) => {
    setExpandedFields((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const openAddEntryModal = (fieldKey: string) => {
    setActiveFieldKey(fieldKey);
    setNewEntry({
      name: '',
      description: '',
      amount: '',
      currency: country?.currency || 'USD',
      exchangeRate: '1',
    });
    setShowAddEntryModal(true);
  };

  const handleAddEntry = () => {
    const amount = parseFloat(newEntry.amount) || 0;
    const exchangeRate = parseFloat(newEntry.exchangeRate) || 1;
    const convertedAmount = amount * exchangeRate;

    if (amount > 0 && newEntry.name.trim()) {
      addSubEntry(activeFieldKey, {
        name: newEntry.name.trim(),
        description: newEntry.description.trim() || undefined,
        amount,
        currency: newEntry.currency,
        exchangeRate,
        convertedAmount,
      });
      setShowAddEntryModal(false);
    }
  };

  const handleAddGold = () => {
    if (newGoldEntry.weightGrams > 0 && newGoldEntry.pricePerGram > 0) {
      addGoldEntry(newGoldEntry);
      setNewGoldEntry({ karat: '24k', weightGrams: 0, pricePerGram: 0 });
      setShowGoldModal(false);
    }
  };

  const getFieldEntries = (fieldKey: string): AssetSubEntry[] => {
    const entriesKey = `${fieldKey}Entries` as keyof typeof assets;
    return (assets[entriesKey] as AssetSubEntry[]) || [];
  };

  const getFieldTotal = (fieldKey: string): number => {
    const entries = getFieldEntries(fieldKey);
    return entries.reduce((sum, e) => sum + e.convertedAmount, 0);
  };

  const totalAssets = getTotalAssets();

  const getCurrencySymbol = (code: string) => {
    return SUPPORTED_CURRENCIES.find((c) => c.code === code)?.symbol || code;
  };

  // Keyboard shortcut handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to proceed
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleNext();
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowAddEntryModal(false);
        setShowGoldModal(false);
      }
      // Cmd/Ctrl + F to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && isDesktop) {
        e.preventDefault();
        // Focus search input
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
          style={containerStyle}
        >
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Pressable
              onPress={handleBack}
              className={`p-2 rounded-full bg-white/10 ${isRTL ? 'ml-4' : 'mr-4'}`}
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
              Assets
            </Text>
          </View>

          {/* Search bar for desktop */}
          {isDesktop && (
            <View className="flex-row items-center bg-emerald-800/50 rounded-xl px-4 py-2 flex-1 mx-8 max-w-md">
              <Search size={18} color="#6ee7b7" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search categories... (Ctrl+F)"
                placeholderTextColor="#6b7280"
                className="flex-1 text-white ml-2"
              />
            </View>
          )}

          <View className="bg-emerald-600/50 rounded-xl px-4 py-2">
            <Text className="text-emerald-200 font-semibold">
              {currencySymbol} {totalAssets.toLocaleString()}
            </Text>
          </View>
        </Animated.View>

        {/* Step Indicator */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="px-6 pt-4"
          style={containerStyle}
        >
          <View className="flex-row items-center justify-center gap-2">
            <View className="w-8 h-8 rounded-full bg-emerald-700 items-center justify-center">
              <Text className="text-white/50 font-bold">1</Text>
            </View>
            <View className="w-12 h-1 bg-emerald-500 rounded-full" />
            <View className="w-8 h-8 rounded-full bg-emerald-500 items-center justify-center">
              <Text className="text-white font-bold">2</Text>
            </View>
            <View className="w-12 h-1 bg-emerald-800 rounded-full" />
            <View className="w-8 h-8 rounded-full bg-emerald-800 items-center justify-center">
              <Text className="text-white/50 font-bold">3</Text>
            </View>
          </View>
          {isDesktop && (
            <Text className="text-emerald-400 text-center text-sm mt-2">
              Press Ctrl+Enter to proceed to next step
            </Text>
          )}
        </Animated.View>

        <ScrollView
          className="flex-1 mt-4"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Categories Grid */}
          <View
            style={{
              ...containerStyle,
              flexDirection: isDesktop ? 'row' : 'column',
              flexWrap: isDesktop ? 'wrap' : 'nowrap',
              paddingHorizontal: 16,
            }}
          >
            {filteredCategories.map((category, index) => {
              const isExpanded = expandedCategories.includes(category.id);

              let categoryTotal = 0;
              category.fields.forEach((field) => {
                categoryTotal += getFieldTotal(field.key);
              });

              let goldTotal = 0;
              if (category.id === 'E') {
                goldTotal = assets.gold.reduce((sum, g) => {
                  const purity = g.karat === '24k' ? 1 : g.karat === '21k' ? 0.875 : 0.75;
                  return sum + g.weightGrams * g.pricePerGram * purity;
                }, 0);
              }

              const totalWithGold = categoryTotal + goldTotal;

              return (
                <Animated.View
                  key={category.id}
                  entering={FadeInUp.delay(300 + index * 30).springify()}
                  style={{
                    width: isDesktop ? `${100 / columns}%` : '100%',
                    padding: 8,
                  }}
                >
                  {/* Category Header */}
                  <Pressable
                    onPress={() => toggleCategory(category.id)}
                    // @ts-ignore - web hover
                    style={({ hovered }: { hovered?: boolean }) => ({
                      opacity: hovered ? 0.9 : 1,
                      transform: hovered ? [{ scale: 1.01 }] : [],
                    })}
                  >
                    <LinearGradient
                      colors={category.color}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        borderRadius: isExpanded ? 16 : 12,
                        borderBottomLeftRadius: isExpanded ? 0 : 12,
                        borderBottomRightRadius: isExpanded ? 0 : 12,
                        padding: 16,
                      }}
                    >
                      <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <View className={`flex-row items-center flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {isExpanded ? (
                            <ChevronUp size={20} color="white" />
                          ) : (
                            <ChevronDown size={20} color="white" />
                          )}
                          {category.videoUrl && (
                            <Pressable
                              onPress={(e) => {
                                e.stopPropagation();
                                Linking.openURL(category.videoUrl!);
                              }}
                              className={`p-1.5 rounded-full bg-white/20 ${isRTL ? 'mr-2' : 'ml-2'}`}
                              // @ts-ignore - web hover
                              style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(255,255,255,0.3)' }}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                              <Video size={14} color="white" />
                            </Pressable>
                          )}
                          <View className={`flex-1 ${isRTL ? 'mr-3 items-end' : 'ml-3'}`}>
                            <Text className={`text-white font-semibold ${isRTL ? 'text-right' : ''}`}>
                              {t(category.titleKey as any)}
                            </Text>
                            <Text className={`text-white/70 text-xs ${isRTL ? 'text-right' : ''}`}>
                              {t(category.descKey as any)}
                            </Text>
                          </View>
                        </View>
                        <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {totalWithGold > 0 && (
                            <Text className={`text-white/90 text-sm font-medium ${isRTL ? 'ml-2' : 'mr-2'}`}>
                              {currencySymbol}{totalWithGold.toLocaleString()}
                            </Text>
                          )}
                          <Text className="text-2xl">{category.icon}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </Pressable>

                  {/* Category Fields */}
                  {isExpanded && (
                    <View className="bg-emerald-900/50 rounded-b-xl p-4 gap-3">
                      {/* Gold Section for Category E */}
                      {category.id === 'E' && (
                        <View className="mb-2">
                          <View className={`flex-row items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Text className={`text-white font-medium ${isRTL ? 'text-right' : ''}`}>
                              {t('gold')}
                            </Text>
                            <Pressable
                              onPress={() => setShowGoldModal(true)}
                              className="bg-amber-600/50 rounded-lg px-3 py-1 flex-row items-center"
                              // @ts-ignore - web hover
                              style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(217, 119, 6, 0.7)' }}
                            >
                              <Plus size={14} color="white" />
                              <Text className="text-white text-sm ml-1">{t('addGold')}</Text>
                            </Pressable>
                          </View>
                          {assets.gold.map((g, i) => {
                            const purity = g.karat === '24k' ? 1 : g.karat === '21k' ? 0.875 : 0.75;
                            const value = g.weightGrams * g.pricePerGram * purity;
                            return (
                              <View
                                key={i}
                                className={`flex-row items-center justify-between bg-amber-900/30 rounded-lg p-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                              >
                                <View>
                                  <Text className="text-amber-200 text-sm">{g.karat} - {g.weightGrams}g</Text>
                                  <Text className="text-amber-400 text-xs">{currencySymbol}{value.toLocaleString()}</Text>
                                </View>
                                <Pressable
                                  onPress={() => removeGoldEntry(i)}
                                  className="p-2"
                                  // @ts-ignore - web hover
                                  style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 8 }}
                                >
                                  <Trash2 size={18} color="#f87171" />
                                </Pressable>
                              </View>
                            );
                          })}
                        </View>
                      )}

                      {/* Regular Fields */}
                      {category.fields.map((field) => {
                        const entries = getFieldEntries(field.key);
                        const fieldTotal = getFieldTotal(field.key);
                        const isFieldExpanded = expandedFields.includes(field.key);

                        return (
                          <View key={field.key} className="bg-emerald-800/30 rounded-xl overflow-hidden">
                            <Pressable
                              onPress={() => toggleField(field.key)}
                              className={`flex-row items-center justify-between p-3 ${isRTL ? 'flex-row-reverse' : ''}`}
                              // @ts-ignore - web hover
                              style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                            >
                              <View className={`flex-row items-center flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                {isFieldExpanded ? (
                                  <ChevronUp size={16} color="#6ee7b7" />
                                ) : (
                                  <ChevronDown size={16} color="#6ee7b7" />
                                )}
                                <Text className={`text-white font-medium ${isRTL ? 'mr-2 text-right' : 'ml-2'}`}>
                                  {t(field.translationKey as any)}
                                </Text>
                              </View>
                              <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                                {fieldTotal > 0 && (
                                  <Text className={`text-emerald-300 text-sm ${isRTL ? 'ml-3' : 'mr-3'}`}>
                                    {currencySymbol}{fieldTotal.toLocaleString()}
                                  </Text>
                                )}
                                <View className="bg-emerald-700/50 rounded-full px-2 py-0.5">
                                  <Text className="text-emerald-200 text-xs">{entries.length}</Text>
                                </View>
                              </View>
                            </Pressable>

                            {isFieldExpanded && (
                              <View className="px-3 pb-3">
                                {/* Desktop table view */}
                                {isDesktop && entries.length > 0 && (
                                  <View className="bg-emerald-900/30 rounded-lg overflow-hidden mb-2">
                                    <View className="flex-row bg-emerald-800/50 p-2">
                                      <Text className="text-emerald-300 text-xs flex-1">Name</Text>
                                      <Text className="text-emerald-300 text-xs w-24 text-right">Amount</Text>
                                      <Text className="text-emerald-300 text-xs w-24 text-right">Converted</Text>
                                      <Text className="text-emerald-300 text-xs w-12"></Text>
                                    </View>
                                    {entries.map((entry) => (
                                      <View
                                        key={entry.id}
                                        className="flex-row items-center p-2 border-t border-emerald-800/30"
                                      >
                                        <View className="flex-1">
                                          <Text className="text-white text-sm">{entry.name}</Text>
                                          {entry.description && (
                                            <Text className="text-white/50 text-xs">{entry.description}</Text>
                                          )}
                                        </View>
                                        <Text className="text-emerald-400 text-sm w-24 text-right">
                                          {getCurrencySymbol(entry.currency)}{entry.amount.toLocaleString()}
                                        </Text>
                                        <Text className="text-emerald-300 text-sm w-24 text-right">
                                          {currencySymbol}{entry.convertedAmount.toLocaleString()}
                                        </Text>
                                        <Pressable
                                          onPress={() => removeSubEntry(field.key, entry.id)}
                                          className="w-12 items-center"
                                          // @ts-ignore - web hover
                                          style={({ hovered }: { hovered?: boolean }) => hovered && { opacity: 0.7 }}
                                        >
                                          <Trash2 size={14} color="#f87171" />
                                        </Pressable>
                                      </View>
                                    ))}
                                  </View>
                                )}

                                {/* Mobile card view */}
                                {!isDesktop && entries.map((entry) => (
                                  <View
                                    key={entry.id}
                                    className="bg-emerald-900/50 rounded-lg p-3 mb-2"
                                  >
                                    <View className="flex-row items-start justify-between w-full">
                                      <View className="flex-1">
                                        <Text className="text-white font-medium">{entry.name}</Text>
                                        {entry.description && (
                                          <Text className="text-white/50 text-xs mt-0.5">{entry.description}</Text>
                                        )}
                                        <View className="flex-row items-center mt-1">
                                          <Text className="text-emerald-400 text-sm">
                                            {getCurrencySymbol(entry.currency)} {entry.amount.toLocaleString()}
                                          </Text>
                                          {entry.currency !== (country?.currency || 'USD') && (
                                            <Text className="text-white/40 text-xs ml-2">@ {entry.exchangeRate}</Text>
                                          )}
                                        </View>
                                        {entry.currency !== (country?.currency || 'USD') && (
                                          <Text className="text-emerald-300 text-xs mt-0.5">
                                            = {currencySymbol}{entry.convertedAmount.toLocaleString()}
                                          </Text>
                                        )}
                                      </View>
                                      <Pressable
                                        onPress={() => removeSubEntry(field.key, entry.id)}
                                        className="p-1"
                                      >
                                        <Trash2 size={16} color="#f87171" />
                                      </Pressable>
                                    </View>
                                  </View>
                                ))}

                                <Pressable
                                  onPress={() => openAddEntryModal(field.key)}
                                  className="flex-row items-center justify-center bg-emerald-700/30 rounded-lg p-3 border border-dashed border-emerald-600/50"
                                  // @ts-ignore - web hover
                                  style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                                >
                                  <Plus size={16} color="#10b981" />
                                  <Text className="text-emerald-400 text-sm ml-2">
                                    Add {t(field.translationKey as any)}
                                  </Text>
                                </Pressable>
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>

        {/* Next Button */}
        <Animated.View
          entering={FadeInUp.delay(800).springify()}
          className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4"
          style={{
            backgroundColor: 'rgba(6, 78, 59, 0.95)',
          }}
        >
          <View style={containerStyle}>
            <Pressable
              onPress={handleNext}
              // @ts-ignore - web hover
              style={({ hovered }: { hovered?: boolean }) => ({
                transform: hovered ? [{ scale: 1.02 }] : [],
                maxWidth: isDesktop ? 400 : undefined,
                marginLeft: isDesktop ? 'auto' : undefined,
                marginRight: isDesktop ? 'auto' : undefined,
              })}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
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
                  {t('next')}
                </Text>
                <ArrowRight
                  size={20}
                  color="white"
                  style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
                />
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>

        {/* Add Entry Modal */}
        <Modal
          visible={showAddEntryModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddEntryModal(false)}
        >
          <Pressable
            className="flex-1 bg-black/70 justify-center items-center px-6"
            onPress={() => setShowAddEntryModal(false)}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={{
                maxWidth: isDesktop ? 500 : '100%',
                width: '100%',
              }}
            >
              <View className="bg-emerald-900 rounded-2xl p-6">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-white text-xl font-bold">Add Entry</Text>
                  <Pressable
                    onPress={() => setShowAddEntryModal(false)}
                    className="p-2"
                    // @ts-ignore - web hover
                    style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }}
                  >
                    <X size={20} color="white" />
                  </Pressable>
                </View>

                <Text className="text-white/70 text-sm mb-2">Name / ID</Text>
                <TextInput
                  value={newEntry.name}
                  onChangeText={(v) => setNewEntry((p) => ({ ...p, name: v }))}
                  placeholder="e.g., Apple Inc. Bonds"
                  placeholderTextColor="#6b7280"
                  className="bg-emerald-800 rounded-xl px-4 py-3 text-white mb-4"
                  autoFocus={isDesktop}
                />

                <Text className="text-white/70 text-sm mb-2">Description (optional)</Text>
                <TextInput
                  value={newEntry.description}
                  onChangeText={(v) => setNewEntry((p) => ({ ...p, description: v }))}
                  placeholder="e.g., Corporate bonds, 5% yield"
                  placeholderTextColor="#6b7280"
                  className="bg-emerald-800 rounded-xl px-4 py-3 text-white mb-4"
                />

                <Text className="text-white/70 text-sm mb-2">Amount</Text>
                <TextInput
                  value={newEntry.amount}
                  onChangeText={(v) => setNewEntry((p) => ({ ...p, amount: v.replace(/[^0-9.]/g, '') }))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  className="bg-emerald-800 rounded-xl px-4 py-3 text-white mb-4"
                />

                <Text className="text-white/70 text-sm mb-2">Currency</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-4"
                  style={{ flexGrow: 0 }}
                >
                  <View className="flex-row gap-2">
                    {SUPPORTED_CURRENCIES.map((curr) => (
                      <Pressable
                        key={curr.code}
                        onPress={() => setNewEntry((p) => ({ ...p, currency: curr.code }))}
                        className={`px-3 py-2 rounded-lg ${newEntry.currency === curr.code ? 'bg-emerald-600' : 'bg-emerald-800'}`}
                        // @ts-ignore - web hover
                        style={({ hovered }: { hovered?: boolean }) => hovered && newEntry.currency !== curr.code && { backgroundColor: 'rgba(16, 185, 129, 0.3)' }}
                      >
                        <Text className="text-white text-sm">{curr.symbol} {curr.code}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>

                {newEntry.currency !== (country?.currency || 'USD') && (
                  <>
                    <Text className="text-white/70 text-sm mb-2">
                      Exchange Rate (1 {newEntry.currency} = ? {country?.currency || 'USD'})
                    </Text>
                    <TextInput
                      value={newEntry.exchangeRate}
                      onChangeText={(v) => setNewEntry((p) => ({ ...p, exchangeRate: v.replace(/[^0-9.]/g, '') }))}
                      keyboardType="numeric"
                      placeholder="1"
                      placeholderTextColor="#6b7280"
                      className="bg-emerald-800 rounded-xl px-4 py-3 text-white mb-2"
                    />
                    {newEntry.amount && newEntry.exchangeRate && (
                      <Text className="text-emerald-400 text-sm mb-4">
                        = {currencySymbol}{((parseFloat(newEntry.amount) || 0) * (parseFloat(newEntry.exchangeRate) || 1)).toLocaleString()} {country?.currency || 'USD'}
                      </Text>
                    )}
                  </>
                )}

                <View className="flex-row gap-3 mt-2">
                  <Pressable
                    onPress={() => setShowAddEntryModal(false)}
                    className="flex-1 bg-emerald-800 rounded-xl py-3"
                    // @ts-ignore - web hover
                    style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(6, 78, 59, 0.8)' }}
                  >
                    <Text className="text-white text-center font-medium">{t('cancel')}</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleAddEntry}
                    className="flex-1 bg-emerald-600 rounded-xl py-3"
                    // @ts-ignore - web hover
                    style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(16, 185, 129, 0.8)' }}
                  >
                    <Text className="text-white text-center font-bold">Add</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Gold Entry Modal */}
        <Modal
          visible={showGoldModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowGoldModal(false)}
        >
          <View className="flex-1 bg-black/70 justify-center items-center px-6">
            <View
              className="bg-emerald-900 rounded-2xl p-6"
              style={{ maxWidth: isDesktop ? 400 : '100%', width: '100%' }}
            >
              <Text className="text-white text-xl font-bold mb-6 text-center">{t('addGold')}</Text>

              <Text className="text-white/70 text-sm mb-2">{t('karat')}</Text>
              <View className="flex-row gap-2 mb-4">
                {(['24k', '21k', '18k'] as const).map((k) => (
                  <Pressable
                    key={k}
                    onPress={() => setNewGoldEntry((p) => ({ ...p, karat: k }))}
                    className={`flex-1 py-3 rounded-xl ${newGoldEntry.karat === k ? 'bg-amber-600' : 'bg-emerald-800'}`}
                    // @ts-ignore - web hover
                    style={({ hovered }: { hovered?: boolean }) => hovered && newGoldEntry.karat !== k && { backgroundColor: 'rgba(217, 119, 6, 0.3)' }}
                  >
                    <Text className="text-white text-center font-medium">{k}</Text>
                  </Pressable>
                ))}
              </View>

              <Text className="text-white/70 text-sm mb-2">{t('weight')}</Text>
              <TextInput
                value={newGoldEntry.weightGrams > 0 ? String(newGoldEntry.weightGrams) : ''}
                onChangeText={(v) => setNewGoldEntry((p) => ({ ...p, weightGrams: parseFloat(v) || 0 }))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#6b7280"
                className="bg-emerald-800 rounded-xl px-4 py-3 text-white mb-4"
              />

              <Text className="text-white/70 text-sm mb-2">{t('pricePerGram')}</Text>
              <View className="flex-row items-center bg-emerald-800 rounded-xl px-4 py-3 mb-6">
                <Text className="text-emerald-300 mr-2">{currencySymbol}</Text>
                <TextInput
                  value={newGoldEntry.pricePerGram > 0 ? String(newGoldEntry.pricePerGram) : ''}
                  onChangeText={(v) => setNewGoldEntry((p) => ({ ...p, pricePerGram: parseFloat(v) || 0 }))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  className="flex-1 text-white"
                />
              </View>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setShowGoldModal(false)}
                  className="flex-1 bg-emerald-800 rounded-xl py-3"
                >
                  <Text className="text-white text-center font-medium">{t('cancel')}</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddGold}
                  className="flex-1 bg-amber-600 rounded-xl py-3"
                >
                  <Text className="text-white text-center font-bold">{t('save')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
