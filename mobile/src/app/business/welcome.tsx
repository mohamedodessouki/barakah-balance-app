import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, Building2, FileSpreadsheet, CheckCircle, ArrowRight, Clock } from 'lucide-react-native';
import { useLanguageStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';

export default function BusinessWelcomeScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);

  const handleBack = () => {
    router.back();
  };

  const handleStart = () => {
    router.push('/business/setup');
  };

  const features = [
    { icon: '📊', text: 'AAOIFI compliant analysis' },
    { icon: '🔍', text: 'Smart line item classification' },
    { icon: '💡', text: 'Intelligent clarification questions' },
    { icon: '📱', text: 'Works offline with local database' },
  ];

  return (
    <View className="flex-1 bg-indigo-950">
      <LinearGradient
        colors={['#312e81', '#1e1b4b', '#0f0a1e']}
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
              {t('business')}
            </Text>
          </Animated.View>

          {/* Hero */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            className="px-6 pt-8 items-center"
          >
            <View className="w-20 h-20 rounded-2xl bg-indigo-500/20 items-center justify-center mb-4">
              <Building2 size={40} color="#a5b4fc" />
            </View>
            <Text className={`text-2xl font-bold text-white text-center ${isRTL ? 'text-right' : ''}`}>
              {t('businessWelcome')}
            </Text>
            <Text className={`text-indigo-300 text-center mt-2 leading-6 ${isRTL ? 'text-right' : ''}`}>
              {t('businessWelcomeDesc')}
            </Text>
          </Animated.View>

          {/* Time Estimate */}
          <Animated.View
            entering={FadeInUp.delay(300).springify()}
            className="mx-6 mt-6"
          >
            <View className={`flex-row items-center justify-center bg-indigo-900/50 rounded-xl py-3 px-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Clock size={18} color="#a5b4fc" />
              <Text className={`text-indigo-200 ${isRTL ? 'mr-2' : 'ml-2'}`}>
                {t('timeEstimate')}
              </Text>
            </View>
          </Animated.View>

          {/* Features */}
          <Animated.View
            entering={FadeInUp.delay(400).springify()}
            className="mx-6 mt-8"
          >
            <View className="gap-3">
              {features.map((feature, index) => (
                <View
                  key={index}
                  className={`flex-row items-center bg-indigo-900/30 rounded-xl p-4 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <Text className="text-2xl">{feature.icon}</Text>
                  <Text className={`text-indigo-100 flex-1 ${isRTL ? 'mr-3 text-right' : 'ml-3'}`}>
                    {feature.text}
                  </Text>
                  <CheckCircle size={18} color="#a5b4fc" />
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Options Preview */}
          <Animated.View
            entering={FadeInUp.delay(500).springify()}
            className="mx-6 mt-8"
          >
            <Text className={`text-white font-semibold text-lg mb-4 ${isRTL ? 'text-right' : ''}`}>
              Two Ways to Calculate
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-indigo-900/50 rounded-xl p-4 items-center">
                <FileSpreadsheet size={32} color="#a5b4fc" />
                <Text className="text-white font-medium mt-2 text-center">
                  {t('uploadBalanceSheet')}
                </Text>
                <Text className="text-indigo-300 text-xs mt-1 text-center">
                  Excel or PDF
                </Text>
              </View>
              <View className="flex-1 bg-indigo-900/50 rounded-xl p-4 items-center">
                <Text className="text-3xl">✏️</Text>
                <Text className="text-white font-medium mt-2 text-center">
                  {t('manualEntry')}
                </Text>
                <Text className="text-indigo-300 text-xs mt-1 text-center">
                  Step by step
                </Text>
              </View>
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
              colors={['#6366f1', '#4f46e5']}
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
