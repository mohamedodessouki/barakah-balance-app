import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { ChevronLeft, Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react-native';
import { useLanguageStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `You are a knowledgeable Islamic scholar assistant specialized in Zakat calculations following AAOIFI (Accounting and Auditing Organization for Islamic Financial Institutions) standards.

Your expertise includes:
- AAOIFI FAS 9 (Zakat) standards
- Nisab thresholds (85 grams of gold)
- Zakat rates (2.5% lunar / 2.577% solar calendar)
- Classification of assets: zakatable, exempt, deductible
- Business zakat (commercial zakat) calculations
- Individual zakat on personal wealth
- Gold and silver zakat rules
- Agricultural zakat (Ushr)
- Livestock zakat
- Trade goods (Urud al-Tijarah)
- Islamic financing vs conventional loans treatment

Guidelines:
1. Always cite AAOIFI standards when applicable
2. Provide clear, practical guidance
3. Acknowledge scholarly differences where they exist
4. Recommend consulting a local scholar for complex cases
5. Be respectful and use Islamic greetings
6. Keep responses concise but comprehensive
7. Use examples when helpful

You must ONLY answer questions related to:
- Zakat calculation methods
- AAOIFI standards interpretation
- Islamic finance principles related to zakat
- Asset classification for zakat purposes
- Hawl (lunar year) requirements
- Nisab thresholds

If asked about unrelated topics, politely redirect to zakat-related questions.`;

const SAMPLE_QUESTIONS = [
  'What is the Nisab threshold?',
  'How do I calculate zakat on gold jewelry?',
  'Is zakat due on my primary home?',
  'What assets are exempt from zakat?',
  'How does business zakat work?',
  'What is the difference between Islamic and conventional loans for zakat?',
];

export default function ZakatChatbotScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const { t, isRTL } = useTranslation(language);
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: language === 'ar'
        ? 'السلام عليكم ورحمة الله وبركاته! أنا مساعدك في حساب الزكاة وفقاً لمعايير أيوفي. كيف يمكنني مساعدتك اليوم؟'
        : 'Assalamu Alaikum! I am your Zakat consultation assistant, specializing in AAOIFI standards. How may I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-5.2',
          input: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content: text.trim() },
          ],
        }),
      });

      const data = await response.json();

      const assistantContent = data.output_text ||
        data.output?.[0]?.content?.[0]?.text ||
        'I apologize, I was unable to process your question. Please try again.';

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'I apologize, there was an error processing your question. Please check your internet connection and try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: generateId(),
        role: 'assistant',
        content: language === 'ar'
          ? 'السلام عليكم ورحمة الله وبركاته! أنا مساعدك في حساب الزكاة وفقاً لمعايير أيوفي. كيف يمكنني مساعدتك اليوم؟'
          : 'Assalamu Alaikum! I am your Zakat consultation assistant, specializing in AAOIFI standards. How may I help you today?',
        timestamp: new Date(),
      },
    ]);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

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
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-emerald-600 items-center justify-center">
                <Bot size={20} color="white" />
              </View>
              <View className={isRTL ? 'mr-3' : 'ml-3'}>
                <Text className="text-white font-semibold">
                  {language === 'ar' ? 'مساعد الزكاة' : 'Zakat Assistant'}
                </Text>
                <Text className="text-emerald-400 text-xs">AAOIFI Standards</Text>
              </View>
            </View>
          </View>
          <Pressable
            onPress={clearChat}
            className="p-2 rounded-full bg-white/10 active:bg-white/20"
          >
            <RefreshCw size={20} color="#6ee7b7" />
          </Pressable>
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          keyboardVerticalOffset={0}
        >
          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-4 pt-4"
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message, index) => (
              <Animated.View
                key={message.id}
                entering={FadeInUp.delay(index * 50).springify()}
                className={`mb-4 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <View
                  className={`max-w-[85%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-emerald-600 rounded-tr-none'
                      : 'bg-emerald-900/70 rounded-tl-none'
                  }`}
                >
                  <View className={`flex-row items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {message.role === 'assistant' && (
                      <View className={`w-6 h-6 rounded-full bg-emerald-600/50 items-center justify-center ${isRTL ? 'ml-2' : 'mr-2'}`}>
                        <Sparkles size={12} color="#6ee7b7" />
                      </View>
                    )}
                    <Text
                      className={`flex-1 text-white text-sm leading-5 ${
                        isRTL ? 'text-right' : ''
                      }`}
                    >
                      {message.content}
                    </Text>
                  </View>
                </View>
                <Text className="text-emerald-600 text-xs mt-1 mx-2">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </Animated.View>
            ))}

            {isLoading && (
              <Animated.View
                entering={FadeIn.springify()}
                className="items-start mb-4"
              >
                <View className="bg-emerald-900/70 rounded-2xl rounded-tl-none p-4">
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="#6ee7b7" />
                    <Text className="text-emerald-300 ml-3 text-sm">Thinking...</Text>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Sample Questions (show only at start) */}
            {messages.length === 1 && (
              <Animated.View
                entering={FadeInUp.delay(300).springify()}
                className="mt-4"
              >
                <Text className="text-emerald-400 text-sm mb-3 px-2">
                  {language === 'ar' ? 'أسئلة مقترحة:' : 'Suggested questions:'}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {SAMPLE_QUESTIONS.map((question, index) => (
                    <Pressable
                      key={index}
                      onPress={() => sendMessage(question)}
                      className="bg-emerald-800/50 rounded-xl px-4 py-2 active:bg-emerald-800"
                    >
                      <Text className="text-emerald-200 text-sm">{question}</Text>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            )}
          </ScrollView>

          {/* Input Area */}
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            className="px-4 pb-4 pt-2"
          >
            <View className="flex-row items-end gap-3">
              <View className="flex-1 bg-emerald-900/70 rounded-2xl px-4 py-3 max-h-32">
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder={
                    language === 'ar'
                      ? 'اكتب سؤالك عن الزكاة...'
                      : 'Ask about Zakat...'
                  }
                  placeholderTextColor="#6b7280"
                  multiline
                  className={`text-white text-base ${isRTL ? 'text-right' : ''}`}
                  style={{ maxHeight: 100, textAlign: isRTL ? 'right' : 'left' }}
                  onSubmitEditing={() => sendMessage(inputText)}
                />
              </View>
              <Pressable
                onPress={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isLoading}
                className={`p-4 rounded-full ${
                  inputText.trim() && !isLoading
                    ? 'bg-emerald-600 active:bg-emerald-700'
                    : 'bg-emerald-800/50'
                }`}
              >
                <Send
                  size={20}
                  color={inputText.trim() && !isLoading ? 'white' : '#6b7280'}
                />
              </Pressable>
            </View>

            {/* Disclaimer */}
            <Text className="text-emerald-700 text-xs text-center mt-3 px-4">
              {language === 'ar'
                ? 'هذا المساعد يقدم إرشادات عامة. يُرجى استشارة عالم شرعي للمسائل المعقدة.'
                : 'This assistant provides general guidance. Please consult a qualified scholar for complex matters.'}
            </Text>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
