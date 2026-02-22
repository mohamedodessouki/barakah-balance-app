import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, ArrowRight, Plus, Trash2, AlertCircle, CheckCircle, MinusCircle, HelpCircle, Clock, CalendarDays } from 'lucide-react-native';
import { useLanguageStore, useSettingsStore, useBusinessCalculatorStore, BusinessLineItem } from '@/lib/store';
import { useTranslation } from '@/lib/translations';
import { createBusinessLineItem, commonLineItems } from '@/lib/zakat-classifier';

export default function BusinessAnalysisScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);
  const country = useSettingsStore((s) => s.country);

  const assets = useBusinessCalculatorStore((s) => s.assets);
  const setLineItems = useBusinessCalculatorStore((s) => s.setLineItems);
  const addLineItem = useBusinessCalculatorStore((s) => s.addLineItem);
  const removeLineItem = useBusinessCalculatorStore((s) => s.removeLineItem);
  const getTotalZakatable = useBusinessCalculatorStore((s) => s.getTotalZakatable);
  const getTotalDeductible = useBusinessCalculatorStore((s) => s.getTotalDeductible);
  const getTotalExempt = useBusinessCalculatorStore((s) => s.getTotalExempt);
  const getPendingClarifications = useBusinessCalculatorStore((s) => s.getPendingClarifications);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [showTermModal, setShowTermModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const currencySymbol = country?.currencySymbol ?? '$';

  const updateLineItem = useBusinessCalculatorStore((s) => s.updateLineItem);

  const handleOpenTermModal = (itemId: string) => {
    setSelectedItemId(itemId);
    setShowTermModal(true);
  };

  const handleSelectTerm = (termType: 'short' | 'long') => {
    if (!selectedItemId) return;

    // Short-term investments are zakatable, long-term are exempt
    const newClassification = termType === 'short' ? 'zakatable' : 'exempt';

    updateLineItem(selectedItemId, {
      classification: newClassification,
      clarificationAnswer: termType,
    });

    setShowTermModal(false);
    setSelectedItemId(null);
  };

  // Auto-generate initial line items based on manual entry values
  useEffect(() => {
    if (assets.lineItems.length === 0) {
      const initialItems: BusinessLineItem[] = [];

      if (assets.cash > 0) {
        initialItems.push(createBusinessLineItem('Cash on Hand', assets.cash));
      }
      if (assets.receivables > 0) {
        initialItems.push(createBusinessLineItem('Accounts Receivable', assets.receivables));
      }
      if (assets.inventory > 0) {
        initialItems.push(createBusinessLineItem('Inventory', assets.inventory));
      }
      if (assets.investments > 0) {
        initialItems.push(createBusinessLineItem('Short-term Investments', assets.investments));
      }

      if (initialItems.length > 0) {
        setLineItems(initialItems);
      }
    }
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    const pendingItems = getPendingClarifications();
    if (pendingItems.length > 0) {
      router.push('/business/clarification');
    } else {
      router.push('/business/results');
    }
  };

  const handleAddItem = () => {
    if (newItemName.trim() && parseInt(newItemAmount) > 0) {
      const item = createBusinessLineItem(newItemName.trim(), parseInt(newItemAmount));
      addLineItem(item);
      setNewItemName('');
      setNewItemAmount('');
      setShowAddModal(false);
    }
  };

  const totalZakatable = getTotalZakatable();
  const totalDeductible = getTotalDeductible();
  const totalExempt = getTotalExempt();
  const pendingItems = getPendingClarifications();

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'zakatable':
        return 'bg-emerald-600/50';
      case 'deductible':
        return 'bg-blue-600/50';
      case 'exempt':
        return 'bg-gray-600/50';
      case 'not_deductible':
        return 'bg-red-600/50';
      case 'needs_clarification':
        return 'bg-amber-600/50';
      default:
        return 'bg-gray-600/50';
    }
  };

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'zakatable':
        return <CheckCircle size={16} color="#a7f3d0" />;
      case 'deductible':
        return <MinusCircle size={16} color="#93c5fd" />;
      case 'exempt':
        return <AlertCircle size={16} color="#9ca3af" />;
      case 'not_deductible':
        return <AlertCircle size={16} color="#fca5a5" />;
      case 'needs_clarification':
        return <HelpCircle size={16} color="#fcd34d" />;
      default:
        return <AlertCircle size={16} color="#9ca3af" />;
    }
  };

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
          className={`px-6 pt-4 flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
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
              {t('analysisResults')}
            </Text>
          </View>
          <Pressable
            onPress={() => setShowAddModal(true)}
            className="p-2 rounded-full bg-indigo-600 active:bg-indigo-700"
          >
            <Plus size={20} color="white" />
          </Pressable>
        </Animated.View>

        <ScrollView
          className="flex-1 mt-4"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Cards */}
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            className="mx-4 mb-4"
          >
            <View className="flex-row flex-wrap gap-2">
              <View className="flex-1 min-w-[45%] bg-emerald-900/50 rounded-xl p-3">
                <Text className="text-emerald-400 text-xs">{t('totalZakatable')}</Text>
                <Text className="text-white font-bold mt-1">
                  {currencySymbol} {totalZakatable.toLocaleString()}
                </Text>
              </View>
              <View className="flex-1 min-w-[45%] bg-blue-900/50 rounded-xl p-3">
                <Text className="text-blue-400 text-xs">{t('totalDeductibleItems')}</Text>
                <Text className="text-white font-bold mt-1">
                  {currencySymbol} {totalDeductible.toLocaleString()}
                </Text>
              </View>
              <View className="flex-1 min-w-[45%] bg-gray-800/50 rounded-xl p-3">
                <Text className="text-gray-400 text-xs">{t('totalExemptItems')}</Text>
                <Text className="text-white font-bold mt-1">
                  {currencySymbol} {totalExempt.toLocaleString()}
                </Text>
              </View>
              <View className="flex-1 min-w-[45%] bg-amber-900/50 rounded-xl p-3">
                <Text className="text-amber-400 text-xs">{t('pendingAnswers')}</Text>
                <Text className="text-white font-bold mt-1">
                  {pendingItems.length} items
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Line Items Table */}
          <Animated.View
            entering={FadeInUp.delay(300).springify()}
            className="mx-4"
          >
            <Text className={`text-white font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
              {t('lineItem')}s ({assets.lineItems.length})
            </Text>

            {assets.lineItems.length === 0 ? (
              <View className="bg-indigo-900/30 rounded-xl p-6 items-center">
                <Text className="text-indigo-300 text-center">
                  No line items yet. Tap + to add items.
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                {assets.lineItems.map((item, index) => (
                  <Animated.View
                    key={item.id}
                    entering={FadeInUp.delay(350 + index * 50).springify()}
                  >
                    <View className="bg-indigo-900/50 rounded-xl p-4">
                      <View className={`flex-row items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <View className="flex-1">
                          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {getClassificationIcon(item.classification)}
                            <Text className={`text-white font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>
                              {item.name}
                            </Text>
                          </View>
                          <Text className="text-indigo-300 text-lg font-semibold mt-1">
                            {currencySymbol} {item.amount.toLocaleString()}
                          </Text>
                          <View className={`flex-row items-center mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {item.classification === 'needs_clarification' ? (
                              <Pressable
                                onPress={() => handleOpenTermModal(item.id)}
                                className={`${getClassificationColor(item.classification)} rounded-full px-3 py-1 active:opacity-80 flex-row items-center`}
                              >
                                <HelpCircle size={12} color="#fcd34d" />
                                <Text className="text-white text-xs capitalize ml-1">
                                  Tap to Clarify
                                </Text>
                              </Pressable>
                            ) : (
                              <View className={`${getClassificationColor(item.classification)} rounded-full px-2 py-0.5`}>
                                <Text className="text-white text-xs capitalize">
                                  {t(item.classification as any)}
                                </Text>
                              </View>
                            )}
                          </View>
                          {item.islamicRuling && (
                            <Text className="text-indigo-400 text-xs mt-2">
                              {item.islamicRuling}
                            </Text>
                          )}
                          {item.classification === 'needs_clarification' && item.clarificationQuestion && (
                            <View className="bg-amber-900/30 rounded-lg p-2 mt-2">
                              <Text className="text-amber-300 text-xs">
                                {item.clarificationQuestion}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Pressable
                          onPress={() => removeLineItem(item.id)}
                          className="p-2"
                        >
                          <Trash2 size={18} color="#f87171" />
                        </Pressable>
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            )}
          </Animated.View>

          {/* Quick Add Common Items */}
          <Animated.View
            entering={FadeInUp.delay(500).springify()}
            className="mx-4 mt-6"
          >
            <Text className={`text-white font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
              Quick Add Common Items
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {commonLineItems.slice(0, 8).map((item) => (
                  <Pressable
                    key={item.name}
                    onPress={() => {
                      setNewItemName(item.name);
                      setShowAddModal(true);
                    }}
                    className="bg-indigo-800/50 rounded-xl px-3 py-2 active:bg-indigo-700"
                  >
                    <Text className="text-indigo-200 text-sm">{item.name}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </Animated.View>
        </ScrollView>

        {/* Next Button */}
        <Animated.View
          entering={FadeInUp.delay(600).springify()}
          className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4"
          style={{
            backgroundColor: 'rgba(30, 27, 75, 0.95)',
          }}
        >
          <Pressable
            onPress={handleNext}
            className="active:scale-[0.98]"
          >
            <LinearGradient
              colors={pendingItems.length > 0 ? ['#f59e0b', '#d97706'] : ['#6366f1', '#4f46e5']}
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
                {pendingItems.length > 0 ? `Answer ${pendingItems.length} Questions` : t('calculate')}
              </Text>
              <ArrowRight
                size={20}
                color="white"
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              />
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Add Item Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View className="flex-1 bg-black/70 justify-center px-6">
            <View className="bg-indigo-900 rounded-2xl p-6">
              <Text className="text-white text-xl font-bold mb-6 text-center">
                Add Line Item
              </Text>

              <Text className="text-white/70 text-sm mb-2">Item Name</Text>
              <TextInput
                value={newItemName}
                onChangeText={setNewItemName}
                placeholder="e.g., Accounts Receivable"
                placeholderTextColor="#6b7280"
                className="bg-indigo-800 rounded-xl px-4 py-3 text-white mb-4"
              />

              <Text className="text-white/70 text-sm mb-2">{t('amount')}</Text>
              <View className="flex-row items-center bg-indigo-800 rounded-xl px-4 py-3 mb-6">
                <Text className="text-indigo-300 mr-2">{currencySymbol}</Text>
                <TextInput
                  value={newItemAmount}
                  onChangeText={setNewItemAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  className="flex-1 text-white"
                />
              </View>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => {
                    setShowAddModal(false);
                    setNewItemName('');
                    setNewItemAmount('');
                  }}
                  className="flex-1 bg-indigo-800 rounded-xl py-3"
                >
                  <Text className="text-white text-center font-medium">{t('cancel')}</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddItem}
                  className="flex-1 bg-indigo-600 rounded-xl py-3"
                >
                  <Text className="text-white text-center font-bold">{t('save')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Term Selection Modal */}
        <Modal
          visible={showTermModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTermModal(false)}
        >
          <View className="flex-1 bg-black/70 justify-center px-6">
            <View className="bg-indigo-900 rounded-2xl p-6">
              <Text className="text-white text-xl font-bold mb-2 text-center">
                Classify This Item
              </Text>
              <Text className="text-indigo-300 text-center mb-6">
                Is this a short-term or long-term holding?
              </Text>

              {/* Short-term Option */}
              <Pressable
                onPress={() => handleSelectTerm('short')}
                className="active:scale-[0.98] mb-3"
              >
                <LinearGradient
                  colors={['#059669', '#047857']}
                  style={{
                    borderRadius: 16,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
                    <Clock size={24} color="white" />
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="text-white font-bold text-lg">Short-term</Text>
                    <Text className="text-emerald-200 text-sm">
                      For trading/selling (Zakatable)
                    </Text>
                  </View>
                </LinearGradient>
              </Pressable>

              {/* Long-term Option */}
              <Pressable
                onPress={() => handleSelectTerm('long')}
                className="active:scale-[0.98] mb-4"
              >
                <LinearGradient
                  colors={['#6b7280', '#4b5563']}
                  style={{
                    borderRadius: 16,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
                    <CalendarDays size={24} color="white" />
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="text-white font-bold text-lg">Long-term</Text>
                    <Text className="text-gray-300 text-sm">
                      Strategic holding (Exempt)
                    </Text>
                  </View>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => setShowTermModal(false)}
                className="bg-indigo-800 rounded-xl py-3"
              >
                <Text className="text-white text-center font-medium">{t('cancel')}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
