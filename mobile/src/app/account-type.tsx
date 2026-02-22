import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { User, Building2, ArrowRight } from 'lucide-react-native';
import { useLanguageStore } from '@/lib/store';
import { useAppStore, AccountType } from '@/lib/app-store';

export default function AccountTypeScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const isRTL = useLanguageStore((s) => s.isRTL);
  const setAccountType = useAppStore((s) => s.setAccountType);

  const handleSelect = (type: AccountType) => {
    setAccountType(type);
    router.replace('/onboarding');
  };

  return (
    <View className="flex-1 bg-emerald-950">
      <LinearGradient
        colors={['#064e3b', '#022c22', '#011311']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <SafeAreaView className="flex-1 justify-center px-6">
        {/* Title */}
        <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-10">
          <Text className="text-emerald-400 text-base font-medium mb-2 text-center">
            {language === 'ar' ? 'ميزان البركة' : 'Barakah Balance'}
          </Text>
          <Text className="text-white text-2xl font-bold text-center">
            {language === 'ar' ? 'كيف تود استخدام التطبيق؟' : 'How will you use the app?'}
          </Text>
          <Text className="text-emerald-300/50 text-sm text-center mt-2">
            {language === 'ar'
              ? 'يمكنك تغيير هذا لاحقاً في الإعدادات'
              : 'You can change this later in settings'}
          </Text>
        </Animated.View>

        {/* Individual Option */}
        <Animated.View entering={FadeInUp.delay(200).springify()} className="mb-4">
          <Pressable
            onPress={() => handleSelect('individual')}
            className="bg-emerald-900/40 border border-emerald-700/50 rounded-2xl p-6 active:bg-emerald-900/60"
          >
            <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <View className="w-14 h-14 rounded-2xl bg-emerald-600/30 items-center justify-center">
                <User size={28} color="#34d399" />
              </View>
              <View className={`flex-1 ${isRTL ? 'mr-4 items-end' : 'ml-4'}`}>
                <Text className="text-white text-lg font-bold">
                  {language === 'ar' ? 'فرد' : 'Individual'}
                </Text>
                <Text className="text-emerald-300/60 text-sm mt-1 leading-5">
                  {language === 'ar'
                    ? 'إدارة ثروتي الشخصية وحساب زكاتي. يمكنني أيضاً إضافة شركاتي الصغيرة.'
                    : 'Manage my personal wealth and calculate my zakat. I can also add my small businesses.'}
                </Text>
              </View>
              <ArrowRight
                size={20}
                color="#6ee7b7"
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              />
            </View>
          </Pressable>
        </Animated.View>

        {/* Enterprise Option */}
        <Animated.View entering={FadeInUp.delay(350).springify()}>
          <Pressable
            onPress={() => handleSelect('enterprise')}
            className="bg-emerald-900/40 border border-emerald-700/50 rounded-2xl p-6 active:bg-emerald-900/60"
          >
            <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <View className="w-14 h-14 rounded-2xl bg-amber-600/20 items-center justify-center">
                <Building2 size={28} color="#fbbf24" />
              </View>
              <View className={`flex-1 ${isRTL ? 'mr-4 items-end' : 'ml-4'}`}>
                <Text className="text-white text-lg font-bold">
                  {language === 'ar' ? 'مؤسسة' : 'Enterprise'}
                </Text>
                <Text className="text-emerald-300/60 text-sm mt-1 leading-5">
                  {language === 'ar'
                    ? 'أمثل شركة أو مؤسسة. موصى به للشركات الكبيرة مع فرق مالية متخصصة.'
                    : 'I represent a company or organization. Recommended for larger companies with dedicated finance teams.'}
                </Text>
              </View>
              <ArrowRight
                size={20}
                color="#6ee7b7"
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              />
            </View>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
