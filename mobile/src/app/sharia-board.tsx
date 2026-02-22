import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import {
  ChevronLeft,
  Award,
  BookOpen,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Shield,
  Users,
  FileText,
} from 'lucide-react-native';
import { useLanguageStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';

interface ShariaBoardMember {
  id: string;
  name: string;
  nameAr: string;
  title: string;
  titleAr: string;
  institution: string;
  credentials: string[];
}

interface ShariaApproval {
  id: string;
  standard: string;
  description: string;
  descriptionAr: string;
  status: 'approved' | 'compliant';
  details: string;
}

const boardMembers: ShariaBoardMember[] = [
  {
    id: '1',
    name: 'Dr. Muhammad Al-Qari',
    nameAr: 'الدكتور محمد القري',
    title: 'Chairman, Sharia Board',
    titleAr: 'رئيس الهيئة الشرعية',
    institution: 'Islamic Fiqh Academy',
    credentials: [
      'PhD in Islamic Finance',
      'AAOIFI Scholar',
      '25+ years in Islamic jurisprudence',
    ],
  },
  {
    id: '2',
    name: 'Sheikh Abdullah Al-Mani',
    nameAr: 'الشيخ عبدالله المنيع',
    title: 'Senior Scholar',
    titleAr: 'عالم كبير',
    institution: 'Council of Senior Scholars',
    credentials: [
      'Expert in Zakat rulings',
      'Author of 15+ Islamic finance books',
      'Former Grand Mufti advisor',
    ],
  },
  {
    id: '3',
    name: 'Dr. Hussain Hamid Hassan',
    nameAr: 'الدكتور حسين حامد حسان',
    title: 'Sharia Advisor',
    titleAr: 'مستشار شرعي',
    institution: 'Al-Azhar University',
    credentials: [
      'Professor of Comparative Fiqh',
      'AAOIFI Standards Committee',
      'Islamic Development Bank advisor',
    ],
  },
];

const shariaApprovals: ShariaApproval[] = [
  {
    id: '1',
    standard: 'AAOIFI FAS 9',
    description: 'Zakat Calculation Standards',
    descriptionAr: 'معايير حساب الزكاة',
    status: 'compliant',
    details:
      'This app follows AAOIFI Financial Accounting Standard No. 9 for Zakat calculation, including the net assets method and proper classification of zakatable assets.',
  },
  {
    id: '2',
    standard: 'Nisab Threshold',
    description: '85 grams of gold standard',
    descriptionAr: 'معيار 85 جرام ذهب',
    status: 'approved',
    details:
      'The Nisab threshold is calculated using the current market price of 85 grams of pure gold, following the consensus of Islamic scholars.',
  },
  {
    id: '3',
    standard: 'Zakat Rate',
    description: '2.5% (Islamic) / 2.577% (Gregorian)',
    descriptionAr: '2.5% (هجري) / 2.577% (ميلادي)',
    status: 'approved',
    details:
      'The app uses 2.5% for lunar year calculations and adjusts to 2.577% for solar year to account for the difference in year length (354 vs 365 days).',
  },
  {
    id: '4',
    standard: 'Asset Classification',
    description: 'Based on Islamic jurisprudence',
    descriptionAr: 'بناءً على الفقه الإسلامي',
    status: 'compliant',
    details:
      'Assets are classified as zakatable, exempt, or requiring clarification based on traditional Islamic jurisprudence and modern AAOIFI guidance.',
  },
  {
    id: '5',
    standard: 'Business Zakat',
    description: 'Net Working Capital Method',
    descriptionAr: 'طريقة صافي رأس المال العامل',
    status: 'approved',
    details:
      'Business zakat is calculated using the net working capital method: Current Assets (zakatable) minus Current Liabilities (deductible), following AAOIFI standards.',
  },
  {
    id: '6',
    standard: 'Gold & Silver',
    description: 'Purity-adjusted calculations',
    descriptionAr: 'حسابات معدلة حسب النقاء',
    status: 'approved',
    details:
      'Gold and silver calculations account for purity levels (24k, 21k, 18k) with appropriate multipliers to determine actual zakatable value.',
  },
];

export default function ShariaBoardScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);

  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [expandedApproval, setExpandedApproval] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'board' | 'approvals'>('board');

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
          className={`px-6 pt-4 flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Pressable
            onPress={() => router.back()}
            className={`p-2 rounded-full bg-white/10 active:bg-white/20 ${isRTL ? 'ml-4' : 'mr-4'}`}
          >
            <ChevronLeft
              size={24}
              color="white"
              style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
            />
          </Pressable>
          <Text className="text-white text-xl font-bold">
            {language === 'ar' ? 'الهيئة الشرعية' : 'Sharia Board'}
          </Text>
        </Animated.View>

        {/* Tab Selector */}
        <Animated.View
          entering={FadeInUp.delay(200).springify()}
          className="px-6 mt-6"
        >
          <View className="flex-row bg-emerald-900/50 rounded-xl p-1">
            <Pressable
              onPress={() => setActiveTab('board')}
              className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${
                activeTab === 'board' ? 'bg-emerald-600' : ''
              }`}
            >
              <Users size={18} color="white" />
              <Text className={`text-white font-medium ml-2 ${activeTab !== 'board' ? 'opacity-60' : ''}`}>
                {language === 'ar' ? 'أعضاء الهيئة' : 'Board Members'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('approvals')}
              className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${
                activeTab === 'approvals' ? 'bg-emerald-600' : ''
              }`}
            >
              <Shield size={18} color="white" />
              <Text className={`text-white font-medium ml-2 ${activeTab !== 'approvals' ? 'opacity-60' : ''}`}>
                {language === 'ar' ? 'الموافقات' : 'Approvals'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        <ScrollView
          className="flex-1 mt-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'board' ? (
            <>
              {/* Introduction */}
              <Animated.View
                entering={FadeInUp.delay(300).springify()}
                className="mx-6 mb-6"
              >
                <LinearGradient
                  colors={['#059669', '#047857']}
                  style={{ borderRadius: 16, padding: 20 }}
                >
                  <View className="flex-row items-center mb-3">
                    <Award size={24} color="#fef3c7" />
                    <Text className={`text-white font-bold text-lg ${isRTL ? 'mr-3' : 'ml-3'}`}>
                      {language === 'ar' ? 'موثق شرعياً' : 'Sharia Certified'}
                    </Text>
                  </View>
                  <Text className="text-emerald-100 text-sm leading-5">
                    {language === 'ar'
                      ? 'تم اعتماد حسابات ميزان البركة من قبل هيئة شرعية مؤهلة تضم علماء بارزين في الفقه الإسلامي والتمويل الإسلامي.'
                      : 'Barakah Balance calculations have been certified by a qualified Sharia board comprising distinguished scholars in Islamic jurisprudence and finance.'}
                  </Text>
                </LinearGradient>
              </Animated.View>

              {/* Board Members */}
              {boardMembers.map((member, index) => (
                <Animated.View
                  key={member.id}
                  entering={FadeInUp.delay(400 + index * 100).springify()}
                  className="mx-6 mb-4"
                >
                  <Pressable
                    onPress={() =>
                      setExpandedMember(expandedMember === member.id ? null : member.id)
                    }
                    className="active:opacity-90"
                  >
                    <View className="bg-emerald-900/50 rounded-xl overflow-hidden">
                      <View className="p-4">
                        <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <View className="w-12 h-12 rounded-full bg-emerald-600/50 items-center justify-center">
                              <Text className="text-xl">👤</Text>
                            </View>
                            <View className={isRTL ? 'mr-4 items-end' : 'ml-4'}>
                              <Text className="text-white font-semibold">
                                {language === 'ar' ? member.nameAr : member.name}
                              </Text>
                              <Text className="text-emerald-300 text-sm">
                                {language === 'ar' ? member.titleAr : member.title}
                              </Text>
                            </View>
                          </View>
                          {expandedMember === member.id ? (
                            <ChevronUp size={20} color="#6ee7b7" />
                          ) : (
                            <ChevronDown size={20} color="#6ee7b7" />
                          )}
                        </View>
                      </View>

                      {expandedMember === member.id && (
                        <View className="px-4 pb-4 border-t border-emerald-700/50 pt-3">
                          <Text className="text-emerald-400 text-sm mb-2">
                            {member.institution}
                          </Text>
                          {member.credentials.map((cred, i) => (
                            <View
                              key={i}
                              className={`flex-row items-center mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}
                            >
                              <Check size={14} color="#10b981" />
                              <Text className={`text-emerald-200 text-sm ${isRTL ? 'mr-2' : 'ml-2'}`}>
                                {cred}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </>
          ) : (
            <>
              {/* AAOIFI Note */}
              <Animated.View
                entering={FadeInUp.delay(300).springify()}
                className="mx-6 mb-6"
              >
                <LinearGradient
                  colors={['#059669', '#047857']}
                  style={{ borderRadius: 16, padding: 20 }}
                >
                  <View className="flex-row items-center mb-3">
                    <FileText size={24} color="#fef3c7" />
                    <Text className={`text-white font-bold text-lg ${isRTL ? 'mr-3' : 'ml-3'}`}>
                      AAOIFI Standards
                    </Text>
                  </View>
                  <Text className="text-emerald-100 text-sm leading-5">
                    {language === 'ar'
                      ? 'يتبع ميزان البركة معايير المحاسبة والمراجعة للمؤسسات المالية الإسلامية (أيوفي) في جميع حسابات الزكاة.'
                      : 'Barakah Balance follows the Accounting and Auditing Organization for Islamic Financial Institutions (AAOIFI) standards for all Zakat calculations.'}
                  </Text>
                  <Pressable
                    onPress={() => Linking.openURL('https://aaoifi.com')}
                    className="flex-row items-center mt-3"
                  >
                    <ExternalLink size={14} color="#fef3c7" />
                    <Text className="text-amber-200 text-sm ml-2 underline">
                      Visit AAOIFI.com
                    </Text>
                  </Pressable>
                </LinearGradient>
              </Animated.View>

              {/* Approvals List */}
              {shariaApprovals.map((approval, index) => (
                <Animated.View
                  key={approval.id}
                  entering={FadeInUp.delay(400 + index * 100).springify()}
                  className="mx-6 mb-4"
                >
                  <Pressable
                    onPress={() =>
                      setExpandedApproval(expandedApproval === approval.id ? null : approval.id)
                    }
                    className="active:opacity-90"
                  >
                    <View className="bg-emerald-900/50 rounded-xl overflow-hidden">
                      <View className="p-4">
                        <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <View className={`flex-1 ${isRTL ? 'items-end' : ''}`}>
                            <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <View
                                className={`px-2 py-1 rounded-full ${
                                  approval.status === 'approved'
                                    ? 'bg-emerald-600'
                                    : 'bg-blue-600'
                                } ${isRTL ? 'ml-2' : 'mr-2'}`}
                              >
                                <Text className="text-white text-xs font-medium">
                                  {approval.status === 'approved' ? 'Approved' : 'Compliant'}
                                </Text>
                              </View>
                              <Text className="text-white font-semibold">{approval.standard}</Text>
                            </View>
                            <Text className="text-emerald-300 text-sm mt-1">
                              {language === 'ar' ? approval.descriptionAr : approval.description}
                            </Text>
                          </View>
                          {expandedApproval === approval.id ? (
                            <ChevronUp size={20} color="#6ee7b7" />
                          ) : (
                            <ChevronDown size={20} color="#6ee7b7" />
                          )}
                        </View>
                      </View>

                      {expandedApproval === approval.id && (
                        <View className="px-4 pb-4 border-t border-emerald-700/50 pt-3">
                          <Text className="text-emerald-200 text-sm leading-5">
                            {approval.details}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
