import React from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, ArrowRight, MinusCircle } from 'lucide-react-native';
import { useLanguageStore, useSettingsStore, useIndividualCalculatorStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';

export default function DeductionsScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);
  const country = useSettingsStore((s) => s.country);

  const deductions = useIndividualCalculatorStore((s) => s.deductions);
  const setDeductionValue = useIndividualCalculatorStore((s) => s.setDeductionValue);
  const getTotalDeductions = useIndividualCalculatorStore((s) => s.getTotalDeductions);
  const getTotalAssets = useIndividualCalculatorStore((s) => s.getTotalAssets);

  const currencySymbol = country?.currencySymbol ?? '$';
  const totalDeductions = getTotalDeductions();
  const totalAssets = getTotalAssets();

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push('/individual/results');
  };

  const handleValueChange = (key: keyof typeof deductions, value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    setDeductionValue(key, numValue);
  };

  const deductionFields = [
    {
      key: 'zakatAlreadyPaid' as const,
      titleKey: 'zakatAlreadyPaid',
      description: 'Zakat you have already paid this year',
      icon: '💰',
    },
    {
      key: 'urgentDebts' as const,
      titleKey: 'urgentDebts',
      description: 'Debts you must pay immediately',
      icon: '⚡',
    },
    {
      key: 'goodReceivables' as const,
      titleKey: 'goodReceivables',
      description: 'Good debts owed to you',
      icon: '📋',
    },
  ];

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
              {t('deductions')}
            </Text>
          </View>
          <View className="bg-red-600/30 rounded-xl px-3 py-1">
            <Text className="text-red-200 text-sm">
              -{currencySymbol} {totalDeductions.toLocaleString()}
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
            <View className="w-8 h-8 rounded-full bg-emerald-700 items-center justify-center">
              <Text className="text-white/50 font-bold">2</Text>
            </View>
            <View className="w-12 h-1 bg-emerald-500 rounded-full" />
            <View className="w-8 h-8 rounded-full bg-emerald-500 items-center justify-center">
              <Text className="text-white font-bold">3</Text>
            </View>
          </View>
        </Animated.View>

        <ScrollView
          className="flex-1 mt-6"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Card */}
          <Animated.View
            entering={FadeInUp.delay(300).springify()}
            className="mx-6 mb-6"
          >
            <LinearGradient
              colors={['#065f46', '#064e3b']}
              style={{ borderRadius: 16, padding: 16 }}
            >
              <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MinusCircle size={24} color="#f87171" />
                <View className={`flex-1 ${isRTL ? 'mr-3' : 'ml-3'}`}>
                  <Text className={`text-emerald-300 text-sm ${isRTL ? 'text-right' : ''}`}>
                    {t('deductionsDesc')}
                  </Text>
                  <View className={`flex-row items-center mt-1 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                    <Text className={`text-white text-xl font-bold ${isRTL ? 'text-right' : ''}`}>
                      {currencySymbol} {totalAssets.toLocaleString()}
                    </Text>
                    <Text className={`text-red-400 ${isRTL ? 'mr-2' : 'ml-2'}`}>
                      - {currencySymbol} {totalDeductions.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Deduction Fields */}
          {deductionFields.map((field, index) => (
            <Animated.View
              key={field.key}
              entering={FadeInUp.delay(400 + index * 100).springify()}
              className="mx-6 mb-4"
            >
              <View className="bg-emerald-900/50 rounded-xl p-4">
                <View className={`flex-row items-center mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Text className="text-2xl">{field.icon}</Text>
                  <View className={`flex-1 ${isRTL ? 'mr-3 items-end' : 'ml-3'}`}>
                    <Text className={`text-white font-medium ${isRTL ? 'text-right' : ''}`}>
                      {t(field.titleKey as any)}
                    </Text>
                    <Text className={`text-emerald-400 text-xs ${isRTL ? 'text-right' : ''}`}>
                      {field.description}
                    </Text>
                  </View>
                </View>
                <View className={`flex-row items-center bg-emerald-800/50 rounded-xl px-4 py-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Text className={`text-emerald-300 ${isRTL ? 'ml-2' : 'mr-2'}`}>
                    {currencySymbol}
                  </Text>
                  <TextInput
                    value={deductions[field.key] > 0 ? String(deductions[field.key]) : ''}
                    onChangeText={(v) => handleValueChange(field.key, v)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#6b7280"
                    className={`flex-1 text-white text-lg ${isRTL ? 'text-right' : ''}`}
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                  />
                </View>
              </View>
            </Animated.View>
          ))}

          {/* Net Wealth Preview */}
          <Animated.View
            entering={FadeInUp.delay(700).springify()}
            className="mx-6 mt-4"
          >
            <View className="bg-emerald-800/30 rounded-xl p-4 border border-emerald-700/50">
              <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Text className={`text-emerald-300 ${isRTL ? 'text-right' : ''}`}>
                  {t('netWealth')}
                </Text>
                <Text className="text-white text-xl font-bold">
                  {currencySymbol} {(totalAssets - totalDeductions).toLocaleString()}
                </Text>
              </View>
            </View>
          </Animated.View>
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
                {t('calculate')}
              </Text>
              <ArrowRight
                size={20}
                color="white"
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
