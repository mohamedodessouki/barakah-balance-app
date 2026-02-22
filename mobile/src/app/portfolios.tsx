import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import {
  Plus,
  Building2,
  User,
  ChevronRight,
  Calendar,
  Trash2,
  Edit3,
  Check,
  X,
  Clock,
  ChevronLeft,
} from 'lucide-react-native';
import { useAuthStore, ZakatPortfolio } from '@/lib/auth-store';
import { useLanguageStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';

export default function PortfoliosScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);

  const user = useAuthStore((s) => s.user);
  const portfolios = useAuthStore((s) => s.portfolios);
  const activePortfolioId = useAuthStore((s) => s.activePortfolioId);
  const createPortfolio = useAuthStore((s) => s.createPortfolio);
  const updatePortfolio = useAuthStore((s) => s.updatePortfolio);
  const deletePortfolio = useAuthStore((s) => s.deletePortfolio);
  const setActivePortfolio = useAuthStore((s) => s.setActivePortfolio);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioType, setNewPortfolioType] = useState<'personal' | 'business'>('personal');
  const [companyName, setCompanyName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreatePortfolio = () => {
    if (!newPortfolioName.trim()) return;

    const id = createPortfolio(
      newPortfolioName.trim(),
      newPortfolioType,
      newPortfolioType === 'business' ? companyName : undefined
    );

    setShowCreateModal(false);
    setNewPortfolioName('');
    setCompanyName('');
    setNewPortfolioType('personal');
  };

  const handleSelectPortfolio = (portfolio: ZakatPortfolio) => {
    setActivePortfolio(portfolio.id);
    // Navigate to appropriate calculator
    if (portfolio.type === 'personal') {
      router.push('/individual/welcome');
    } else {
      router.push('/business/welcome');
    }
  };

  const handleViewHistory = (portfolioId: string) => {
    router.push(`/portfolio-history?id=${portfolioId}`);
  };

  const handleStartEdit = (portfolio: ZakatPortfolio) => {
    setEditingId(portfolio.id);
    setEditName(portfolio.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      updatePortfolio(editingId, { name: editName.trim() });
    }
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = () => {
    if (showDeleteModal) {
      deletePortfolio(showDeleteModal);
      setShowDeleteModal(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const personalPortfolios = portfolios.filter((p) => p.type === 'personal');
  const businessPortfolios = portfolios.filter((p) => p.type === 'business');

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
              onPress={() => router.back()}
              className={`p-2 rounded-full bg-white/10 active:bg-white/20 ${isRTL ? 'ml-4' : 'mr-4'}`}
            >
              <ChevronLeft
                size={24}
                color="white"
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              />
            </Pressable>
            <Text className="text-white text-xl font-bold">My Portfolios</Text>
          </View>
          <Pressable
            onPress={() => setShowCreateModal(true)}
            className="bg-emerald-600 rounded-full p-2 active:bg-emerald-700"
          >
            <Plus size={24} color="white" />
          </Pressable>
        </Animated.View>

        {/* User Info */}
        {user && (
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            className="mx-6 mt-4"
          >
            <View className="bg-emerald-900/50 rounded-xl p-4 flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-emerald-600/50 items-center justify-center">
                <User size={24} color="#6ee7b7" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-white font-semibold">{user.displayName}</Text>
                <Text className="text-emerald-300 text-sm">{user.email}</Text>
              </View>
              <View className="bg-emerald-700/50 px-3 py-1 rounded-full">
                <Text className="text-emerald-200 text-xs capitalize">{user.authMethod}</Text>
              </View>
            </View>
          </Animated.View>
        )}

        <ScrollView
          className="flex-1 mt-6"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Personal Portfolios */}
          <Animated.View entering={FadeInUp.delay(300).springify()} className="mx-6 mb-6">
            <View className={`flex-row items-center mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <User size={18} color="#6ee7b7" />
              <Text className={`text-emerald-400 font-semibold ${isRTL ? 'mr-2' : 'ml-2'}`}>
                Personal ({personalPortfolios.length})
              </Text>
            </View>

            {personalPortfolios.length === 0 ? (
              <View className="bg-emerald-900/30 rounded-xl p-6 items-center">
                <Text className="text-emerald-400/50 text-center">
                  No personal portfolios yet
                </Text>
              </View>
            ) : (
              personalPortfolios.map((portfolio, index) => (
                <Animated.View
                  key={portfolio.id}
                  entering={FadeInUp.delay(350 + index * 50).springify()}
                >
                  <Pressable
                    onPress={() => handleSelectPortfolio(portfolio)}
                    className="active:scale-[0.98]"
                  >
                    <LinearGradient
                      colors={
                        activePortfolioId === portfolio.id
                          ? ['#059669', '#047857']
                          : ['#064e3b', '#053326']
                      }
                      style={{
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: activePortfolioId === portfolio.id ? 2 : 0,
                        borderColor: '#10b981',
                      }}
                    >
                      <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <View className="flex-1">
                          {editingId === portfolio.id ? (
                            <View className="flex-row items-center">
                              <TextInput
                                value={editName}
                                onChangeText={setEditName}
                                className="bg-white/20 rounded-lg px-3 py-2 text-white flex-1"
                                autoFocus
                              />
                              <Pressable onPress={handleSaveEdit} className="ml-2 p-2">
                                <Check size={20} color="#10b981" />
                              </Pressable>
                              <Pressable
                                onPress={() => setEditingId(null)}
                                className="ml-1 p-2"
                              >
                                <X size={20} color="#f87171" />
                              </Pressable>
                            </View>
                          ) : (
                            <>
                              <Text className="text-white font-semibold text-lg">
                                {portfolio.name}
                              </Text>
                              <View className="flex-row items-center mt-1">
                                <Calendar size={12} color="#6ee7b7" />
                                <Text className="text-emerald-300 text-xs ml-1">
                                  {formatDate(portfolio.updatedAt)}
                                </Text>
                                {portfolio.calculations.length > 0 && (
                                  <View className="flex-row items-center ml-3">
                                    <Clock size={12} color="#6ee7b7" />
                                    <Text className="text-emerald-300 text-xs ml-1">
                                      {portfolio.calculations.length} calculations
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </>
                          )}
                        </View>
                        {editingId !== portfolio.id && (
                          <View className="flex-row items-center">
                            <Pressable
                              onPress={() => handleStartEdit(portfolio)}
                              className="p-2"
                            >
                              <Edit3 size={18} color="#6ee7b7" />
                            </Pressable>
                            <Pressable
                              onPress={() => setShowDeleteModal(portfolio.id)}
                              className="p-2"
                            >
                              <Trash2 size={18} color="#f87171" />
                            </Pressable>
                            <ChevronRight
                              size={20}
                              color="white"
                              style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
                            />
                          </View>
                        )}
                      </View>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              ))
            )}
          </Animated.View>

          {/* Business Portfolios */}
          <Animated.View entering={FadeInUp.delay(400).springify()} className="mx-6">
            <View className={`flex-row items-center mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Building2 size={18} color="#818cf8" />
              <Text className={`text-indigo-400 font-semibold ${isRTL ? 'mr-2' : 'ml-2'}`}>
                Business ({businessPortfolios.length})
              </Text>
            </View>

            {businessPortfolios.length === 0 ? (
              <View className="bg-indigo-900/30 rounded-xl p-6 items-center">
                <Text className="text-indigo-400/50 text-center">
                  No business portfolios yet
                </Text>
              </View>
            ) : (
              businessPortfolios.map((portfolio, index) => (
                <Animated.View
                  key={portfolio.id}
                  entering={FadeInUp.delay(450 + index * 50).springify()}
                >
                  <Pressable
                    onPress={() => handleSelectPortfolio(portfolio)}
                    className="active:scale-[0.98]"
                  >
                    <LinearGradient
                      colors={
                        activePortfolioId === portfolio.id
                          ? ['#4f46e5', '#4338ca']
                          : ['#312e81', '#252262']
                      }
                      style={{
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: activePortfolioId === portfolio.id ? 2 : 0,
                        borderColor: '#6366f1',
                      }}
                    >
                      <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <View className="flex-1">
                          {editingId === portfolio.id ? (
                            <View className="flex-row items-center">
                              <TextInput
                                value={editName}
                                onChangeText={setEditName}
                                className="bg-white/20 rounded-lg px-3 py-2 text-white flex-1"
                                autoFocus
                              />
                              <Pressable onPress={handleSaveEdit} className="ml-2 p-2">
                                <Check size={20} color="#10b981" />
                              </Pressable>
                              <Pressable
                                onPress={() => setEditingId(null)}
                                className="ml-1 p-2"
                              >
                                <X size={20} color="#f87171" />
                              </Pressable>
                            </View>
                          ) : (
                            <>
                              <Text className="text-white font-semibold text-lg">
                                {portfolio.name}
                              </Text>
                              {portfolio.companyName && (
                                <Text className="text-indigo-300 text-sm">
                                  {portfolio.companyName}
                                </Text>
                              )}
                              <View className="flex-row items-center mt-1">
                                <Calendar size={12} color="#a5b4fc" />
                                <Text className="text-indigo-300 text-xs ml-1">
                                  {formatDate(portfolio.updatedAt)}
                                </Text>
                                {portfolio.calculations.length > 0 && (
                                  <View className="flex-row items-center ml-3">
                                    <Clock size={12} color="#a5b4fc" />
                                    <Text className="text-indigo-300 text-xs ml-1">
                                      {portfolio.calculations.length} calculations
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </>
                          )}
                        </View>
                        {editingId !== portfolio.id && (
                          <View className="flex-row items-center">
                            <Pressable
                              onPress={() => handleStartEdit(portfolio)}
                              className="p-2"
                            >
                              <Edit3 size={18} color="#a5b4fc" />
                            </Pressable>
                            <Pressable
                              onPress={() => setShowDeleteModal(portfolio.id)}
                              className="p-2"
                            >
                              <Trash2 size={18} color="#f87171" />
                            </Pressable>
                            <ChevronRight
                              size={20}
                              color="white"
                              style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
                            />
                          </View>
                        )}
                      </View>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              ))
            )}
          </Animated.View>
        </ScrollView>

        {/* Create Portfolio Modal */}
        <Modal
          visible={showCreateModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View className="flex-1 bg-black/70 justify-center px-6">
            <View className="bg-emerald-900 rounded-2xl p-6">
              <Text className="text-white text-xl font-bold mb-6 text-center">
                Create New Portfolio
              </Text>

              {/* Portfolio Type Selection */}
              <Text className="text-emerald-300 text-sm mb-2">Portfolio Type</Text>
              <View className="flex-row gap-3 mb-4">
                <Pressable
                  onPress={() => setNewPortfolioType('personal')}
                  className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
                    newPortfolioType === 'personal' ? 'bg-emerald-600' : 'bg-emerald-800'
                  }`}
                >
                  <User size={18} color="white" />
                  <Text className="text-white ml-2 font-medium">Personal</Text>
                </Pressable>
                <Pressable
                  onPress={() => setNewPortfolioType('business')}
                  className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
                    newPortfolioType === 'business' ? 'bg-indigo-600' : 'bg-emerald-800'
                  }`}
                >
                  <Building2 size={18} color="white" />
                  <Text className="text-white ml-2 font-medium">Business</Text>
                </Pressable>
              </View>

              {/* Portfolio Name */}
              <Text className="text-emerald-300 text-sm mb-2">Portfolio Name</Text>
              <TextInput
                value={newPortfolioName}
                onChangeText={setNewPortfolioName}
                placeholder="e.g., My 2024 Zakat"
                placeholderTextColor="#6b7280"
                className="bg-emerald-800 rounded-xl px-4 py-3 text-white mb-4"
              />

              {/* Company Name (for business) */}
              {newPortfolioType === 'business' && (
                <>
                  <Text className="text-emerald-300 text-sm mb-2">Company Name (Optional)</Text>
                  <TextInput
                    value={companyName}
                    onChangeText={setCompanyName}
                    placeholder="e.g., ABC Trading LLC"
                    placeholderTextColor="#6b7280"
                    className="bg-emerald-800 rounded-xl px-4 py-3 text-white mb-4"
                  />
                </>
              )}

              {/* Buttons */}
              <View className="flex-row gap-3 mt-2">
                <Pressable
                  onPress={() => setShowCreateModal(false)}
                  className="flex-1 bg-emerald-800 rounded-xl py-3"
                >
                  <Text className="text-white text-center font-medium">{t('cancel')}</Text>
                </Pressable>
                <Pressable
                  onPress={handleCreatePortfolio}
                  className="flex-1 bg-emerald-600 rounded-xl py-3"
                >
                  <Text className="text-white text-center font-bold">Create</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={!!showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(null)}
        >
          <View className="flex-1 bg-black/70 justify-center px-6">
            <View className="bg-emerald-900 rounded-2xl p-6">
              <Text className="text-white text-xl font-bold mb-4 text-center">
                Delete Portfolio?
              </Text>
              <Text className="text-emerald-300 text-center mb-6">
                This will permanently delete this portfolio and all its calculation history.
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setShowDeleteModal(null)}
                  className="flex-1 bg-emerald-800 rounded-xl py-3"
                >
                  <Text className="text-white text-center font-medium">{t('cancel')}</Text>
                </Pressable>
                <Pressable
                  onPress={handleDelete}
                  className="flex-1 bg-red-600 rounded-xl py-3"
                >
                  <Text className="text-white text-center font-bold">Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
