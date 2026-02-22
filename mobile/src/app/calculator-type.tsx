import React from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { User, Building2, ArrowLeft, FolderOpen, Shield, MessageCircle, LogIn, FileSpreadsheet, Calculator, Globe, HelpCircle, LayoutDashboard, TrendingUp } from 'lucide-react-native';
import { useLanguageStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';
import { useAuthStore } from '@/lib/auth-store';
import { useResponsive } from '@/lib/useResponsive';

export default function CalculatorTypeScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();

  const handleSelectType = (type: 'individual' | 'business') => {
    if (type === 'individual') {
      router.push('/individual/welcome');
    } else {
      router.push('/business/welcome');
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  // Container style for centering on large screens
  const containerStyle = isDesktop
    ? { maxWidth: 1200, marginHorizontal: 'auto' as const, width: '100%' as const }
    : isTablet
    ? { maxWidth: 800, marginHorizontal: 'auto' as const, width: '100%' as const }
    : {};

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
          style={containerStyle}
        >
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Pressable
              onPress={handleBack}
              className={`p-2 rounded-full bg-white/10 ${isRTL ? 'ml-4' : 'mr-4'}`}
              // @ts-ignore - web hover
              style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <ArrowLeft
                size={24}
                color="white"
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              />
            </Pressable>
            <Text className="text-white/70 text-base">
              {t('appName')}
            </Text>
          </View>

          {/* Desktop navigation */}
          {isDesktop && (
            <View className="flex-row items-center gap-6">
              <Pressable
                onPress={() => router.push('/dashboard')}
                className="flex-row items-center"
                // @ts-ignore - web hover
                style={({ hovered }: { hovered?: boolean }) => ({ opacity: hovered ? 0.8 : 1 })}
              >
                <LayoutDashboard size={16} color="#6ee7b7" />
                <Text className="text-emerald-300 text-sm ml-2">Dashboard</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/sharia-board')}
                className="flex-row items-center"
                // @ts-ignore - web hover
                style={({ hovered }: { hovered?: boolean }) => ({ opacity: hovered ? 0.8 : 1 })}
              >
                <Shield size={16} color="#6ee7b7" />
                <Text className="text-emerald-300 text-sm ml-2">Sharia Board</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/zakat-chatbot')}
                className="flex-row items-center"
                // @ts-ignore - web hover
                style={({ hovered }: { hovered?: boolean }) => ({ opacity: hovered ? 0.8 : 1 })}
              >
                <MessageCircle size={16} color="#6ee7b7" />
                <Text className="text-emerald-300 text-sm ml-2">Zakat Assistant</Text>
              </Pressable>
            </View>
          )}

          {/* Auth/Profile button */}
          <Pressable
            onPress={() => isAuthenticated ? router.push('/portfolios') : router.push('/auth')}
            className="flex-row items-center bg-emerald-700/50 rounded-full px-3 py-2"
            // @ts-ignore - web hover
            style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(4, 120, 87, 0.7)' }}
          >
            {isAuthenticated ? (
              <>
                <User size={16} color="#6ee7b7" />
                <Text className="text-emerald-300 text-sm ml-2">{user?.displayName?.split(' ')[0]}</Text>
              </>
            ) : (
              <>
                <LogIn size={16} color="#6ee7b7" />
                <Text className="text-emerald-300 text-sm ml-2">Sign In</Text>
              </>
            )}
          </Pressable>
        </Animated.View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            className={`items-center mt-8 mb-8 px-6 ${isDesktop ? 'mt-12 mb-12' : ''}`}
            style={containerStyle}
          >
            <View className={`rounded-full bg-emerald-500/20 items-center justify-center mb-4 ${isDesktop ? 'w-24 h-24' : 'w-16 h-16'}`}>
              <Text className={isDesktop ? 'text-6xl' : 'text-4xl'}>⚖️</Text>
            </View>
            <Text className={`font-bold text-white text-center ${isRTL ? 'font-arabic' : ''} ${isDesktop ? 'text-4xl' : 'text-2xl'}`}>
              {t('chooseCalculator')}
            </Text>
            {isDesktop && (
              <Text className="text-emerald-400 text-lg mt-2 text-center max-w-lg">
                Calculate your Zakat accurately following AAOIFI standards
              </Text>
            )}
          </Animated.View>

          {/* Calculator Options - Side by side on desktop/tablet */}
          <View
            className="px-6 gap-4"
            style={{
              ...containerStyle,
              flexDirection: isDesktop || isTablet ? 'row' : 'column',
            }}
          >
            {/* Individual Calculator */}
            <Animated.View
              entering={FadeInUp.delay(300).springify()}
              style={{ flex: isDesktop || isTablet ? 1 : undefined }}
            >
              <Pressable
                onPress={() => handleSelectType('individual')}
                className="active:scale-[0.98]"
                // @ts-ignore - web hover
                style={({ hovered }: { hovered?: boolean }) => ({
                  transform: hovered ? [{ scale: 1.02 }] : [],
                })}
              >
                <LinearGradient
                  colors={['#059669', '#047857']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 20,
                    padding: isDesktop ? 32 : 24,
                    minHeight: isDesktop ? 280 : undefined,
                  }}
                >
                  <View className={`w-16 h-16 rounded-2xl bg-white/20 items-center justify-center ${isDesktop ? 'w-20 h-20 mb-6' : ''}`}>
                    <User size={isDesktop ? 40 : 32} color="white" />
                  </View>
                  <View className={isDesktop ? '' : isRTL ? 'items-end' : ''}>
                    <Text className={`font-bold text-white ${isRTL ? 'text-right' : ''} ${isDesktop ? 'text-2xl mt-4' : 'text-xl mt-4'}`}>
                      {t('individual')}
                    </Text>
                    <Text className={`text-emerald-100 mt-2 ${isRTL ? 'text-right' : ''} ${isDesktop ? 'text-base' : ''}`}>
                      {t('individualDesc')}
                    </Text>
                    {isDesktop && (
                      <View className="mt-4 flex-row flex-wrap gap-2">
                        <View className="bg-white/20 rounded-lg px-2 py-1">
                          <Text className="text-white text-xs">10 Asset Categories</Text>
                        </View>
                        <View className="bg-white/20 rounded-lg px-2 py-1">
                          <Text className="text-white text-xs">Gold Calculator</Text>
                        </View>
                        <View className="bg-white/20 rounded-lg px-2 py-1">
                          <Text className="text-white text-xs">Multi-Currency</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* Business Calculator */}
            <Animated.View
              entering={FadeInUp.delay(400).springify()}
              style={{ flex: isDesktop || isTablet ? 1 : undefined }}
            >
              <Pressable
                onPress={() => handleSelectType('business')}
                className="active:scale-[0.98]"
                // @ts-ignore - web hover
                style={({ hovered }: { hovered?: boolean }) => ({
                  transform: hovered ? [{ scale: 1.02 }] : [],
                })}
              >
                <LinearGradient
                  colors={['#047857', '#065f46']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 20,
                    padding: isDesktop ? 32 : 24,
                    minHeight: isDesktop ? 280 : undefined,
                  }}
                >
                  <View className={`w-16 h-16 rounded-2xl bg-white/20 items-center justify-center ${isDesktop ? 'w-20 h-20 mb-6' : ''}`}>
                    <Building2 size={isDesktop ? 40 : 32} color="white" />
                  </View>
                  <View className={isDesktop ? '' : isRTL ? 'items-end' : ''}>
                    <Text className={`font-bold text-white ${isRTL ? 'text-right' : ''} ${isDesktop ? 'text-2xl mt-4' : 'text-xl mt-4'}`}>
                      {t('business')}
                    </Text>
                    <Text className={`text-emerald-100 mt-2 ${isRTL ? 'text-right' : ''} ${isDesktop ? 'text-base' : ''}`}>
                      {t('businessDesc')}
                    </Text>
                    {isDesktop && (
                      <View className="mt-4 flex-row flex-wrap gap-2">
                        <View className="bg-white/20 rounded-lg px-2 py-1">
                          <Text className="text-white text-xs">Excel Upload</Text>
                        </View>
                        <View className="bg-white/20 rounded-lg px-2 py-1">
                          <Text className="text-white text-xs">AAOIFI Compliant</Text>
                        </View>
                        <View className="bg-white/20 rounded-lg px-2 py-1">
                          <Text className="text-white text-xs">Printable Reports</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>

          {/* Quick Actions - Grid on desktop */}
          <Animated.View
            entering={FadeInUp.delay(500).springify()}
            className="px-6 mt-8"
            style={containerStyle}
          >
            <Text className={`text-emerald-400 font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
              {language === 'ar' ? 'الوصول السريع' : 'Quick Access'}
            </Text>
            <View className={`flex-row flex-wrap gap-3 ${isDesktop ? 'gap-4' : ''}`}>
              {/* Dashboard - Mobile only */}
              {!isDesktop && (
                <Pressable
                  onPress={() => router.push('/dashboard')}
                  className="bg-emerald-800/30 rounded-xl px-4 py-3 flex-row items-center"
                  // @ts-ignore - web hover
                  style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(6, 78, 59, 0.5)' }}
                >
                  <LayoutDashboard size={18} color="#6ee7b7" />
                  <Text className="text-emerald-300 ml-2">
                    {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                  </Text>
                </Pressable>
              )}

              {/* Portfolios */}
              <Pressable
                onPress={() => isAuthenticated ? router.push('/portfolios') : router.push('/auth')}
                className={`bg-emerald-800/30 rounded-xl px-4 py-3 flex-row items-center ${isDesktop ? 'flex-1 min-w-[200px]' : ''}`}
                // @ts-ignore - web hover
                style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(6, 78, 59, 0.5)' }}
              >
                <FolderOpen size={18} color="#6ee7b7" />
                <Text className="text-emerald-300 ml-2">
                  {language === 'ar' ? 'المحافظ' : 'Portfolios'}
                </Text>
                {isDesktop && (
                  <Text className="text-emerald-600 text-xs ml-auto">
                    Manage multiple calculations
                  </Text>
                )}
              </Pressable>

              {/* Sharia Board */}
              {!isDesktop && (
                <Pressable
                  onPress={() => router.push('/sharia-board')}
                  className="bg-emerald-800/30 rounded-xl px-4 py-3 flex-row items-center"
                  // @ts-ignore - web hover
                  style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(6, 78, 59, 0.5)' }}
                >
                  <Shield size={18} color="#6ee7b7" />
                  <Text className="text-emerald-300 ml-2">
                    {language === 'ar' ? 'الهيئة الشرعية' : 'Sharia Board'}
                  </Text>
                </Pressable>
              )}

              {/* AI Chatbot */}
              {!isDesktop && (
                <Pressable
                  onPress={() => router.push('/zakat-chatbot')}
                  className="bg-emerald-800/30 rounded-xl px-4 py-3 flex-row items-center"
                  // @ts-ignore - web hover
                  style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(6, 78, 59, 0.5)' }}
                >
                  <MessageCircle size={18} color="#6ee7b7" />
                  <Text className="text-emerald-300 ml-2">
                    {language === 'ar' ? 'مساعد الزكاة' : 'Zakat Assistant'}
                  </Text>
                </Pressable>
              )}

              {/* Desktop-only quick actions */}
              {isDesktop && (
                <>
                  <Pressable
                    onPress={() => handleSelectType('business')}
                    className="bg-emerald-800/30 rounded-xl px-4 py-3 flex-row items-center flex-1 min-w-[200px]"
                    // @ts-ignore - web hover
                    style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(6, 78, 59, 0.5)' }}
                  >
                    <FileSpreadsheet size={18} color="#6ee7b7" />
                    <Text className="text-emerald-300 ml-2">Excel Upload</Text>
                    <Text className="text-emerald-600 text-xs ml-auto">
                      Import balance sheets
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => router.push('/zakat-chatbot')}
                    className="bg-emerald-800/30 rounded-xl px-4 py-3 flex-row items-center flex-1 min-w-[200px]"
                    // @ts-ignore - web hover
                    style={({ hovered }: { hovered?: boolean }) => hovered && { backgroundColor: 'rgba(6, 78, 59, 0.5)' }}
                  >
                    <HelpCircle size={18} color="#6ee7b7" />
                    <Text className="text-emerald-300 ml-2">Help & FAQ</Text>
                    <Text className="text-emerald-600 text-xs ml-auto">
                      AI-powered assistance
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </Animated.View>

          {/* Desktop Features Overview */}
          {isDesktop && (
            <Animated.View
              entering={FadeInUp.delay(600).springify()}
              className="px-6 mt-12"
              style={containerStyle}
            >
              <View className="bg-emerald-900/30 rounded-2xl p-8">
                <Text className="text-emerald-300 font-semibold text-lg mb-6">
                  Why Barakah Balance?
                </Text>
                <View className="flex-row gap-8">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <Shield size={20} color="#10b981" />
                      <Text className="text-white font-medium ml-2">AAOIFI Compliant</Text>
                    </View>
                    <Text className="text-emerald-400 text-sm">
                      Calculations follow Islamic accounting standards approved by Sharia scholars
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <Globe size={20} color="#10b981" />
                      <Text className="text-white font-medium ml-2">Multi-Currency</Text>
                    </View>
                    <Text className="text-emerald-400 text-sm">
                      Support for 20+ currencies with automatic conversion rates
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <Calculator size={20} color="#10b981" />
                      <Text className="text-white font-medium ml-2">Accurate Results</Text>
                    </View>
                    <Text className="text-emerald-400 text-sm">
                      Distinguishes between Islamic financing and conventional loans
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Footer */}
        <Animated.View
          entering={FadeInUp.delay(700).springify()}
          className="px-6 pb-4 items-center"
          style={containerStyle}
        >
          <Text className="text-emerald-600 text-center text-sm">
            {t('tagline')}
          </Text>
          {isDesktop && (
            <Text className="text-emerald-700 text-center text-xs mt-1">
              Press any calculator card to get started • Keyboard shortcuts available
            </Text>
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
