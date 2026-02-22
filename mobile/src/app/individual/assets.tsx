import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal, Linking, Keyboard, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { ArrowLeft, ArrowRight, Plus, Trash2, ChevronDown, ChevronUp, Video, X } from 'lucide-react-native';
import { useLanguageStore, useSettingsStore, useIndividualCalculatorStore, GoldEntry, AssetSubEntry, SUPPORTED_CURRENCIES } from '@/lib/store';
import { useTranslation } from '@/lib/translations';

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
    color: ['#059669', '#047857'] as [string, string], // Emerald - Cash
    fields: [{ key: 'cashOnHand', translationKey: 'cashOnHand' }],
    videoUrl: 'https://www.youtube.com/watch?v=zakat-cash',
  },
  {
    id: 'B',
    icon: '🏦',
    titleKey: 'categoryB',
    descKey: 'categoryBDesc',
    color: ['#0891b2', '#0e7490'] as [string, string], // Cyan - Bank
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
    color: ['#7c3aed', '#6d28d9'] as [string, string], // Purple - Investments
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
    color: ['#db2777', '#be185d'] as [string, string], // Pink - Digital
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
    color: ['#f59e0b', '#d97706'] as [string, string], // Amber - Precious Metals
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
    color: ['#ef4444', '#dc2626'] as [string, string], // Red - Real Estate
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
    color: ['#14b8a6', '#0d9488'] as [string, string], // Teal - Debts/Insurance
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
    color: ['#8b5cf6', '#7c3aed'] as [string, string], // Violet - Commodities
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
    color: ['#ec4899', '#db2777'] as [string, string], // Fuchsia - Unique Assets
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
    color: ['#6366f1', '#4f46e5'] as [string, string], // Indigo - Extracted Resources
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

  const assets = useIndividualCalculatorStore((s) => s.assets);
  const baseCurrency = useIndividualCalculatorStore((s) => s.baseCurrency);
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
  const [newGoldEntry, setNewGoldEntry] = useState<GoldEntry>({
    karat: '24k',
    weightGrams: 0,
    pricePerGram: 0,
  });
  const [newEntry, setNewEntry] = useState({
    name: '',
    amount: '',
    units: '',
    unitValue: '',
    currency: country?.currency || 'USD',
    exchangeRate: '1',
  });
  const [entryMode, setEntryMode] = useState<'amount' | 'units'>('amount');

  const currencySymbol = country?.currencySymbol ?? '$';

  // Fields that should use unit-based entry (name, units, unit value)
  const unitBasedFields = [
    'cryptocurrency', 'tradingStocks', 'mutualFunds', 'etfs', 'bonds', 'sukuk', 'trustFunds',
    'silver', 'goldInvestments', 'platinum', 'diamonds', 'investmentJewelry'
  ];

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push('/individual/deductions');
  };

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
    const isUnitBased = unitBasedFields.includes(fieldKey);
    setEntryMode(isUnitBased ? 'units' : 'amount');
    setNewEntry({
      name: '',
      amount: '',
      units: '',
      unitValue: '',
      currency: country?.currency || 'USD',
      exchangeRate: '1',
    });
    setShowAddEntryModal(true);
  };

  const handleAddEntry = () => {
    let amount: number;

    if (entryMode === 'units') {
      // Calculate amount from units * unit value
      const units = parseFloat(newEntry.units) || 0;
      const unitValue = parseFloat(newEntry.unitValue) || 0;
      amount = units * unitValue;
    } else {
      amount = parseFloat(newEntry.amount) || 0;
    }

    const exchangeRate = parseFloat(newEntry.exchangeRate) || 1;
    const convertedAmount = amount * exchangeRate;

    if (amount > 0 && newEntry.name.trim()) {
      addSubEntry(activeFieldKey, {
        name: newEntry.name.trim(),
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
              Assets
            </Text>
          </View>
          <View className="bg-emerald-600/50 rounded-xl px-3 py-1">
            <Text className="text-emerald-200 text-sm">
              {currencySymbol} {totalAssets.toLocaleString()}
            </Text>
          </View>
        </Animated.View>

        {/* Step Indicator */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="px-6 pt-4"
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
        </Animated.View>

        <ScrollView
          className="flex-1 mt-4"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {assetCategories.map((category, index) => {
            const isExpanded = expandedCategories.includes(category.id);

            // Calculate category total from all field entries
            let categoryTotal = 0;
            category.fields.forEach((field) => {
              categoryTotal += getFieldTotal(field.key);
            });

            // Add gold value for category E
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
                entering={FadeInUp.delay(300 + index * 50).springify()}
                className="mx-4 mb-3"
              >
                {/* Category Header */}
                <Pressable
                  onPress={() => toggleCategory(category.id)}
                  className="active:opacity-90"
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
                            className={`p-1.5 rounded-full bg-white/20 active:bg-white/30 ${isRTL ? 'mr-2' : 'ml-2'}`}
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
                            className="bg-amber-600/50 rounded-lg px-3 py-1 flex-row items-center active:bg-amber-600"
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
                              >
                                <Trash2 size={18} color="#f87171" />
                              </Pressable>
                            </View>
                          );
                        })}
                      </View>
                    )}

                    {/* Regular Fields with Sub-entries */}
                    {category.fields.map((field) => {
                      const entries = getFieldEntries(field.key);
                      const fieldTotal = getFieldTotal(field.key);
                      const isFieldExpanded = expandedFields.includes(field.key);

                      return (
                        <View key={field.key} className="bg-emerald-800/30 rounded-xl overflow-hidden">
                          {/* Field Header */}
                          <Pressable
                            onPress={() => toggleField(field.key)}
                            className={`flex-row items-center justify-between p-3 ${isRTL ? 'flex-row-reverse' : ''}`}
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

                          {/* Field Entries */}
                          {isFieldExpanded && (
                            <View className="px-3 pb-3">
                              {entries.map((entry) => (
                                <View
                                  key={entry.id}
                                  className={`bg-emerald-900/50 rounded-lg p-3 mb-2 ${isRTL ? 'items-end' : ''}`}
                                >
                                  <View className={`flex-row items-start justify-between w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <View className="flex-1">
                                      <Text className={`text-white font-medium ${isRTL ? 'text-right' : ''}`}>
                                        {entry.name}
                                      </Text>
                                      {entry.description && (
                                        <Text className={`text-white/50 text-xs mt-0.5 ${isRTL ? 'text-right' : ''}`}>
                                          {entry.description}
                                        </Text>
                                      )}
                                      <View className={`flex-row items-center mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <Text className="text-emerald-400 text-sm">
                                          {getCurrencySymbol(entry.currency)} {entry.amount.toLocaleString()}
                                        </Text>
                                        {entry.currency !== (country?.currency || 'USD') && (
                                          <Text className={`text-white/40 text-xs ${isRTL ? 'mr-2' : 'ml-2'}`}>
                                            @ {entry.exchangeRate}
                                          </Text>
                                        )}
                                      </View>
                                      {entry.currency !== (country?.currency || 'USD') && (
                                        <Text className={`text-emerald-300 text-xs mt-0.5 ${isRTL ? 'text-right' : ''}`}>
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

                              {/* Add Entry Button */}
                              <Pressable
                                onPress={() => openAddEntryModal(field.key)}
                                className={`flex-row items-center justify-center bg-emerald-700/30 rounded-lg p-3 border border-dashed border-emerald-600/50 active:bg-emerald-700/50 ${isRTL ? 'flex-row-reverse' : ''}`}
                              >
                                <Plus size={16} color="#10b981" />
                                <Text className={`text-emerald-400 text-sm ${isRTL ? 'mr-2' : 'ml-2'}`}>
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
        </ScrollView>

        {/* Next Button */}
        <Animated.View
          entering={FadeInUp.delay(800).springify()}
          className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4"
          style={{
            backgroundColor: 'rgba(6, 78, 59, 0.95)',
          }}
        >
          <Pressable
            onPress={handleNext}
            className="active:scale-[0.98]"
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
        </Animated.View>

        {/* Add Entry Modal */}
        <Modal
          visible={showAddEntryModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddEntryModal(false)}
        >
          <Pressable
            className="flex-1 bg-black/70 justify-end"
            onPress={() => {
              Keyboard.dismiss();
              setShowAddEntryModal(false);
            }}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="bg-emerald-900 rounded-t-3xl p-6 pb-10">
                {/* Keyboard Dismiss Handle */}
                <Pressable
                  onPress={() => Keyboard.dismiss()}
                  className="items-center mb-4"
                >
                  <View className="w-12 h-1 bg-white/30 rounded-full" />
                  <View className="flex-row items-center mt-2">
                    <ChevronDown size={16} color="#6ee7b7" />
                    <Text className="text-emerald-400 text-xs ml-1">Tap to dismiss keyboard</Text>
                  </View>
                </Pressable>

                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-white text-xl font-bold">
                    Add Entry
                  </Text>
                  <Pressable onPress={() => setShowAddEntryModal(false)} className="p-2">
                    <X size={20} color="white" />
                  </Pressable>
                </View>

                {/* Name */}
                <Text className="text-white/70 text-sm mb-2">Name / Symbol</Text>
                <TextInput
                  value={newEntry.name}
                  onChangeText={(v) => setNewEntry((p) => ({ ...p, name: v }))}
                  placeholder={entryMode === 'units' ? "e.g., BTC, AAPL, Silver Bar" : "e.g., Savings Account"}
                  placeholderTextColor="#6b7280"
                  className="bg-emerald-800 rounded-xl px-4 py-3 text-white mb-4"
                />

                {/* Unit-based entry for stocks, crypto, metals */}
                {entryMode === 'units' ? (
                  <>
                    {/* Number of Units */}
                    <Text className="text-white/70 text-sm mb-2">Number of Units</Text>
                    <TextInput
                      value={newEntry.units}
                      onChangeText={(v) => setNewEntry((p) => ({ ...p, units: v.replace(/[^0-9.]/g, '') }))}
                      keyboardType="numeric"
                      placeholder="e.g., 0.5, 100, 10"
                      placeholderTextColor="#6b7280"
                      className="bg-emerald-800 rounded-xl px-4 py-3 text-white mb-4"
                    />

                    {/* Value per Unit */}
                    <Text className="text-white/70 text-sm mb-2">Value per Unit</Text>
                    <TextInput
                      value={newEntry.unitValue}
                      onChangeText={(v) => setNewEntry((p) => ({ ...p, unitValue: v.replace(/[^0-9.]/g, '') }))}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#6b7280"
                      className="bg-emerald-800 rounded-xl px-4 py-3 text-white mb-4"
                    />

                    {/* Calculated Total */}
                    {newEntry.units && newEntry.unitValue ? (
                      <View className="bg-emerald-700/50 rounded-xl px-4 py-3 mb-4">
                        <Text className="text-emerald-300 text-sm">Total Value</Text>
                        <Text className="text-white text-lg font-bold">
                          {((parseFloat(newEntry.units) || 0) * (parseFloat(newEntry.unitValue) || 0)).toLocaleString()} {newEntry.currency}
                        </Text>
                      </View>
                    ) : null}
                  </>
                ) : (
                  <>
                    {/* Amount - for simple entries */}
                    <Text className="text-white/70 text-sm mb-2">Amount</Text>
                    <TextInput
                      value={newEntry.amount}
                      onChangeText={(v) => setNewEntry((p) => ({ ...p, amount: v.replace(/[^0-9.]/g, '') }))}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#6b7280"
                      className="bg-emerald-800 rounded-xl px-4 py-3 text-white mb-4"
                    />
                  </>
                )}

                {/* Currency Selection */}
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
                        className={`px-3 py-2 rounded-lg ${
                          newEntry.currency === curr.code ? 'bg-emerald-600' : 'bg-emerald-800'
                        }`}
                      >
                        <Text className="text-white text-sm">{curr.symbol} {curr.code}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>

                {/* Exchange Rate (if different from base) */}
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
                    {newEntry.amount && newEntry.exchangeRate ? (
                      <Text className="text-emerald-400 text-sm mb-4">
                        = {currencySymbol}{((parseFloat(newEntry.amount) || 0) * (parseFloat(newEntry.exchangeRate) || 1)).toLocaleString()} {country?.currency || 'USD'}
                      </Text>
                    ) : null}
                  </>
                )}

                {/* Buttons */}
                <View className="flex-row gap-3 mt-2">
                  <Pressable
                    onPress={() => setShowAddEntryModal(false)}
                    className="flex-1 bg-emerald-800 rounded-xl py-3"
                  >
                    <Text className="text-white text-center font-medium">{t('cancel')}</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleAddEntry}
                    className="flex-1 bg-emerald-600 rounded-xl py-3"
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
          <Pressable
            className="flex-1 bg-black/70 justify-end"
            onPress={() => {
              Keyboard.dismiss();
              setShowGoldModal(false);
            }}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="bg-emerald-900 rounded-t-3xl p-6 pb-10">
                {/* Keyboard Dismiss Handle */}
                <Pressable
                  onPress={() => Keyboard.dismiss()}
                  className="items-center mb-4"
                >
                  <View className="w-12 h-1 bg-white/30 rounded-full" />
                  <View className="flex-row items-center mt-2">
                    <ChevronDown size={16} color="#6ee7b7" />
                    <Text className="text-emerald-400 text-xs ml-1">Tap to dismiss keyboard</Text>
                  </View>
                </Pressable>

                <Text className="text-white text-xl font-bold mb-6 text-center">
                {t('addGold')}
              </Text>

              {/* Karat Selection */}
              <Text className="text-white/70 text-sm mb-2">{t('karat')}</Text>
              <View className="flex-row gap-2 mb-4">
                {(['24k', '21k', '18k'] as const).map((k) => (
                  <Pressable
                    key={k}
                    onPress={() => setNewGoldEntry((p) => ({ ...p, karat: k }))}
                    className={`flex-1 py-3 rounded-xl ${
                      newGoldEntry.karat === k ? 'bg-amber-600' : 'bg-emerald-800'
                    }`}
                  >
                    <Text className="text-white text-center font-medium">{k}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Weight */}
              <Text className="text-white/70 text-sm mb-2">{t('weight')}</Text>
              <TextInput
                value={newGoldEntry.weightGrams > 0 ? String(newGoldEntry.weightGrams) : ''}
                onChangeText={(v) =>
                  setNewGoldEntry((p) => ({ ...p, weightGrams: parseFloat(v) || 0 }))
                }
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#6b7280"
                className="bg-emerald-800 rounded-xl px-4 py-3 text-white mb-4"
              />

              {/* Price per Gram */}
              <Text className="text-white/70 text-sm mb-2">{t('pricePerGram')}</Text>
              <View className="flex-row items-center bg-emerald-800 rounded-xl px-4 py-3 mb-6">
                <Text className="text-emerald-300 mr-2">{currencySymbol}</Text>
                <TextInput
                  value={newGoldEntry.pricePerGram > 0 ? String(newGoldEntry.pricePerGram) : ''}
                  onChangeText={(v) =>
                    setNewGoldEntry((p) => ({ ...p, pricePerGram: parseFloat(v) || 0 }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  className="flex-1 text-white"
                />
              </View>

              {/* Buttons */}
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
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
