import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Shield,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Scale,
  Filter,
  X,
} from 'lucide-react-native';
import { useLanguageStore } from '@/lib/store';
import {
  HALAL_INVESTMENTS,
  HalalInvestment,
  CONTRACT_TYPE_FILTERS,
  RISK_FILTERS,
  COUNTRY_FILTERS,
  IslamicContractType,
  RiskLevel,
} from '@/lib/investments-data';

// ─── Risk Badge ──────────────────────────────────────────────────────────────

function RiskBadge({ risk, language }: { risk: RiskLevel; language: string | null }) {
  const colors = {
    Low: { bg: 'bg-emerald-600/30', text: 'text-emerald-400' },
    Medium: { bg: 'bg-amber-600/30', text: 'text-amber-400' },
    High: { bg: 'bg-red-600/30', text: 'text-red-400' },
  };
  const labels = {
    Low: language === 'ar' ? 'منخفض' : 'Low',
    Medium: language === 'ar' ? 'متوسط' : 'Medium',
    High: language === 'ar' ? 'مرتفع' : 'High',
  };
  const c = colors[risk];
  return (
    <View className={`px-2 py-0.5 rounded-full ${c.bg}`}>
      <Text className={`text-xs font-medium ${c.text}`}>{labels[risk]}</Text>
    </View>
  );
}

// ─── Investment Card ─────────────────────────────────────────────────────────

function InvestmentCard({
  item,
  language,
  isExpanded,
  onToggle,
}: {
  item: HalalInvestment;
  language: string | null;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const isAr = language === 'ar';

  return (
    <View className="mb-3">
      <Pressable
        onPress={onToggle}
        className="bg-emerald-900/40 border border-emerald-700/40 rounded-2xl p-4"
      >
        {/* Header */}
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 mr-3">
            <Text className="text-emerald-400/60 text-xs font-medium">
              {isAr ? item.entityAr : item.entity}
            </Text>
            <Text className="text-white text-base font-bold mt-0.5">
              {isAr ? item.productAr : item.product}
            </Text>
          </View>
          <RiskBadge risk={item.riskLevel} language={language} />
        </View>

        {/* Quick Stats */}
        <View className="flex-row flex-wrap gap-x-4 gap-y-2 mt-2">
          <View className="flex-row items-center">
            <TrendingUp size={13} color="#34d399" />
            <Text className="text-emerald-300 text-xs ml-1 font-medium">
              {item.expectedReturn}
            </Text>
          </View>
          <View className="flex-row items-center">
            <DollarSign size={13} color="#6b7280" />
            <Text className="text-emerald-300/60 text-xs ml-1">
              {item.minimumInvestment > 0
                ? `${item.currency} ${item.minimumInvestment.toLocaleString()}`
                : isAr ? 'لا حد أدنى' : 'No minimum'}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Clock size={13} color="#6b7280" />
            <Text className="text-emerald-300/60 text-xs ml-1">
              {isAr
                ? item.payoutFrequency === 'Monthly' ? 'شهري'
                  : item.payoutFrequency === 'Quarterly' ? 'ربع سنوي'
                  : item.payoutFrequency === 'Semi-Annual' ? 'نصف سنوي'
                  : item.payoutFrequency === 'Annual' ? 'سنوي'
                  : 'عند الاستحقاق'
                : item.payoutFrequency}
            </Text>
          </View>
          <View className="flex-row items-center">
            <MapPin size={13} color="#6b7280" />
            <Text className="text-emerald-300/60 text-xs ml-1">
              {isAr ? item.countryAr : item.country}
            </Text>
          </View>
        </View>

        {/* Contract Type Badge */}
        <View className="flex-row items-center mt-3">
          <Scale size={13} color="#818cf8" />
          <Text className="text-indigo-300 text-xs ml-1 font-medium">{item.contractType}</Text>
          <Text className="text-emerald-300/30 text-xs ml-2">|</Text>
          <Text className="text-emerald-300/40 text-xs ml-2">{item.maturity}</Text>
          <View className="flex-1" />
          {isExpanded ? (
            <ChevronUp size={16} color="#6ee7b7" />
          ) : (
            <ChevronDown size={16} color="#6ee7b7" />
          )}
        </View>
      </Pressable>

      {/* Expanded Details */}
      {isExpanded && (
        <Animated.View
          entering={FadeInDown.springify()}
          className="bg-emerald-900/20 border border-emerald-800/30 rounded-xl mt-1 p-4"
        >
          {/* Description */}
          <Text className="text-emerald-200/80 text-sm leading-5 mb-4">
            {isAr ? item.descriptionAr : item.description}
          </Text>

          {/* Company Overview */}
          <View className="mb-4">
            <View className="flex-row items-center mb-1">
              <Building2 size={14} color="#6ee7b7" />
              <Text className="text-emerald-400 text-xs font-semibold ml-1 uppercase tracking-wider">
                {isAr ? 'عن الشركة' : 'Company Overview'}
              </Text>
            </View>
            <Text className="text-emerald-200/60 text-xs leading-4">
              {isAr ? item.companyOverviewAr : item.companyOverview}
            </Text>
          </View>

          {/* Investment Use */}
          <View className="mb-4">
            <View className="flex-row items-center mb-1">
              <TrendingUp size={14} color="#6ee7b7" />
              <Text className="text-emerald-400 text-xs font-semibold ml-1 uppercase tracking-wider">
                {isAr ? 'كيف يُستخدم الاستثمار' : 'How Investment Is Used'}
              </Text>
            </View>
            <Text className="text-emerald-200/60 text-xs leading-4">
              {isAr ? item.investmentUseAr : item.investmentUse}
            </Text>
          </View>

          {/* Terms */}
          <View className="mb-4">
            <View className="flex-row items-center mb-1">
              <Clock size={14} color="#6ee7b7" />
              <Text className="text-emerald-400 text-xs font-semibold ml-1 uppercase tracking-wider">
                {isAr ? 'الشروط' : 'Terms & Conditions'}
              </Text>
            </View>
            <Text className="text-emerald-200/60 text-xs leading-4">
              {isAr ? item.termsAr : item.terms}
            </Text>
          </View>

          {/* Sharia Compliance */}
          <View className="bg-emerald-600/10 rounded-xl p-3">
            <View className="flex-row items-center mb-1">
              <Shield size={14} color="#34d399" />
              <Text className="text-emerald-400 text-xs font-semibold ml-1 uppercase tracking-wider">
                {isAr ? 'التوافق الشرعي' : 'Sharia Compliance'}
              </Text>
            </View>
            <Text className="text-emerald-200/60 text-xs leading-4">
              {isAr ? item.shariaComplianceAr : item.shariaCompliance}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// ─── Filter Chip ─────────────────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 mb-2 px-3 py-1.5 rounded-full border ${
        active
          ? 'bg-emerald-600 border-emerald-500'
          : 'bg-emerald-900/40 border-emerald-700/50'
      }`}
    >
      <Text
        className={`text-xs font-medium ${
          active ? 'text-white' : 'text-emerald-300/60'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InvestmentsTab() {
  const language = useLanguageStore((s) => s.language);
  const isAr = language === 'ar';

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContractTypes, setSelectedContractTypes] = useState<IslamicContractType[]>([]);
  const [selectedRisks, setSelectedRisks] = useState<RiskLevel[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const hasFilters =
    selectedContractTypes.length > 0 || selectedRisks.length > 0 || selectedCountries.length > 0;

  const filteredInvestments = useMemo(() => {
    return HALAL_INVESTMENTS.filter((inv) => {
      if (selectedContractTypes.length > 0 && !selectedContractTypes.includes(inv.contractType))
        return false;
      if (selectedRisks.length > 0 && !selectedRisks.includes(inv.riskLevel)) return false;
      if (selectedCountries.length > 0 && !selectedCountries.includes(inv.country)) return false;
      return true;
    });
  }, [selectedContractTypes, selectedRisks, selectedCountries]);

  const toggleContractType = (t: IslamicContractType) => {
    setSelectedContractTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const toggleRisk = (r: RiskLevel) => {
    setSelectedRisks((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  };

  const toggleCountry = (c: string) => {
    setSelectedCountries((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const clearFilters = () => {
    setSelectedContractTypes([]);
    setSelectedRisks([]);
    setSelectedCountries([]);
  };

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
          <View className="px-6 pt-4 pb-2">
            <Text className="text-white text-xl font-bold">
              {isAr ? 'استثمارات حلال' : 'Halal Investments'}
            </Text>
            <Text className="text-emerald-400/60 text-sm mt-1">
              {isAr
                ? 'اكتشف منتجات استثمارية متوافقة مع الشريعة'
                : 'Discover Sharia-compliant investment products'}
            </Text>
          </View>

          {/* Filter Button */}
          <View className="px-6 mt-3 flex-row items-center">
            <Pressable
              onPress={() => setShowFilters(!showFilters)}
              className={`flex-row items-center px-4 py-2 rounded-full border ${
                hasFilters
                  ? 'bg-emerald-600 border-emerald-500'
                  : 'bg-emerald-900/40 border-emerald-700/50'
              }`}
            >
              <Filter size={14} color={hasFilters ? 'white' : '#6ee7b7'} />
              <Text
                className={`text-sm ml-1.5 font-medium ${
                  hasFilters ? 'text-white' : 'text-emerald-300'
                }`}
              >
                {isAr ? 'تصفية' : 'Filter'}
              </Text>
              {hasFilters && (
                <View className="bg-white/30 rounded-full w-5 h-5 items-center justify-center ml-1.5">
                  <Text className="text-white text-xs font-bold">
                    {selectedContractTypes.length + selectedRisks.length + selectedCountries.length}
                  </Text>
                </View>
              )}
            </Pressable>
            {hasFilters && (
              <Pressable onPress={clearFilters} className="ml-2">
                <X size={18} color="#f87171" />
              </Pressable>
            )}
            <View className="flex-1" />
            <Text className="text-emerald-300/40 text-xs">
              {filteredInvestments.length} {isAr ? 'منتج' : 'products'}
            </Text>
          </View>

          {/* Filters Panel */}
          {showFilters && (
            <Animated.View entering={FadeInDown.springify()} className="px-6 mt-3">
              <View className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl p-4">
                {/* Contract Type */}
                <Text className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  {isAr ? 'نوع العقد' : 'Contract Type'}
                </Text>
                <View className="flex-row flex-wrap">
                  {CONTRACT_TYPE_FILTERS.map((f) => (
                    <FilterChip
                      key={f.value}
                      label={isAr ? f.labelAr : f.labelEn}
                      active={selectedContractTypes.includes(f.value)}
                      onPress={() => toggleContractType(f.value)}
                    />
                  ))}
                </View>

                {/* Risk Level */}
                <Text className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2 mt-3">
                  {isAr ? 'مستوى المخاطر' : 'Risk Level'}
                </Text>
                <View className="flex-row flex-wrap">
                  {RISK_FILTERS.map((f) => (
                    <FilterChip
                      key={f.value}
                      label={isAr ? f.labelAr : f.labelEn}
                      active={selectedRisks.includes(f.value)}
                      onPress={() => toggleRisk(f.value)}
                    />
                  ))}
                </View>

                {/* Country */}
                <Text className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2 mt-3">
                  {isAr ? 'البلد' : 'Country'}
                </Text>
                <View className="flex-row flex-wrap">
                  {COUNTRY_FILTERS.map((f) => (
                    <FilterChip
                      key={f.value}
                      label={isAr ? f.labelAr : f.labelEn}
                      active={selectedCountries.includes(f.value)}
                      onPress={() => toggleCountry(f.value)}
                    />
                  ))}
                </View>
              </View>
            </Animated.View>
          )}

          {/* Investment Cards */}
          <View className="px-6 mt-4">
            {filteredInvestments.length === 0 ? (
              <View className="bg-emerald-900/30 rounded-2xl p-6 items-center border border-emerald-800/30">
                <Filter size={32} color="#6b7280" />
                <Text className="text-emerald-300/40 text-sm mt-3 text-center">
                  {isAr
                    ? 'لا توجد منتجات تطابق التصفية.\nحاول تغيير معايير البحث.'
                    : 'No products match your filters.\nTry adjusting your criteria.'}
                </Text>
              </View>
            ) : (
              filteredInvestments.map((inv, index) => (
                <Animated.View key={inv.id} entering={FadeInUp.delay(index * 50).springify()}>
                  <InvestmentCard
                    item={inv}
                    language={language}
                    isExpanded={expandedId === inv.id}
                    onToggle={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                  />
                </Animated.View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
