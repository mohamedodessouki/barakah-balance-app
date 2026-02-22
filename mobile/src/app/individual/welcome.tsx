import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, Shield, Calendar, ArrowRight } from 'lucide-react-native';
import { useLanguageStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';

const assetCategories = [
  { icon: '💵', key: 'A' },
  { icon: '🏦', key: 'B' },
  { icon: '📈', key: 'C' },
  { icon: '💳', key: 'D' },
  { icon: '💎', key: 'E' },
  { icon: '🏠', key: 'F' },
  { icon: '🤝', key: 'G' },
  { icon: '📦', key: 'H' },
  { icon: '🎨', key: 'I' },
  { icon: '⛏️', key: 'J' },
];

export default function IndividualWelcomeScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);

  const handleBack = () => {
    router.back();
  };

  const handleStart = () => {
    router.push('/individual/location');
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
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
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
            <Text className="text-white/70 text-base">
              {t('individual')}
            </Text>
          </Animated.View>

          {/* Greeting */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            className="px-6 pt-8 items-center"
          >
            <Text className="text-4xl mb-4">☪</Text>
            <Text className={`text-2xl font-bold text-white text-center ${isRTL ? 'text-right' : ''}`}>
              {t('welcomeGreeting')}
            </Text>
            <Text className={`text-emerald-300 text-center mt-2 text-lg ${isRTL ? 'text-right' : ''}`}>
              {t('welcomeTitle')}
            </Text>
          </Animated.View>

          {/* Privacy Note */}
          <Animated.View
            entering={FadeInUp.delay(300).springify()}
            className="mx-6 mt-8"
          >
            <LinearGradient
              colors={['#065f46', '#064e3b']}
              style={{
                borderRadius: 16,
                padding: 16,
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
              }}
            >
              <View className={`w-10 h-10 rounded-full bg-emerald-400/20 items-center justify-center ${isRTL ? 'ml-3' : 'mr-3'}`}>
                <Shield size={20} color="#34d399" />
              </View>
              <View className="flex-1">
                <Text className={`text-white font-semibold mb-1 ${isRTL ? 'text-right' : ''}`}>
                  Privacy First
                </Text>
                <Text className={`text-emerald-200 text-sm leading-5 ${isRTL ? 'text-right' : ''}`}>
                  {t('privacyNote')}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Hawl Explanation */}
          <Animated.View
            entering={FadeInUp.delay(400).springify()}
            className="mx-6 mt-4"
          >
            <LinearGradient
              colors={['#065f46', '#064e3b']}
              style={{
                borderRadius: 16,
                padding: 16,
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
              }}
            >
              <View className={`w-10 h-10 rounded-full bg-emerald-400/20 items-center justify-center ${isRTL ? 'ml-3' : 'mr-3'}`}>
                <Calendar size={20} color="#34d399" />
              </View>
              <View className="flex-1">
                <Text className={`text-white font-semibold mb-1 ${isRTL ? 'text-right' : ''}`}>
                  Understanding Hawl
                </Text>
                <Text className={`text-emerald-200 text-sm leading-5 ${isRTL ? 'text-right' : ''}`}>
                  {t('hawlExplanation')}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Asset Categories */}
          <Animated.View
            entering={FadeInUp.delay(500).springify()}
            className="mx-6 mt-6"
          >
            <Text className={`text-white font-semibold text-lg mb-3 ${isRTL ? 'text-right' : ''}`}>
              {t('coverageTitle')}
            </Text>
            <View className="flex-row flex-wrap justify-center gap-2">
              {assetCategories.map((cat, index) => (
                <View
                  key={cat.key}
                  className="w-12 h-12 rounded-xl bg-emerald-800/50 items-center justify-center"
                >
                  <Text className="text-2xl">{cat.icon}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Start Button */}
        <Animated.View
          entering={FadeInUp.delay(600).springify()}
          className="absolute bottom-0 left-0 right-0 px-6 pb-8"
        >
          <Pressable
            onPress={handleStart}
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
                {t('startButton')}
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
