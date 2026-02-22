import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView, I18nManager } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useLanguageStore, SupportedLanguage } from '@/lib/store';
import { useAppStore } from '@/lib/app-store';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  enabled: boolean;
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', enabled: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', enabled: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', enabled: false },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', enabled: false },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', enabled: false },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', enabled: false },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', enabled: false },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', enabled: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', enabled: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', enabled: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', enabled: false },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', enabled: false },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', enabled: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', enabled: false },
];

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const language = useLanguageStore((s) => s.language);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);

  // Skip to tabs if user already completed onboarding
  useEffect(() => {
    if (language && onboardingComplete) {
      router.replace('/(tabs)');
    }
  }, [language, onboardingComplete]);

  const handleLanguageSelect = async (lang: LanguageOption) => {
    if (!lang.enabled) return;

    const isRTL = lang.code === 'ar';

    // Force RTL layout for Arabic
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    }

    setLanguage(lang.code as SupportedLanguage);
    router.replace('/account-type' as const);
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
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            className="px-6 pt-8 pb-6 items-center"
          >
            <View className="w-20 h-20 rounded-full bg-emerald-500/20 items-center justify-center mb-4">
              <Text className="text-5xl">☪</Text>
            </View>
            <Text className="text-3xl font-bold text-white text-center mb-2">
              Barakah Balance
            </Text>
            <Text className="text-emerald-400 text-center text-lg">
              ميزان البركة
            </Text>
          </Animated.View>

          {/* Title */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            className="px-6 mb-6"
          >
            <Text className="text-xl text-white text-center font-semibold">
              Select Your Language
            </Text>
            <Text className="text-emerald-300 text-center mt-1">
              اختر لغتك
            </Text>
          </Animated.View>

          {/* Language Grid */}
          <View className="px-4">
            <View className="flex-row flex-wrap justify-center">
              {languages.map((lang, index) => (
                <Animated.View
                  key={lang.code}
                  entering={FadeInUp.delay(300 + index * 50).springify()}
                  className="w-[45%] m-[2.5%]"
                >
                  <Pressable
                    onPress={() => handleLanguageSelect(lang)}
                    className={`rounded-2xl overflow-hidden ${
                      lang.enabled
                        ? 'active:scale-95'
                        : 'opacity-50'
                    }`}
                    style={{ transform: [{ scale: 1 }] }}
                  >
                    <LinearGradient
                      colors={
                        lang.enabled
                          ? ['#059669', '#047857']
                          : ['#374151', '#1f2937']
                      }
                      style={{
                        padding: 16,
                        borderRadius: 16,
                        alignItems: 'center',
                      }}
                    >
                      <Text className="text-4xl mb-2">{lang.flag}</Text>
                      <Text className="text-white font-semibold text-base">
                        {lang.name}
                      </Text>
                      <Text className="text-emerald-200 text-sm mt-1">
                        {lang.nativeName}
                      </Text>
                      {!lang.enabled && (
                        <View className="bg-gray-600 rounded-full px-3 py-1 mt-2">
                          <Text className="text-gray-300 text-xs">
                            Coming Soon
                          </Text>
                        </View>
                      )}
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Footer */}
          <Animated.View
            entering={FadeInUp.delay(1000).springify()}
            className="px-6 mt-8 items-center"
          >
            <Text className="text-emerald-600 text-center text-sm">
              Your Trusted Zakat Calculator
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
