import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Mail, Lock, User, ArrowRight, ChevronLeft } from 'lucide-react-native';
import { useAuthStore } from '@/lib/auth-store';
import { useLanguageStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';

type AuthMode = 'login' | 'signup' | 'verify';

export default function AuthScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);

  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const handleGoogleSignIn = async () => {
    // Simulate Google Sign-in with demo data
    // In production, integrate with expo-auth-session for real Google auth
    await signInWithGoogle('user@gmail.com', 'Demo User');
    router.replace('/calculator-type');
  };

  const handleEmailAuth = async () => {
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (mode === 'signup' && !name) {
      setError('Please enter your name');
      return;
    }

    if (mode === 'login') {
      const result = await signInWithEmail(email, password);
      if (result.success) {
        router.replace('/calculator-type');
      } else if (result.needsVerification) {
        setError('Please verify your email first');
        setPendingEmail(email);
        setMode('verify');
      } else {
        setError('Invalid email or password');
      }
    } else if (mode === 'signup') {
      const result = await signUpWithEmail(email, password, name);
      if (result.success && result.verificationSent) {
        setPendingEmail(email);
        setMode('verify');
      } else {
        setError('Email already registered');
      }
    }
  };

  const handleVerification = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    const success = await verifyEmail(verificationCode);
    if (success) {
      // Auto-login after verification
      const result = await signInWithEmail(pendingEmail, password);
      if (result.success) {
        router.replace('/calculator-type');
      }
    } else {
      setError('Invalid verification code');
    }
  };

  const handleBack = () => {
    if (mode === 'verify') {
      setMode('login');
      setVerificationCode('');
    } else {
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-emerald-950">
      <LinearGradient
        colors={['#064e3b', '#022c22', '#011311']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            className={`px-6 pt-4 flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Pressable
              onPress={handleBack}
              className={`p-2 rounded-full bg-white/10 active:bg-white/20 ${isRTL ? 'ml-4' : 'mr-4'}`}
            >
              <ChevronLeft
                size={24}
                color="white"
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              />
            </Pressable>
          </Animated.View>

          <View className="flex-1 px-6 justify-center">
            {/* Logo/Title */}
            <Animated.View
              entering={ZoomIn.delay(200).springify()}
              className="items-center mb-10"
            >
              <View className="w-20 h-20 rounded-full bg-emerald-600/30 items-center justify-center mb-4">
                <Text className="text-4xl">☪</Text>
              </View>
              <Text className="text-white text-2xl font-bold">
                {mode === 'verify' ? 'Verify Email' : mode === 'signup' ? 'Create Account' : 'Welcome Back'}
              </Text>
              <Text className="text-emerald-300 text-center mt-2">
                {mode === 'verify'
                  ? `Enter the code sent to ${pendingEmail}`
                  : mode === 'signup'
                  ? 'Start tracking your Zakat today'
                  : 'Sign in to access your portfolios'}
              </Text>
            </Animated.View>

            {error && (
              <Animated.View
                entering={FadeInDown.springify()}
                className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-4"
              >
                <Text className="text-red-300 text-center">{error}</Text>
              </Animated.View>
            )}

            {mode === 'verify' ? (
              // Verification Code Input
              <Animated.View entering={FadeInUp.delay(300).springify()}>
                <View className="mb-4">
                  <View className="flex-row items-center bg-emerald-900/50 rounded-xl px-4 py-4">
                    <Lock size={20} color="#6ee7b7" />
                    <TextInput
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="#6b7280"
                      keyboardType="number-pad"
                      maxLength={6}
                      className="flex-1 ml-3 text-white text-lg tracking-widest"
                    />
                  </View>
                </View>

                <Pressable
                  onPress={handleVerification}
                  disabled={isLoading}
                  className="active:scale-[0.98]"
                >
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={{
                      borderRadius: 16,
                      padding: 18,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text className="text-white font-bold text-lg mr-2">Verify</Text>
                        <ArrowRight size={20} color="white" />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            ) : (
              <>
                {/* Google Sign In */}
                <Animated.View entering={FadeInUp.delay(300).springify()}>
                  <Pressable
                    onPress={handleGoogleSignIn}
                    disabled={isLoading}
                    className="bg-white rounded-xl p-4 flex-row items-center justify-center active:bg-gray-100 mb-6"
                  >
                    <Text className="text-2xl mr-3">G</Text>
                    <Text className="text-gray-800 font-semibold text-base">
                      Continue with Google
                    </Text>
                  </Pressable>
                </Animated.View>

                {/* Divider */}
                <Animated.View
                  entering={FadeInUp.delay(350).springify()}
                  className="flex-row items-center mb-6"
                >
                  <View className="flex-1 h-px bg-emerald-700/50" />
                  <Text className="text-emerald-400 mx-4">or</Text>
                  <View className="flex-1 h-px bg-emerald-700/50" />
                </Animated.View>

                {/* Email Form */}
                <Animated.View entering={FadeInUp.delay(400).springify()}>
                  {mode === 'signup' && (
                    <View className="mb-4">
                      <View className="flex-row items-center bg-emerald-900/50 rounded-xl px-4 py-4">
                        <User size={20} color="#6ee7b7" />
                        <TextInput
                          value={name}
                          onChangeText={setName}
                          placeholder="Full Name"
                          placeholderTextColor="#6b7280"
                          autoCapitalize="words"
                          className="flex-1 ml-3 text-white text-base"
                        />
                      </View>
                    </View>
                  )}

                  <View className="mb-4">
                    <View className="flex-row items-center bg-emerald-900/50 rounded-xl px-4 py-4">
                      <Mail size={20} color="#6ee7b7" />
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email Address"
                        placeholderTextColor="#6b7280"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="flex-1 ml-3 text-white text-base"
                      />
                    </View>
                  </View>

                  <View className="mb-6">
                    <View className="flex-row items-center bg-emerald-900/50 rounded-xl px-4 py-4">
                      <Lock size={20} color="#6ee7b7" />
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        placeholderTextColor="#6b7280"
                        secureTextEntry
                        className="flex-1 ml-3 text-white text-base"
                      />
                    </View>
                  </View>

                  <Pressable
                    onPress={handleEmailAuth}
                    disabled={isLoading}
                    className="active:scale-[0.98]"
                  >
                    <LinearGradient
                      colors={['#10b981', '#059669']}
                      style={{
                        borderRadius: 16,
                        padding: 18,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <Text className="text-white font-bold text-lg mr-2">
                            {mode === 'signup' ? 'Sign Up' : 'Sign In'}
                          </Text>
                          <ArrowRight size={20} color="white" />
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </Animated.View>

                {/* Toggle Mode */}
                <Animated.View
                  entering={FadeInUp.delay(500).springify()}
                  className="mt-6"
                >
                  <Pressable
                    onPress={() => {
                      setMode(mode === 'login' ? 'signup' : 'login');
                      setError('');
                    }}
                    className="py-2"
                  >
                    <Text className="text-emerald-300 text-center">
                      {mode === 'login'
                        ? "Don't have an account? Sign Up"
                        : 'Already have an account? Sign In'}
                    </Text>
                  </Pressable>
                </Animated.View>

                {/* Skip for now */}
                <Animated.View
                  entering={FadeInUp.delay(550).springify()}
                  className="mt-4"
                >
                  <Pressable
                    onPress={() => router.replace('/calculator-type')}
                    className="py-2"
                  >
                    <Text className="text-emerald-600 text-center text-sm">
                      Continue without account
                    </Text>
                  </Pressable>
                </Animated.View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
