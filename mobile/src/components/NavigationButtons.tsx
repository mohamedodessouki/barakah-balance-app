import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  isRTL?: boolean;
  showBack?: boolean;
  showNext?: boolean;
  nextDisabled?: boolean;
  variant?: 'emerald' | 'indigo';
  containerStyle?: object;
}

export function NavigationButtons({
  onBack,
  onNext,
  backLabel = 'Back',
  nextLabel = 'Next',
  isRTL = false,
  showBack = true,
  showNext = true,
  nextDisabled = false,
  variant = 'emerald',
  containerStyle = {},
}: NavigationButtonsProps) {
  const gradientColors = variant === 'emerald'
    ? ['#10b981', '#059669'] as const
    : ['#6366f1', '#4f46e5'] as const;

  const bgColor = variant === 'emerald'
    ? 'rgba(6, 78, 59, 0.95)'
    : 'rgba(49, 46, 129, 0.95)';

  return (
    <Animated.View
      entering={FadeInUp.delay(800).springify()}
      className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4"
      style={[{ backgroundColor: bgColor }, containerStyle]}
    >
      <View className={`flex-row gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {showBack && onBack && (
          <Pressable
            onPress={onBack}
            className={`flex-1 active:scale-[0.98] ${!showNext ? 'flex-[0.4]' : ''}`}
          >
            <View
              className={`rounded-2xl p-4 flex-row items-center justify-center ${
                variant === 'emerald' ? 'bg-emerald-800/50' : 'bg-indigo-800/50'
              }`}
            >
              <ArrowLeft
                size={20}
                color="white"
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              />
              <Text className={`text-white font-semibold text-base ${isRTL ? 'mr-2' : 'ml-2'}`}>
                {backLabel}
              </Text>
            </View>
          </Pressable>
        )}

        {showNext && onNext && (
          <Pressable
            onPress={onNext}
            disabled={nextDisabled}
            className={`flex-1 active:scale-[0.98] ${nextDisabled ? 'opacity-50' : ''}`}
          >
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 16,
                padding: 16,
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text className={`text-white font-bold text-base ${isRTL ? 'ml-2' : 'mr-2'}`}>
                {nextLabel}
              </Text>
              <ArrowRight
                size={20}
                color="white"
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              />
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  variant?: 'emerald' | 'indigo';
  labels?: string[];
}

export function StepIndicator({
  currentStep,
  totalSteps,
  variant = 'emerald',
  labels,
}: StepIndicatorProps) {
  const activeColor = variant === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500';
  const inactiveColor = variant === 'emerald' ? 'bg-emerald-800' : 'bg-indigo-800';
  const completedColor = variant === 'emerald' ? 'bg-emerald-700' : 'bg-indigo-700';

  return (
    <View className="px-6 pt-4">
      <View className="flex-row items-center justify-center">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${
                index + 1 === currentStep
                  ? activeColor
                  : index + 1 < currentStep
                  ? completedColor
                  : inactiveColor
              }`}
            >
              <Text
                className={`font-bold ${
                  index + 1 <= currentStep ? 'text-white' : 'text-white/50'
                }`}
              >
                {index + 1}
              </Text>
            </View>
            {index < totalSteps - 1 && (
              <View
                className={`w-12 h-1 rounded-full ${
                  index + 1 < currentStep ? activeColor : inactiveColor
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </View>
      {labels && labels.length === totalSteps && (
        <View className="flex-row justify-between mt-2 px-2">
          {labels.map((label, index) => (
            <Text
              key={index}
              className={`text-xs ${
                index + 1 === currentStep
                  ? variant === 'emerald'
                    ? 'text-emerald-400'
                    : 'text-indigo-400'
                  : 'text-white/40'
              }`}
              style={{ width: 60, textAlign: 'center' }}
            >
              {label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
