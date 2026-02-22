import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  ArrowLeft, FileText, Download, Share2, Calendar, ChevronRight,
  PieChart, BarChart3, FileSpreadsheet
} from 'lucide-react-native';
import { useLanguageStore, useSettingsStore, useIndividualCalculatorStore } from '@/lib/store';
import { useDashboardStore } from '@/lib/dashboard-store';
import { useResponsive } from '@/lib/useResponsive';

function ReportCard({
  title,
  description,
  icon: Icon,
  color,
  isRTL,
  onPress,
  badge,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  isRTL: boolean;
  onPress: () => void;
  badge?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-slate-800/50 rounded-2xl p-4 mb-3"
    >
      <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <View
          style={{ backgroundColor: color + '30' }}
          className="w-12 h-12 rounded-xl items-center justify-center"
        >
          <Icon size={24} color={color} />
        </View>
        <View className={`flex-1 ${isRTL ? 'mr-4' : 'ml-4'}`}>
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-white font-semibold ${isRTL ? 'text-right' : ''}`}>{title}</Text>
            {badge && (
              <View className="bg-emerald-500/20 px-2 py-0.5 rounded-full ml-2">
                <Text className="text-emerald-400 text-xs">{badge}</Text>
              </View>
            )}
          </View>
          <Text className={`text-slate-400 text-sm mt-1 ${isRTL ? 'text-right' : ''}`}>{description}</Text>
        </View>
        <ChevronRight size={20} color="#64748b" style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
      </View>
    </Pressable>
  );
}

export default function ReportsScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const isRTL = language === 'ar';
  const country = useSettingsStore((s) => s.country);
  const { isDesktop, isTablet } = useResponsive();

  const totalAssets = useIndividualCalculatorStore((s) => s.getTotalAssets)();
  const zakatPayments = useDashboardStore((s) => s.zakatPayments);

  const currencySymbol = country?.currencySymbol ?? '$';

  const containerStyle = isDesktop
    ? { maxWidth: 800, marginHorizontal: 'auto' as const, width: '100%' as const }
    : isTablet
    ? { maxWidth: 600, marginHorizontal: 'auto' as const, width: '100%' as const }
    : {};

  const reports = [
    {
      id: 'zakat-calculation',
      title: language === 'ar' ? 'تقرير حساب الزكاة' : 'Zakat Calculation Report',
      description: language === 'ar' ? 'تفصيل كامل لحساب الزكاة الخاص بك' : 'Complete breakdown of your Zakat calculation',
      icon: FileText,
      color: '#10b981',
      route: '/individual/results',
      badge: language === 'ar' ? 'AAOIFI' : 'AAOIFI',
    },
    {
      id: 'business-report',
      title: language === 'ar' ? 'تقرير زكاة الشركة' : 'Business Zakat Report',
      description: language === 'ar' ? 'تقرير مفصل لزكاة الأعمال' : 'Detailed business Zakat report',
      icon: FileSpreadsheet,
      color: '#6366f1',
      route: '/business/report',
    },
    {
      id: 'wealth-summary',
      title: language === 'ar' ? 'ملخص الثروة' : 'Wealth Summary',
      description: language === 'ar' ? 'نظرة شاملة على أصولك والتزاماتك' : 'Overview of your assets and liabilities',
      icon: PieChart,
      color: '#f59e0b',
      route: '/dashboard',
    },
    {
      id: 'payment-history',
      title: language === 'ar' ? 'سجل المدفوعات' : 'Payment History',
      description: language === 'ar' ? `${zakatPayments.length} دفعة مسجلة` : `${zakatPayments.length} payments recorded`,
      icon: Calendar,
      color: '#ec4899',
      route: '/zakat-distribution',
    },
    {
      id: 'trend-report',
      title: language === 'ar' ? 'تقرير الاتجاهات' : 'Trend Report',
      description: language === 'ar' ? 'تحليل نمو ثروتك مع مرور الوقت' : 'Analysis of your wealth growth over time',
      icon: BarChart3,
      color: '#8b5cf6',
      route: '/trends',
    },
  ];

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
                {language === 'ar' ? 'التقارير' : 'Reports'}
              </Text>
              <Text className="text-slate-400 text-xs">
                {language === 'ar' ? 'عرض وتصدير التقارير' : 'View and export reports'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="px-6 mt-4"
          style={containerStyle}
        >
          <View className="flex-row gap-3">
            <View className="flex-1 bg-slate-800/50 rounded-xl p-4">
              <Text className={`text-slate-400 text-xs ${isRTL ? 'text-right' : ''}`}>
                {language === 'ar' ? 'صافي الثروة' : 'Net Worth'}
              </Text>
              <Text className={`text-white text-xl font-bold mt-1 ${isRTL ? 'text-right' : ''}`}>
                {currencySymbol}{totalAssets.toLocaleString()}
              </Text>
            </View>
            <View className="flex-1 bg-slate-800/50 rounded-xl p-4">
              <Text className={`text-slate-400 text-xs ${isRTL ? 'text-right' : ''}`}>
                {language === 'ar' ? 'الزكاة المستحقة' : 'Zakat Due'}
              </Text>
              <Text className={`text-emerald-400 text-xl font-bold mt-1 ${isRTL ? 'text-right' : ''}`}>
                {currencySymbol}{Math.round(totalAssets * 0.025).toLocaleString()}
              </Text>
            </View>
          </View>
        </Animated.View>

        <ScrollView
          className="flex-1 px-6 mt-4"
          contentContainerStyle={{ ...containerStyle, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className={`text-white font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
            {language === 'ar' ? 'التقارير المتاحة' : 'Available Reports'}
          </Text>

          {reports.map((report, index) => (
            <Animated.View key={report.id} entering={FadeInUp.delay(300 + index * 100).springify()}>
              <ReportCard
                title={report.title}
                description={report.description}
                icon={report.icon}
                color={report.color}
                isRTL={isRTL}
                onPress={() => router.push(report.route as never)}
                badge={report.badge}
              />
            </Animated.View>
          ))}

          {/* Export Options */}
          <Animated.View entering={FadeInUp.delay(800).springify()} className="mt-6">
            <Text className={`text-white font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
              {language === 'ar' ? 'خيارات التصدير' : 'Export Options'}
            </Text>
            <View className="flex-row gap-3">
              <Pressable className="flex-1 bg-slate-800/50 rounded-xl p-4 items-center">
                <Download size={24} color="#10b981" />
                <Text className="text-slate-300 text-sm mt-2">PDF</Text>
              </Pressable>
              <Pressable className="flex-1 bg-slate-800/50 rounded-xl p-4 items-center">
                <FileSpreadsheet size={24} color="#6366f1" />
                <Text className="text-slate-300 text-sm mt-2">Excel</Text>
              </Pressable>
              <Pressable className="flex-1 bg-slate-800/50 rounded-xl p-4 items-center">
                <Share2 size={24} color="#f59e0b" />
                <Text className="text-slate-300 text-sm mt-2">
                  {language === 'ar' ? 'مشاركة' : 'Share'}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
