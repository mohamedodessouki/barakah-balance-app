import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Calculator,
  Wallet,
  Building2,
  Landmark,
  Coins,
  Gem,
  Home,
  HandCoins,
  Package,
  Sparkles,
  Pickaxe,
  Trash2,
  Check,
  X,
} from 'lucide-react-native';
import { useLanguageStore, useSettingsStore, useIndividualCalculatorStore, CalendarType } from '@/lib/store';
import { useAppStore, Company } from '@/lib/app-store';

// ─── Asset Categories ────────────────────────────────────────────────────────

interface AssetCategory {
  id: string;
  icon: React.ReactNode;
  titleEn: string;
  titleAr: string;
  fields: { key: string; labelEn: string; labelAr: string }[];
}

const INDIVIDUAL_CATEGORIES: AssetCategory[] = [
  {
    id: 'cash',
    icon: <Wallet size={18} color="#34d399" />,
    titleEn: 'Cash on Hand',
    titleAr: 'النقد',
    fields: [{ key: 'cashOnHand', labelEn: 'Cash on Hand', labelAr: 'النقد في اليد' }],
  },
  {
    id: 'bank',
    icon: <Landmark size={18} color="#34d399" />,
    titleEn: 'Bank Accounts',
    titleAr: 'الحسابات البنكية',
    fields: [
      { key: 'savingsAccount', labelEn: 'Savings Account', labelAr: 'حساب التوفير' },
      { key: 'checkingAccount', labelEn: 'Checking Account', labelAr: 'الحساب الجاري' },
      { key: 'certificatesOfDeposit', labelEn: 'Certificates of Deposit', labelAr: 'شهادات الإيداع' },
      { key: 'highYieldAccounts', labelEn: 'High-Yield Accounts', labelAr: 'حسابات العائد المرتفع' },
    ],
  },
  {
    id: 'investments',
    icon: <Coins size={18} color="#34d399" />,
    titleEn: 'Investments',
    titleAr: 'الاستثمارات',
    fields: [
      { key: 'sukuk', labelEn: 'Sukuk', labelAr: 'صكوك' },
      { key: 'tradingStocks', labelEn: 'Trading Stocks', labelAr: 'أسهم التداول' },
      { key: 'mutualFunds', labelEn: 'Mutual Funds', labelAr: 'صناديق الاستثمار' },
      { key: 'etfs', labelEn: 'ETFs', labelAr: 'صناديق المؤشرات' },
      { key: 'trustFunds', labelEn: 'Trust Funds', labelAr: 'صناديق الأمانة' },
      { key: 'bonds', labelEn: 'Bonds', labelAr: 'سندات' },
    ],
  },
  {
    id: 'digital',
    icon: <Sparkles size={18} color="#34d399" />,
    titleEn: 'Digital Money',
    titleAr: 'الأموال الرقمية',
    fields: [
      { key: 'digitalWallets', labelEn: 'Digital Wallets (PayPal, etc.)', labelAr: 'المحافظ الرقمية' },
      { key: 'cryptocurrency', labelEn: 'Cryptocurrency', labelAr: 'العملات المشفرة' },
      { key: 'prepaidCards', labelEn: 'Prepaid Cards', labelAr: 'البطاقات مسبقة الدفع' },
    ],
  },
  {
    id: 'metals',
    icon: <Gem size={18} color="#34d399" />,
    titleEn: 'Precious Metals',
    titleAr: 'المعادن الثمينة',
    fields: [
      { key: 'goldInvestments', labelEn: 'Gold Investments', labelAr: 'استثمارات الذهب' },
      { key: 'silver', labelEn: 'Silver', labelAr: 'فضة' },
      { key: 'platinum', labelEn: 'Platinum', labelAr: 'بلاتين' },
      { key: 'diamonds', labelEn: 'Diamonds', labelAr: 'ألماس' },
      { key: 'investmentJewelry', labelEn: 'Investment Jewelry', labelAr: 'مجوهرات استثمارية' },
    ],
  },
  {
    id: 'realestate',
    icon: <Home size={18} color="#34d399" />,
    titleEn: 'Real Estate (Investment)',
    titleAr: 'العقارات الاستثمارية',
    fields: [
      { key: 'investmentProperties', labelEn: 'Investment Properties', labelAr: 'عقارات استثمارية' },
      { key: 'partialOwnership', labelEn: 'Partial Ownership', labelAr: 'ملكية جزئية' },
      { key: 'constructionProperties', labelEn: 'Under Construction', labelAr: 'تحت الإنشاء' },
    ],
  },
  {
    id: 'owed',
    icon: <HandCoins size={18} color="#34d399" />,
    titleEn: 'Money Owed to You',
    titleAr: 'أموال مستحقة لك',
    fields: [
      { key: 'receivableDebts', labelEn: 'Receivable Debts', labelAr: 'ديون مستحقة' },
      { key: 'lifeInsuranceCashValue', labelEn: 'Life Insurance Cash Value', labelAr: 'القيمة النقدية للتأمين' },
      { key: 'pensionFunds', labelEn: 'Pension Funds', labelAr: 'صناديق التقاعد' },
    ],
  },
  {
    id: 'commodities',
    icon: <Package size={18} color="#34d399" />,
    titleEn: 'Commodities',
    titleAr: 'السلع',
    fields: [
      { key: 'buildingMaterials', labelEn: 'Building Materials', labelAr: 'مواد البناء' },
      { key: 'bulkFood', labelEn: 'Bulk Food', labelAr: 'أغذية بالجملة' },
      { key: 'farmingSupplies', labelEn: 'Farming Supplies', labelAr: 'مستلزمات زراعية' },
      { key: 'electronicsInventory', labelEn: 'Electronics Inventory', labelAr: 'مخزون إلكتروني' },
    ],
  },
  {
    id: 'extracted',
    icon: <Pickaxe size={18} color="#fbbf24" />,
    titleEn: 'Extracted Resources (20%)',
    titleAr: 'الموارد المستخرجة (20%)',
    fields: [
      { key: 'minerals', labelEn: 'Minerals', labelAr: 'معادن' },
      { key: 'oil', labelEn: 'Oil', labelAr: 'نفط' },
      { key: 'gas', labelEn: 'Gas', labelAr: 'غاز' },
    ],
  },
];

// ─── Company Fields ──────────────────────────────────────────────────────────

const COMPANY_FIELDS: { key: keyof Company; labelEn: string; labelAr: string }[] = [
  { key: 'cash', labelEn: 'Cash & Bank Balances', labelAr: 'النقد والأرصدة البنكية' },
  { key: 'receivables', labelEn: 'Accounts Receivable', labelAr: 'حسابات القبض' },
  { key: 'inventory', labelEn: 'Inventory', labelAr: 'المخزون' },
  { key: 'investments', labelEn: 'Investments', labelAr: 'الاستثمارات' },
  { key: 'otherCurrentAssets', labelEn: 'Other Current Assets', labelAr: 'أصول متداولة أخرى' },
  { key: 'currentLiabilities', labelEn: 'Current Liabilities (deducted)', labelAr: 'الالتزامات المتداولة (تخصم)' },
  { key: 'islamicFinancing', labelEn: 'Islamic Financing (deducted)', labelAr: 'التمويل الإسلامي (يخصم)' },
];

// ─── Number Input Component ──────────────────────────────────────────────────

function NumberField({
  label,
  value,
  onChange,
  currencySymbol,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  currencySymbol: string;
}) {
  const [text, setText] = useState<string>(value > 0 ? value.toString() : '');

  const handleChange = (t: string) => {
    const cleaned = t.replace(/[^0-9.]/g, '');
    setText(cleaned);
    const num = parseFloat(cleaned);
    onChange(isNaN(num) ? 0 : num);
  };

  return (
    <View className="flex-row items-center justify-between py-3 border-b border-emerald-800/30">
      <Text className="text-emerald-200/80 text-sm flex-1 mr-3" numberOfLines={1}>
        {label}
      </Text>
      <View className="flex-row items-center bg-emerald-900/40 rounded-lg px-3 py-2 min-w-[140px]">
        <Text className="text-emerald-400 text-sm mr-1">{currencySymbol}</Text>
        <TextInput
          value={text}
          onChangeText={handleChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#6b7280"
          className="text-white text-sm flex-1 text-right"
          style={{ padding: 0, minWidth: 60 }}
        />
      </View>
    </View>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ZakatTab() {
  const language = useLanguageStore((s) => s.language);
  const country = useSettingsStore((s) => s.country);
  const calendarType = useSettingsStore((s) => s.calendarType);
  const nisab = useSettingsStore((s) => s.nisabThreshold);

  const assets = useIndividualCalculatorStore((s) => s.assets);
  const deductions = useIndividualCalculatorStore((s) => s.deductions);
  const setAssetValue = useIndividualCalculatorStore((s) => s.setAssetValue);
  const setDeductionValue = useIndividualCalculatorStore((s) => s.setDeductionValue);
  const getTotalAssets = useIndividualCalculatorStore((s) => s.getTotalAssets);
  const getTotalDeductions = useIndividualCalculatorStore((s) => s.getTotalDeductions);
  const getZakatDue = useIndividualCalculatorStore((s) => s.getZakatDue);

  const companies = useAppStore((s) => s.companies);
  const activeEntityId = useAppStore((s) => s.activeEntityId);
  const setActiveEntity = useAppStore((s) => s.setActiveEntity);
  const addCompany = useAppStore((s) => s.addCompany);
  const updateCompany = useAppStore((s) => s.updateCompany);
  const removeCompany = useAppStore((s) => s.removeCompany);
  const addZakatRecord = useAppStore((s) => s.addZakatRecord);
  const accountType = useAppStore((s) => s.accountType);

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [showResults, setShowResults] = useState(false);

  const currencySymbol = country?.currencySymbol ?? '$';
  const currencyCode = country?.currency ?? 'USD';

  // ─── Personal Zakat Calculation ──────────────────────────────────────

  const personalTotal = getTotalAssets();
  const personalDeductions = getTotalDeductions();
  const personalZakat = getZakatDue(nisab, calendarType);

  // ─── Company Zakat Calculation ───────────────────────────────────────

  const activeCompany = companies.find((c) => c.id === activeEntityId) ?? null;

  const companyZakat = useMemo(() => {
    if (!activeCompany) return { totalAssets: 0, totalDeductions: 0, zakatableAmount: 0, zakatDue: 0 };
    const totalAssets =
      activeCompany.cash +
      activeCompany.receivables +
      activeCompany.inventory +
      activeCompany.investments +
      activeCompany.otherCurrentAssets;
    const totalDeductions = activeCompany.currentLiabilities + activeCompany.islamicFinancing;
    const zakatableAmount = Math.max(0, totalAssets - totalDeductions);
    const rate = calendarType === 'islamic' ? 0.025 : 0.02577;
    const zakatDue = zakatableAmount >= nisab ? zakatableAmount * rate : 0;
    return { totalAssets, totalDeductions, zakatableAmount, zakatDue };
  }, [activeCompany, calendarType, nisab]);

  // ─── Entity tabs ─────────────────────────────────────────────────────

  const entities = [
    { id: null as string | null, name: language === 'ar' ? 'شخصي' : 'Personal' },
    ...companies.map((c) => ({ id: c.id as string | null, name: c.name })),
  ];

  const isPersonal = activeEntityId === null;

  // ─── Add Company ─────────────────────────────────────────────────────

  const handleAddCompany = () => {
    if (!newCompanyName.trim()) return;
    const id = addCompany(newCompanyName.trim());
    setNewCompanyName('');
    setShowAddCompany(false);
    setActiveEntity(id);
  };

  // ─── Save Zakat Record ───────────────────────────────────────────────

  const handleSaveRecord = () => {
    const now = new Date();
    const fiscalYear = `${now.getFullYear()}`;

    if (isPersonal) {
      addZakatRecord({
        date: now.toISOString(),
        fiscalYear,
        entityType: 'personal',
        entityId: null,
        entityName: language === 'ar' ? 'شخصي' : 'Personal',
        totalAssets: personalTotal,
        totalDeductions: personalDeductions,
        zakatableAmount: personalTotal - personalDeductions,
        zakatDue: personalZakat.total,
        currency: currencySymbol,
        paid: false,
      });
    } else if (activeCompany) {
      addZakatRecord({
        date: now.toISOString(),
        fiscalYear,
        entityType: 'company',
        entityId: activeCompany.id,
        entityName: activeCompany.name,
        totalAssets: companyZakat.totalAssets,
        totalDeductions: companyZakat.totalDeductions,
        zakatableAmount: companyZakat.zakatableAmount,
        zakatDue: companyZakat.zakatDue,
        currency: currencySymbol,
        paid: false,
      });
    }
    setShowResults(false);
  };

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-emerald-950">
      <LinearGradient
        colors={['#064e3b', '#022c22', '#011311']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <SafeAreaView className="flex-1" edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View className="px-6 pt-4 pb-2">
              <Text className="text-white text-xl font-bold">
                {language === 'ar' ? 'حساب الزكاة' : 'Zakat Calculator'}
              </Text>
              <Text className="text-emerald-400/60 text-sm mt-1">
                {language === 'ar'
                  ? 'أدخل أصولك لحساب الزكاة المستحقة'
                  : 'Enter your assets to calculate zakat due'}
              </Text>
            </View>

            {/* Entity Toggle */}
            <View className="px-6 mt-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                {entities.map((entity) => (
                  <Pressable
                    key={entity.id ?? 'personal'}
                    onPress={() => {
                      setActiveEntity(entity.id);
                      setShowResults(false);
                    }}
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
                    onPress={() => setShowAddCompany(true)}
                    className="mr-2 px-3 py-2 rounded-full border border-dashed border-emerald-700/50 flex-row items-center"
                  >
                    <Plus size={14} color="#6ee7b7" />
                    <Text className="text-emerald-300/60 text-sm ml-1">
                      {language === 'ar' ? 'شركة' : 'Company'}
                    </Text>
                  </Pressable>
                )}
              </ScrollView>
            </View>

            {/* Add Company Modal */}
            {showAddCompany && (
              <Animated.View entering={FadeInDown.springify()} className="mx-6 mt-3">
                <View className="bg-emerald-900/60 border border-emerald-700/50 rounded-xl p-4">
                  <Text className="text-white text-sm font-medium mb-2">
                    {language === 'ar' ? 'اسم الشركة' : 'Company Name'}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      value={newCompanyName}
                      onChangeText={setNewCompanyName}
                      placeholder={language === 'ar' ? 'أدخل اسم الشركة...' : 'Enter company name...'}
                      placeholderTextColor="#6b7280"
                      className="flex-1 bg-emerald-900/40 border border-emerald-700/40 rounded-lg px-3 py-2 text-white"
                    />
                    <Pressable onPress={handleAddCompany} className="bg-emerald-600 rounded-lg p-2">
                      <Check size={20} color="white" />
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setShowAddCompany(false);
                        setNewCompanyName('');
                      }}
                      className="bg-red-900/40 rounded-lg p-2"
                    >
                      <X size={20} color="#f87171" />
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* ─── Personal Assets Entry ──────────────────────────────── */}
            {isPersonal && !showResults && (
              <Animated.View entering={FadeInUp.delay(100).springify()} className="mx-6 mt-4">
                {INDIVIDUAL_CATEGORIES.map((category) => {
                  const isExpanded = expandedCategory === category.id;
                  const categoryTotal = category.fields.reduce((sum, f) => {
                    const val = assets[f.key as keyof typeof assets];
                    return sum + (typeof val === 'number' ? val : 0);
                  }, 0);

                  return (
                    <View key={category.id} className="mb-2">
                      <Pressable
                        onPress={() => setExpandedCategory(isExpanded ? null : category.id)}
                        className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl p-4 flex-row items-center justify-between"
                      >
                        <View className="flex-row items-center flex-1">
                          {category.icon}
                          <Text className="text-white text-sm font-medium ml-3">
                            {language === 'ar' ? category.titleAr : category.titleEn}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          {categoryTotal > 0 && (
                            <Text className="text-emerald-400 text-sm font-medium mr-2">
                              {currencySymbol} {categoryTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </Text>
                          )}
                          {isExpanded ? (
                            <ChevronUp size={18} color="#6ee7b7" />
                          ) : (
                            <ChevronDown size={18} color="#6ee7b7" />
                          )}
                        </View>
                      </Pressable>

                      {isExpanded && (
                        <Animated.View
                          entering={FadeInDown.springify()}
                          className="bg-emerald-900/20 border border-emerald-800/30 rounded-xl mt-1 px-4"
                        >
                          {category.fields.map((field) => (
                            <NumberField
                              key={field.key}
                              label={language === 'ar' ? field.labelAr : field.labelEn}
                              value={(assets[field.key as keyof typeof assets] as number) ?? 0}
                              onChange={(v) => setAssetValue(field.key as keyof typeof assets, v as never)}
                              currencySymbol={currencySymbol}
                            />
                          ))}
                        </Animated.View>
                      )}
                    </View>
                  );
                })}

                {/* Deductions */}
                <View className="mt-4 mb-2">
                  <Text className="text-white text-base font-semibold mb-2">
                    {language === 'ar' ? 'الخصومات' : 'Deductions'}
                  </Text>
                  <View className="bg-emerald-900/20 border border-emerald-800/30 rounded-xl px-4">
                    <NumberField
                      label={language === 'ar' ? 'زكاة مدفوعة مسبقاً' : 'Zakat Already Paid'}
                      value={deductions.zakatAlreadyPaid}
                      onChange={(v) => setDeductionValue('zakatAlreadyPaid', v)}
                      currencySymbol={currencySymbol}
                    />
                    <NumberField
                      label={language === 'ar' ? 'ديون عاجلة' : 'Urgent Debts'}
                      value={deductions.urgentDebts}
                      onChange={(v) => setDeductionValue('urgentDebts', v)}
                      currencySymbol={currencySymbol}
                    />
                    <NumberField
                      label={language === 'ar' ? 'ديون حسنة مستحقة' : 'Good Receivables'}
                      value={deductions.goodReceivables}
                      onChange={(v) => setDeductionValue('goodReceivables', v)}
                      currencySymbol={currencySymbol}
                    />
                  </View>
                </View>

                {/* Calculate Button */}
                <Pressable
                  onPress={() => setShowResults(true)}
                  className="mt-4 rounded-2xl overflow-hidden"
                >
                  <LinearGradient
                    colors={['#059669', '#047857']}
                    style={{
                      paddingVertical: 16,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}
                  >
                    <Calculator size={20} color="white" />
                    <Text className="text-white text-base font-semibold ml-2">
                      {language === 'ar' ? 'احسب الزكاة' : 'Calculate Zakat'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            )}

            {/* ─── Company Assets Entry ───────────────────────────────── */}
            {!isPersonal && activeCompany && !showResults && (
              <Animated.View entering={FadeInUp.delay(100).springify()} className="mx-6 mt-4">
                {/* Company Header */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Building2 size={18} color="#fbbf24" />
                    <Text className="text-white text-base font-semibold ml-2">
                      {activeCompany.name}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      removeCompany(activeCompany.id);
                      setActiveEntity(null);
                    }}
                    className="bg-red-900/30 rounded-lg p-2"
                  >
                    <Trash2 size={16} color="#f87171" />
                  </Pressable>
                </View>

                {/* Company Fields */}
                <View className="bg-emerald-900/20 border border-emerald-800/30 rounded-xl px-4">
                  {COMPANY_FIELDS.map((field) => (
                    <NumberField
                      key={field.key}
                      label={language === 'ar' ? field.labelAr : field.labelEn}
                      value={(activeCompany[field.key] as number) ?? 0}
                      onChange={(v) => updateCompany(activeCompany.id, { [field.key]: v })}
                      currencySymbol={currencySymbol}
                    />
                  ))}
                </View>

                {/* Calculate Button */}
                <Pressable
                  onPress={() => setShowResults(true)}
                  className="mt-4 rounded-2xl overflow-hidden"
                >
                  <LinearGradient
                    colors={['#059669', '#047857']}
                    style={{
                      paddingVertical: 16,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}
                  >
                    <Calculator size={20} color="white" />
                    <Text className="text-white text-base font-semibold ml-2">
                      {language === 'ar' ? 'احسب الزكاة' : 'Calculate Zakat'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            )}

            {/* ─── Results ────────────────────────────────────────────── */}
            {showResults && (
              <Animated.View entering={FadeInUp.springify()} className="mx-6 mt-5">
                <LinearGradient
                  colors={['#059669', '#047857', '#065f46']}
                  style={{ borderRadius: 20, padding: 24 }}
                >
                  <Text className="text-emerald-200/60 text-xs font-medium uppercase tracking-wider mb-1">
                    {language === 'ar' ? 'نتائج الزكاة' : 'Zakat Results'}
                  </Text>
                  <Text className="text-white text-sm font-medium mb-4">
                    {isPersonal
                      ? language === 'ar' ? 'شخصي' : 'Personal'
                      : activeCompany?.name ?? ''}
                  </Text>

                  {/* Summary rows */}
                  <View className="bg-white/10 rounded-xl p-4 mb-3">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-emerald-200/70 text-sm">
                        {language === 'ar' ? 'إجمالي الأصول' : 'Total Assets'}
                      </Text>
                      <Text className="text-white text-sm font-medium">
                        {currencySymbol}{' '}
                        {(isPersonal ? personalTotal : companyZakat.totalAssets).toLocaleString(
                          undefined,
                          { maximumFractionDigits: 0 }
                        )}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-emerald-200/70 text-sm">
                        {language === 'ar' ? 'الخصومات' : 'Deductions'}
                      </Text>
                      <Text className="text-red-300 text-sm font-medium">
                        - {currencySymbol}{' '}
                        {(isPersonal ? personalDeductions : companyZakat.totalDeductions).toLocaleString(
                          undefined,
                          { maximumFractionDigits: 0 }
                        )}
                      </Text>
                    </View>
                    <View className="border-t border-white/20 pt-2 flex-row justify-between mb-2">
                      <Text className="text-emerald-200/70 text-sm">
                        {language === 'ar' ? 'النصاب' : 'Nisab Threshold'}
                      </Text>
                      <Text className="text-white text-sm font-medium">
                        {currencySymbol} {nisab.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-emerald-200/70 text-sm">
                        {language === 'ar' ? 'المعدل' : 'Rate'}
                      </Text>
                      <Text className="text-white text-sm font-medium">
                        {calendarType === 'islamic' ? '2.5%' : '2.577%'}
                        {!isPersonal ? '' : ' + 20% '}
                        {!isPersonal ? '' : language === 'ar' ? '(موارد)' : '(resources)'}
                      </Text>
                    </View>
                  </View>

                  {/* Zakat Due */}
                  <View className="bg-amber-500/20 rounded-xl p-4 items-center">
                    <Text className="text-amber-200/70 text-xs uppercase tracking-wider mb-1">
                      {language === 'ar' ? 'الزكاة المستحقة' : 'Zakat Due'}
                    </Text>
                    <Text className="text-white text-3xl font-bold">
                      {currencySymbol}{' '}
                      {(isPersonal ? personalZakat.total : companyZakat.zakatDue).toLocaleString(
                        undefined,
                        { maximumFractionDigits: 0 }
                      )}
                    </Text>
                    {isPersonal && personalZakat.extracted > 0 && (
                      <Text className="text-amber-300/60 text-xs mt-1">
                        {language === 'ar'
                          ? `يشمل ${currencySymbol} ${personalZakat.extracted.toLocaleString(undefined, { maximumFractionDigits: 0 })} من الموارد المستخرجة`
                          : `Includes ${currencySymbol} ${personalZakat.extracted.toLocaleString(undefined, { maximumFractionDigits: 0 })} from extracted resources`}
                      </Text>
                    )}
                  </View>

                  {/* Actions */}
                  <View className="flex-row gap-3 mt-4">
                    <Pressable
                      onPress={() => setShowResults(false)}
                      className="flex-1 bg-white/10 rounded-xl py-3 items-center"
                    >
                      <Text className="text-white text-sm font-medium">
                        {language === 'ar' ? 'تعديل' : 'Edit'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={handleSaveRecord}
                      className="flex-1 bg-amber-500/30 rounded-xl py-3 items-center"
                    >
                      <Text className="text-amber-200 text-sm font-medium">
                        {language === 'ar' ? 'حفظ السجل' : 'Save Record'}
                      </Text>
                    </Pressable>
                  </View>
                </LinearGradient>
              </Animated.View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
