import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, SlideInUp } from 'react-native-reanimated';
import {
  ArrowLeft, Plus, X, Users, Building2, ChevronRight, Check, Info
} from 'lucide-react-native';
import { useLanguageStore, useSettingsStore, useIndividualCalculatorStore } from '@/lib/store';
import { useDashboardStore, ZAKAT_CATEGORIES, ZakatCategory, ZakatRecipient } from '@/lib/dashboard-store';
import { useResponsive } from '@/lib/useResponsive';

function CategoryCard({
  category,
  allocation,
  totalZakat,
  recipients,
  language,
  isRTL,
  currencySymbol,
  onPress,
  onAllocate,
}: {
  category: ZakatCategory;
  allocation: number;
  totalZakat: number;
  recipients: ZakatRecipient[];
  language: string;
  isRTL: boolean;
  currencySymbol: string;
  onPress: () => void;
  onAllocate: () => void;
}) {
  const cat = ZAKAT_CATEGORIES[category];
  const amount = (totalZakat * allocation) / 100;
  const recipientCount = recipients.filter((r) => r.category === category).length;

  return (
    <Animated.View entering={FadeInUp.springify()}>
      <Pressable
        onPress={onPress}
        className="bg-slate-800/50 rounded-2xl p-4 mb-3"
      >
        <View className={`flex-row items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
          <View className="w-14 h-14 rounded-xl bg-emerald-900/50 items-center justify-center">
            <Text className="text-2xl">{cat.icon}</Text>
          </View>
          <View className={`flex-1 ${isRTL ? 'mr-4' : 'ml-4'}`}>
            <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <View>
                <Text className={`text-white font-semibold ${isRTL ? 'text-right' : ''}`}>
                  {language === 'ar' ? cat.ar : cat.en}
                </Text>
                {recipientCount > 0 && (
                  <Text className={`text-slate-400 text-xs mt-0.5 ${isRTL ? 'text-right' : ''}`}>
                    {recipientCount} {language === 'ar' ? 'مستفيد' : 'recipient(s)'}
                  </Text>
                )}
              </View>
              <View className="items-end">
                <Text className="text-emerald-400 font-bold">
                  {allocation > 0 ? `${allocation}%` : '-'}
                </Text>
                {allocation > 0 && (
                  <Text className="text-slate-400 text-xs">
                    {currencySymbol}{amount.toLocaleString()}
                  </Text>
                )}
              </View>
            </View>

            {/* Allocation bar */}
            <View className="h-2 bg-slate-700 rounded-full overflow-hidden mt-3">
              <View
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${allocation}%` }}
              />
            </View>

            <View className={`flex-row items-center justify-between mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Pressable
                onPress={onAllocate}
                className="bg-emerald-600/30 px-3 py-1.5 rounded-lg"
              >
                <Text className="text-emerald-400 text-xs">
                  {language === 'ar' ? 'تخصيص' : 'Allocate'}
                </Text>
              </Pressable>
              <Pressable
                onPress={onPress}
                className="flex-row items-center"
              >
                <Text className="text-slate-400 text-xs">
                  {language === 'ar' ? 'إضافة مستفيد' : 'Add Recipient'}
                </Text>
                <ChevronRight size={14} color="#64748b" />
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function ZakatDistributionScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const isRTL = language === 'ar';
  const country = useSettingsStore((s) => s.country);
  const { isDesktop, isTablet } = useResponsive();

  const totalAssets = useIndividualCalculatorStore((s) => s.getTotalAssets)();
  const currentNisab = useDashboardStore((s) => s.getCurrentNisab)();
  const zakatPayments = useDashboardStore((s) => s.zakatPayments);
  const addZakatPayment = useDashboardStore((s) => s.addZakatPayment);

  const currencySymbol = country?.currencySymbol ?? '$';

  // Calculate total Zakat due
  const totalZakat = Math.max(0, (totalAssets - currentNisab) * 0.025);

  // Allocation state (percentage for each category)
  const [allocations, setAllocations] = useState<Record<ZakatCategory, number>>({
    fuqara: 0,
    masakin: 0,
    amil: 0,
    muallaf: 0,
    riqab: 0,
    gharimin: 0,
    fisabilillah: 0,
    ibnsabil: 0,
  });

  // Recipients state
  const [recipients, setRecipients] = useState<ZakatRecipient[]>([]);

  // Modals
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ZakatCategory>('fuqara');
  const [allocationAmount, setAllocationAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAmount, setRecipientAmount] = useState('');
  const [isOrganization, setIsOrganization] = useState(false);

  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + val, 0);
  const remaining = 100 - totalAllocated;

  const containerStyle = isDesktop
    ? { maxWidth: 1000, marginHorizontal: 'auto' as const, width: '100%' as const }
    : isTablet
    ? { maxWidth: 700, marginHorizontal: 'auto' as const, width: '100%' as const }
    : {};

  const handleAllocate = () => {
    const amount = parseFloat(allocationAmount);
    if (isNaN(amount) || amount < 0) return;

    // Check if allocation exceeds remaining
    const newTotal = totalAllocated - allocations[selectedCategory] + amount;
    if (newTotal > 100) {
      // Cap at remaining
      setAllocations((prev) => ({
        ...prev,
        [selectedCategory]: prev[selectedCategory] + remaining,
      }));
    } else {
      setAllocations((prev) => ({
        ...prev,
        [selectedCategory]: amount,
      }));
    }

    setAllocationAmount('');
    setShowAllocateModal(false);
  };

  const handleAddRecipient = () => {
    if (!recipientName || !recipientAmount) return;

    const newRecipient: ZakatRecipient = {
      category: selectedCategory,
      name: recipientName,
      amount: parseFloat(recipientAmount),
      isOrganization,
    };

    setRecipients((prev) => [...prev, newRecipient]);
    setRecipientName('');
    setRecipientAmount('');
    setIsOrganization(false);
    setShowRecipientModal(false);
  };

  const handleConfirmDistribution = () => {
    if (totalAllocated < 100) return;

    addZakatPayment({
      date: new Date().toISOString(),
      amount: totalZakat,
      currency: country?.currency ?? 'USD',
      notes: 'Distributed via Barakah Balance',
      recipients,
    });

    router.back();
  };

  // Quick allocate equal amounts
  const handleEqualDistribution = () => {
    const categories = Object.keys(ZAKAT_CATEGORIES) as ZakatCategory[];
    const equalShare = Math.floor(100 / categories.length);
    const remainder = 100 - equalShare * categories.length;

    const newAllocations: Record<ZakatCategory, number> = {} as Record<ZakatCategory, number>;
    categories.forEach((cat, index) => {
      newAllocations[cat] = equalShare + (index === 0 ? remainder : 0);
    });
    setAllocations(newAllocations);
  };

  return (
    <View className="flex-1 bg-slate-950">
      <LinearGradient
        colors={['#0f172a', '#020617', '#000']}
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
              onPress={() => router.back()}
              className={`p-2 rounded-full bg-white/10 ${isRTL ? 'ml-4' : 'mr-4'}`}
            >
              <ArrowLeft size={24} color="white" style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
            </Pressable>
            <View>
              <Text className="text-white text-lg font-bold">
                {language === 'ar' ? 'توزيع الزكاة' : 'Zakat Distribution'}
              </Text>
              <Text className="text-slate-400 text-xs">
                {language === 'ar' ? 'الأصناف الثمانية' : 'Eight Eligible Categories'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Total Zakat Card */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="px-6 mt-4"
          style={containerStyle}
        >
          <LinearGradient
            colors={['#064e3b', '#022c22']}
            style={{ borderRadius: 16, padding: 20 }}
          >
            <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <View>
                <Text className={`text-emerald-300 text-sm ${isRTL ? 'text-right' : ''}`}>
                  {language === 'ar' ? 'إجمالي الزكاة المستحقة' : 'Total Zakat Due'}
                </Text>
                <Text className={`text-white text-3xl font-bold mt-1 ${isRTL ? 'text-right' : ''}`}>
                  {currencySymbol}{totalZakat.toLocaleString()}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-emerald-300 text-sm">
                  {language === 'ar' ? 'موزع' : 'Allocated'}
                </Text>
                <Text className={`text-2xl font-bold ${totalAllocated === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {totalAllocated}%
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View className="h-3 bg-emerald-950 rounded-full overflow-hidden mt-4">
              <View
                className={`h-full rounded-full ${totalAllocated === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${totalAllocated}%` }}
              />
            </View>

            {remaining > 0 && (
              <Text className="text-amber-400 text-xs mt-2 text-center">
                {language === 'ar' ? `${remaining}% متبقي للتوزيع` : `${remaining}% remaining to allocate`}
              </Text>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          className="px-6 mt-4 flex-row gap-3"
          style={containerStyle}
        >
          <Pressable
            onPress={handleEqualDistribution}
            className="flex-1 bg-slate-800/50 rounded-xl py-3 items-center"
          >
            <Text className="text-slate-300 text-sm">
              {language === 'ar' ? 'توزيع متساوٍ' : 'Equal Split'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setAllocations({
              fuqara: 0, masakin: 0, amil: 0, muallaf: 0,
              riqab: 0, gharimin: 0, fisabilillah: 0, ibnsabil: 0,
            })}
            className="flex-1 bg-slate-800/50 rounded-xl py-3 items-center"
          >
            <Text className="text-slate-300 text-sm">
              {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Info Banner */}
        <Animated.View
          entering={FadeInDown.delay(350).springify()}
          className="px-6 mt-4"
          style={containerStyle}
        >
          <View className="bg-indigo-900/30 rounded-xl p-3 flex-row items-start">
            <Info size={16} color="#818cf8" style={{ marginTop: 2 }} />
            <Text className={`text-indigo-300 text-xs flex-1 ${isRTL ? 'mr-2 text-right' : 'ml-2'}`}>
              {language === 'ar'
                ? 'يجوز توزيع الزكاة على صنف واحد أو أكثر من الأصناف الثمانية المذكورة في القرآن'
                : 'Zakat can be distributed to one or more of the eight categories mentioned in the Quran (At-Tawbah 9:60)'}
            </Text>
          </View>
        </Animated.View>

        <ScrollView
          className="flex-1 px-6 mt-4"
          contentContainerStyle={{ ...containerStyle, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Desktop: 2-column grid */}
          <View className={isDesktop ? 'flex-row flex-wrap gap-4' : ''}>
            {(Object.keys(ZAKAT_CATEGORIES) as ZakatCategory[]).map((category) => (
              <View key={category} className={isDesktop ? 'w-[48%]' : ''}>
                <CategoryCard
                  category={category}
                  allocation={allocations[category]}
                  totalZakat={totalZakat}
                  recipients={recipients}
                  language={language ?? 'en'}
                  isRTL={isRTL}
                  currencySymbol={currencySymbol}
                  onPress={() => {
                    setSelectedCategory(category);
                    setShowRecipientModal(true);
                  }}
                  onAllocate={() => {
                    setSelectedCategory(category);
                    setAllocationAmount(allocations[category].toString());
                    setShowAllocateModal(true);
                  }}
                />
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Confirm Button */}
        <Animated.View
          entering={FadeInUp.delay(500).springify()}
          className="px-6 pb-6"
          style={containerStyle}
        >
          <Pressable
            onPress={handleConfirmDistribution}
            disabled={totalAllocated < 100}
            className={`py-4 rounded-xl flex-row items-center justify-center ${
              totalAllocated === 100 ? 'bg-emerald-600' : 'bg-slate-700'
            }`}
          >
            {totalAllocated === 100 && <Check size={20} color="white" style={{ marginRight: 8 }} />}
            <Text className={`font-semibold ${totalAllocated === 100 ? 'text-white' : 'text-slate-400'}`}>
              {totalAllocated === 100
                ? language === 'ar' ? 'تأكيد التوزيع' : 'Confirm Distribution'
                : language === 'ar' ? `خصص ${remaining}% المتبقية` : `Allocate remaining ${remaining}%`}
            </Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>

      {/* Allocate Modal */}
      <Modal visible={showAllocateModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <Animated.View
            entering={SlideInUp.springify()}
            className="bg-slate-900 rounded-t-3xl p-6"
          >
            <View className={`flex-row items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <View>
                <Text className="text-white text-xl font-bold">
                  {language === 'ar' ? 'تخصيص نسبة' : 'Allocate Percentage'}
                </Text>
                <Text className="text-slate-400 text-sm">
                  {language === 'ar' ? ZAKAT_CATEGORIES[selectedCategory].ar : ZAKAT_CATEGORIES[selectedCategory].en}
                </Text>
              </View>
              <Pressable onPress={() => setShowAllocateModal(false)}>
                <X size={24} color="#64748b" />
              </Pressable>
            </View>

            <View className="bg-slate-800 rounded-xl p-4 mb-4">
              <View className={`flex-row justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Text className="text-slate-400">{language === 'ar' ? 'المتاح' : 'Available'}</Text>
                <Text className="text-emerald-400">{remaining + allocations[selectedCategory]}%</Text>
              </View>
              <View className={`flex-row justify-between mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Text className="text-slate-400">{language === 'ar' ? 'المبلغ المقابل' : 'Equivalent Amount'}</Text>
                <Text className="text-white">
                  {currencySymbol}{((totalZakat * (parseFloat(allocationAmount) || 0)) / 100).toLocaleString()}
                </Text>
              </View>
            </View>

            <Text className={`text-slate-400 text-sm mb-2 ${isRTL ? 'text-right' : ''}`}>
              {language === 'ar' ? 'النسبة المئوية' : 'Percentage'} (%)
            </Text>
            <TextInput
              value={allocationAmount}
              onChangeText={setAllocationAmount}
              placeholder="25"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              className="bg-slate-800 rounded-xl px-4 py-3 text-white text-xl text-center mb-6"
              autoFocus
            />

            {/* Quick percentages */}
            <View className="flex-row gap-2 mb-6">
              {[10, 25, 50, 100].map((pct) => (
                <Pressable
                  key={pct}
                  onPress={() => setAllocationAmount(Math.min(pct, remaining + allocations[selectedCategory]).toString())}
                  className="flex-1 bg-slate-800 py-2 rounded-lg"
                >
                  <Text className="text-slate-300 text-center">{pct}%</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleAllocate}
              className="bg-emerald-600 py-4 rounded-xl"
            >
              <Text className="text-white text-center font-semibold">
                {language === 'ar' ? 'تأكيد' : 'Confirm'}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

      {/* Add Recipient Modal */}
      <Modal visible={showRecipientModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <Animated.View
            entering={SlideInUp.springify()}
            className="bg-slate-900 rounded-t-3xl p-6"
          >
            <View className={`flex-row items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <View>
                <Text className="text-white text-xl font-bold">
                  {language === 'ar' ? 'إضافة مستفيد' : 'Add Recipient'}
                </Text>
                <Text className="text-slate-400 text-sm">
                  {language === 'ar' ? ZAKAT_CATEGORIES[selectedCategory].ar : ZAKAT_CATEGORIES[selectedCategory].en}
                </Text>
              </View>
              <Pressable onPress={() => { setRecipientName(''); setRecipientAmount(''); setShowRecipientModal(false); }}>
                <X size={24} color="#64748b" />
              </Pressable>
            </View>

            {/* Type Toggle */}
            <View className="flex-row bg-slate-800 rounded-xl p-1 mb-4">
              <Pressable
                onPress={() => setIsOrganization(false)}
                className={`flex-1 py-2 rounded-lg flex-row items-center justify-center ${!isOrganization ? 'bg-slate-700' : ''}`}
              >
                <Users size={16} color={!isOrganization ? 'white' : '#64748b'} />
                <Text className={`ml-2 text-sm ${!isOrganization ? 'text-white' : 'text-slate-400'}`}>
                  {language === 'ar' ? 'فرد' : 'Individual'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setIsOrganization(true)}
                className={`flex-1 py-2 rounded-lg flex-row items-center justify-center ${isOrganization ? 'bg-slate-700' : ''}`}
              >
                <Building2 size={16} color={isOrganization ? 'white' : '#64748b'} />
                <Text className={`ml-2 text-sm ${isOrganization ? 'text-white' : 'text-slate-400'}`}>
                  {language === 'ar' ? 'منظمة' : 'Organization'}
                </Text>
              </Pressable>
            </View>

            <Text className={`text-slate-400 text-sm mb-2 ${isRTL ? 'text-right' : ''}`}>
              {isOrganization
                ? language === 'ar' ? 'اسم المنظمة' : 'Organization Name'
                : language === 'ar' ? 'اسم المستفيد' : 'Recipient Name'}
            </Text>
            <TextInput
              value={recipientName}
              onChangeText={setRecipientName}
              placeholder={isOrganization ? 'Islamic Relief' : 'Ahmed Ali'}
              placeholderTextColor="#64748b"
              className="bg-slate-800 rounded-xl px-4 py-3 text-white mb-4"
              style={{ textAlign: isRTL ? 'right' : 'left' }}
            />

            <Text className={`text-slate-400 text-sm mb-2 ${isRTL ? 'text-right' : ''}`}>
              {language === 'ar' ? 'المبلغ' : 'Amount'} ({currencySymbol})
            </Text>
            <TextInput
              value={recipientAmount}
              onChangeText={setRecipientAmount}
              placeholder="500"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              className="bg-slate-800 rounded-xl px-4 py-3 text-white mb-6"
              style={{ textAlign: isRTL ? 'right' : 'left' }}
            />

            <Pressable
              onPress={handleAddRecipient}
              disabled={!recipientName || !recipientAmount}
              className={`py-4 rounded-xl ${(!recipientName || !recipientAmount) ? 'bg-slate-700' : 'bg-emerald-600'}`}
            >
              <Text className={`text-center font-semibold ${(!recipientName || !recipientAmount) ? 'text-slate-400' : 'text-white'}`}>
                {language === 'ar' ? 'إضافة مستفيد' : 'Add Recipient'}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
