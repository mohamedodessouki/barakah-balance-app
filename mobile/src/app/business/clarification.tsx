import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { ArrowLeft, ArrowRight, HelpCircle, Building2, ShoppingCart, Check } from 'lucide-react-native';
import { useLanguageStore, useSettingsStore, useBusinessCalculatorStore, LineItemClassification } from '@/lib/store';
import { useTranslation } from '@/lib/translations';

export default function ClarificationScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);
  const country = useSettingsStore((s) => s.country);

  const getPendingClarifications = useBusinessCalculatorStore((s) => s.getPendingClarifications);
  const updateLineItem = useBusinessCalculatorStore((s) => s.updateLineItem);

  const pendingItems = getPendingClarifications();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [marketValue, setMarketValue] = useState('');

  const currencySymbol = country?.currencySymbol ?? '$';
  const currentItem = pendingItems[currentIndex];
  const progress = pendingItems.length > 0 ? ((currentIndex) / pendingItems.length) * 100 : 0;

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setMarketValue('');
    } else {
      router.back();
    }
  };

  const handleAnswer = (answer: 'trading' | 'operations' | 'islamic' | 'conventional' | 'paid' | 'holding') => {
    if (!currentItem) return;

    let newClassification: LineItemClassification = 'exempt';
    let needsMarketValue = false;

    // Determine classification based on answer
    switch (answer) {
      case 'trading':
        newClassification = 'zakatable';
        needsMarketValue = true;
        break;
      case 'operations':
        newClassification = 'exempt';
        break;
      case 'islamic':
        newClassification = 'deductible';
        break;
      case 'conventional':
        newClassification = 'not_deductible';
        break;
      case 'paid':
        newClassification = 'zakatable';
        break;
      case 'holding':
        newClassification = 'deductible';
        break;
    }

    const updates: Partial<typeof currentItem> = {
      classification: newClassification,
      clarificationAnswer: answer,
    };

    if (needsMarketValue && marketValue) {
      updates.marketValue = parseInt(marketValue);
    }

    updateLineItem(currentItem.id, updates);
    setMarketValue('');

    // Move to next or finish
    if (currentIndex < pendingItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push('/business/results');
    }
  };

  const getQuestionType = (question?: string): 'asset' | 'loan' | 'deposit' | 'other' => {
    if (!question) return 'other';
    if (question.includes('trading/selling') || question.includes('business operations')) return 'asset';
    if (question.includes('Islamic financing') || question.includes('interest-based')) return 'loan';
    if (question.includes('deposit')) return 'deposit';
    return 'other';
  };

  if (pendingItems.length === 0) {
    router.replace('/business/results');
    return null;
  }

  const questionType = getQuestionType(currentItem?.clarificationQuestion);

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
            Clarification Questions
          </Text>
        </Animated.View>

        {/* Progress Bar */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="px-6 pt-4"
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-indigo-300 text-sm">
              Question {currentIndex + 1} of {pendingItems.length}
            </Text>
            <Text className="text-indigo-300 text-sm">
              {Math.round(progress)}% complete
            </Text>
          </View>
          <View className="h-2 bg-indigo-800 rounded-full overflow-hidden">
            <View
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </Animated.View>

        <ScrollView
          className="flex-1 mt-6"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {currentItem && (
            <>
              {/* Item Info Card */}
              <Animated.View
                entering={ZoomIn.delay(300).springify()}
                className="mx-6 mb-6"
              >
                <LinearGradient
                  colors={['#4338ca', '#3730a3']}
                  style={{ borderRadius: 20, padding: 20, alignItems: 'center' }}
                >
                  <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-3">
                    <HelpCircle size={32} color="white" />
                  </View>
                  <Text className="text-white text-xl font-bold text-center">
                    {currentItem.name}
                  </Text>
                  <Text className="text-indigo-200 text-2xl font-bold mt-2">
                    {currencySymbol} {currentItem.amount.toLocaleString()}
                  </Text>
                </LinearGradient>
              </Animated.View>

              {/* Question */}
              <Animated.View
                entering={FadeInUp.delay(400).springify()}
                className="mx-6 mb-6"
              >
                <View className="bg-indigo-900/50 rounded-xl p-4">
                  <Text className={`text-white text-lg text-center ${isRTL ? 'text-right' : ''}`}>
                    {currentItem.clarificationQuestion}
                  </Text>
                </View>
              </Animated.View>

              {/* Answer Options */}
              <Animated.View
                entering={FadeInUp.delay(500).springify()}
                className="mx-6 gap-3"
              >
                {questionType === 'asset' && (
                  <>
                    <Pressable
                      onPress={() => handleAnswer('trading')}
                      className="active:scale-[0.98]"
                    >
                      <LinearGradient
                        colors={['#059669', '#047857']}
                        style={{
                          borderRadius: 16,
                          padding: 20,
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                          alignItems: 'center',
                        }}
                      >
                        <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
                          <ShoppingCart size={24} color="white" />
                        </View>
                        <View className={`flex-1 ${isRTL ? 'mr-4 items-end' : 'ml-4'}`}>
                          <Text className={`text-white font-bold text-lg ${isRTL ? 'text-right' : ''}`}>
                            {t('forTrading')}
                          </Text>
                          <Text className={`text-emerald-200 text-sm ${isRTL ? 'text-right' : ''}`}>
                            Held for sale or profit
                          </Text>
                        </View>
                      </LinearGradient>
                    </Pressable>

                    <Pressable
                      onPress={() => handleAnswer('operations')}
                      className="active:scale-[0.98]"
                    >
                      <LinearGradient
                        colors={['#6b7280', '#4b5563']}
                        style={{
                          borderRadius: 16,
                          padding: 20,
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                          alignItems: 'center',
                        }}
                      >
                        <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
                          <Building2 size={24} color="white" />
                        </View>
                        <View className={`flex-1 ${isRTL ? 'mr-4 items-end' : 'ml-4'}`}>
                          <Text className={`text-white font-bold text-lg ${isRTL ? 'text-right' : ''}`}>
                            {t('forOperations')}
                          </Text>
                          <Text className={`text-gray-300 text-sm ${isRTL ? 'text-right' : ''}`}>
                            Used in daily business
                          </Text>
                        </View>
                      </LinearGradient>
                    </Pressable>
                  </>
                )}

                {questionType === 'loan' && (
                  <>
                    <Pressable
                      onPress={() => handleAnswer('islamic')}
                      className="active:scale-[0.98]"
                    >
                      <LinearGradient
                        colors={['#059669', '#047857']}
                        style={{
                          borderRadius: 16,
                          padding: 20,
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                          alignItems: 'center',
                        }}
                      >
                        <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
                          <Check size={24} color="white" />
                        </View>
                        <View className={`flex-1 ${isRTL ? 'mr-4 items-end' : 'ml-4'}`}>
                          <Text className={`text-white font-bold text-lg ${isRTL ? 'text-right' : ''}`}>
                            {t('islamicFinancing')}
                          </Text>
                          <Text className={`text-emerald-200 text-sm ${isRTL ? 'text-right' : ''}`}>
                            Murabaha, Ijara, etc.
                          </Text>
                        </View>
                      </LinearGradient>
                    </Pressable>

                    <Pressable
                      onPress={() => handleAnswer('conventional')}
                      className="active:scale-[0.98]"
                    >
                      <LinearGradient
                        colors={['#dc2626', '#b91c1c']}
                        style={{
                          borderRadius: 16,
                          padding: 20,
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                          alignItems: 'center',
                        }}
                      >
                        <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
                          <Text className="text-2xl">%</Text>
                        </View>
                        <View className={`flex-1 ${isRTL ? 'mr-4 items-end' : 'ml-4'}`}>
                          <Text className={`text-white font-bold text-lg ${isRTL ? 'text-right' : ''}`}>
                            {t('conventionalLoan')}
                          </Text>
                          <Text className={`text-red-200 text-sm ${isRTL ? 'text-right' : ''}`}>
                            Interest-based financing
                          </Text>
                        </View>
                      </LinearGradient>
                    </Pressable>
                  </>
                )}

                {questionType === 'deposit' && (
                  <>
                    <Pressable
                      onPress={() => handleAnswer('paid')}
                      className="active:scale-[0.98]"
                    >
                      <LinearGradient
                        colors={['#059669', '#047857']}
                        style={{
                          borderRadius: 16,
                          padding: 20,
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                          alignItems: 'center',
                        }}
                      >
                        <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
                          <Text className="text-2xl">💰</Text>
                        </View>
                        <View className={`flex-1 ${isRTL ? 'mr-4 items-end' : 'ml-4'}`}>
                          <Text className={`text-white font-bold text-lg ${isRTL ? 'text-right' : ''}`}>
                            {t('paidDeposit')}
                          </Text>
                          <Text className={`text-emerald-200 text-sm ${isRTL ? 'text-right' : ''}`}>
                            You will get it back
                          </Text>
                        </View>
                      </LinearGradient>
                    </Pressable>

                    <Pressable
                      onPress={() => handleAnswer('holding')}
                      className="active:scale-[0.98]"
                    >
                      <LinearGradient
                        colors={['#3b82f6', '#2563eb']}
                        style={{
                          borderRadius: 16,
                          padding: 20,
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                          alignItems: 'center',
                        }}
                      >
                        <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
                          <Text className="text-2xl">🏦</Text>
                        </View>
                        <View className={`flex-1 ${isRTL ? 'mr-4 items-end' : 'ml-4'}`}>
                          <Text className={`text-white font-bold text-lg ${isRTL ? 'text-right' : ''}`}>
                            {t('holdingDeposit')}
                          </Text>
                          <Text className={`text-blue-200 text-sm ${isRTL ? 'text-right' : ''}`}>
                            Belongs to others
                          </Text>
                        </View>
                      </LinearGradient>
                    </Pressable>
                  </>
                )}

                {questionType === 'other' && (
                  <View className="bg-indigo-900/50 rounded-xl p-4">
                    <Text className="text-indigo-200 text-center">
                      Please contact a qualified Islamic scholar for guidance on this item.
                    </Text>
                    <Pressable
                      onPress={() => handleAnswer('operations')}
                      className="mt-4 bg-indigo-600 rounded-xl py-3 active:bg-indigo-700"
                    >
                      <Text className="text-white text-center font-medium">
                        Mark as Exempt (Uncertain)
                      </Text>
                    </Pressable>
                  </View>
                )}
              </Animated.View>

              {/* Market Value Input (shown after selecting 'trading') */}
              {questionType === 'asset' && (
                <Animated.View
                  entering={FadeInUp.delay(600).springify()}
                  className="mx-6 mt-6"
                >
                  <Text className={`text-white/70 text-sm mb-2 ${isRTL ? 'text-right' : ''}`}>
                    {t('enterMarketValue')} (Optional)
                  </Text>
                  <View className={`flex-row items-center bg-indigo-800/50 rounded-xl px-4 py-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Text className={`text-indigo-300 ${isRTL ? 'ml-2' : 'mr-2'}`}>
                      {currencySymbol}
                    </Text>
                    <TextInput
                      value={marketValue}
                      onChangeText={setMarketValue}
                      keyboardType="numeric"
                      placeholder={currentItem.amount.toString()}
                      placeholderTextColor="#6b7280"
                      className={`flex-1 text-white text-lg ${isRTL ? 'text-right' : ''}`}
                      style={{ textAlign: isRTL ? 'right' : 'left' }}
                    />
                  </View>
                  <Text className="text-indigo-400 text-xs mt-2">
                    Enter current market value if different from book value
                  </Text>
                </Animated.View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
