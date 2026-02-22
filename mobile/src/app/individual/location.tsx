import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, ArrowRight, ChevronDown, Check, Search, Info, RefreshCw, X } from 'lucide-react-native';
import { useLanguageStore, useSettingsStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';
import { countries, getGoldPriceForCurrency } from '@/lib/countries';
import { fetchGoldPrice, GoldPriceResult } from '@/lib/api-services';

export default function LocationSetupScreen() {
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
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [goldPriceInput, setGoldPriceInput] = useState(goldPricePerGram.toString());
  const [isLoadingGoldPrice, setIsLoadingGoldPrice] = useState(false);
  const [goldPriceData, setGoldPriceData] = useState<GoldPriceResult | null>(null);
  const [showGoldPriceTooltip, setShowGoldPriceTooltip] = useState(false);

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!countrySearchQuery.trim()) return countries;
    const query = countrySearchQuery.toLowerCase().trim();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.nameAr.includes(query) ||
        c.code.toLowerCase().includes(query) ||
        c.currency.toLowerCase().includes(query)
    );
  }, [countrySearchQuery]);

  // Fetch gold price when country changes
  const fetchGoldPriceFromAPI = async () => {
    if (!country) return;

    setIsLoadingGoldPrice(true);
    try {
      const result = await fetchGoldPrice(country.currency);
      setGoldPriceData(result);
      setGoldPrice(result.averagePrice);
      setGoldPriceInput(result.averagePrice.toString());
    } catch (error) {
      console.error('Error fetching gold price:', error);
      // Fallback to default price
      const defaultPrice = getGoldPriceForCurrency(country.currency);
      setGoldPrice(defaultPrice);
      setGoldPriceInput(defaultPrice.toString());
    } finally {
      setIsLoadingGoldPrice(false);
    }
  };

  useEffect(() => {
    if (country) {
      fetchGoldPriceFromAPI();
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
      router.push('/individual/assets');
    }
  };

  const handleSelectCountry = (selectedCountry: typeof countries[0]) => {
    setCountry(selectedCountry);
    setShowCountryPicker(false);
    setCountrySearchQuery('');
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
    <View className="flex-1 bg-emerald-950">
      <LinearGradient
        colors={['#064e3b', '#022c22', '#011311']}
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
          {/* Step Indicator */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            className="px-6 pt-6"
          >
            <View className="flex-row items-center justify-center gap-2">
              <View className="w-8 h-8 rounded-full bg-emerald-500 items-center justify-center">
                <Text className="text-white font-bold">1</Text>
              </View>
              <View className="w-12 h-1 bg-emerald-800 rounded-full" />
              <View className="w-8 h-8 rounded-full bg-emerald-800 items-center justify-center">
                <Text className="text-white/50 font-bold">2</Text>
              </View>
              <View className="w-12 h-1 bg-emerald-800 rounded-full" />
              <View className="w-8 h-8 rounded-full bg-emerald-800 items-center justify-center">
                <Text className="text-white/50 font-bold">3</Text>
              </View>
            </View>
          </Animated.View>

          {/* Country Selector */}
          <Animated.View
            entering={FadeInUp.delay(300).springify()}
            className="mx-6 mt-8"
          >
            <Text className={`text-white font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
              {t('selectCountry')}
            </Text>
            <Pressable
              onPress={() => setShowCountryPicker(!showCountryPicker)}
              className="bg-emerald-800/50 rounded-xl p-4 active:bg-emerald-800/70"
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

            {/* Country Picker Dropdown with Search */}
            {showCountryPicker && (
              <View className="bg-emerald-900/95 rounded-xl mt-2 overflow-hidden">
                {/* Search Input */}
                <View className="p-3 border-b border-emerald-800/50">
                  <View className={`flex-row items-center bg-emerald-800/50 rounded-lg px-3 py-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Search size={18} color="#6ee7b7" />
                    <TextInput
                      value={countrySearchQuery}
                      onChangeText={setCountrySearchQuery}
                      placeholder="Search country..."
                      placeholderTextColor="#6b7280"
                      className={`flex-1 text-white ${isRTL ? 'mr-2 text-right' : 'ml-2'}`}
                      autoFocus
                    />
                    {countrySearchQuery.length > 0 && (
                      <Pressable onPress={() => setCountrySearchQuery('')}>
                        <X size={16} color="#6b7280" />
                      </Pressable>
                    )}
                  </View>
                </View>

                {/* Country List */}
                <ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 240 }}
                >
                  {filteredCountries.length === 0 ? (
                    <View className="p-4">
                      <Text className="text-white/50 text-center">No countries found</Text>
                    </View>
                  ) : (
                    filteredCountries.map((c) => (
                      <Pressable
                        key={c.code}
                        onPress={() => handleSelectCountry(c)}
                        className={`p-4 border-b border-emerald-800/50 active:bg-emerald-700/50 flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <Text className="text-xl">{c.flag}</Text>
                        <View className={`flex-1 ${isRTL ? 'mr-3 items-end' : 'ml-3'}`}>
                          <Text className={`text-white ${isRTL ? 'text-right' : ''}`}>
                            {isRTL ? c.nameAr : c.name}
                          </Text>
                          <Text className={`text-emerald-400 text-xs ${isRTL ? 'text-right' : ''}`}>
                            {c.currency} ({c.currencySymbol})
                          </Text>
                        </View>
                        {country?.code === c.code && (
                          <Check size={18} color="#34d399" />
                        )}
                      </Pressable>
                    ))
                  )}
                </ScrollView>
              </View>
            )}
          </Animated.View>

          {/* Currency Display */}
          {country && (
            <Animated.View
              entering={FadeInUp.delay(400).springify()}
              className="mx-6 mt-6"
            >
              <Text className={`text-white font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
                {t('currency')}
              </Text>
              <View className="bg-emerald-800/30 rounded-xl p-4">
                <Text className={`text-emerald-300 text-lg ${isRTL ? 'text-right' : ''}`}>
                  {country.currencySymbol} {country.currency}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Gold Price with API Info */}
          {country && (
            <Animated.View
              entering={FadeInUp.delay(500).springify()}
              className="mx-6 mt-6"
            >
              <View className={`flex-row items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Text className={`text-white font-semibold ${isRTL ? 'ml-2' : 'mr-2'}`}>
                    {t('goldPrice')} ({country.currencySymbol})
                  </Text>
                  <Pressable
                    onPress={() => setShowGoldPriceTooltip(true)}
                    className="p-1"
                  >
                    <Info size={16} color="#6ee7b7" />
                  </Pressable>
                </View>
                <Pressable
                  onPress={fetchGoldPriceFromAPI}
                  disabled={isLoadingGoldPrice}
                  className={`flex-row items-center bg-emerald-700/50 rounded-lg px-2 py-1 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  {isLoadingGoldPrice ? (
                    <ActivityIndicator size="small" color="#6ee7b7" />
                  ) : (
                    <>
                      <RefreshCw size={14} color="#6ee7b7" />
                      <Text className={`text-emerald-300 text-xs ${isRTL ? 'mr-1' : 'ml-1'}`}>
                        Refresh
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>

              <View className={`bg-emerald-800/50 rounded-xl p-4 flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Text className={`text-emerald-300 text-lg ${isRTL ? 'ml-2' : 'mr-2'}`}>
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
                {isLoadingGoldPrice && (
                  <ActivityIndicator size="small" color="#6ee7b7" />
                )}
              </View>

              {goldPriceData && (
                <Text className={`text-emerald-500 text-xs mt-2 ${isRTL ? 'text-right' : ''}`}>
                  Average of {goldPriceData.sources.length} market sources
                </Text>
              )}
            </Animated.View>
          )}

          {/* Calendar Type */}
          {country && (
            <Animated.View
              entering={FadeInUp.delay(600).springify()}
              className="mx-6 mt-6"
            >
              <Text className={`text-white font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
                {t('calendarType')}
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setCalendarType('islamic')}
                  className={`flex-1 rounded-xl p-4 ${
                    calendarType === 'islamic' ? 'bg-emerald-600' : 'bg-emerald-800/50'
                  }`}
                >
                  <Text className="text-white text-center font-medium">
                    {t('islamicCalendar')}
                  </Text>
                  <Text className="text-emerald-200 text-center text-sm mt-1">
                    2.5%
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setCalendarType('western')}
                  className={`flex-1 rounded-xl p-4 ${
                    calendarType === 'western' ? 'bg-emerald-600' : 'bg-emerald-800/50'
                  }`}
                >
                  <Text className="text-white text-center font-medium">
                    {t('westernCalendar')}
                  </Text>
                  <Text className="text-emerald-200 text-center text-sm mt-1">
                    2.577%
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {/* Nisab Threshold */}
          {country && (
            <Animated.View
              entering={FadeInUp.delay(700).springify()}
              className="mx-6 mt-6"
            >
              <LinearGradient
                colors={['#065f46', '#064e3b']}
                style={{ borderRadius: 16, padding: 16 }}
              >
                <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <View>
                    <Text className={`text-emerald-300 text-sm ${isRTL ? 'text-right' : ''}`}>
                      {t('nisabThreshold')}
                    </Text>
                    <Text className={`text-white text-2xl font-bold mt-1 ${isRTL ? 'text-right' : ''}`}>
                      {country.currencySymbol} {nisabThreshold.toLocaleString()}
                    </Text>
                  </View>
                  <View className={isRTL ? 'items-start' : 'items-end'}>
                    <Text className="text-emerald-300 text-sm">
                      {t('zakatRate')}
                    </Text>
                    <Text className="text-white text-xl font-bold mt-1">
                      {zakatRate}
                    </Text>
                  </View>
                </View>
                <Text className={`text-emerald-400 text-xs mt-3 ${isRTL ? 'text-right' : ''}`}>
                  {t('nisabExplanation')} (85g x {country.currencySymbol}{goldPricePerGram})
                </Text>
              </LinearGradient>
            </Animated.View>
          )}
        </ScrollView>

        {/* Next Button */}
        <Animated.View
          entering={FadeInUp.delay(800).springify()}
          className="absolute bottom-0 left-0 right-0 px-6 pb-8"
        >
          <Pressable
            onPress={handleNext}
            disabled={!country}
            className={`active:scale-[0.98] ${!country ? 'opacity-50' : ''}`}
          >
            <LinearGradient
              colors={country ? ['#10b981', '#059669'] : ['#374151', '#1f2937']}
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

        {/* Gold Price Tooltip Modal */}
        <Modal
          visible={showGoldPriceTooltip}
          transparent
          animationType="fade"
          onRequestClose={() => setShowGoldPriceTooltip(false)}
        >
          <Pressable
            className="flex-1 bg-black/70 justify-center px-6"
            onPress={() => setShowGoldPriceTooltip(false)}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="bg-emerald-900 rounded-2xl p-6">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-white text-lg font-bold">Gold Price Sources</Text>
                  <Pressable onPress={() => setShowGoldPriceTooltip(false)}>
                    <X size={20} color="white" />
                  </Pressable>
                </View>

                <Text className="text-emerald-300 text-sm mb-4">
                  The gold price is calculated as an average from multiple reputable market sources:
                </Text>

                {goldPriceData?.sources.map((source, index) => (
                  <View key={index} className="flex-row items-center justify-between py-2 border-b border-emerald-800/50">
                    <Text className="text-white">{source.name}</Text>
                    <Text className="text-emerald-400">
                      {country?.currencySymbol}{source.price.toFixed(2)}/g
                    </Text>
                  </View>
                )) || (
                  <Text className="text-white/50">Loading price data...</Text>
                )}

                {goldPriceData && (
                  <View className="mt-4 pt-4 border-t border-emerald-700">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-white font-semibold">Average Price</Text>
                      <Text className="text-emerald-400 font-bold">
                        {country?.currencySymbol}{goldPriceData.averagePrice.toFixed(2)}/g
                      </Text>
                    </View>
                    <Text className="text-emerald-500 text-xs mt-2">
                      Last updated: {new Date(goldPriceData.lastUpdated).toLocaleString()}
                    </Text>
                  </View>
                )}

                <Text className="text-emerald-500 text-xs mt-4 italic">
                  You can manually adjust the price if needed.
                </Text>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
