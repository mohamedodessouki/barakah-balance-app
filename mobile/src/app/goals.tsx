import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, SlideInUp } from 'react-native-reanimated';
import {
  ArrowLeft, Plus, Target, X, ChevronRight, Edit3, Trash2, CheckCircle
} from 'lucide-react-native';
import { useLanguageStore, useSettingsStore } from '@/lib/store';
import { useDashboardStore, GOAL_CATEGORIES, FinancialGoal } from '@/lib/dashboard-store';
import { useResponsive } from '@/lib/useResponsive';

type GoalCategory = keyof typeof GOAL_CATEGORIES;

const GOAL_ICONS = ['🕌', '🏠', '🎓', '👨‍👩‍👧‍👦', '💰', '✈️', '🚗', '💼', '📚', '❤️', '🏥', '💎'];

function GoalCard({
  goal,
  language,
  isRTL,
  currencySymbol,
  onPress,
  onContribute,
}: {
  goal: FinancialGoal;
  language: string;
  isRTL: boolean;
  currencySymbol: string;
  onPress: () => void;
  onContribute: () => void;
}) {
  const category = GOAL_CATEGORIES[goal.category];
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  const isComplete = progress >= 100;

  return (
    <Animated.View entering={FadeInUp.springify()}>
      <Pressable
        onPress={onPress}
        className={`bg-slate-800/50 rounded-2xl p-4 mb-3 ${isComplete ? 'border border-emerald-500/30' : ''}`}
      >
        <View className={`flex-row items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
          <View className="w-14 h-14 rounded-xl bg-slate-700 items-center justify-center">
            <Text className="text-2xl">{goal.icon}</Text>
          </View>
          <View className={`flex-1 ${isRTL ? 'mr-4' : 'ml-4'}`}>
            <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Text className={`text-white font-semibold ${isRTL ? 'text-right' : ''}`}>
                {language === 'ar' ? goal.nameAr : goal.name}
              </Text>
              {isComplete ? (
                <View className="bg-emerald-500/20 px-2 py-1 rounded-full flex-row items-center">
                  <CheckCircle size={12} color="#10b981" />
                  <Text className="text-emerald-400 text-xs ml-1">
                    {language === 'ar' ? 'مكتمل' : 'Complete'}
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-bold">{progress.toFixed(0)}%</Text>
              )}
            </View>
            <Text className={`text-slate-400 text-xs mt-1 ${isRTL ? 'text-right' : ''}`}>
              {language === 'ar' ? category.ar : category.en}
            </Text>

            {/* Progress bar */}
            <View className="h-2 bg-slate-700 rounded-full overflow-hidden mt-3">
              <View
                className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </View>

            <View className={`flex-row items-center justify-between mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Text className={`text-slate-400 text-xs ${isRTL ? 'text-right' : ''}`}>
                {currencySymbol}{goal.currentAmount.toLocaleString()} / {currencySymbol}{goal.targetAmount.toLocaleString()}
              </Text>
              {!isComplete && (
                <Pressable
                  onPress={onContribute}
                  className="bg-indigo-600/30 px-3 py-1 rounded-lg"
                >
                  <Text className="text-indigo-400 text-xs">
                    {language === 'ar' ? 'إضافة' : 'Add'}
                  </Text>
                </Pressable>
              )}
            </View>

            {!isComplete && goal.monthlyContribution && (
              <Text className={`text-slate-500 text-xs mt-1 ${isRTL ? 'text-right' : ''}`}>
                {language === 'ar' ? 'شهرياً: ' : 'Monthly: '}{currencySymbol}{goal.monthlyContribution}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function GoalsScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const isRTL = language === 'ar';
  const country = useSettingsStore((s) => s.country);
  const { isDesktop, isTablet } = useResponsive();

  const financialGoals = useDashboardStore((s) => s.financialGoals);
  const addFinancialGoal = useDashboardStore((s) => s.addFinancialGoal);
  const updateGoalProgress = useDashboardStore((s) => s.updateGoalProgress);

  const currencySymbol = country?.currencySymbol ?? '$';

  const [showAddModal, setShowAddModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory>('mal');
  const [selectedIcon, setSelectedIcon] = useState('💰');
  const [goalName, setGoalName] = useState('');
  const [goalNameAr, setGoalNameAr] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [contributeAmount, setContributeAmount] = useState('');

  const containerStyle = isDesktop
    ? { maxWidth: 900, marginHorizontal: 'auto' as const, width: '100%' as const }
    : isTablet
    ? { maxWidth: 700, marginHorizontal: 'auto' as const, width: '100%' as const }
    : {};

  const resetForm = () => {
    setSelectedCategory('mal');
    setSelectedIcon('💰');
    setGoalName('');
    setGoalNameAr('');
    setTargetAmount('');
    setMonthlyContribution('');
  };

  const handleAddGoal = () => {
    if (!goalName || !targetAmount) return;

    addFinancialGoal({
      category: selectedCategory,
      name: goalName,
      nameAr: goalNameAr || goalName,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      currency: country?.currency ?? 'USD',
      monthlyContribution: monthlyContribution ? parseFloat(monthlyContribution) : undefined,
      icon: selectedIcon,
    });

    resetForm();
    setShowAddModal(false);
  };

  const handleContribute = () => {
    if (!selectedGoal || !contributeAmount) return;

    const newAmount = selectedGoal.currentAmount + parseFloat(contributeAmount);
    updateGoalProgress(selectedGoal.id, newAmount);

    setContributeAmount('');
    setSelectedGoal(null);
    setShowContributeModal(false);
  };

  const totalGoalValue = financialGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = financialGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalGoalValue > 0 ? (totalSaved / totalGoalValue) * 100 : 0;

  // Group goals by category
  const goalsByCategory = Object.keys(GOAL_CATEGORIES).reduce((acc, cat) => {
    acc[cat as GoalCategory] = financialGoals.filter((g) => g.category === cat);
    return acc;
  }, {} as Record<GoalCategory, FinancialGoal[]>);

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
                {language === 'ar' ? 'الأهداف المالية' : 'Financial Goals'}
              </Text>
              <Text className="text-slate-400 text-xs">
                {language === 'ar' ? 'مقاصد الشريعة' : 'Based on Maqasid Al-Shariah'}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setShowAddModal(true)}
            className="w-10 h-10 rounded-full bg-indigo-600 items-center justify-center"
          >
            <Plus size={20} color="white" />
          </Pressable>
        </Animated.View>

        {/* Overall Progress */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="px-6 mt-4"
          style={containerStyle}
        >
          <LinearGradient
            colors={['#4f46e5', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 16, padding: 20 }}
          >
            <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <View>
                <Text className={`text-white/70 text-sm ${isRTL ? 'text-right' : ''}`}>
                  {language === 'ar' ? 'إجمالي التقدم' : 'Total Progress'}
                </Text>
                <Text className={`text-white text-3xl font-bold mt-1 ${isRTL ? 'text-right' : ''}`}>
                  {overallProgress.toFixed(0)}%
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-white/70 text-xs">
                  {language === 'ar' ? 'المحفوظ' : 'Saved'}
                </Text>
                <Text className="text-white font-semibold">
                  {currencySymbol}{totalSaved.toLocaleString()}
                </Text>
                <Text className="text-white/50 text-xs mt-1">
                  {language === 'ar' ? 'من ' : 'of '}{currencySymbol}{totalGoalValue.toLocaleString()}
                </Text>
              </View>
            </View>
            <View className="h-3 bg-white/20 rounded-full overflow-hidden mt-4">
              <View
                className="h-full bg-white rounded-full"
                style={{ width: `${Math.min(100, overallProgress)}%` }}
              />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Maqasid Categories Legend */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          className="px-6 mt-4"
          style={containerStyle}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {Object.entries(GOAL_CATEGORIES).map(([key, value]) => (
                <View key={key} className="bg-slate-800/50 rounded-lg px-3 py-2 flex-row items-center">
                  <Text className="text-sm">{value.icon}</Text>
                  <Text className="text-slate-300 text-xs ml-2">
                    {language === 'ar' ? value.ar : value.en}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        <ScrollView
          className="flex-1 px-6 mt-4"
          contentContainerStyle={{ ...containerStyle, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {financialGoals.length === 0 ? (
            <Animated.View
              entering={FadeInUp.delay(400).springify()}
              className="items-center py-16"
            >
              <View className="w-20 h-20 rounded-full bg-slate-800 items-center justify-center mb-4">
                <Target size={40} color="#6366f1" />
              </View>
              <Text className="text-white text-lg font-semibold">
                {language === 'ar' ? 'لا توجد أهداف بعد' : 'No Goals Yet'}
              </Text>
              <Text className="text-slate-400 text-sm mt-2 text-center px-8">
                {language === 'ar'
                  ? 'أنشئ أهدافاً مالية بناءً على مقاصد الشريعة الخمسة'
                  : 'Create financial goals based on the five Maqasid Al-Shariah'}
              </Text>
              <Pressable
                onPress={() => setShowAddModal(true)}
                className="mt-6 bg-indigo-600 px-6 py-3 rounded-xl flex-row items-center"
              >
                <Plus size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  {language === 'ar' ? 'إضافة هدف' : 'Add Goal'}
                </Text>
              </Pressable>
            </Animated.View>
          ) : (
            <>
              {/* Group by category for desktop, flat list for mobile */}
              {isDesktop || isTablet ? (
                Object.entries(goalsByCategory).map(([category, goals]) => {
                  if (goals.length === 0) return null;
                  const cat = GOAL_CATEGORIES[category as GoalCategory];
                  return (
                    <View key={category} className="mb-6">
                      <View className={`flex-row items-center mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Text className="text-lg">{cat.icon}</Text>
                        <Text className={`text-white font-semibold ${isRTL ? 'mr-2' : 'ml-2'}`}>
                          {language === 'ar' ? cat.ar : cat.en}
                        </Text>
                      </View>
                      <View className={isDesktop ? 'flex-row flex-wrap gap-4' : ''}>
                        {goals.map((goal) => (
                          <View key={goal.id} className={isDesktop ? 'w-[48%]' : ''}>
                            <GoalCard
                              goal={goal}
                              language={language ?? 'en'}
                              isRTL={isRTL}
                              currencySymbol={currencySymbol}
                              onPress={() => {}}
                              onContribute={() => {
                                setSelectedGoal(goal);
                                setShowContributeModal(true);
                              }}
                            />
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })
              ) : (
                financialGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    language={language ?? 'en'}
                    isRTL={isRTL}
                    currencySymbol={currencySymbol}
                    onPress={() => {}}
                    onContribute={() => {
                      setSelectedGoal(goal);
                      setShowContributeModal(true);
                    }}
                  />
                ))
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Add Goal Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <Animated.View
            entering={SlideInUp.springify()}
            className="bg-slate-900 rounded-t-3xl p-6 max-h-[85%]"
          >
            <View className={`flex-row items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Text className="text-white text-xl font-bold">
                {language === 'ar' ? 'هدف جديد' : 'New Goal'}
              </Text>
              <Pressable onPress={() => { resetForm(); setShowAddModal(false); }}>
                <X size={24} color="#64748b" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Category Selection */}
              <Text className={`text-slate-400 text-sm mb-2 ${isRTL ? 'text-right' : ''}`}>
                {language === 'ar' ? 'الفئة (مقاصد الشريعة)' : 'Category (Maqasid)'}
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {Object.entries(GOAL_CATEGORIES).map(([key, value]) => (
                  <Pressable
                    key={key}
                    onPress={() => setSelectedCategory(key as GoalCategory)}
                    className={`px-4 py-2 rounded-xl flex-row items-center ${
                      selectedCategory === key ? 'bg-indigo-600' : 'bg-slate-800'
                    }`}
                  >
                    <Text className="text-sm">{value.icon}</Text>
                    <Text className={`text-sm ml-2 ${selectedCategory === key ? 'text-white' : 'text-slate-300'}`}>
                      {language === 'ar' ? value.ar : value.en}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Icon Selection */}
              <Text className={`text-slate-400 text-sm mb-2 ${isRTL ? 'text-right' : ''}`}>
                {language === 'ar' ? 'الأيقونة' : 'Icon'}
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {GOAL_ICONS.map((icon) => (
                  <Pressable
                    key={icon}
                    onPress={() => setSelectedIcon(icon)}
                    className={`w-12 h-12 rounded-xl items-center justify-center ${
                      selectedIcon === icon ? 'bg-indigo-600' : 'bg-slate-800'
                    }`}
                  >
                    <Text className="text-xl">{icon}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Goal Name */}
              <Text className={`text-slate-400 text-sm mb-2 ${isRTL ? 'text-right' : ''}`}>
                {language === 'ar' ? 'اسم الهدف' : 'Goal Name'}
              </Text>
              <TextInput
                value={goalName}
                onChangeText={setGoalName}
                placeholder={language === 'ar' ? 'مثال: شراء منزل' : 'e.g., Buy a house'}
                placeholderTextColor="#64748b"
                className="bg-slate-800 rounded-xl px-4 py-3 text-white mb-4"
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />

              {language === 'ar' && (
                <>
                  <Text className="text-slate-400 text-sm mb-2 text-right">
                    الاسم بالعربية
                  </Text>
                  <TextInput
                    value={goalNameAr}
                    onChangeText={setGoalNameAr}
                    placeholder="الاسم بالعربية"
                    placeholderTextColor="#64748b"
                    className="bg-slate-800 rounded-xl px-4 py-3 text-white mb-4"
                    style={{ textAlign: 'right' }}
                  />
                </>
              )}

              {/* Target Amount */}
              <Text className={`text-slate-400 text-sm mb-2 ${isRTL ? 'text-right' : ''}`}>
                {language === 'ar' ? 'المبلغ المستهدف' : 'Target Amount'} ({currencySymbol})
              </Text>
              <TextInput
                value={targetAmount}
                onChangeText={setTargetAmount}
                placeholder="50000"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                className="bg-slate-800 rounded-xl px-4 py-3 text-white mb-4"
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />

              {/* Monthly Contribution */}
              <Text className={`text-slate-400 text-sm mb-2 ${isRTL ? 'text-right' : ''}`}>
                {language === 'ar' ? 'المساهمة الشهرية (اختياري)' : 'Monthly Contribution (optional)'} ({currencySymbol})
              </Text>
              <TextInput
                value={monthlyContribution}
                onChangeText={setMonthlyContribution}
                placeholder="500"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                className="bg-slate-800 rounded-xl px-4 py-3 text-white mb-6"
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              />

              <Pressable
                onPress={handleAddGoal}
                className={`bg-indigo-600 py-4 rounded-xl ${(!goalName || !targetAmount) ? 'opacity-50' : ''}`}
                disabled={!goalName || !targetAmount}
              >
                <Text className="text-white text-center font-semibold">
                  {language === 'ar' ? 'إنشاء الهدف' : 'Create Goal'}
                </Text>
              </Pressable>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Contribute Modal */}
      <Modal visible={showContributeModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <Animated.View
            entering={SlideInUp.springify()}
            className="bg-slate-900 rounded-t-3xl p-6"
          >
            <View className={`flex-row items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <View>
                <Text className="text-white text-xl font-bold">
                  {language === 'ar' ? 'إضافة مبلغ' : 'Add Contribution'}
                </Text>
                {selectedGoal && (
                  <Text className="text-slate-400 text-sm">
                    {language === 'ar' ? selectedGoal.nameAr : selectedGoal.name}
                  </Text>
                )}
              </View>
              <Pressable onPress={() => { setContributeAmount(''); setShowContributeModal(false); }}>
                <X size={24} color="#64748b" />
              </Pressable>
            </View>

            {selectedGoal && (
              <View className="bg-slate-800 rounded-xl p-4 mb-4">
                <View className={`flex-row justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Text className="text-slate-400">{language === 'ar' ? 'الحالي' : 'Current'}</Text>
                  <Text className="text-white">{currencySymbol}{selectedGoal.currentAmount.toLocaleString()}</Text>
                </View>
                <View className={`flex-row justify-between mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Text className="text-slate-400">{language === 'ar' ? 'الهدف' : 'Target'}</Text>
                  <Text className="text-white">{currencySymbol}{selectedGoal.targetAmount.toLocaleString()}</Text>
                </View>
                <View className={`flex-row justify-between mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Text className="text-slate-400">{language === 'ar' ? 'المتبقي' : 'Remaining'}</Text>
                  <Text className="text-emerald-400">
                    {currencySymbol}{(selectedGoal.targetAmount - selectedGoal.currentAmount).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            <Text className={`text-slate-400 text-sm mb-2 ${isRTL ? 'text-right' : ''}`}>
              {language === 'ar' ? 'المبلغ المضاف' : 'Amount to Add'} ({currencySymbol})
            </Text>
            <TextInput
              value={contributeAmount}
              onChangeText={setContributeAmount}
              placeholder="1000"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              className="bg-slate-800 rounded-xl px-4 py-3 text-white text-xl text-center mb-6"
              autoFocus
            />

            <Pressable
              onPress={handleContribute}
              className={`bg-emerald-600 py-4 rounded-xl ${!contributeAmount ? 'opacity-50' : ''}`}
              disabled={!contributeAmount}
            >
              <Text className="text-white text-center font-semibold">
                {language === 'ar' ? 'إضافة' : 'Add Contribution'}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
