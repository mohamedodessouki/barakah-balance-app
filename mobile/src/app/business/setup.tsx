import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, ArrowRight, ChevronDown, Check } from 'lucide-react-native';
import { useLanguageStore, useSettingsStore, CalendarType } from '@/lib/store';
import { useTranslation } from '@/lib/translations';
import { countries, getGoldPriceForCurrency } from '@/lib/countries';

export default function BusinessSetupScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);

  const country = useSettingsStore((s) => s.country);
  const goldPricePerGram = useSettingsStore((s) => s.goldPricePerGram);
  const calendarType = useSettingsStore((s) => s.calendarType);
  const nisabThreshold = useSettingsStore((s) => s.nisabThreshold);
  const setCountry = useSettingsStore((s) => s.setCountry);
  const setGoldPrice = useSettingsStore((s) => s.setGoldPrice);
  const setCalendarType = useSettingsStore((s) => s.setCalendarType);
  const calculateNisab = useSettingsStore((s) => s.calculateNisab);

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [goldPriceInput, setGoldPriceInput] = useState(goldPricePerGram.toString());

  useEffect(() => {
    if (country) {
      const defaultPrice = getGoldPriceForCurrency(country.currency);
      setGoldPrice(defaultPrice);
      setGoldPriceInput(defaultPrice.toString());
    }
  }, [country?.currency]);

  useEffect(() => {
    calculateNisab();
  }, [goldPricePerGram]);

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    if (country) {
      router.push('/business/entry');
    }
  };

  const handleSelectCountry = (selectedCountry: typeof countries[0]) => {
    setCountry(selectedCountry);
    setShowCountryPicker(false);
  };

  const handleGoldPriceChange = (value: string) => {
    setGoldPriceInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setGoldPrice(numValue);
    }
  };

  const zakatRate = calendarType === 'islamic' ? '2.5%' : '2.577%';

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
          className={`px-6 pt-4 flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}
        >
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
            {t('locationSetup')}
          </Text>
        </Animated.View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Country Selector */}
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            className="mx-6 mt-8"
          >
            <Text className={`text-white font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
              {t('selectCountry')}
            </Text>
            <Pressable
              onPress={() => setShowCountryPicker(!showCountryPicker)}
              className="bg-indigo-800/50 rounded-xl p-4 active:bg-indigo-800/70"
            >
              <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                {country ? (
                  <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Text className="text-2xl">{country.flag}</Text>
                    <Text className={`text-white text-base ${isRTL ? 'mr-3' : 'ml-3'}`}>
                      {isRTL ? country.nameAr : country.name}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white/50">{t('selectCountry')}</Text>
                )}
                <ChevronDown size={20} color="white" />
              </View>
            </Pressable>

            {/* Country Picker Dropdown */}
            {showCountryPicker && (
              <View className="bg-indigo-900/90 rounded-xl mt-2 max-h-64 overflow-hidden">
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  {countries.map((c) => (
                    <Pressable
                      key={c.code}
                      onPress={() => handleSelectCountry(c)}
                      className={`p-4 border-b border-indigo-800/50 active:bg-indigo-700/50 flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <Text className="text-xl">{c.flag}</Text>
                      <Text className={`text-white flex-1 ${isRTL ? 'mr-3 text-right' : 'ml-3'}`}>
                        {isRTL ? c.nameAr : c.name}
                      </Text>
                      {country?.code === c.code && (
                        <Check size={18} color="#a5b4fc" />
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </Animated.View>

          {/* Currency Display */}
          {country && (
            <Animated.View
              entering={FadeInUp.delay(300).springify()}
              className="mx-6 mt-6"
            >
              <Text className={`text-white font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
                {t('currency')}
              </Text>
              <View className="bg-indigo-800/30 rounded-xl p-4">
                <Text className={`text-indigo-300 text-lg ${isRTL ? 'text-right' : ''}`}>
                  {country.currencySymbol} {country.currency}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Gold Price */}
          {country && (
            <Animated.View
              entering={FadeInUp.delay(400).springify()}
              className="mx-6 mt-6"
            >
              <Text className={`text-white font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
                {t('goldPrice')} ({country.currencySymbol})
              </Text>
              <View className={`bg-indigo-800/50 rounded-xl p-4 flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Text className={`text-indigo-300 text-lg ${isRTL ? 'ml-2' : 'mr-2'}`}>
                  {country.currencySymbol}
                </Text>
                <TextInput
                  value={goldPriceInput}
                  onChangeText={handleGoldPriceChange}
                  keyboardType="numeric"
                  className={`flex-1 text-white text-lg ${isRTL ? 'text-right' : ''}`}
                  placeholderTextColor="#6b7280"
                  style={{ textAlign: isRTL ? 'right' : 'left' }}
                />
              </View>
            </Animated.View>
          )}

          {/* Calendar Type */}
          {country && (
            <Animated.View
              entering={FadeInUp.delay(500).springify()}
              className="mx-6 mt-6"
            >
              <Text className={`text-white font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
                {t('calendarType')}
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setCalendarType('islamic')}
                  className={`flex-1 rounded-xl p-4 ${
                    calendarType === 'islamic' ? 'bg-indigo-600' : 'bg-indigo-800/50'
                  }`}
                >
                  <Text className={`text-white text-center font-medium ${isRTL ? 'text-right' : ''}`}>
                    {t('islamicCalendar')}
                  </Text>
                  <Text className="text-indigo-200 text-center text-sm mt-1">
                    2.5%
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setCalendarType('western')}
                  className={`flex-1 rounded-xl p-4 ${
                    calendarType === 'western' ? 'bg-indigo-600' : 'bg-indigo-800/50'
                  }`}
                >
                  <Text className={`text-white text-center font-medium ${isRTL ? 'text-right' : ''}`}>
                    {t('westernCalendar')}
                  </Text>
                  <Text className="text-indigo-200 text-center text-sm mt-1">
                    2.577%
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {/* Nisab Threshold */}
          {country && (
            <Animated.View
              entering={FadeInUp.delay(600).springify()}
              className="mx-6 mt-6"
            >
              <LinearGradient
                colors={['#4338ca', '#3730a3']}
                style={{ borderRadius: 16, padding: 16 }}
              >
                <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <View>
                    <Text className={`text-indigo-300 text-sm ${isRTL ? 'text-right' : ''}`}>
                      {t('nisabThreshold')}
                    </Text>
                    <Text className={`text-white text-2xl font-bold mt-1 ${isRTL ? 'text-right' : ''}`}>
                      {country.currencySymbol} {nisabThreshold.toLocaleString()}
                    </Text>
                  </View>
                  <View className={`items-${isRTL ? 'start' : 'end'}`}>
                    <Text className="text-indigo-300 text-sm">
                      {t('zakatRate')}
                    </Text>
                    <Text className="text-white text-xl font-bold mt-1">
                      {zakatRate}
                    </Text>
                  </View>
                </View>
                <Text className={`text-indigo-400 text-xs mt-3 ${isRTL ? 'text-right' : ''}`}>
                  {t('nisabExplanation')} (85g x {country.currencySymbol}{goldPricePerGram})
                </Text>
              </LinearGradient>
            </Animated.View>
          )}
        </ScrollView>

        {/* Next Button */}
        <Animated.View
          entering={FadeInUp.delay(700).springify()}
          className="absolute bottom-0 left-0 right-0 px-6 pb-8"
        >
          <Pressable
            onPress={handleNext}
            disabled={!country}
            className={`active:scale-[0.98] ${!country ? 'opacity-50' : ''}`}
          >
            <LinearGradient
              colors={country ? ['#6366f1', '#4f46e5'] : ['#374151', '#1f2937']}
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
      </SafeAreaView>
    </View>
  );
}
