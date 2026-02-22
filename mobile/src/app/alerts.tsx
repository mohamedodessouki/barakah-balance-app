import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, SlideOutRight } from 'react-native-reanimated';
import {
  ArrowLeft, Bell, Calendar, AlertTriangle, CheckCircle, Clock,
  Gift, TrendingUp, Info, Trash2, Check, ChevronRight
} from 'lucide-react-native';
import { useLanguageStore } from '@/lib/store';
import { useDashboardStore, Alert } from '@/lib/dashboard-store';
import { useResponsive } from '@/lib/useResponsive';

const ALERT_ICONS: Record<Alert['type'], { icon: React.ElementType; color: string; bgColor: string }> = {
  hawl: { icon: Calendar, color: '#10b981', bgColor: '#064e3b' },
  nisab: { icon: TrendingUp, color: '#6366f1', bgColor: '#312e81' },
  deposit: { icon: Gift, color: '#f59e0b', bgColor: '#78350f' },
  ramadan: { icon: Clock, color: '#ec4899', bgColor: '#831843' },
  compliance: { icon: AlertTriangle, color: '#ef4444', bgColor: '#7f1d1d' },
  reminder: { icon: Info, color: '#3b82f6', bgColor: '#1e3a8a' },
};

function AlertItem({
  alert,
  language,
  isRTL,
  onMarkRead,
  onDismiss,
  onPress,
}: {
  alert: Alert;
  language: string;
  isRTL: boolean;
  onMarkRead: () => void;
  onDismiss: () => void;
  onPress: () => void;
}) {
  const config = ALERT_ICONS[alert.type];
  const Icon = config.icon;

  return (
    <Animated.View
      entering={FadeInUp.springify()}
      exiting={SlideOutRight.springify()}
    >
      <Pressable
        onPress={onPress}
        className={`bg-slate-800/50 rounded-2xl p-4 mb-3 ${!alert.isRead ? 'border-l-4 border-amber-500' : ''}`}
      >
        <View className={`flex-row items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
          <View
            style={{ backgroundColor: config.bgColor }}
            className="w-12 h-12 rounded-xl items-center justify-center"
          >
            <Icon size={24} color={config.color} />
          </View>
          <View className={`flex-1 ${isRTL ? 'mr-4' : 'ml-4'}`}>
            <View className={`flex-row items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <View className="flex-1">
                <Text className={`text-white font-semibold ${isRTL ? 'text-right' : ''}`}>
                  {language === 'ar' ? alert.titleAr : alert.title}
                </Text>
                <Text className={`text-slate-400 text-sm mt-1 ${isRTL ? 'text-right' : ''}`}>
                  {language === 'ar' ? alert.messageAr : alert.message}
                </Text>
              </View>
              {alert.actionRoute && (
                <ChevronRight size={20} color="#64748b" style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
              )}
            </View>
            <View className={`flex-row items-center mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Text className={`text-slate-500 text-xs flex-1 ${isRTL ? 'text-right' : ''}`}>
                {new Date(alert.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <View className={`flex-row items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {!alert.isRead && (
                  <Pressable
                    onPress={onMarkRead}
                    className="p-2 rounded-lg bg-emerald-600/20"
                  >
                    <Check size={16} color="#10b981" />
                  </Pressable>
                )}
                <Pressable
                  onPress={onDismiss}
                  className="p-2 rounded-lg bg-red-600/20"
                >
                  <Trash2 size={16} color="#ef4444" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function AlertsScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const isRTL = language === 'ar';
  const { isDesktop, isTablet } = useResponsive();

  const alerts = useDashboardStore((s) => s.alerts);
  const markAlertRead = useDashboardStore((s) => s.markAlertRead);
  const dismissAlert = useDashboardStore((s) => s.dismissAlert);
  const addAlert = useDashboardStore((s) => s.addAlert);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredAlerts = filter === 'unread' ? alerts.filter((a) => !a.isRead) : alerts;
  const unreadCount = alerts.filter((a) => !a.isRead).length;

  // Add sample alerts if none exist
  React.useEffect(() => {
    if (alerts.length === 0) {
      addAlert({
        type: 'hawl',
        title: 'Hawl Anniversary Approaching',
        titleAr: 'اقتراب ذكرى الحول',
        message: 'Your Hawl anniversary is in 45 days. Start preparing your Zakat calculation.',
        messageAr: 'ذكرى الحول الخاص بك بعد 45 يوماً. ابدأ في إعداد حساب الزكاة.',
        date: new Date().toISOString(),
        actionRoute: '/individual/assets',
      });
      addAlert({
        type: 'nisab',
        title: 'Above Nisab Threshold',
        titleAr: 'فوق حد النصاب',
        message: 'Your wealth exceeds the Nisab threshold. Zakat may be obligatory.',
        messageAr: 'ثروتك تتجاوز حد النصاب. قد تكون الزكاة واجبة.',
        date: new Date(Date.now() - 86400000).toISOString(),
      });
      addAlert({
        type: 'ramadan',
        title: 'Ramadan is Coming',
        titleAr: 'رمضان قادم',
        message: 'Many Muslims prefer to pay Zakat during Ramadan. Consider calculating early.',
        messageAr: 'يفضل كثير من المسلمين دفع الزكاة في رمضان. فكر في الحساب مبكراً.',
        date: new Date(Date.now() - 172800000).toISOString(),
      });
    }
  }, []);

  const containerStyle = isDesktop
    ? { maxWidth: 800, marginHorizontal: 'auto' as const, width: '100%' as const }
    : isTablet
    ? { maxWidth: 600, marginHorizontal: 'auto' as const, width: '100%' as const }
    : {};

  const handleAlertPress = (alert: Alert) => {
    if (!alert.isRead) {
      markAlertRead(alert.id);
    }
    if (alert.actionRoute) {
      router.push(alert.actionRoute as never);
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      <LinearGradient
        colors={['#0f172a', '#020617', '#000']}
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
              onPress={() => router.back()}
              className={`p-2 rounded-full bg-white/10 ${isRTL ? 'ml-4' : 'mr-4'}`}
            >
              <ArrowLeft size={24} color="white" style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
            </Pressable>
            <View>
              <Text className="text-white text-lg font-bold">
                {language === 'ar' ? 'التنبيهات' : 'Alerts'}
              </Text>
              <Text className="text-slate-400 text-xs">
                {unreadCount > 0
                  ? language === 'ar'
                    ? `${unreadCount} غير مقروءة`
                    : `${unreadCount} unread`
                  : language === 'ar'
                  ? 'الكل مقروء'
                  : 'All caught up'}
              </Text>
            </View>
          </View>
          <View className="w-10 h-10 rounded-full bg-amber-500/20 items-center justify-center">
            <Bell size={20} color="#f59e0b" />
          </View>
        </Animated.View>

        {/* Filter Tabs */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="px-6 mt-4"
          style={containerStyle}
        >
          <View className="flex-row bg-slate-800/50 rounded-xl p-1">
            <Pressable
              onPress={() => setFilter('all')}
              className={`flex-1 py-2 rounded-lg ${filter === 'all' ? 'bg-slate-700' : ''}`}
            >
              <Text className={`text-center text-sm ${filter === 'all' ? 'text-white font-medium' : 'text-slate-400'}`}>
                {language === 'ar' ? 'الكل' : 'All'} ({alerts.length})
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFilter('unread')}
              className={`flex-1 py-2 rounded-lg ${filter === 'unread' ? 'bg-slate-700' : ''}`}
            >
              <Text className={`text-center text-sm ${filter === 'unread' ? 'text-white font-medium' : 'text-slate-400'}`}>
                {language === 'ar' ? 'غير مقروء' : 'Unread'} ({unreadCount})
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        <ScrollView
          className="flex-1 px-6 mt-4"
          contentContainerStyle={{ ...containerStyle, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {filteredAlerts.length === 0 ? (
            <Animated.View
              entering={FadeInUp.delay(300).springify()}
              className="items-center py-16"
            >
              <View className="w-20 h-20 rounded-full bg-slate-800 items-center justify-center mb-4">
                <CheckCircle size={40} color="#10b981" />
              </View>
              <Text className="text-white text-lg font-semibold">
                {language === 'ar' ? 'لا توجد تنبيهات' : 'No Alerts'}
              </Text>
              <Text className="text-slate-400 text-sm mt-2 text-center">
                {filter === 'unread'
                  ? language === 'ar'
                    ? 'لقد قرأت جميع التنبيهات'
                    : "You've read all alerts"
                  : language === 'ar'
                  ? 'ستظهر التنبيهات هنا'
                  : 'Alerts will appear here'}
              </Text>
            </Animated.View>
          ) : (
            filteredAlerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                language={language ?? 'en'}
                isRTL={isRTL}
                onMarkRead={() => markAlertRead(alert.id)}
                onDismiss={() => dismissAlert(alert.id)}
                onPress={() => handleAlertPress(alert)}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
