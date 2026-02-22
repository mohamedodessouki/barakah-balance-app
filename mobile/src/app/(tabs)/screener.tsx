import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import {
  ScanSearch,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  BookOpen,
  Clock,
  Camera,
  Type,
  ClipboardList,
  ImageIcon,
  AlertCircle,
  X,
  Trash2,
  TrendingUp,
  ArrowRight,
} from 'lucide-react-native';
import { useLanguageStore } from '@/lib/store';
import {
  useScreenerStore,
  ScreenerResult,
  ProductCategory,
  ComplianceLevel,
  ComplianceIssue,
} from '@/lib/screener-store';
import {
  HALAL_INVESTMENTS,
  HalalInvestment,
} from '@/lib/investments-data';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

// ─── Constants ───────────────────────────────────────────────────────────────

type InputMode = 'form' | 'text' | 'camera';
type ScreenView = 'input' | 'results' | 'history';

interface CategoryOption {
  value: ProductCategory;
  labelEn: string;
  labelAr: string;
  emoji: string;
}

const PRODUCT_CATEGORIES: CategoryOption[] = [
  { value: 'savings', labelEn: 'Savings', labelAr: 'توفير', emoji: '🏦' },
  { value: 'credit_card', labelEn: 'Credit Card', labelAr: 'بطاقة ائتمان', emoji: '💳' },
  { value: 'mortgage', labelEn: 'Mortgage', labelAr: 'رهن عقاري', emoji: '🏠' },
  { value: 'auto_loan', labelEn: 'Auto Loan', labelAr: 'تمويل سيارة', emoji: '🚗' },
  { value: 'personal_loan', labelEn: 'Personal Loan', labelAr: 'قرض شخصي', emoji: '💰' },
  { value: 'investment', labelEn: 'Investment', labelAr: 'استثمار', emoji: '📈' },
  { value: 'insurance', labelEn: 'Insurance', labelAr: 'تأمين', emoji: '🛡' },
  { value: 'pension', labelEn: 'Pension', labelAr: 'تقاعد', emoji: '👴' },
];

// ─── System Prompt ───────────────────────────────────────────────────────────

const SCREENER_SYSTEM_PROMPT = `You are an expert Islamic finance Sharia compliance specialist with deep knowledge of AAOIFI Shariah Standards and Islamic finance product structures.

Your task is to analyze financial products and determine their Sharia compliance. Products may include: bank accounts, savings plans, credit cards, mortgages, auto loans, personal loans, investments, insurance, and pension plans.

## CORE PROHIBITIONS TO ASSESS

1. **Riba (Interest/Usury)** — Any predetermined return on loans or deposits based on interest (SS 19, SS 3, SS 28)
2. **Gharar (Excessive Uncertainty)** — Unclear contract terms, hidden fees, speculative structures (SS 47, SS 36)
3. **Maysir (Gambling/Speculation)** — Highly speculative products, derivatives without underlying assets (SS 27, SS 51)
4. **Jahalah (Ignorance)** — Lack of transparency in pricing or terms (SS 47, SS 29)
5. **Prohibited Sectors** — Involvement with alcohol, tobacco, weapons, pork, conventional finance intermediation (SS 50, SS 21)

## AAOIFI STANDARDS BY PRODUCT TYPE

- **Savings/Deposits**: SS 8 (Murabaha), SS 19 (Qard), SS 13 (Mudarabah), SS 40 (Distribution of Profit)
- **Credit Cards**: SS 2 (Credit Cards), SS 8 (Murabaha), SS 3 (Default in Payment)
- **Mortgages/Home Finance**: SS 9 (Ijarah), SS 8 (Murabaha), SS 12 (Musharakah Diminishing), SS 39 (Mortgage)
- **Auto Loans**: SS 9 (Ijarah Muntahia Bittamleek), SS 8 (Murabaha)
- **Personal Loans**: SS 19 (Qard), SS 20 (Commodity Trading / Tawarruq), SS 30 (Monetization)
- **Investments**: SS 12 (Musharakah), SS 13 (Mudarabah), SS 17 (Investment Sukuk), SS 21 (Financial Papers)
- **Insurance**: SS 26 (Islamic Insurance / Takaful), SS 41 (Islamic Reinsurance)
- **Pensions**: SS 13 (Mudarabah), SS 46 (Wakalah Bi Al-Istithmar), SS 23 (Agency)

## SCORING GUIDELINES

- **80-100 (Halal)**: Fully Sharia-compliant or only minor technical observations. No Riba, Gharar, or Maysir present. Proper Islamic contract structure.
- **50-79 (Questionable)**: Significant concerns but may be acceptable with modifications. Mixed elements or unclear structures.
- **0-49 (Haram)**: Contains critical Sharia violations such as Riba (interest), Maysir (gambling), or involvement in prohibited sectors. Fundamentally non-compliant.

## RESPONSE FORMAT

You MUST respond in valid JSON only, no other text before or after:
{
  "score": <number 0-100>,
  "complianceLevel": "<halal|questionable|haram>",
  "productCategory": "<savings|investment|credit_card|mortgage|auto_loan|personal_loan|insurance|pension|unknown>",
  "productName": "<identified or provided product name>",
  "summary": "<2-3 sentence overview of the compliance status>",
  "complianceIssues": [
    {
      "issue": "<violation type, e.g. Riba (Interest), Gharar (Uncertainty)>",
      "detail": "<specific explanation about this product>",
      "standard": "<AAOIFI standard reference, e.g. SS 19 - Loan (Qard)>",
      "severity": "<critical|major|minor>"
    }
  ],
  "suggestedIslamicAlternative": "<explanation of the halal structure that would replace this product, e.g. 'This product could be restructured as a Murabaha facility where the bank purchases the asset and sells it at a disclosed markup...'>",
  "overallAssessment": "<detailed paragraph about compliance status and what makes this product compliant or non-compliant>"
}

If the product is fully halal, complianceIssues should contain positive observations with severity "minor".
Respond in the same language as the input (Arabic or English).`;

// ─── Alternative Matching ────────────────────────────────────────────────────

function suggestAlternatives(category: ProductCategory): HalalInvestment[] {
  switch (category) {
    case 'savings':
      return HALAL_INVESTMENTS.filter(
        (inv) => inv.sector === 'Savings' || (inv.contractType === 'Murabaha' && inv.riskLevel === 'Low')
      );
    case 'investment':
      return HALAL_INVESTMENTS.filter((inv) =>
        ['Fixed Income', 'Equities', 'Multi-Asset', 'Venture Capital'].includes(inv.sector)
      );
    case 'mortgage':
      return HALAL_INVESTMENTS.filter(
        (inv) => inv.sector === 'Real Estate' || (inv.contractType === 'Ijarah' && inv.sector !== 'Consumer Finance')
      );
    case 'auto_loan':
      return HALAL_INVESTMENTS.filter((inv) => inv.sector === 'Consumer Finance');
    case 'credit_card':
    case 'personal_loan':
      return HALAL_INVESTMENTS.filter(
        (inv) => inv.contractType === 'Murabaha' && inv.riskLevel === 'Low'
      );
    case 'pension':
      return HALAL_INVESTMENTS.filter(
        (inv) => inv.contractType === 'Mudarabah' || inv.contractType === 'Wakalah'
      );
    case 'insurance':
      return []; // No takaful products in database yet
    default:
      return HALAL_INVESTMENTS.filter((inv) => inv.riskLevel === 'Low').slice(0, 3);
  }
}

// ─── Score Circle ────────────────────────────────────────────────────────────

function ScoreCircle({ score, size = 'large' }: { score: number; size?: 'large' | 'small' }) {
  const color = score >= 80 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171';
  const isLarge = size === 'large';

  return (
    <View
      className={`rounded-full items-center justify-center ${isLarge ? 'w-28 h-28' : 'w-10 h-10'}`}
      style={{ borderWidth: isLarge ? 4 : 2, borderColor: color }}
    >
      <Text style={{ color, fontSize: isLarge ? 32 : 14, fontWeight: '800' }}>{score}</Text>
      {isLarge && <Text className="text-emerald-300/40 text-xs">/ 100</Text>}
    </View>
  );
}

// ─── Compliance Badge ────────────────────────────────────────────────────────

function ComplianceBadge({ level, language }: { level: ComplianceLevel; language: string | null }) {
  const config = {
    halal: { bg: 'bg-emerald-600/30', text: 'text-emerald-400', labelEn: 'Halal', labelAr: 'حلال', icon: ShieldCheck },
    questionable: { bg: 'bg-amber-600/30', text: 'text-amber-400', labelEn: 'Questionable', labelAr: 'مشكوك فيه', icon: ShieldAlert },
    haram: { bg: 'bg-red-600/30', text: 'text-red-400', labelEn: 'Haram', labelAr: 'محظور', icon: ShieldX },
  };
  const c = config[level];
  const Icon = c.icon;

  return (
    <View className={`flex-row items-center px-3 py-1.5 rounded-full ${c.bg}`}>
      <Icon size={14} color={level === 'halal' ? '#34d399' : level === 'questionable' ? '#fbbf24' : '#f87171'} />
      <Text className={`text-sm font-semibold ml-1.5 ${c.text}`}>
        {language === 'ar' ? c.labelAr : c.labelEn}
      </Text>
    </View>
  );
}

// ─── Severity Badge ──────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    critical: { bg: 'bg-red-600/30', text: 'text-red-400' },
    major: { bg: 'bg-amber-600/30', text: 'text-amber-400' },
    minor: { bg: 'bg-emerald-600/30', text: 'text-emerald-400' },
  };
  const c = colors[severity] ?? colors.minor;
  return (
    <View className={`px-2 py-0.5 rounded-full ${c.bg}`}>
      <Text className={`text-xs font-medium capitalize ${c.text}`}>{severity}</Text>
    </View>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ScreenerTab() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const isAr = language === 'ar';

  const screeningHistory = useScreenerStore((s) => s.screeningHistory);
  const addScreening = useScreenerStore((s) => s.addScreening);
  const removeScreening = useScreenerStore((s) => s.removeScreening);

  const [view, setView] = useState<ScreenView>('input');
  const [inputMode, setInputMode] = useState<InputMode>('form');

  // Form state
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [productName, setProductName] = useState('');
  const [provider, setProvider] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [fees, setFees] = useState('');
  const [terms, setTerms] = useState('');

  // Text/Camera state
  const [freeText, setFreeText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScreenerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);

  // Pulse animation
  const pulseAnim = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseAnim.value }));

  // ─── Derived ───────────────────────────────────────────────────────

  const alternatives = result ? suggestAlternatives(result.productCategory) : [];

  const hasFormInput = selectedCategory !== null && (productName.trim() || provider.trim() || interestRate.trim());
  const hasTextInput = freeText.trim().length > 0;
  const hasCameraInput = imageUri !== null;
  const hasInput =
    (inputMode === 'form' && hasFormInput) ||
    (inputMode === 'text' && hasTextInput) ||
    (inputMode === 'camera' && hasCameraInput);

  // ─── Camera ────────────────────────────────────────────────────────

  const pickImage = useCallback(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError(isAr ? 'يجب منح صلاحية الكاميرا' : 'Camera permission required');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!res.canceled && res.assets?.[0]) {
      setImageUri(res.assets[0].uri);
    }
  }, [isAr]);

  const pickFromGallery = useCallback(async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled && res.assets?.[0]) {
      setImageUri(res.assets[0].uri);
    }
  }, []);

  // ─── Analyze ───────────────────────────────────────────────────────

  const analyzeProduct = useCallback(async () => {
    setError(null);
    setResult(null);
    setIsAnalyzing(true);

    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );

    try {
      const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error(isAr ? 'مفتاح API غير مهيأ' : 'API key not configured');

      const content: Array<Record<string, unknown>> = [];

      if (inputMode === 'form') {
        const catLabel = PRODUCT_CATEGORIES.find((c) => c.value === selectedCategory);
        const formText = [
          `Product Category: ${catLabel?.labelEn ?? selectedCategory}`,
          productName && `Product Name: ${productName}`,
          provider && `Provider/Bank: ${provider}`,
          interestRate && `Interest/Profit Rate: ${interestRate}`,
          fees && `Fees: ${fees}`,
          terms && `Terms & Conditions: ${terms}`,
        ]
          .filter(Boolean)
          .join('\n');

        content.push({
          type: 'text',
          text: `Please screen this financial product for Sharia compliance:\n\n${formText}`,
        });
      } else if (inputMode === 'text') {
        content.push({
          type: 'text',
          text: `Please screen this financial product for Sharia compliance:\n\n${freeText}`,
        });
      } else if (inputMode === 'camera' && imageUri) {
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const mimeType = imageUri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        content.push({
          type: 'image',
          source: { type: 'base64', media_type: mimeType, data: base64 },
        });
        content.push({
          type: 'text',
          text: 'Please screen this financial product brochure/document for Sharia compliance. Extract the product details and analyze them.',
        });
      }

      if (content.length === 0) {
        throw new Error(isAr ? 'يرجى إدخال تفاصيل المنتج' : 'Please enter product details');
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 4096,
          system: SCREENER_SYSTEM_PROMPT,
          messages: [{ role: 'user', content }],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          (errData as Record<string, Record<string, string>>)?.error?.message || `API error: ${response.status}`
        );
      }

      const data = await response.json();
      const text = (data as { content: Array<{ type: string; text: string }> }).content?.[0]?.text ?? '';

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error(isAr ? 'لم يتم العثور على نتائج' : 'No results found');

      const parsed = JSON.parse(jsonMatch[0]) as ScreenerResult;

      // Ensure defaults
      parsed.complianceIssues = parsed.complianceIssues ?? [];
      parsed.productCategory = parsed.productCategory ?? 'unknown';
      parsed.complianceLevel = parsed.complianceLevel ?? (parsed.score >= 80 ? 'halal' : parsed.score >= 50 ? 'questionable' : 'haram');

      setResult(parsed);
      setView('results');

      // Auto-save to history
      addScreening({
        date: new Date().toISOString(),
        inputMode,
        productName: parsed.productName || productName || 'Unknown Product',
        productCategory: parsed.productCategory,
        score: parsed.score,
        complianceLevel: parsed.complianceLevel,
        result: parsed,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsAnalyzing(false);
      pulseAnim.value = 1;
    }
  }, [inputMode, selectedCategory, productName, provider, interestRate, fees, terms, freeText, imageUri, isAr, pulseAnim, addScreening]);

  // ─── Reset ─────────────────────────────────────────────────────────

  const resetAll = () => {
    setView('input');
    setResult(null);
    setError(null);
    setExpandedIssue(null);
    setSelectedCategory(null);
    setProductName('');
    setProvider('');
    setInterestRate('');
    setFees('');
    setTerms('');
    setFreeText('');
    setImageUri(null);
  };

  // ─── View from history ─────────────────────────────────────────────

  const viewHistoryItem = (record: (typeof screeningHistory)[0]) => {
    setResult(record.result);
    setView('results');
  };

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-emerald-950">
      <LinearGradient
        colors={['#064e3b', '#022c22', '#011311']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <SafeAreaView className="flex-1" edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View className="px-6 pt-4 pb-2 flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-white text-xl font-bold">
                  {isAr ? 'فاحص المنتجات' : 'Product Screener'}
                </Text>
                <Text className="text-emerald-400/60 text-sm mt-1">
                  {isAr
                    ? 'افحص أي منتج مالي للتوافق مع الشريعة'
                    : 'Check any financial product for Sharia compliance'}
                </Text>
              </View>
              {view !== 'history' && (
                <Pressable
                  onPress={() => setView('history')}
                  className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl p-2.5"
                >
                  <Clock size={18} color="#6ee7b7" />
                </Pressable>
              )}
              {view === 'history' && (
                <Pressable
                  onPress={() => setView('input')}
                  className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl p-2.5"
                >
                  <X size={18} color="#6ee7b7" />
                </Pressable>
              )}
            </View>

            {/* ═══════════ INPUT VIEW ═══════════ */}
            {view === 'input' && (
              <Animated.View entering={FadeInUp.delay(100).springify()} className="mx-6 mt-4">
                {/* Mode Tabs */}
                <View className="flex-row bg-emerald-900/40 rounded-xl p-1 mb-4">
                  {([
                    { mode: 'form' as InputMode, icon: <ClipboardList size={16} />, label: isAr ? 'نموذج' : 'Form' },
                    { mode: 'text' as InputMode, icon: <Type size={16} />, label: isAr ? 'نص' : 'Text' },
                    { mode: 'camera' as InputMode, icon: <Camera size={16} />, label: isAr ? 'كاميرا' : 'Camera' },
                  ]).map((tab) => (
                    <Pressable
                      key={tab.mode}
                      onPress={() => setInputMode(tab.mode)}
                      className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ${
                        inputMode === tab.mode ? 'bg-emerald-600' : ''
                      }`}
                    >
                      {React.cloneElement(tab.icon, {
                        color: inputMode === tab.mode ? 'white' : '#6b7280',
                      })}
                      <Text
                        className={`text-sm ml-1.5 font-medium ${
                          inputMode === tab.mode ? 'text-white' : 'text-gray-500'
                        }`}
                      >
                        {tab.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* ─── Form Mode ─────────────────────────────────────── */}
                {inputMode === 'form' && (
                  <View>
                    {/* Category Chips */}
                    <Text className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      {isAr ? 'نوع المنتج' : 'Product Type'}
                    </Text>
                    <View className="flex-row flex-wrap mb-4">
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <Pressable
                          key={cat.value}
                          onPress={() => setSelectedCategory(cat.value)}
                          className={`mr-2 mb-2 px-3 py-2 rounded-full border flex-row items-center ${
                            selectedCategory === cat.value
                              ? 'bg-emerald-600 border-emerald-500'
                              : 'bg-emerald-900/40 border-emerald-700/50'
                          }`}
                        >
                          <Text className="text-sm mr-1">{cat.emoji}</Text>
                          <Text
                            className={`text-xs font-medium ${
                              selectedCategory === cat.value ? 'text-white' : 'text-emerald-300/60'
                            }`}
                          >
                            {isAr ? cat.labelAr : cat.labelEn}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    {/* Form Fields */}
                    <View className="gap-3">
                      <View>
                        <Text className="text-emerald-300/60 text-xs mb-1">
                          {isAr ? 'اسم المنتج' : 'Product Name'}
                        </Text>
                        <TextInput
                          value={productName}
                          onChangeText={setProductName}
                          placeholder={isAr ? 'مثال: بطاقة فيزا بلاتينيوم' : 'e.g. Visa Platinum Card'}
                          placeholderTextColor="#6b7280"
                          className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl px-4 py-3 text-white text-sm"
                        />
                      </View>
                      <View>
                        <Text className="text-emerald-300/60 text-xs mb-1">
                          {isAr ? 'الجهة المقدمة' : 'Provider / Bank'}
                        </Text>
                        <TextInput
                          value={provider}
                          onChangeText={setProvider}
                          placeholder={isAr ? 'مثال: بنك الراجحي' : 'e.g. Chase Bank'}
                          placeholderTextColor="#6b7280"
                          className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl px-4 py-3 text-white text-sm"
                        />
                      </View>
                      <View>
                        <Text className="text-emerald-300/60 text-xs mb-1">
                          {isAr ? 'معدل الفائدة / الربح' : 'Interest / Profit Rate'}
                        </Text>
                        <TextInput
                          value={interestRate}
                          onChangeText={setInterestRate}
                          placeholder={isAr ? 'مثال: 24.99% سنوياً' : 'e.g. 24.99% APR'}
                          placeholderTextColor="#6b7280"
                          keyboardType="default"
                          className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl px-4 py-3 text-white text-sm"
                        />
                      </View>
                      <View>
                        <Text className="text-emerald-300/60 text-xs mb-1">
                          {isAr ? 'الرسوم' : 'Fees'}
                        </Text>
                        <TextInput
                          value={fees}
                          onChangeText={setFees}
                          placeholder={isAr ? 'مثال: رسوم سنوية 500 ريال' : 'e.g. $95 annual fee'}
                          placeholderTextColor="#6b7280"
                          className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl px-4 py-3 text-white text-sm"
                        />
                      </View>
                      <View>
                        <Text className="text-emerald-300/60 text-xs mb-1">
                          {isAr ? 'الشروط والتفاصيل' : 'Terms & Additional Details'}
                        </Text>
                        <TextInput
                          value={terms}
                          onChangeText={setTerms}
                          placeholder={
                            isAr
                              ? 'أي تفاصيل إضافية عن المنتج...'
                              : 'Any additional product details...'
                          }
                          placeholderTextColor="#6b7280"
                          multiline
                          numberOfLines={3}
                          className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl px-4 py-3 text-white text-sm"
                          style={{ minHeight: 80, textAlignVertical: 'top' }}
                        />
                      </View>
                    </View>
                  </View>
                )}

                {/* ─── Text Mode ─────────────────────────────────────── */}
                {inputMode === 'text' && (
                  <View className="bg-emerald-900/30 border border-emerald-800/30 rounded-xl p-3">
                    <TextInput
                      value={freeText}
                      onChangeText={setFreeText}
                      placeholder={
                        isAr
                          ? 'الصق وصف المنتج أو شروطه هنا...'
                          : 'Paste product description or terms here...'
                      }
                      placeholderTextColor="#6b7280"
                      multiline
                      numberOfLines={8}
                      className="text-white text-sm"
                      style={{ minHeight: 150, textAlignVertical: 'top' }}
                    />
                  </View>
                )}

                {/* ─── Camera Mode ───────────────────────────────────── */}
                {inputMode === 'camera' && (
                  <View>
                    {imageUri ? (
                      <View className="relative">
                        <Image
                          source={{ uri: imageUri }}
                          style={{ width: '100%', height: 200, borderRadius: 12 }}
                          resizeMode="cover"
                        />
                        <Pressable
                          onPress={() => setImageUri(null)}
                          className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5"
                        >
                          <X size={16} color="white" />
                        </Pressable>
                      </View>
                    ) : (
                      <View className="gap-3">
                        <Pressable
                          onPress={pickImage}
                          className="bg-emerald-900/30 border border-emerald-800/30 rounded-xl p-6 items-center"
                        >
                          <Camera size={32} color="#34d399" />
                          <Text className="text-emerald-300 text-sm mt-2 font-medium">
                            {isAr ? 'التقط صورة' : 'Take Photo'}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={pickFromGallery}
                          className="bg-emerald-900/30 border border-emerald-800/30 rounded-xl p-6 items-center"
                        >
                          <ImageIcon size={32} color="#34d399" />
                          <Text className="text-emerald-300 text-sm mt-2 font-medium">
                            {isAr ? 'اختر من المعرض' : 'Choose from Gallery'}
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                )}

                {/* Error */}
                {error && (
                  <View className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 mt-3 flex-row items-start">
                    <AlertCircle size={16} color="#f87171" style={{ marginTop: 2 }} />
                    <Text className="text-red-300 text-sm ml-2 flex-1">{error}</Text>
                  </View>
                )}

                {/* Analyze Button */}
                <Pressable
                  onPress={analyzeProduct}
                  disabled={!hasInput || isAnalyzing}
                  style={{ opacity: hasInput && !isAnalyzing ? 1 : 0.4 }}
                  className="mt-4 rounded-2xl overflow-hidden"
                >
                  <LinearGradient
                    colors={['#059669', '#047857']}
                    style={{
                      paddingVertical: 16,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}
                  >
                    {isAnalyzing ? (
                      <Animated.View style={pulseStyle} className="flex-row items-center">
                        <ActivityIndicator size="small" color="white" />
                        <Text className="text-white text-base font-semibold ml-2">
                          {isAr ? 'جاري الفحص...' : 'Screening...'}
                        </Text>
                      </Animated.View>
                    ) : (
                      <>
                        <ScanSearch size={20} color="white" />
                        <Text className="text-white text-base font-semibold ml-2">
                          {isAr ? 'افحص المنتج' : 'Screen Product'}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            )}

            {/* ═══════════ RESULTS VIEW ═══════════ */}
            {view === 'results' && result && (
              <Animated.View entering={FadeInUp.springify()} className="mx-6 mt-4">
                {/* Score Card */}
                <LinearGradient
                  colors={
                    result.complianceLevel === 'halal'
                      ? ['#059669', '#047857', '#065f46']
                      : result.complianceLevel === 'questionable'
                      ? ['#d97706', '#b45309', '#92400e']
                      : ['#dc2626', '#b91c1c', '#991b1b']
                  }
                  style={{ borderRadius: 20, padding: 24, alignItems: 'center' }}
                >
                  <ScoreCircle score={result.score} />
                  <View className="mt-3">
                    <ComplianceBadge level={result.complianceLevel} language={language} />
                  </View>
                  <Text className="text-white/80 text-xs mt-2 font-medium uppercase tracking-wider">
                    {result.productName}
                  </Text>
                  <Text className="text-white text-sm font-medium mt-3 text-center leading-5">
                    {result.summary}
                  </Text>
                </LinearGradient>

                {/* Compliance Issues */}
                {result.complianceIssues.length > 0 && (
                  <View className="mt-4">
                    <Text className="text-white text-base font-semibold mb-3">
                      {isAr ? 'المخالفات' : 'Compliance Issues'} ({result.complianceIssues.length})
                    </Text>
                    {result.complianceIssues.map((issue, index) => (
                      <Pressable
                        key={index}
                        onPress={() => setExpandedIssue(expandedIssue === index ? null : index)}
                        className="bg-emerald-900/30 border border-emerald-800/30 rounded-xl p-4 mb-2"
                      >
                        <View className="flex-row items-start justify-between">
                          <View className="flex-1 mr-2">
                            <Text className="text-white text-sm font-semibold">{issue.issue}</Text>
                            <Text className="text-emerald-300/50 text-xs mt-0.5">{issue.standard}</Text>
                          </View>
                          <SeverityBadge severity={issue.severity} />
                        </View>
                        {expandedIssue === index && (
                          <Animated.View entering={FadeIn} className="mt-3 pt-3 border-t border-emerald-800/30">
                            <Text className="text-emerald-200/70 text-sm leading-5">{issue.detail}</Text>
                          </Animated.View>
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* Suggested Islamic Alternative */}
                {result.suggestedIslamicAlternative && (
                  <View className="mt-4 bg-emerald-600/10 border border-emerald-600/30 rounded-xl p-4">
                    <View className="flex-row items-center mb-2">
                      <ShieldCheck size={16} color="#34d399" />
                      <Text className="text-emerald-400 text-sm font-semibold ml-2">
                        {isAr ? 'البديل الإسلامي' : 'Islamic Alternative'}
                      </Text>
                    </View>
                    <Text className="text-emerald-200/70 text-sm leading-5">
                      {result.suggestedIslamicAlternative}
                    </Text>
                  </View>
                )}

                {/* Halal Product Alternatives from Database */}
                {alternatives.length > 0 && result.score < 80 && (
                  <View className="mt-4">
                    <Text className="text-white text-base font-semibold mb-3">
                      {isAr ? 'منتجات حلال بديلة' : 'Halal Alternatives'}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                      {alternatives.map((alt) => (
                        <Pressable
                          key={alt.id}
                          onPress={() => router.push('/(tabs)/investments')}
                          className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl p-4 mr-3"
                          style={{ width: 220 }}
                        >
                          <Text className="text-emerald-400/60 text-xs">{isAr ? alt.entityAr : alt.entity}</Text>
                          <Text className="text-white text-sm font-semibold mt-0.5" numberOfLines={1}>
                            {isAr ? alt.productAr : alt.product}
                          </Text>
                          <View className="flex-row items-center mt-2">
                            <TrendingUp size={12} color="#34d399" />
                            <Text className="text-emerald-300 text-xs ml-1 font-medium">
                              {alt.expectedReturn}
                            </Text>
                          </View>
                          <View className="flex-row items-center mt-1">
                            <Text className="text-indigo-300/60 text-xs">{alt.contractType}</Text>
                            <Text className="text-emerald-300/30 text-xs mx-1">|</Text>
                            <Text className="text-emerald-300/40 text-xs">{isAr ? alt.countryAr : alt.country}</Text>
                          </View>
                          <View className="flex-row items-center mt-2">
                            <Text className="text-emerald-400 text-xs font-medium">
                              {isAr ? 'عرض التفاصيل' : 'View Details'}
                            </Text>
                            <ArrowRight size={12} color="#34d399" style={{ marginLeft: 4 }} />
                          </View>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Overall Assessment */}
                <View className="bg-emerald-900/30 border border-emerald-800/30 rounded-xl p-4 mt-4">
                  <View className="flex-row items-center mb-2">
                    <BookOpen size={16} color="#6ee7b7" />
                    <Text className="text-emerald-400 text-sm font-semibold ml-2">
                      {isAr ? 'التقييم الشامل' : 'Overall Assessment'}
                    </Text>
                  </View>
                  <Text className="text-emerald-200/60 text-sm leading-5">{result.overallAssessment}</Text>
                </View>

                {/* Actions */}
                <Pressable
                  onPress={resetAll}
                  className="mt-4 bg-emerald-900/40 border border-emerald-700/40 rounded-2xl py-4 items-center flex-row justify-center"
                >
                  <RefreshCw size={18} color="#6ee7b7" />
                  <Text className="text-emerald-300 text-sm font-semibold ml-2">
                    {isAr ? 'فحص جديد' : 'New Screening'}
                  </Text>
                </Pressable>
              </Animated.View>
            )}

            {/* ═══════════ HISTORY VIEW ═══════════ */}
            {view === 'history' && (
              <Animated.View entering={FadeInUp.delay(100).springify()} className="mx-6 mt-4">
                <Text className="text-white text-base font-semibold mb-3">
                  {isAr ? 'سجل الفحوصات' : 'Screening History'}
                </Text>

                {screeningHistory.length === 0 ? (
                  <View className="bg-emerald-900/30 rounded-2xl p-6 items-center border border-emerald-800/30">
                    <Clock size={32} color="#6b7280" />
                    <Text className="text-emerald-300/40 text-sm mt-3 text-center">
                      {isAr
                        ? 'لم يتم إجراء أي فحوصات بعد.\nافحص منتجاً مالياً لبدء السجل.'
                        : 'No screenings yet.\nScreen a financial product to start.'}
                    </Text>
                  </View>
                ) : (
                  screeningHistory.map((record) => (
                    <Pressable
                      key={record.id}
                      onPress={() => viewHistoryItem(record)}
                      className="bg-emerald-900/30 border border-emerald-800/30 rounded-xl p-4 mb-2 flex-row items-center"
                    >
                      <ScoreCircle score={record.score} size="small" />
                      <View className="flex-1 ml-3">
                        <Text className="text-white text-sm font-medium" numberOfLines={1}>
                          {record.productName}
                        </Text>
                        <Text className="text-emerald-300/50 text-xs mt-0.5">
                          {new Date(record.date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
                        </Text>
                      </View>
                      <ComplianceBadge level={record.complianceLevel} language={language} />
                    </Pressable>
                  ))
                )}

                {/* New Screening Button */}
                <Pressable
                  onPress={resetAll}
                  className="mt-4 rounded-2xl overflow-hidden"
                >
                  <LinearGradient
                    colors={['#059669', '#047857']}
                    style={{
                      paddingVertical: 16,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}
                  >
                    <ScanSearch size={20} color="white" />
                    <Text className="text-white text-base font-semibold ml-2">
                      {isAr ? 'فحص جديد' : 'New Screening'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
