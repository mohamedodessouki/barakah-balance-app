import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Calendar, MapPin, ChevronDown, ChevronUp, Check, ArrowRight, Info } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLanguageStore, useSettingsStore, CalendarType, CountryData } from '@/lib/store';
import { useAppStore } from '@/lib/app-store';
import { countries } from '@/lib/countries';

export default function OnboardingScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const isRTL = useLanguageStore((s) => s.isRTL);
  const setCountry = useSettingsStore((s) => s.setCountry);
  const setCalendarType = useSettingsStore((s) => s.setCalendarType);
  const { setHawlStartDate, completeOnboarding } = useAppStore();

  const [hawlDate, setHawlDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [calType, setCalType] = useState<CalendarType>('islamic');

  const canProceed = selectedCountry !== null;

  const handleContinue = () => {
    if (!selectedCountry) return;
    setCountry(selectedCountry);
    setCalendarType(calType);
    setHawlStartDate(hawlDate.toISOString());
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleDateChange = (_: unknown, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (date) setHawlDate(date);
  };

  return (
    <View className="flex-1 bg-emerald-950">
      <LinearGradient
        colors={['#064e3b', '#022c22', '#011311']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()} className="mt-6 mb-8">
            <Text className="text-emerald-400 text-sm font-medium mb-1">
              {language === 'ar' ? 'الخطوة الأخيرة' : 'Final Step'}
            </Text>
            <Text className="text-white text-2xl font-bold">
              {language === 'ar' ? 'إعداد حساب الزكاة' : 'Set Up Your Zakat'}
            </Text>
          </Animated.View>

          {/* Country Selection */}
          <Animated.View entering={FadeInUp.delay(200).springify()} className="mb-5">
            <View className="flex-row items-center mb-2">
              <MapPin size={16} color="#6ee7b7" />
              <Text className="text-emerald-300 text-sm font-medium ml-2">
                {language === 'ar' ? 'البلد والعملة' : 'Country & Currency'}
              </Text>
            </View>

            <Pressable
              onPress={() => setShowCountryPicker(!showCountryPicker)}
              className="bg-emerald-900/40 border border-emerald-700/50 rounded-xl p-4 flex-row items-center justify-between"
            >
              <Text className="text-white text-base">
                {selectedCountry
                  ? `${selectedCountry.flag}  ${language === 'ar' ? selectedCountry.nameAr : selectedCountry.name} (${selectedCountry.currency})`
                  : language === 'ar'
                  ? 'اختر بلدك...'
                  : 'Select your country...'}
              </Text>
              {showCountryPicker ? (
                <ChevronUp size={20} color="#6ee7b7" />
              ) : (
                <ChevronDown size={20} color="#6ee7b7" />
              )}
            </Pressable>

            {showCountryPicker && (
              <View className="bg-emerald-900/60 border border-emerald-700/50 rounded-xl mt-2 max-h-64 overflow-hidden">
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  {countries.map((c) => (
                    <Pressable
                      key={c.code}
                      onPress={() => {
                        setSelectedCountry(c);
                        setShowCountryPicker(false);
                      }}
                      className={`px-4 py-3 flex-row items-center justify-between border-b border-emerald-800/30 ${
                        selectedCountry?.code === c.code ? 'bg-emerald-700/30' : ''
                      }`}
                    >
                      <Text className="text-white text-sm">
                        {c.flag}  {language === 'ar' ? c.nameAr : c.name} ({c.currency})
                      </Text>
                      {selectedCountry?.code === c.code && (
                        <Check size={16} color="#34d399" />
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </Animated.View>

          {/* Calendar Type */}
          <Animated.View entering={FadeInUp.delay(300).springify()} className="mb-5">
            <View className="flex-row items-center mb-2">
              <Calendar size={16} color="#6ee7b7" />
              <Text className="text-emerald-300 text-sm font-medium ml-2">
                {language === 'ar' ? 'نوع التقويم' : 'Calendar Type'}
              </Text>
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setCalType('islamic')}
                className={`flex-1 rounded-xl p-4 border ${
                  calType === 'islamic'
                    ? 'bg-emerald-600/30 border-emerald-500'
                    : 'bg-emerald-900/40 border-emerald-700/50'
                }`}
              >
                <Text className="text-white font-semibold text-center">
                  {language === 'ar' ? 'هجري' : 'Hijri'}
                </Text>
                <Text className="text-emerald-300/50 text-xs text-center mt-1">
                  2.5%
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setCalType('western')}
                className={`flex-1 rounded-xl p-4 border ${
                  calType === 'western'
                    ? 'bg-emerald-600/30 border-emerald-500'
                    : 'bg-emerald-900/40 border-emerald-700/50'
                }`}
              >
                <Text className="text-white font-semibold text-center">
                  {language === 'ar' ? 'ميلادي' : 'Gregorian'}
                </Text>
                <Text className="text-emerald-300/50 text-xs text-center mt-1">
                  2.577%
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Hawl Date */}
          <Animated.View entering={FadeInUp.delay(400).springify()} className="mb-5">
            <View className="flex-row items-center mb-2">
              <Calendar size={16} color="#6ee7b7" />
              <Text className="text-emerald-300 text-sm font-medium ml-2">
                {language === 'ar' ? 'تاريخ بداية الحول' : 'Hawl Start Date'}
              </Text>
            </View>

            <Pressable
              onPress={() => setShowDatePicker(!showDatePicker)}
              className="bg-emerald-900/40 border border-emerald-700/50 rounded-xl p-4"
            >
              <Text className="text-white text-base">
                {hawlDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </Pressable>

            {showDatePicker && (
              <View className="bg-emerald-900/60 rounded-xl mt-2 p-2 items-center">
                <DateTimePicker
                  value={hawlDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  themeVariant="dark"
                  maximumDate={new Date()}
                />
                {Platform.OS === 'ios' && (
                  <Pressable
                    onPress={() => setShowDatePicker(false)}
                    className="bg-emerald-600 rounded-lg px-6 py-2 mt-2"
                  >
                    <Text className="text-white font-medium">
                      {language === 'ar' ? 'تم' : 'Done'}
                    </Text>
                  </Pressable>
                )}
              </View>
            )}

            {/* Hawl explanation */}
            <View className="bg-emerald-900/30 rounded-xl p-3 mt-3 flex-row items-start">
              <Info size={14} color="#6ee7b7" style={{ marginTop: 2 }} />
              <Text className="text-emerald-300/50 text-xs ml-2 flex-1 leading-4">
                {language === 'ar'
                  ? 'الحول هو السنة القمرية (354 يوماً) التي يجب أن يمر عليها المال بعد بلوغه النصاب قبل وجوب الزكاة. إذا كنت لا تعرف التاريخ بالضبط، اختر التاريخ التقريبي.'
                  : 'The Hawl is the lunar year (354 days) that must pass after your wealth reaches the Nisab threshold before Zakat becomes due. If you don\'t know the exact date, choose an approximate one.'}
              </Text>
            </View>
          </Animated.View>

          {/* Continue Button */}
          <Animated.View entering={FadeInUp.delay(500).springify()} className="mt-4">
            <Pressable
              onPress={handleContinue}
              disabled={!canProceed}
              style={{ opacity: canProceed ? 1 : 0.4 }}
              className="rounded-2xl overflow-hidden"
            >
              <LinearGradient
                colors={['#059669', '#047857']}
                style={{
                  paddingVertical: 18,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}
              >
                <Text className="text-white text-base font-semibold">
                  {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                </Text>
                <ArrowRight
                  size={20}
                  color="white"
                  style={{ marginLeft: 8, transform: [{ scaleX: isRTL ? -1 : 1 }] }}
                />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
