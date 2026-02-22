import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, Trash2, Calendar, DollarSign, TrendingUp, X, Check, XCircle } from 'lucide-react-native';
import { useLanguageStore, useZakatHistoryStore, ZakatHistoryEntry } from '@/lib/store';
import { useTranslation } from '@/lib/translations';

export default function ZakatHistoryScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);

  const entries = useZakatHistoryStore((s) => s.entries);
  const removeEntry = useZakatHistoryStore((s) => s.removeEntry);
  const clearHistory = useZakatHistoryStore((s) => s.clearHistory);

  const [showClearModal, setShowClearModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ZakatHistoryEntry | null>(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/calculator-type');
    }
  };

  const handleDeleteEntry = (id: string) => {
    removeEntry(id);
    setSelectedEntry(null);
  };

  const handleClearHistory = () => {
    clearHistory();
    setShowClearModal(false);
  };

  // Group entries by year
  const entriesByYear = entries.reduce((acc, entry) => {
    const year = entry.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(entry);
    return acc;
  }, {} as Record<number, ZakatHistoryEntry[]>);

  const years = Object.keys(entriesByYear).sort((a, b) => Number(b) - Number(a));

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
              Zakat History
            </Text>
          </View>
          {entries.length > 0 && (
            <Pressable
              onPress={() => setShowClearModal(true)}
              className="p-2 rounded-full bg-red-900/30 active:bg-red-900/50"
            >
              <Trash2 size={20} color="#fca5a5" />
            </Pressable>
          )}
        </Animated.View>

        <ScrollView
          className="flex-1 mt-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {entries.length === 0 ? (
            <Animated.View
              entering={FadeInUp.delay(200).springify()}
              className="mx-6 mt-12 items-center"
            >
              <Calendar size={64} color="#6ee7b7" />
              <Text className="text-white text-xl font-bold mt-6 text-center">
                No History Yet
              </Text>
              <Text className="text-emerald-400 text-center mt-2">
                Your saved Zakat calculations will appear here.
              </Text>
              <Pressable
                onPress={() => router.push('/individual/welcome')}
                className="mt-6 bg-emerald-600 rounded-xl px-6 py-3"
              >
                <Text className="text-white font-semibold">Calculate Zakat</Text>
              </Pressable>
            </Animated.View>
          ) : (
            years.map((year, yearIndex) => (
              <Animated.View
                key={year}
                entering={FadeInUp.delay(200 + yearIndex * 100).springify()}
                className="mx-6 mb-6"
              >
                <Text className="text-emerald-400 font-semibold text-sm mb-3">
                  {year}
                </Text>
                <View className="gap-3">
                  {entriesByYear[Number(year)].map((entry) => (
                    <Pressable
                      key={entry.id}
                      onPress={() => setSelectedEntry(entry)}
                      className="active:opacity-80"
                    >
                      <LinearGradient
                        colors={entry.meetsNisab ? ['#065f46', '#064e3b'] : ['#374151', '#1f2937']}
                        style={{ borderRadius: 16, padding: 16 }}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <Text className="text-white font-semibold">{entry.label}</Text>
                            <Text className="text-emerald-400 text-xs mt-1">
                              {new Date(entry.date).toLocaleDateString()} {entry.hijriDate ? `• ${entry.hijriDate}` : ''}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text className="text-white text-lg font-bold">
                              {entry.currencySymbol}{entry.zakatDue.toLocaleString()}
                            </Text>
                            <View className="flex-row items-center mt-1">
                              {entry.meetsNisab ? (
                                <Check size={12} color="#34d399" />
                              ) : (
                                <XCircle size={12} color="#9ca3af" />
                              )}
                              <Text className={`text-xs ml-1 ${entry.meetsNisab ? 'text-emerald-400' : 'text-gray-400'}`}>
                                {entry.meetsNisab ? 'Nisab Met' : 'Below Nisab'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </LinearGradient>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            ))
          )}
        </ScrollView>

        {/* Entry Detail Modal */}
        <Modal
          visible={selectedEntry !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedEntry(null)}
        >
          <Pressable
            className="flex-1 bg-black/70 justify-center px-6"
            onPress={() => setSelectedEntry(null)}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="bg-emerald-900 rounded-2xl p-6">
                {selectedEntry && (
                  <>
                    <View className="flex-row items-center justify-between mb-4">
                      <Text className="text-white text-xl font-bold">{selectedEntry.label}</Text>
                      <Pressable onPress={() => setSelectedEntry(null)}>
                        <X size={20} color="white" />
                      </Pressable>
                    </View>

                    <Text className="text-emerald-400 text-sm mb-4">
                      {new Date(selectedEntry.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      {selectedEntry.hijriDate ? ` • ${selectedEntry.hijriDate}` : ''}
                    </Text>

                    <View className="gap-3">
                      <View className="flex-row justify-between py-2 border-b border-emerald-800/50">
                        <Text className="text-emerald-300">Total Assets</Text>
                        <Text className="text-white font-medium">
                          {selectedEntry.currencySymbol}{selectedEntry.totalAssets.toLocaleString()}
                        </Text>
                      </View>
                      <View className="flex-row justify-between py-2 border-b border-emerald-800/50">
                        <Text className="text-emerald-300">Total Deductions</Text>
                        <Text className="text-white font-medium">
                          -{selectedEntry.currencySymbol}{selectedEntry.totalDeductions.toLocaleString()}
                        </Text>
                      </View>
                      <View className="flex-row justify-between py-2 border-b border-emerald-800/50">
                        <Text className="text-emerald-300">Net Wealth</Text>
                        <Text className="text-white font-medium">
                          {selectedEntry.currencySymbol}{selectedEntry.netWealth.toLocaleString()}
                        </Text>
                      </View>
                      <View className="flex-row justify-between py-2 border-b border-emerald-800/50">
                        <Text className="text-emerald-300">Nisab Threshold</Text>
                        <Text className="text-white font-medium">
                          {selectedEntry.currencySymbol}{selectedEntry.nisabThreshold.toLocaleString()}
                        </Text>
                      </View>
                      <View className="flex-row justify-between py-2">
                        <Text className="text-emerald-300">Calendar Type</Text>
                        <Text className="text-white font-medium">
                          {selectedEntry.calendarType === 'islamic' ? 'Islamic (2.5%)' : 'Western (2.577%)'}
                        </Text>
                      </View>
                    </View>

                    <View className={`mt-4 p-4 rounded-xl ${selectedEntry.meetsNisab ? 'bg-emerald-700/50' : 'bg-gray-700/50'}`}>
                      <Text className={`text-center text-sm ${selectedEntry.meetsNisab ? 'text-emerald-300' : 'text-gray-300'}`}>
                        Zakat Due
                      </Text>
                      <Text className="text-white text-2xl font-bold text-center mt-1">
                        {selectedEntry.currencySymbol}{selectedEntry.zakatDue.toLocaleString()}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => handleDeleteEntry(selectedEntry.id)}
                      className="mt-4 bg-red-900/30 rounded-xl p-3 flex-row items-center justify-center"
                    >
                      <Trash2 size={16} color="#fca5a5" />
                      <Text className="text-red-300 ml-2">Delete Entry</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Clear History Modal */}
        <Modal
          visible={showClearModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowClearModal(false)}
        >
          <View className="flex-1 bg-black/70 justify-center px-6">
            <View className="bg-emerald-900 rounded-2xl p-6">
              <Text className="text-white text-xl font-bold mb-2 text-center">
                Clear All History?
              </Text>
              <Text className="text-emerald-400 text-center mb-6">
                This will permanently delete all your saved Zakat calculations.
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setShowClearModal(false)}
                  className="flex-1 bg-emerald-800 rounded-xl py-3"
                >
                  <Text className="text-white text-center font-medium">{t('cancel')}</Text>
                </Pressable>
                <Pressable
                  onPress={handleClearHistory}
                  className="flex-1 bg-red-600 rounded-xl py-3"
                >
                  <Text className="text-white text-center font-bold">Clear All</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
