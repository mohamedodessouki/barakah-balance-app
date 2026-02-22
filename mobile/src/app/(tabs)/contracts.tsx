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
  FileSearch,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  BookOpen,
  Shield,
  Scale,
  Copy,
  X,
  Camera,
  FileText,
  Type,
  Upload,
  ImageIcon,
  AlertCircle,
} from 'lucide-react-native';
import { useLanguageStore } from '@/lib/store';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

// ─── Types ───────────────────────────────────────────────────────────────────

type InputMode = 'text' | 'camera' | 'document';
type Severity = 'critical' | 'major' | 'minor' | 'info';

interface Finding {
  clause: string;
  issue: string;
  severity: Severity;
  standard: string;
  recommendation: string;
}

interface AnalysisResult {
  score: number;
  summary: string;
  findings: Finding[];
  overallAssessment: string;
}

// ─── AAOIFI System Prompt ────────────────────────────────────────────────────

const AAOIFI_SYSTEM_PROMPT = `You are an expert Islamic finance and Sharia compliance analyst with deep knowledge of ALL 54 AAOIFI (Accounting and Auditing Organization for Islamic Financial Institutions) Shariah Standards.

Your task is to analyze contracts and financial documents for Sharia compliance against the complete set of AAOIFI standards.

## AAOIFI SHARIAH STANDARDS REFERENCE

### Trading & Sale Standards
- **SS 1 - Trading in Currencies**: Spot exchange rules, prohibition of futures in currencies, conditions for currency trading
- **SS 2 - Debit Card, Charge Card & Credit Card**: Rules for Islamic cards, prohibition of interest-based credit
- **SS 3 - Default in Payment by a Debtor**: Rules when debtor defaults, prohibition of penalties as income
- **SS 4 - Settlement of Debt by Set-Off (Muqassah)**: Conditions for debt offsetting
- **SS 5 - Guarantees (Kafalah)**: Rules for Islamic guarantees, conditions and limits
- **SS 8 - Murabahah**: Cost-plus sale rules, disclosure requirements, ownership transfer
- **SS 10 - Salam**: Forward sale rules, commodity specifications, delivery conditions
- **SS 11 - Istisna'a and Parallel Istisna'a**: Manufacturing contracts, progress payments, specifications
- **SS 20 - Commodity Trading**: Rules for commodity murabahah (tawarruq), organized trading

### Partnership Standards
- **SS 12 - Sharikah (Musharakah) & Modern Corporations**: Partnership rules, profit/loss sharing, corporate structures
- **SS 13 - Mudarabah**: Investment partnership rules, profit sharing, capital provider rights
- **SS 14 - Documentary Credit**: Islamic letter of credit rules, murabahah-based LC

### Leasing Standards
- **SS 9 - Ijarah and Ijarah Muntahia Bittamleek**: Leasing rules, maintenance obligations, ownership transfer options

### Investment Standards
- **SS 17 - Investment Sukuk**: Islamic bond structures, asset backing requirements, tradability
- **SS 18 - Possession (Qabd)**: Rules for constructive and actual possession
- **SS 21 - Financial Papers (Shares and Bonds)**: Rules for stock trading, purification of income
- **SS 22 - Concession Contracts**: BOT and concession rules

### Insurance Standards
- **SS 26 - Islamic Insurance (Takaful)**: Cooperative insurance rules, surplus distribution
- **SS 41 - Islamic Reinsurance**: Retakaful rules and structures

### Agency & Service Standards
- **SS 23 - Agency (Wakalah)**: Rules for agency contracts, agent duties, compensation
- **SS 46 - Wakalah Bi Al-Istithmar**: Investment agency rules, fee structures

### Debt & Transfer Standards
- **SS 7 - Hawalah**: Debt transfer rules, conditions for validity
- **SS 24 - Syndicated Financing**: Rules for multi-party Islamic financing

### Charity & Social Standards
- **SS 33 - Waqf**: Endowment rules, management, beneficiary rights
- **SS 34 - Ijarah on Labour (Employment)**: Islamic employment contract rules
- **SS 35 - Zakah**: Zakat calculation rules, eligible recipients, distribution
- **SS 36 - Impact of Contingent Events on Commitments**: Force majeure in Islamic finance
- **SS 37 - Credit Agreement**: Islamic credit facility structures
- **SS 40 - Distribution of Profit in Mudarabah-based Investment Accounts**: Profit allocation rules

### Governance Standards
- **SS 6 - Conversion of a Conventional Bank to an Islamic Bank**: Transition rules and procedures
- **SS 29 - Ethics**: Islamic financial ethics standards
- **SS 54 - Sale of Debt (Bay' Al-Dayn)**: Rules for debt trading

### Modern Finance Standards
- **SS 30 - Monetization (Tawarruq)**: Organized tawarruq rules, commodity trading
- **SS 42 - Rights and Their Disposition**: Financial rights trading
- **SS 43 - Insolvency**: Islamic insolvency rules
- **SS 44 - Obtaining and Deploying Liquidity**: Liquidity management in Islamic finance
- **SS 45 - Protection of Capital and Investments**: Capital guarantee rules
- **SS 47 - Contract Stipulations (Shurut)**: Conditions in Islamic contracts
- **SS 48 - Limitation of Liability**: Liability limits in Islamic finance
- **SS 49 - Promise and Bilateral Promise**: Wa'ad and muwa'adah rules
- **SS 50 - Prohibited Earnings**: Haram income identification and purification
- **SS 51 - Options**: Khiyar (option) types and rules
- **SS 52 - Currency Exchange**: Foreign exchange rules, hedging
- **SS 53 - Arbitration**: Islamic dispute resolution

### Additional Standards
- **SS 15 - Ju'alah**: Task-based reward contracts
- **SS 16 - Commercial Papers**: Promissory notes, bills of exchange
- **SS 19 - Loan (Qard)**: Islamic loan rules, prohibition of benefit to lender
- **SS 25 - Combination of Contracts**: Rules for combining multiple contracts
- **SS 27 - Indices**: Islamic index construction rules
- **SS 28 - Banking Services**: General Islamic banking rules
- **SS 31 - Pledge (Rahn)**: Collateral rules in Islamic finance
- **SS 32 - Tahkim (Arbitration)**: Alternative dispute resolution
- **SS 38 - Online Financial Dealings**: E-commerce and digital finance rules
- **SS 39 - Mortgage and its Contemporary Applications**: Islamic mortgage structures

## ANALYSIS INSTRUCTIONS

1. Identify the type of contract/document
2. Determine which AAOIFI standards are applicable
3. Analyze each clause against relevant standards
4. Flag any non-compliant elements with specific standard references
5. Provide severity ratings: critical (haram elements), major (significant non-compliance), minor (technical issues), info (recommendations)
6. Give an overall compliance score (0-100)

## RESPONSE FORMAT

You MUST respond in valid JSON with this exact structure:
{
  "score": <number 0-100>,
  "summary": "<brief 2-3 sentence summary>",
  "findings": [
    {
      "clause": "<the specific clause or section analyzed>",
      "issue": "<description of the issue found>",
      "severity": "<critical|major|minor|info>",
      "standard": "<AAOIFI standard reference, e.g. SS 8 - Murabahah>",
      "recommendation": "<how to fix or improve>"
    }
  ],
  "overallAssessment": "<detailed paragraph about overall compliance status>"
}

If the document is fully compliant, still provide info-level findings with positive observations.
Respond in the same language as the contract (Arabic or English).`;

// ─── Score Circle ────────────────────────────────────────────────────────────

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171';
  return (
    <View
      className="w-24 h-24 rounded-full items-center justify-center"
      style={{ borderWidth: 4, borderColor: color }}
    >
      <Text style={{ color, fontSize: 28, fontWeight: '800' }}>{score}</Text>
      <Text className="text-emerald-300/40 text-xs">/ 100</Text>
    </View>
  );
}

// ─── Severity Badge ──────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: Severity }) {
  const colors: Record<Severity, { bg: string; text: string }> = {
    critical: { bg: 'bg-red-600/30', text: 'text-red-400' },
    major: { bg: 'bg-amber-600/30', text: 'text-amber-400' },
    minor: { bg: 'bg-blue-600/30', text: 'text-blue-400' },
    info: { bg: 'bg-emerald-600/30', text: 'text-emerald-400' },
  };
  const c = colors[severity];
  return (
    <View className={`px-2 py-0.5 rounded-full ${c.bg}`}>
      <Text className={`text-xs font-medium capitalize ${c.text}`}>{severity}</Text>
    </View>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ContractsTab() {
  const language = useLanguageStore((s) => s.language);
  const isAr = language === 'ar';

  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [contractText, setContractText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [documentUri, setDocumentUri] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [expandedFinding, setExpandedFinding] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Loading animation
  const pulseAnim = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseAnim.value }));

  // ─── Pick Image ──────────────────────────────────────────────────────

  const pickImage = useCallback(async () => {
    const permResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permResult.granted) {
      setError(isAr ? 'يجب منح صلاحية الكاميرا' : 'Camera permission required');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      base64: false,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
      setContractText('');
      setDocumentUri(null);
      setDocumentName(null);
    }
  }, [isAr]);

  const pickFromGallery = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
      setContractText('');
      setDocumentUri(null);
      setDocumentName(null);
    }
  }, []);

  // ─── Pick Document ───────────────────────────────────────────────────

  const pickDocument = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    });
    if (!result.canceled && result.assets?.[0]) {
      setDocumentUri(result.assets[0].uri);
      setDocumentName(result.assets[0].name);
      setImageUri(null);
      setContractText('');
    }
  }, []);

  // ─── Analyze Contract ────────────────────────────────────────────────

  const analyzeContract = useCallback(async () => {
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
      if (!apiKey) {
        throw new Error(isAr ? 'مفتاح API غير مهيأ' : 'API key not configured');
      }

      // Build content blocks
      const content: Array<Record<string, unknown>> = [];

      if (inputMode === 'text' && contractText.trim()) {
        content.push({ type: 'text', text: `Please analyze this contract for Sharia compliance:\n\n${contractText}` });
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
          text: 'Please analyze this contract image for Sharia compliance. Extract the text and analyze each clause against AAOIFI standards.',
        });
      } else if (inputMode === 'document' && documentUri) {
        const base64 = await FileSystem.readAsStringAsync(documentUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        content.push({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: base64 },
        });
        content.push({
          type: 'text',
          text: 'Please analyze this contract document for Sharia compliance against AAOIFI standards.',
        });
      } else {
        throw new Error(isAr ? 'يرجى إدخال نص العقد أو رفع ملف' : 'Please enter contract text or upload a file');
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
          max_tokens: 8192,
          system: AAOIFI_SYSTEM_PROMPT,
          messages: [{ role: 'user', content }],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error((errData as Record<string, Record<string, string>>)?.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const text = (data as { content: Array<{ type: string; text: string }> }).content?.[0]?.text ?? '';

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error(isAr ? 'لم يتم العثور على نتائج' : 'No results found');

      const parsed = JSON.parse(jsonMatch[0]) as AnalysisResult;
      setResult(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsAnalyzing(false);
      pulseAnim.value = 1;
    }
  }, [inputMode, contractText, imageUri, documentUri, isAr, pulseAnim]);

  // ─── Reset ───────────────────────────────────────────────────────────

  const resetAll = () => {
    setContractText('');
    setImageUri(null);
    setDocumentUri(null);
    setDocumentName(null);
    setResult(null);
    setError(null);
    setExpandedFinding(null);
  };

  // ─── Copy to Clipboard ───────────────────────────────────────────────

  const copyResults = async () => {
    if (!result) return;
    const text = `Sharia Compliance Score: ${result.score}/100\n\n${result.summary}\n\n${result.overallAssessment}\n\nFindings:\n${result.findings.map((f, i) => `${i + 1}. [${f.severity.toUpperCase()}] ${f.clause}: ${f.issue}\n   Standard: ${f.standard}\n   Recommendation: ${f.recommendation}`).join('\n\n')}`;
    await Clipboard.setStringAsync(text);
  };

  // ─── Render ──────────────────────────────────────────────────────────

  const hasInput =
    (inputMode === 'text' && contractText.trim().length > 0) ||
    (inputMode === 'camera' && imageUri) ||
    (inputMode === 'document' && documentUri);

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
            <View className="px-6 pt-4 pb-2">
              <Text className="text-white text-xl font-bold">
                {isAr ? 'مراجعة العقود' : 'Contract Review'}
              </Text>
              <Text className="text-emerald-400/60 text-sm mt-1">
                {isAr
                  ? 'تحليل العقود للتوافق مع الشريعة الإسلامية'
                  : 'Analyze contracts for Sharia compliance'}
              </Text>
            </View>

            {/* ─── Input Section ─────────────────────────────────────── */}
            {!result && (
              <Animated.View entering={FadeInUp.delay(100).springify()} className="mx-6 mt-4">
                {/* Input Mode Tabs */}
                <View className="flex-row bg-emerald-900/40 rounded-xl p-1 mb-4">
                  {([
                    { mode: 'text' as InputMode, icon: <Type size={16} />, label: isAr ? 'نص' : 'Text' },
                    { mode: 'camera' as InputMode, icon: <Camera size={16} />, label: isAr ? 'كاميرا' : 'Camera' },
                    { mode: 'document' as InputMode, icon: <FileText size={16} />, label: isAr ? 'مستند' : 'Document' },
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

                {/* Text Input */}
                {inputMode === 'text' && (
                  <View className="bg-emerald-900/30 border border-emerald-800/30 rounded-xl p-3">
                    <TextInput
                      value={contractText}
                      onChangeText={setContractText}
                      placeholder={
                        isAr
                          ? 'الصق نص العقد هنا...'
                          : 'Paste your contract text here...'
                      }
                      placeholderTextColor="#6b7280"
                      multiline
                      numberOfLines={8}
                      className="text-white text-sm"
                      style={{ minHeight: 150, textAlignVertical: 'top' }}
                    />
                  </View>
                )}

                {/* Camera Input */}
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

                {/* Document Input */}
                {inputMode === 'document' && (
                  <View>
                    {documentUri ? (
                      <View className="bg-emerald-900/30 border border-emerald-800/30 rounded-xl p-4 flex-row items-center">
                        <FileText size={24} color="#34d399" />
                        <Text className="text-white text-sm flex-1 ml-3" numberOfLines={1}>
                          {documentName}
                        </Text>
                        <Pressable
                          onPress={() => {
                            setDocumentUri(null);
                            setDocumentName(null);
                          }}
                        >
                          <X size={18} color="#f87171" />
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        onPress={pickDocument}
                        className="bg-emerald-900/30 border border-dashed border-emerald-700/50 rounded-xl p-8 items-center"
                      >
                        <Upload size={32} color="#34d399" />
                        <Text className="text-emerald-300 text-sm mt-2 font-medium">
                          {isAr ? 'رفع مستند (PDF / Word)' : 'Upload Document (PDF / Word)'}
                        </Text>
                        <Text className="text-emerald-300/40 text-xs mt-1">
                          {isAr ? 'PDF, DOC, DOCX' : 'PDF, DOC, DOCX'}
                        </Text>
                      </Pressable>
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
                  onPress={analyzeContract}
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
                          {isAr ? 'جاري التحليل...' : 'Analyzing...'}
                        </Text>
                      </Animated.View>
                    ) : (
                      <>
                        <FileSearch size={20} color="white" />
                        <Text className="text-white text-base font-semibold ml-2">
                          {isAr ? 'تحليل العقد' : 'Analyze Contract'}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            )}

            {/* ─── Results Section ───────────────────────────────────── */}
            {result && (
              <Animated.View entering={FadeInUp.springify()} className="mx-6 mt-4">
                {/* Score Card */}
                <LinearGradient
                  colors={['#059669', '#047857', '#065f46']}
                  style={{ borderRadius: 20, padding: 24, alignItems: 'center' }}
                >
                  <ScoreCircle score={result.score} />
                  <Text className="text-white text-base font-semibold mt-3 text-center">
                    {result.summary}
                  </Text>
                </LinearGradient>

                {/* Findings */}
                <View className="mt-4">
                  <Text className="text-white text-base font-semibold mb-3">
                    {isAr ? 'النتائج' : 'Findings'} ({result.findings.length})
                  </Text>
                  {result.findings.map((finding, index) => (
                    <Pressable
                      key={index}
                      onPress={() => setExpandedFinding(expandedFinding === index ? null : index)}
                      className="bg-emerald-900/30 border border-emerald-800/30 rounded-xl p-4 mb-2"
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 mr-2">
                          <Text className="text-white text-sm font-medium">
                            {`"${finding.clause}"`}
                          </Text>
                          <Text className="text-emerald-300/50 text-xs mt-1">{finding.standard}</Text>
                        </View>
                        <SeverityBadge severity={finding.severity} />
                      </View>
                      {expandedFinding === index && (
                        <Animated.View entering={FadeIn} className="mt-3 pt-3 border-t border-emerald-800/30">
                          <Text className="text-emerald-200/70 text-sm mb-2">{finding.issue}</Text>
                          <View className="bg-emerald-600/10 rounded-lg p-3">
                            <Text className="text-emerald-400 text-xs font-semibold mb-1">
                              {isAr ? 'التوصية' : 'Recommendation'}
                            </Text>
                            <Text className="text-emerald-200/60 text-xs">{finding.recommendation}</Text>
                          </View>
                        </Animated.View>
                      )}
                    </Pressable>
                  ))}
                </View>

                {/* Overall Assessment */}
                <View className="bg-emerald-900/30 border border-emerald-800/30 rounded-xl p-4 mt-3">
                  <View className="flex-row items-center mb-2">
                    <BookOpen size={16} color="#6ee7b7" />
                    <Text className="text-emerald-400 text-sm font-semibold ml-2">
                      {isAr ? 'التقييم الشامل' : 'Overall Assessment'}
                    </Text>
                  </View>
                  <Text className="text-emerald-200/60 text-sm leading-5">
                    {result.overallAssessment}
                  </Text>
                </View>

                {/* Actions */}
                <View className="flex-row gap-3 mt-4">
                  <Pressable
                    onPress={resetAll}
                    className="flex-1 bg-emerald-900/40 border border-emerald-700/40 rounded-xl py-3 items-center flex-row justify-center"
                  >
                    <RefreshCw size={16} color="#6ee7b7" />
                    <Text className="text-emerald-300 text-sm font-medium ml-2">
                      {isAr ? 'تحليل جديد' : 'New Analysis'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={copyResults}
                    className="flex-1 bg-emerald-900/40 border border-emerald-700/40 rounded-xl py-3 items-center flex-row justify-center"
                  >
                    <Copy size={16} color="#6ee7b7" />
                    <Text className="text-emerald-300 text-sm font-medium ml-2">
                      {isAr ? 'نسخ' : 'Copy'}
                    </Text>
                  </Pressable>
                </View>
              </Animated.View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
