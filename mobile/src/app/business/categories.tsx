import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  ChevronLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Video,
  ArrowRight,
  Building2,
  Wallet,
  TrendingDown,
  Ban,
} from 'lucide-react-native';
import { useLanguageStore, useSettingsStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';
import {
  useBusinessCategoriesStore,
  BusinessCategory,
  BusinessCategoryEntry,
  availableCurrencies,
  convertCurrency,
} from '@/lib/enhanced-store';
import { NavigationButtons } from '@/components/NavigationButtons';

interface CategoryConfig {
  id: BusinessCategory;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ReactNode;
  color: readonly [string, string];
  showIslamicToggle?: boolean;
}

const categoryConfigs: CategoryConfig[] = [
  {
    id: 'currentAssets',
    title: 'Current Assets',
    titleAr: 'الأصول المتداولة',
    description: 'Cash, receivables, inventory, investments',
    descriptionAr: 'النقد، المستحقات، المخزون، الاستثمارات',
    icon: <Wallet size={24} color="white" />,
    color: ['#059669', '#047857'] as const,
  },
  {
    id: 'fixedAssets',
    title: 'Fixed Assets',
    titleAr: 'الأصول الثابتة',
    description: 'Land, equipment, other long-term assets',
    descriptionAr: 'الأراضي، المعدات، الأصول طويلة الأجل',
    icon: <Building2 size={24} color="white" />,
    color: ['#6b7280', '#4b5563'] as const,
  },
  {
    id: 'currentLiabilities',
    title: 'Current Liabilities',
    titleAr: 'الالتزامات المتداولة',
    description: 'Payables, short-term loans (Islamic financing only is deductible)',
    descriptionAr: 'الذمم الدائنة، القروض قصيرة الأجل (التمويل الإسلامي فقط قابل للخصم)',
    icon: <TrendingDown size={24} color="white" />,
    color: ['#dc2626', '#b91c1c'] as const,
    showIslamicToggle: true,
  },
  {
    id: 'longTermLiabilities',
    title: 'Long Term Liabilities',
    titleAr: 'الالتزامات طويلة الأجل',
    description: 'Long-term debt, bonds payable',
    descriptionAr: 'الديون طويلة الأجل، السندات المستحقة',
    icon: <Ban size={24} color="white" />,
    color: ['#7c3aed', '#6d28d9'] as const,
    showIslamicToggle: true,
  },
];

export default function BusinessCategoriesScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);
  const country = useSettingsStore((s) => s.country);

  const categories = useBusinessCategoriesStore((s) => s.categories);
  const mainCurrency = useBusinessCategoriesStore((s) => s.mainCurrency);
  const mainCurrencySymbol = useBusinessCategoriesStore((s) => s.mainCurrencySymbol);
  const addEntry = useBusinessCategoriesStore((s) => s.addEntry);
  const updateEntry = useBusinessCategoriesStore((s) => s.updateEntry);
  const removeEntry = useBusinessCategoriesStore((s) => s.removeEntry);
  const getCategoryTotal = useBusinessCategoriesStore((s) => s.getCategoryTotal);
  const getDeductibleLiabilities = useBusinessCategoriesStore((s) => s.getDeductibleLiabilities);
  const getNonDeductibleLiabilities = useBusinessCategoriesStore((s) => s.getNonDeductibleLiabilities);

  const [expandedCategories, setExpandedCategories] = useState<BusinessCategory[]>(['currentAssets']);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<BusinessCategory>('currentAssets');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    name: '',
    description: '',
    amount: '',
    currency: mainCurrency,
    isIslamicFinancing: false,
  });

  const toggleCategory = (id: BusinessCategory) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleAddEntry = () => {
    if (!newEntry.name.trim() || !newEntry.amount) return;

    addEntry(activeCategory, {
      name: newEntry.name.trim(),
      description: newEntry.description.trim(),
      amount: parseFloat(newEntry.amount) || 0,
      currency: newEntry.currency,
      isIslamicFinancing: newEntry.isIslamicFinancing,
    });

    setNewEntry({
      name: '',
      description: '',
      amount: '',
      currency: mainCurrency,
      isIslamicFinancing: false,
    });
    setShowAddModal(false);
  };

  const openAddModal = (categoryId: BusinessCategory) => {
    setActiveCategory(categoryId);
    setNewEntry({
      name: '',
      description: '',
      amount: '',
      currency: mainCurrency,
      isIslamicFinancing: false,
    });
    setShowAddModal(true);
  };

  const handleBack = () => router.back();
  const handleNext = () => router.push('/business/results');

  const currentConfig = categoryConfigs.find((c) => c.id === activeCategory);

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
              <ChevronLeft
                size={24}
                color="white"
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              />
            </Pressable>
            <Text className="text-white text-lg font-semibold">
              {language === 'ar' ? 'فئات الزكاة التجارية' : 'Business Zakat Categories'}
            </Text>
          </View>
        </Animated.View>

        {/* Summary Card */}
        <Animated.View
          entering={FadeInUp.delay(200).springify()}
          className="mx-6 mt-4"
        >
          <LinearGradient
            colors={['#4f46e5', '#4338ca']}
            style={{ borderRadius: 16, padding: 16 }}
          >
            <View className="flex-row justify-between">
              <View>
                <Text className="text-indigo-200 text-sm">
                  {language === 'ar' ? 'صافي الوعاء الزكوي' : 'Net Zakatable Base'}
                </Text>
                <Text className="text-white text-2xl font-bold">
                  {mainCurrencySymbol} {(
                    getCategoryTotal('currentAssets') -
                    getDeductibleLiabilities()
                  ).toLocaleString()}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-red-300 text-xs">
                  {language === 'ar' ? 'غير قابل للخصم' : 'Non-Deductible'}
                </Text>
                <Text className="text-red-300 font-semibold">
                  {mainCurrencySymbol} {getNonDeductibleLiabilities().toLocaleString()}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <ScrollView
          className="flex-1 mt-4"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          {categoryConfigs.map((config, index) => {
            const isExpanded = expandedCategories.includes(config.id);
            const entries = categories[config.id] || [];
            const total = getCategoryTotal(config.id);

            return (
              <Animated.View
                key={config.id}
                entering={FadeInUp.delay(300 + index * 100).springify()}
                className="mx-4 mb-3"
              >
                {/* Category Header */}
                <Pressable
                  onPress={() => toggleCategory(config.id)}
                  className="active:opacity-90"
                >
                  <LinearGradient
                    colors={config.color}
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
                        {config.icon}
                        <View className={`flex-1 ${isRTL ? 'mr-3 items-end' : 'ml-3'}`}>
                          <Text className="text-white font-semibold">
                            {language === 'ar' ? config.titleAr : config.title}
                          </Text>
                          <Text className="text-white/70 text-xs">
                            {language === 'ar' ? config.descriptionAr : config.description}
                          </Text>
                        </View>
                      </View>
                      <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Text className={`text-white/90 text-sm font-medium ${isRTL ? 'ml-2' : 'mr-2'}`}>
                          {mainCurrencySymbol}{total.toLocaleString()}
                        </Text>
                        {isExpanded ? (
                          <ChevronUp size={20} color="white" />
                        ) : (
                          <ChevronDown size={20} color="white" />
                        )}
                      </View>
                    </View>
                  </LinearGradient>
                </Pressable>

                {/* Category Entries */}
                {isExpanded && (
                  <View className="bg-indigo-900/50 rounded-b-xl p-4">
                    {entries.length === 0 ? (
                      <Text className="text-indigo-300/50 text-center py-4">
                        {language === 'ar' ? 'لا توجد إدخالات بعد' : 'No entries yet'}
                      </Text>
                    ) : (
                      entries.map((entry) => (
                        <View
                          key={entry.id}
                          className="bg-indigo-800/30 rounded-xl p-4 mb-3"
                        >
                          <View className={`flex-row items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <View className="flex-1">
                              <Text className="text-white font-medium">{entry.name}</Text>
                              {entry.description && (
                                <Text className="text-indigo-300 text-sm">{entry.description}</Text>
                              )}
                              <View className="flex-row items-center mt-1">
                                <Text className="text-indigo-400 text-sm">
                                  {entry.currency} {entry.amount.toLocaleString()}
                                </Text>
                                {entry.currency !== mainCurrency && (
                                  <Text className="text-indigo-300 text-xs ml-2">
                                    ({mainCurrencySymbol}{entry.convertedAmount.toLocaleString()})
                                  </Text>
                                )}
                              </View>
                              {config.showIslamicToggle && (
                                <View className="flex-row items-center mt-2">
                                  <View
                                    className={`px-2 py-1 rounded-full ${
                                      entry.isIslamicFinancing
                                        ? 'bg-emerald-600/50'
                                        : 'bg-red-600/50'
                                    }`}
                                  >
                                    <Text className="text-white text-xs">
                                      {entry.isIslamicFinancing
                                        ? language === 'ar'
                                          ? 'تمويل إسلامي (قابل للخصم)'
                                          : 'Islamic (Deductible)'
                                        : language === 'ar'
                                        ? 'تقليدي (غير قابل للخصم)'
                                        : 'Conventional (Non-Deductible)'}
                                    </Text>
                                  </View>
                                </View>
                              )}
                            </View>
                            <Pressable
                              onPress={() => removeEntry(config.id, entry.id)}
                              className="p-2"
                            >
                              <Trash2 size={18} color="#f87171" />
                            </Pressable>
                          </View>
                        </View>
                      ))
                    )}

                    {/* Add Button */}
                    <Pressable
                      onPress={() => openAddModal(config.id)}
                      className="bg-indigo-700/50 rounded-xl py-3 flex-row items-center justify-center active:bg-indigo-700"
                    >
                      <Plus size={18} color="#a5b4fc" />
                      <Text className="text-indigo-200 font-medium ml-2">
                        {language === 'ar' ? 'إضافة بند' : 'Add Entry'}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </Animated.View>
            );
          })}

          {/* Important Note */}
          <Animated.View
            entering={FadeInUp.delay(700).springify()}
            className="mx-6 mt-4"
          >
            <View className="bg-amber-900/30 border border-amber-700/50 rounded-xl p-4">
              <Text className="text-amber-300 font-semibold mb-2">
                {language === 'ar' ? 'ملاحظة مهمة' : 'Important Note'}
              </Text>
              <Text className="text-amber-200 text-sm leading-5">
                {language === 'ar'
                  ? 'وفقاً لمعايير أيوفي، القروض التقليدية (بفائدة) غير قابلة للخصم من وعاء الزكاة. فقط التمويل الإسلامي (المرابحة، الإجارة، إلخ) يمكن خصمه.'
                  : 'According to AAOIFI standards, conventional (interest-based) loans are NOT deductible from the zakat base. Only Islamic financing (Murabaha, Ijara, etc.) can be deducted.'}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Navigation */}
        <NavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          backLabel={language === 'ar' ? 'رجوع' : 'Back'}
          nextLabel={language === 'ar' ? 'النتائج' : 'Results'}
          isRTL={isRTL}
          variant="indigo"
        />

        {/* Add Entry Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View className="flex-1 bg-black/70 justify-center px-6">
            <View className="bg-indigo-900 rounded-2xl p-6 max-h-[80%]">
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-white text-xl font-bold mb-6 text-center">
                  {language === 'ar' ? 'إضافة بند جديد' : 'Add New Entry'}
                </Text>

                {/* Entry Name */}
                <Text className="text-indigo-300 text-sm mb-2">
                  {language === 'ar' ? 'اسم البند' : 'Entry Name'}
                </Text>
                <TextInput
                  value={newEntry.name}
                  onChangeText={(v) => setNewEntry((p) => ({ ...p, name: v }))}
                  placeholder={language === 'ar' ? 'مثال: النقد في البنك' : 'e.g., Cash in Bank'}
                  placeholderTextColor="#6b7280"
                  className="bg-indigo-800 rounded-xl px-4 py-3 text-white mb-4"
                />

                {/* Description */}
                <Text className="text-indigo-300 text-sm mb-2">
                  {language === 'ar' ? 'الوصف (اختياري)' : 'Description (Optional)'}
                </Text>
                <TextInput
                  value={newEntry.description}
                  onChangeText={(v) => setNewEntry((p) => ({ ...p, description: v }))}
                  placeholder={language === 'ar' ? 'تفاصيل إضافية...' : 'Additional details...'}
                  placeholderTextColor="#6b7280"
                  multiline
                  className="bg-indigo-800 rounded-xl px-4 py-3 text-white mb-4"
                />

                {/* Amount & Currency */}
                <Text className="text-indigo-300 text-sm mb-2">
                  {language === 'ar' ? 'المبلغ والعملة' : 'Amount & Currency'}
                </Text>
                <View className="flex-row gap-3 mb-4">
                  <View className="flex-1 bg-indigo-800 rounded-xl px-4 py-3 flex-row items-center">
                    <TextInput
                      value={newEntry.amount}
                      onChangeText={(v) =>
                        setNewEntry((p) => ({ ...p, amount: v.replace(/[^0-9.]/g, '') }))
                      }
                      placeholder="0"
                      placeholderTextColor="#6b7280"
                      keyboardType="numeric"
                      className="flex-1 text-white text-lg"
                    />
                  </View>
                  <Pressable
                    onPress={() => setShowCurrencyModal(true)}
                    className="bg-indigo-700 rounded-xl px-4 py-3 flex-row items-center"
                  >
                    <Text className="text-white font-medium">{newEntry.currency}</Text>
                    <ChevronDown size={16} color="white" className="ml-1" />
                  </Pressable>
                </View>

                {/* Conversion Preview */}
                {newEntry.amount && newEntry.currency !== mainCurrency && (
                  <View className="bg-indigo-800/50 rounded-xl p-3 mb-4">
                    <Text className="text-indigo-300 text-sm">
                      {language === 'ar' ? 'القيمة المحولة:' : 'Converted Value:'}
                    </Text>
                    <Text className="text-white font-semibold">
                      {mainCurrencySymbol} {convertCurrency(
                        parseFloat(newEntry.amount) || 0,
                        newEntry.currency,
                        mainCurrency
                      ).toLocaleString()}
                    </Text>
                  </View>
                )}

                {/* Islamic Financing Toggle (for liabilities) */}
                {currentConfig?.showIslamicToggle && (
                  <View className="mb-4">
                    <Text className="text-indigo-300 text-sm mb-2">
                      {language === 'ar' ? 'نوع التمويل' : 'Financing Type'}
                    </Text>
                    <View className="flex-row gap-3">
                      <Pressable
                        onPress={() => setNewEntry((p) => ({ ...p, isIslamicFinancing: true }))}
                        className={`flex-1 py-3 rounded-xl ${
                          newEntry.isIslamicFinancing ? 'bg-emerald-600' : 'bg-indigo-800'
                        }`}
                      >
                        <Text className="text-white text-center text-sm font-medium">
                          {language === 'ar' ? 'إسلامي (قابل للخصم)' : 'Islamic (Deductible)'}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setNewEntry((p) => ({ ...p, isIslamicFinancing: false }))}
                        className={`flex-1 py-3 rounded-xl ${
                          !newEntry.isIslamicFinancing ? 'bg-red-600' : 'bg-indigo-800'
                        }`}
                      >
                        <Text className="text-white text-center text-sm font-medium">
                          {language === 'ar' ? 'تقليدي (غير قابل)' : 'Conventional'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* Buttons */}
                <View className="flex-row gap-3 mt-2">
                  <Pressable
                    onPress={() => setShowAddModal(false)}
                    className="flex-1 bg-indigo-800 rounded-xl py-3"
                  >
                    <Text className="text-white text-center font-medium">
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleAddEntry}
                    disabled={!newEntry.name.trim() || !newEntry.amount}
                    className={`flex-1 rounded-xl py-3 ${
                      newEntry.name.trim() && newEntry.amount
                        ? 'bg-indigo-600'
                        : 'bg-indigo-800/50'
                    }`}
                  >
                    <Text className="text-white text-center font-bold">
                      {language === 'ar' ? 'إضافة' : 'Add'}
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Currency Selection Modal */}
        <Modal
          visible={showCurrencyModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCurrencyModal(false)}
        >
          <View className="flex-1 bg-black/70 justify-center px-6">
            <View className="bg-indigo-900 rounded-2xl p-4 max-h-[70%]">
              <Text className="text-white text-xl font-bold mb-4 text-center">
                {language === 'ar' ? 'اختر العملة' : 'Select Currency'}
              </Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {availableCurrencies.map((curr) => (
                  <Pressable
                    key={curr.code}
                    onPress={() => {
                      setNewEntry((p) => ({ ...p, currency: curr.code }));
                      setShowCurrencyModal(false);
                    }}
                    className={`flex-row items-center justify-between p-4 rounded-xl mb-2 ${
                      newEntry.currency === curr.code ? 'bg-indigo-600' : 'bg-indigo-800/50'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-white font-bold text-lg w-12">{curr.symbol}</Text>
                      <View className="ml-3">
                        <Text className="text-white font-medium">{curr.code}</Text>
                        <Text className="text-indigo-300 text-sm">{curr.name}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
