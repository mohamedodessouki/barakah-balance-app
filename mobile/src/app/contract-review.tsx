import React, { useState, useCallback, useEffect } from 'react';
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
  ArrowLeft,
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

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

// ─── AAOIFI Sharia Standards System Prompt ───────────────────────────────────
const SHARIA_SYSTEM_PROMPT = `You are an expert Islamic finance Sharia compliance analyst with deep knowledge of all 54 AAOIFI (Accounting and Auditing Organization for Islamic Financial Institutions) Sharia Standards. Your role is to analyze contracts and determine their Sharia compliance.

## AAOIFI SHARIA STANDARDS REFERENCE

### SS 1: Trading in Currencies
- Spot exchange required for currency trading (no deferred settlement for same currency)
- Exchange of different currencies must be at spot rate
- No futures or options on currencies unless physically settled at spot

### SS 2: Debit Card, Charge Card and Credit Card
- Credit cards must not involve interest (riba)
- Late payment fees that benefit the card issuer are prohibited
- Annual/membership fees are permissible

### SS 3: Procrastinating Debtor
- A solvent debtor who delays payment commits a sin
- No financial penalty that benefits the creditor for late payment
- Charitable donation penalty is permissible (money goes to charity, not creditor)
- Court-imposed damages for actual loss are permissible

### SS 4: Settlement of Debt by Set-Off
- Mutual debts can be set off if they are of the same type, kind, and maturity
- Set-off requires mutual consent or court order

### SS 5: Guarantees
- Guarantor must have legal capacity
- Guarantee cannot be for a fee (kafalah is gratuitous)
- Letter of guarantee fees cover actual administrative costs only
- Guarantee covers the principal amount, not unlawful additions

### SS 7: Hawalah (Transfer of Debt)
- Must be concluded immediately, not deferred or contingent
- Transferred amount must be equal in kind, type, quality
- Transfer of debt to avoid riba is prohibited

### SS 8: Murabahah (Cost-Plus Sale)
- CRITICAL: Seller must own and possess the asset before selling
- Cost price must be transparently disclosed to buyer
- Profit markup must be clearly agreed upon
- No selling before taking possession (qabd)
- No interest on late payments — only charitable penalty
- Early settlement rebate (ibra) at institution's discretion
- Additional payment for time extension = riba (prohibited)
- Promise to purchase is binding on the promisor
- Institution bears risk of asset damage before delivery

### SS 9: Ijarah (Lease) and Ijarah Muntahia Bittamleek
- Lessor retains ownership and bears major maintenance
- Lessee bears operational/routine maintenance
- Rental must be known and agreed at contract inception
- Variable rent tied to a benchmark is permissible if first period is fixed
- Transfer of ownership must be via a separate contract (gift, sale, or gradual transfer)
- Combining lease and sale in one contract is prohibited
- Insurance of leased asset is lessor's responsibility
- Penalties for late rent payment go to charity, not lessor

### SS 10: Salam (Forward Sale)
- Full price must be paid at contract inception (or within 2-3 days)
- Delivery date must be specified
- Subject matter must be precisely described (quantity, quality, type)
- No salam in specific identified items
- Parallel salam must be independent from the original

### SS 11: Istisna'a (Manufacturing Contract)
- Price can be deferred, paid in installments, or at delivery
- Subject matter must be precisely specified
- Manufacturer bears all costs until delivery
- Parallel istisna'a must be independent from original
- Penalty for delay is permissible if it goes to charity

### SS 12: Sharikah (Musharakah) and Modern Corporations
- Profit sharing must be by agreed ratios, not fixed amounts
- Loss sharing must be proportional to capital contribution
- Partners can agree on different profit ratios but NOT different loss ratios
- Diminishing musharakah: one partner gradually buys the other's share
- Managing partner can receive extra share for management effort
- No guarantee of capital by one partner to another

### SS 13: Mudarabah (Trust Financing)
- Profit sharing ratio must be agreed, not a fixed amount
- Loss is borne entirely by the capital provider (rab al-mal)
- Mudarib (manager) loses only effort if no misconduct
- Mudarib cannot guarantee the capital
- Capital must be known and available
- Expenses of mudarib from the mudarabah fund must be agreed

### SS 14: Documentary Credit (Letters of Credit)
- Permissible if structured to avoid riba
- Commission for LC services is permissible
- Must not finance prohibited goods

### SS 17: Investment Sukuk
- Must represent ownership in underlying assets, not debt
- Returns must be tied to asset performance, not guaranteed
- Sukuk manager cannot guarantee returns
- Asset must be Sharia-compliant

### SS 19: Loan (Qard)
- Loan must be gratuitous — no benefit to lender
- Any stipulated increase over principal = riba
- Borrower may voluntarily give extra at repayment (not stipulated)
- Charging fees for loan processing is permissible (actual cost only)
- Converting loan to investment is prohibited

### SS 21: Financial Paper (Shares and Bonds)
- Conventional bonds with fixed interest are prohibited
- Shares of companies with primarily halal business are permissible
- Company's debt ratio and impure income must be within acceptable limits

### SS 22: Concession Contracts (BOT, BOOT, etc.)
- Must be structured as ijarah, istisna'a, or musharakah
- Revenue sharing must follow Islamic finance principles

### SS 23: Agency (Wakalah)
- Agent's authority must be clearly defined
- Agent cannot benefit at principal's expense
- Fee-based agency is permissible

### SS 24: Syndicated Financing
- Each participant bears risk proportional to share
- No guaranteed return for any participant
- Must follow the underlying Islamic contract (murabahah, ijarah, etc.)

### SS 25: Combination of Contracts
- Combining two sales in one is prohibited
- Combining sale and loan in one transaction is prohibited
- Conditional contracts that lead to riba are prohibited
- Separate contracts that are merely linked by sequence are permissible

### SS 26: Islamic Insurance (Takaful)
- Conventional insurance is prohibited (contains gharar and riba)
- Takaful (cooperative insurance) is the Sharia-compliant alternative
- Takaful fund must be invested in Sharia-compliant instruments
- Surplus belongs to participants, not the operator

### SS 30: Monetization (Tawarruq)
- Organized tawarruq (commodity murabahah) is controversial
- Classical tawarruq (buying then selling to third party) is permissible
- Agent cannot be both buyer and seller in the chain

### SS 31: Controls on Gharar (Excessive Uncertainty)
- Contracts with excessive gharar are void
- Minor gharar is tolerable if unavoidable
- Subject matter must be known, deliverable, and existent
- Price must be determined or determinable
- Ambiguous terms that could lead to dispute are prohibited

### SS 35: Zakah
- Zakah is obligatory on wealth exceeding nisab for one lunar year
- Rate is 2.5% for most assets
- Business zakah calculated on net current assets

### SS 37: Credit Agreement
- No interest-bearing credit agreements
- Service fees must reflect actual cost
- Penalties for default go to charity

### SS 38: Online Financial Dealings
- All standard Sharia rules apply to electronic transactions
- Electronic offer and acceptance are valid
- Digital signatures are acceptable

### SS 39: Mortgage
- Conventional mortgage with interest is prohibited
- Islamic alternatives: diminishing musharakah, ijarah muntahia bittamleek
- Mortgaged property cannot be used by mortgagee without permission

### SS 44: Obtaining and Deploying Liquidity
- Liquidity must be obtained through real economic transactions
- Fictitious transactions for liquidity are prohibited
- Buy-back arrangements (bay al-inah) are prohibited

### SS 49: Unilateral and Bilateral Promise
- Unilateral promise (wa'd) is binding on the promisor
- Bilateral promise (muwa'adah) is permissible if not equivalent to a contract
- Breaking a binding promise without excuse is sinful and legally enforceable

## ANALYSIS INSTRUCTIONS

When analyzing a contract:

1. **Identify the contract type** (Murabahah, Ijarah, Musharakah, Mudarabah, Salam, Istisna'a, Takaful, Sukuk, Loan, General, etc.)

2. **Check each clause** against the relevant AAOIFI standard(s). Look for:
   - Riba (interest) in any form — explicit interest rates, late payment penalties benefiting creditor, guaranteed returns
   - Gharar (excessive uncertainty) — ambiguous terms, undefined obligations, contingent conditions
   - Missing ownership/possession requirements — selling before owning
   - Prohibited combinations — sale + loan, two sales in one
   - Guarantee violations — capital guarantee in mudarabah, guaranteed returns in sukuk
   - Insurance issues — conventional insurance instead of takaful
   - Profit/loss sharing violations — fixed amounts instead of ratios, unequal loss sharing

3. **Score the contract** from 0-100:
   - 90-100: Fully compliant, minor suggestions only
   - 70-89: Mostly compliant, some clauses need adjustment
   - 50-69: Significant compliance issues
   - 0-49: Major violations, contract needs substantial revision

4. **For each finding**, provide:
   - The exact clause or section that violates
   - Which AAOIFI standard it violates (with section number if possible)
   - Severity: high (riba, fundamental prohibition), medium (structural issue), low (best practice)
   - Clear explanation of the issue
   - Specific suggestion for a compliant alternative

5. **Respond in the same language as the contract** (Arabic or English)

## RESPONSE FORMAT

You MUST respond with valid JSON only, no other text. Use this exact structure:
{
  "contractType": "string",
  "overallScore": number,
  "findings": [
    {
      "clause": "exact text or description of the problematic clause",
      "standard": "AAOIFI SS No. X (Name), Section Y/Z",
      "severity": "high" | "medium" | "low",
      "issue": "explanation of why this violates Sharia",
      "suggestion": "specific compliant alternative"
    }
  ],
  "summary": "overall assessment paragraph"
}`;

const REVISION_SYSTEM_PROMPT = `You are an expert Islamic finance contract drafter. Given a contract and its Sharia compliance findings, generate a revised version that addresses all compliance issues while maintaining the contract's commercial intent.

For each change you make, track it as a change object.

Respond in the same language as the original contract.

You MUST respond with valid JSON only:
{
  "revisedContract": "full revised contract text",
  "changes": [
    {
      "original": "original problematic text",
      "revised": "new compliant text",
      "reason": "why this change was made"
    }
  ]
}`;

// ─── Types ───────────────────────────────────────────────────────────────────

type InputMode = 'text' | 'camera' | 'document';

interface ContractFinding {
  clause: string;
  standard: string;
  severity: 'high' | 'medium' | 'low';
  issue: string;
  suggestion: string;
}

interface ReviewResult {
  contractType: string;
  overallScore: number;
  findings: ContractFinding[];
  summary: string;
}

interface ContractChange {
  original: string;
  revised: string;
  reason: string;
}

// ─── Helper: Call Claude API ─────────────────────────────────────────────────

async function callClaude(
  systemPrompt: string,
  userContent: Array<Record<string, unknown>>,
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text ?? '';
  return text;
}

function parseJsonResponse<T>(text: string): T {
  // Try to extract JSON from the response (Claude sometimes wraps in markdown)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in response');
  return JSON.parse(jsonMatch[0]) as T;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PulseIndicator() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: '#818cf8',
          marginRight: 10,
        },
      ]}
    />
  );
}

function SeverityBadge({ severity, language }: { severity: 'high' | 'medium' | 'low'; language: string }) {
  const config = {
    high: { bg: 'bg-red-500/20', text: 'text-red-400', labelEn: 'High', labelAr: 'عالي' },
    medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', labelEn: 'Medium', labelAr: 'متوسط' },
    low: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', labelEn: 'Low', labelAr: 'منخفض' },
  };
  const { bg, text, labelEn, labelAr } = config[severity];

  return (
    <View className={`${bg} px-2.5 py-1 rounded-full`}>
      <Text className={`${text} text-xs font-medium`}>
        {language === 'ar' ? labelAr : labelEn}
      </Text>
    </View>
  );
}

function ScoreCircle({ score, size = 140 }: { score: number; size?: number }) {
  const color =
    score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const bgColor =
    score >= 80 ? '#064e3b' : score >= 60 ? '#78350f' : '#7f1d1d';

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 8,
        borderColor: color,
        backgroundColor: bgColor + '40',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color, fontSize: size * 0.3, fontWeight: '800' }}>
        {score}
      </Text>
      <Text style={{ color: color + 'AA', fontSize: size * 0.1, fontWeight: '500' }}>
        / 100
      </Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ContractReviewScreen() {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const isRTL = useLanguageStore((s) => s.isRTL);

  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [contractText, setContractText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<{ uri: string; name: string; mimeType: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [isGeneratingRevision, setIsGeneratingRevision] = useState(false);
  const [revisedContract, setRevisedContract] = useState<string | null>(null);
  const [revisionChanges, setRevisionChanges] = useState<ContractChange[]>([]);
  const [showRevised, setShowRevised] = useState(false);
  const [expandedFindingIndex, setExpandedFindingIndex] = useState<number | null>(null);
  const [copiedRevised, setCopiedRevised] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analysisSteps = language === 'ar'
    ? [
        'قراءة محتوى العقد...',
        'تحليل بنود العقد...',
        'التحقق من معايير أيوفي الـ54...',
        'فحص الامتثال الشرعي...',
        'إعداد التقرير...',
      ]
    : [
        'Reading contract content...',
        'Analyzing contract clauses...',
        'Checking against 54 AAOIFI standards...',
        'Screening for Shariah compliance...',
        'Preparing report...',
      ];

  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setAnalysisStep((prev) => (prev < analysisSteps.length - 1 ? prev + 1 : prev));
    }, 3000);
    return () => clearInterval(interval);
  }, [isAnalyzing, analysisSteps.length]);

  // Check if we have content to analyze
  const hasContent =
    (inputMode === 'text' && contractText.trim().length >= 10) ||
    (inputMode === 'camera' && selectedImages.length > 0) ||
    (inputMode === 'document' && selectedDocument !== null);

  // ─── Pick image from camera or gallery ───────────────────────────────────
  const handlePickImage = useCallback(async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 0.8,
            selectionLimit: 10,
          });

      if (result.canceled) return;

      const newUris = result.assets.map((a) => a.uri);
      setSelectedImages((prev) => [...prev, ...newUris]);
    } catch {
      setError(language === 'ar' ? 'فشل في اختيار الصورة' : 'Failed to pick image');
    }
  }, [language]);

  // ─── Pick document (PDF/Word) ────────────────────────────────────────────
  const handlePickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      setSelectedDocument({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? 'application/pdf',
      });
    } catch {
      setError(language === 'ar' ? 'فشل في اختيار الملف' : 'Failed to pick document');
    }
  }, [language]);

  // ─── Build Claude message content based on input mode ────────────────────
  const buildUserContent = useCallback(async (): Promise<Array<Record<string, unknown>>> => {
    const lang = language === 'ar' ? 'Arabic' : 'English';
    const instruction = `Analyze this contract for Sharia compliance against AAOIFI standards. Respond in ${lang}.`;

    if (inputMode === 'text') {
      return [{ type: 'text', text: `${instruction}\n\nContract text:\n${contractText}` }];
    }

    if (inputMode === 'camera') {
      const content: Array<Record<string, unknown>> = [
        { type: 'text', text: `${instruction}\n\nThe following images are pages of a contract. Read all text from the images and analyze the full contract for Sharia compliance.` },
      ];

      for (const uri of selectedImages) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const mimeType = uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType,
            data: base64,
          },
        });
      }

      return content;
    }

    if (inputMode === 'document' && selectedDocument) {
      const base64 = await FileSystem.readAsStringAsync(selectedDocument.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const isPdf = selectedDocument.mimeType === 'application/pdf' || selectedDocument.name.toLowerCase().endsWith('.pdf');

      if (isPdf) {
        return [
          { type: 'text', text: instruction },
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64,
            },
          },
        ];
      }

      // For Word docs, send as file and ask Claude to read it
      return [
        {
          type: 'text',
          text: `${instruction}\n\nThe following is a base64-encoded Word document. Please extract the text and analyze it for Sharia compliance.\n\nFilename: ${selectedDocument.name}\nBase64 content (first 50000 chars): ${base64.substring(0, 50000)}`,
        },
      ];
    }

    return [{ type: 'text', text: instruction }];
  }, [inputMode, contractText, selectedImages, selectedDocument, language]);

  // ─── Analyze contract ────────────────────────────────────────────────────
  const handleAnalyze = useCallback(async () => {
    if (!ANTHROPIC_API_KEY) {
      setError(
        language === 'ar'
          ? 'يرجى إضافة مفتاح API الخاص بـ Anthropic في تبويب ENV باسم EXPO_PUBLIC_ANTHROPIC_API_KEY'
          : 'Please add your Anthropic API key in the ENV tab as EXPO_PUBLIC_ANTHROPIC_API_KEY'
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(0);
    setResult(null);
    setRevisedContract(null);
    setRevisionChanges([]);
    setShowRevised(false);
    setError(null);

    try {
      const userContent = await buildUserContent();
      const responseText = await callClaude(SHARIA_SYSTEM_PROMPT, userContent);
      const parsed = parseJsonResponse<ReviewResult>(responseText);

      setResult({
        contractType: parsed.contractType ?? 'General Contract',
        overallScore: parsed.overallScore ?? 50,
        findings: parsed.findings ?? [],
        summary: parsed.summary ?? '',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(
        language === 'ar'
          ? `فشل التحليل: ${message}`
          : `Analysis failed: ${message}`
      );
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }
  }, [buildUserContent, language]);

  // ─── Generate revised contract ───────────────────────────────────────────
  const handleGenerateRevision = useCallback(async () => {
    if (!result || !ANTHROPIC_API_KEY) return;
    setIsGeneratingRevision(true);

    try {
      const contractSource = inputMode === 'text' ? contractText : '(see original analysis)';
      const userContent = [
        {
          type: 'text' as const,
          text: `Original contract:\n${contractSource}\n\nFindings:\n${JSON.stringify(result.findings, null, 2)}\n\nPlease generate a revised Sharia-compliant version addressing all findings. Respond in ${language === 'ar' ? 'Arabic' : 'English'}.`,
        },
      ];

      const responseText = await callClaude(REVISION_SYSTEM_PROMPT, userContent);
      const parsed = parseJsonResponse<{ revisedContract: string; changes: ContractChange[] }>(responseText);

      setRevisedContract(parsed.revisedContract ?? null);
      setRevisionChanges(parsed.changes ?? []);
      setShowRevised(true);
    } catch {
      setError(
        language === 'ar'
          ? 'فشل في إنشاء النسخة المعدلة'
          : 'Failed to generate revised version'
      );
    } finally {
      setIsGeneratingRevision(false);
    }
  }, [contractText, result, language, inputMode]);

  // ─── Copy revised contract ───────────────────────────────────────────────
  const handleCopyRevised = useCallback(async () => {
    if (!revisedContract) return;
    try {
      await Clipboard.setStringAsync(revisedContract);
      setCopiedRevised(true);
      setTimeout(() => setCopiedRevised(false), 2000);
    } catch {
      // clipboard not available
    }
  }, [revisedContract]);

  // ─── Reset ───────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setResult(null);
    setContractText('');
    setSelectedImages([]);
    setSelectedDocument(null);
    setRevisedContract(null);
    setRevisionChanges([]);
    setShowRevised(false);
    setError(null);
    setExpandedFindingIndex(null);
  }, []);

  // ─── Input mode tabs config ──────────────────────────────────────────────
  const inputModes: { key: InputMode; labelEn: string; labelAr: string; icon: React.ReactNode }[] = [
    { key: 'text', labelEn: 'Text', labelAr: 'نص', icon: <Type size={16} color="white" /> },
    { key: 'camera', labelEn: 'Photo', labelAr: 'صورة', icon: <Camera size={16} color="white" /> },
    { key: 'document', labelEn: 'File', labelAr: 'ملف', icon: <FileText size={16} color="white" /> },
  ];

  return (
    <View className="flex-1 bg-slate-950">
      <LinearGradient
        colors={['#1e1b4b', '#0f172a', '#020617']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 250 }}
      />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className={`px-5 pt-3 pb-2 flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Pressable
              onPress={() => router.back()}
              className="p-2 rounded-full bg-white/10"
            >
              <ArrowLeft
                size={22}
                color="white"
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              />
            </Pressable>
            <View className={`${isRTL ? 'mr-3' : 'ml-3'}`}>
              <Text className="text-white text-lg font-bold">
                {language === 'ar' ? 'مراجعة العقود' : 'Contract Review'}
              </Text>
              <Text className="text-indigo-300/60 text-xs">
                {language === 'ar' ? 'فحص الامتثال الشرعي — معايير أيوفي' : 'AAOIFI Shariah Compliance Analysis'}
              </Text>
            </View>
          </View>
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ─── Error Banner ──────────────────────────────────────── */}
            {error && (
              <Animated.View entering={FadeIn.duration(300)} className="mx-4 mt-3">
                <View className="bg-red-950/60 rounded-xl p-4 border border-red-800/50 flex-row items-start">
                  <AlertCircle size={18} color="#f87171" style={{ marginTop: 2 }} />
                  <View className="flex-1 ml-3">
                    <Text className="text-red-300 text-sm leading-5">{error}</Text>
                    <Pressable onPress={() => setError(null)} className="mt-2">
                      <Text className="text-red-400 text-xs font-medium">
                        {language === 'ar' ? 'إغلاق' : 'Dismiss'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* ─── Input Section ─────────────────────────────────────── */}
            {!result && !isAnalyzing && (
              <Animated.View
                entering={FadeInUp.delay(200).springify()}
                className="mx-4 mt-4"
              >
                {/* Input Mode Tabs */}
                <View className="flex-row bg-slate-900/70 rounded-xl p-1 mb-4 border border-slate-800/50">
                  {inputModes.map((mode) => (
                    <Pressable
                      key={mode.key}
                      onPress={() => setInputMode(mode.key)}
                      className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${
                        inputMode === mode.key ? 'bg-indigo-600' : ''
                      }`}
                    >
                      {mode.icon}
                      <Text
                        className={`text-white text-sm font-medium ml-1.5 ${
                          inputMode !== mode.key ? 'opacity-50' : ''
                        }`}
                      >
                        {language === 'ar' ? mode.labelAr : mode.labelEn}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* ─── Text Input ─────────────────────────────────────── */}
                {inputMode === 'text' && (
                  <View className="bg-slate-900/70 rounded-2xl border border-indigo-900/50 overflow-hidden">
                    <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-800/50">
                      <View className="flex-row items-center">
                        <FileSearch size={18} color="#818cf8" />
                        <Text className="text-indigo-300 text-sm font-medium ml-2">
                          {language === 'ar' ? 'نص العقد' : 'Contract Text'}
                        </Text>
                      </View>
                    </View>
                    <TextInput
                      className="text-white text-base px-4 py-4"
                      placeholder={
                        language === 'ar'
                          ? 'الصق نص العقد هنا للمراجعة الشرعية...'
                          : 'Paste your contract text here for Shariah review...'
                      }
                      placeholderTextColor="#475569"
                      multiline
                      numberOfLines={12}
                      style={{ minHeight: 240, textAlignVertical: 'top' }}
                      value={contractText}
                      onChangeText={setContractText}
                    />
                    <View className="px-4 pb-3 flex-row items-center justify-between">
                      <Text className="text-slate-500 text-xs">
                        {contractText.length} {language === 'ar' ? 'حرف' : 'characters'}
                      </Text>
                      {contractText.length > 0 && (
                        <Pressable onPress={() => setContractText('')}>
                          <Text className="text-indigo-400 text-xs">
                            {language === 'ar' ? 'مسح' : 'Clear'}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                )}

                {/* ─── Camera / Photo Input ───────────────────────────── */}
                {inputMode === 'camera' && (
                  <View>
                    <View className="flex-row gap-3 mb-4">
                      <Pressable
                        onPress={() => handlePickImage(true)}
                        className="flex-1 bg-slate-900/70 rounded-2xl border border-indigo-900/50 p-5 items-center"
                      >
                        <Camera size={28} color="#818cf8" />
                        <Text className="text-indigo-300 text-sm font-medium mt-2">
                          {language === 'ar' ? 'التقاط صورة' : 'Take Photo'}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handlePickImage(false)}
                        className="flex-1 bg-slate-900/70 rounded-2xl border border-indigo-900/50 p-5 items-center"
                      >
                        <ImageIcon size={28} color="#818cf8" />
                        <Text className="text-indigo-300 text-sm font-medium mt-2">
                          {language === 'ar' ? 'اختيار من المعرض' : 'From Gallery'}
                        </Text>
                      </Pressable>
                    </View>

                    {selectedImages.length > 0 && (
                      <View className="bg-slate-900/70 rounded-2xl border border-indigo-900/50 p-3">
                        <View className="flex-row items-center justify-between mb-3 px-1">
                          <Text className="text-indigo-300 text-sm font-medium">
                            {language === 'ar'
                              ? `${selectedImages.length} صورة محددة`
                              : `${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''} selected`}
                          </Text>
                          <Pressable onPress={() => setSelectedImages([])}>
                            <Text className="text-red-400 text-xs">
                              {language === 'ar' ? 'مسح الكل' : 'Clear All'}
                            </Text>
                          </Pressable>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                          {selectedImages.map((uri, index) => (
                            <View key={uri} className="mr-2 relative">
                              <Image
                                source={{ uri }}
                                style={{ width: 100, height: 130, borderRadius: 12 }}
                                resizeMode="cover"
                              />
                              <Pressable
                                onPress={() => setSelectedImages((prev) => prev.filter((_, i) => i !== index))}
                                style={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  backgroundColor: 'rgba(0,0,0,0.7)',
                                  borderRadius: 10,
                                  padding: 2,
                                }}
                              >
                                <X size={14} color="white" />
                              </Pressable>
                              <View
                                style={{
                                  position: 'absolute',
                                  bottom: 4,
                                  left: 4,
                                  backgroundColor: 'rgba(0,0,0,0.7)',
                                  borderRadius: 8,
                                  paddingHorizontal: 6,
                                  paddingVertical: 2,
                                }}
                              >
                                <Text className="text-white text-xs">{index + 1}</Text>
                              </View>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    )}

                    {selectedImages.length === 0 && (
                      <View className="bg-slate-900/30 rounded-2xl border border-dashed border-slate-700 p-8 items-center">
                        <Camera size={40} color="#475569" />
                        <Text className="text-slate-500 text-sm mt-3 text-center">
                          {language === 'ar'
                            ? 'التقط صورة أو اختر من المعرض\nيمكنك إضافة عدة صفحات'
                            : 'Take a photo or choose from gallery\nYou can add multiple pages'}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* ─── Document Input ─────────────────────────────────── */}
                {inputMode === 'document' && (
                  <View>
                    <Pressable
                      onPress={handlePickDocument}
                      className="bg-slate-900/70 rounded-2xl border border-indigo-900/50 p-6 items-center"
                    >
                      <Upload size={32} color="#818cf8" />
                      <Text className="text-indigo-300 text-base font-medium mt-3">
                        {language === 'ar' ? 'اختر ملف' : 'Choose File'}
                      </Text>
                      <Text className="text-slate-500 text-xs mt-1">
                        PDF, DOC, DOCX
                      </Text>
                    </Pressable>

                    {selectedDocument && (
                      <View className="bg-slate-900/70 rounded-2xl border border-emerald-900/50 p-4 mt-3 flex-row items-center">
                        <FileText size={24} color="#10b981" />
                        <View className="flex-1 ml-3">
                          <Text className="text-white text-sm font-medium" numberOfLines={1}>
                            {selectedDocument.name}
                          </Text>
                          <Text className="text-slate-400 text-xs mt-0.5">
                            {selectedDocument.mimeType === 'application/pdf' ? 'PDF' : 'Word Document'}
                          </Text>
                        </View>
                        <Pressable onPress={() => setSelectedDocument(null)} className="p-2">
                          <X size={18} color="#94a3b8" />
                        </Pressable>
                      </View>
                    )}

                    {!selectedDocument && (
                      <View className="bg-slate-900/30 rounded-2xl border border-dashed border-slate-700 p-8 items-center mt-3">
                        <FileText size={40} color="#475569" />
                        <Text className="text-slate-500 text-sm mt-3 text-center">
                          {language === 'ar'
                            ? 'اختر ملف PDF أو Word يحتوي على العقد'
                            : 'Select a PDF or Word file containing the contract'}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* AAOIFI info card */}
                <View className="bg-indigo-950/40 rounded-2xl p-4 mt-4 border border-indigo-900/30">
                  <View className="flex-row items-start">
                    <BookOpen size={20} color="#818cf8" />
                    <View className="flex-1 ml-3">
                      <Text className="text-indigo-300 text-sm font-medium">
                        {language === 'ar'
                          ? 'التحليل يشمل 54 معيار أيوفي'
                          : 'Analysis covers all 54 AAOIFI Standards'}
                      </Text>
                      <Text className="text-indigo-300/60 text-xs mt-1 leading-5">
                        {language === 'ar'
                          ? '- فحص معايير أيوفي الشرعية الكاملة\n- كشف بنود الربا والغرر والميسر\n- التحقق من أركان وشروط العقد\n- اقتراحات بديلة متوافقة مع الشريعة'
                          : '- Full AAOIFI Shariah Standards screening\n- Riba, Gharar & Maysir detection\n- Contract pillars & conditions validation\n- Sharia-compliant alternative suggestions'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Analyze button */}
                <Pressable
                  onPress={handleAnalyze}
                  disabled={!hasContent}
                  className="mt-6 rounded-2xl overflow-hidden"
                  style={{ opacity: hasContent ? 1 : 0.4 }}
                >
                  <LinearGradient
                    colors={['#6366f1', '#4f46e5']}
                    style={{
                      paddingVertical: 18,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}
                  >
                    <Scale size={20} color="white" />
                    <Text className="text-white text-base font-semibold ml-2">
                      {language === 'ar' ? 'تحليل العقد' : 'Analyze Contract'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            )}

            {/* ─── Loading State ──────────────────────────────────────── */}
            {isAnalyzing && (
              <Animated.View
                entering={FadeIn.duration(300)}
                className="mx-4 mt-8 items-center"
              >
                <View className="bg-indigo-950/40 rounded-3xl p-8 items-center border border-indigo-900/30 w-full">
                  <ActivityIndicator size="large" color="#818cf8" />
                  <Text className="text-indigo-200 text-base font-medium mt-4">
                    {language === 'ar' ? 'جاري التحليل بالذكاء الاصطناعي...' : 'AI Analysis in Progress...'}
                  </Text>
                  <View className="mt-6 w-full">
                    {analysisSteps.map((step, index) => (
                      <Animated.View
                        key={index}
                        entering={FadeInDown.delay(index * 400).springify()}
                        className={`flex-row items-center mt-3 ${
                          index <= analysisStep ? 'opacity-100' : 'opacity-30'
                        }`}
                      >
                        {index < analysisStep ? (
                          <CheckCircle size={14} color="#10b981" style={{ marginRight: 10 }} />
                        ) : index === analysisStep ? (
                          <PulseIndicator />
                        ) : (
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 6,
                              backgroundColor: '#334155',
                              marginRight: 10,
                            }}
                          />
                        )}
                        <Text
                          className={`text-sm ${
                            index <= analysisStep ? 'text-indigo-300' : 'text-slate-600'
                          }`}
                        >
                          {step}
                        </Text>
                      </Animated.View>
                    ))}
                  </View>
                </View>
              </Animated.View>
            )}

            {/* ─── Results Section ────────────────────────────────────── */}
            {result && !showRevised && (
              <Animated.View entering={FadeInUp.springify()} className="mx-4 mt-4">
                {/* Score + Contract Type */}
                <View className="items-center mb-6">
                  <ScoreCircle score={result.overallScore} />
                  <Text className="text-white text-lg font-semibold mt-4">
                    {language === 'ar' ? 'درجة الامتثال' : 'Compliance Score'}
                  </Text>
                  <View className="bg-indigo-600/20 px-3 py-1 rounded-full mt-2">
                    <Text className="text-indigo-300 text-sm">{result.contractType}</Text>
                  </View>
                </View>

                {/* Summary */}
                <View className="bg-slate-900/60 rounded-2xl p-5 mb-4 border border-slate-800/50">
                  <View className="flex-row items-center mb-3">
                    <Shield size={18} color="#818cf8" />
                    <Text className="text-white font-semibold ml-2">
                      {language === 'ar' ? 'الملخص' : 'Summary'}
                    </Text>
                  </View>
                  <Text className="text-slate-300 text-sm leading-6">
                    {result.summary}
                  </Text>
                </View>

                {/* Findings */}
                {result.findings.length > 0 && (
                  <Text className="text-white font-semibold text-base mb-3">
                    {language === 'ar' ? 'النتائج' : 'Findings'} ({result.findings.length})
                  </Text>
                )}

                {result.findings.map((finding, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInUp.delay(100 * index).springify()}
                    className="mb-3"
                  >
                    <Pressable
                      onPress={() =>
                        setExpandedFindingIndex(
                          expandedFindingIndex === index ? null : index
                        )
                      }
                      className="bg-slate-900/60 rounded-2xl overflow-hidden border border-slate-800/50"
                    >
                      <View className="p-4">
                        <View className="flex-row items-start justify-between">
                          <View className="flex-1 mr-3">
                            <View className="flex-row items-center gap-2 mb-2">
                              <SeverityBadge
                                severity={finding.severity}
                                language={language ?? 'en'}
                              />
                              <Text className="text-slate-400 text-xs flex-1" numberOfLines={1}>
                                {finding.standard}
                              </Text>
                            </View>
                            <Text className="text-white text-sm leading-5">
                              {finding.issue}
                            </Text>
                          </View>
                          {expandedFindingIndex === index ? (
                            <ChevronUp size={18} color="#64748b" />
                          ) : (
                            <ChevronDown size={18} color="#64748b" />
                          )}
                        </View>
                      </View>

                      {expandedFindingIndex === index && (
                        <Animated.View entering={FadeIn.duration(200)}>
                          <View className="border-t border-slate-800 px-4 pb-4 pt-3">
                            <View className="bg-red-950/30 rounded-xl p-3 mb-3 border border-red-900/30">
                              <Text className="text-red-300/60 text-xs mb-1 font-medium">
                                {language === 'ar' ? 'البند المعني' : 'Clause'}
                              </Text>
                              <Text className="text-red-200/80 text-sm italic leading-5">
                                {`"${finding.clause}"`}
                              </Text>
                            </View>

                            <View className="bg-indigo-950/30 rounded-xl p-3 mb-3 border border-indigo-900/30">
                              <Text className="text-indigo-300/60 text-xs mb-1 font-medium">
                                {language === 'ar' ? 'المعيار الشرعي' : 'AAOIFI Standard'}
                              </Text>
                              <Text className="text-indigo-200/80 text-sm leading-5">
                                {finding.standard}
                              </Text>
                            </View>

                            <View className="bg-emerald-950/30 rounded-xl p-3 border border-emerald-900/30">
                              <Text className="text-emerald-300/60 text-xs mb-1 font-medium">
                                {language === 'ar' ? 'البديل المقترح' : 'Suggested Alternative'}
                              </Text>
                              <Text className="text-emerald-200/80 text-sm leading-5">
                                {finding.suggestion}
                              </Text>
                            </View>
                          </View>
                        </Animated.View>
                      )}
                    </Pressable>
                  </Animated.View>
                ))}

                {/* Action buttons */}
                <View className="mt-4 gap-3">
                  {inputMode === 'text' && contractText.trim().length > 0 && (
                    <Pressable
                      onPress={handleGenerateRevision}
                      disabled={isGeneratingRevision}
                      className="rounded-2xl overflow-hidden"
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
                        {isGeneratingRevision ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <>
                            <RefreshCw size={18} color="white" />
                            <Text className="text-white text-base font-semibold ml-2">
                              {language === 'ar'
                                ? 'إنشاء نسخة متوافقة'
                                : 'Generate Compliant Version'}
                            </Text>
                          </>
                        )}
                      </LinearGradient>
                    </Pressable>
                  )}

                  <Pressable
                    onPress={handleReset}
                    className="bg-slate-800/50 rounded-2xl py-4 items-center border border-slate-700"
                  >
                    <Text className="text-slate-300 text-base font-medium">
                      {language === 'ar' ? 'تحليل عقد آخر' : 'Analyze Another Contract'}
                    </Text>
                  </Pressable>
                </View>
              </Animated.View>
            )}

            {/* ─── Revised Contract View ──────────────────────────────── */}
            {showRevised && revisedContract && (
              <Animated.View entering={FadeInUp.springify()} className="mx-4 mt-4">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-white text-lg font-semibold">
                    {language === 'ar' ? 'العقد المعدل' : 'Revised Contract'}
                  </Text>
                  <Pressable
                    onPress={() => setShowRevised(false)}
                    className="bg-slate-800 p-2 rounded-full"
                  >
                    <X size={18} color="#94a3b8" />
                  </Pressable>
                </View>

                {revisionChanges.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-indigo-300 text-sm font-medium mb-3">
                      {language === 'ar'
                        ? `${revisionChanges.length} تعديلات`
                        : `${revisionChanges.length} Changes Made`}
                    </Text>
                    {revisionChanges.map((change, index) => (
                      <View
                        key={index}
                        className="bg-slate-900/60 rounded-xl p-4 mb-2 border border-slate-800/50"
                      >
                        <View className="bg-red-950/30 rounded-lg p-2 mb-2">
                          <Text className="text-red-300/70 text-xs line-through">
                            {change.original}
                          </Text>
                        </View>
                        <View className="bg-emerald-950/30 rounded-lg p-2 mb-2">
                          <Text className="text-emerald-300/70 text-xs">
                            {change.revised}
                          </Text>
                        </View>
                        <Text className="text-slate-400 text-xs italic">
                          {change.reason}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <View className="bg-slate-900/60 rounded-2xl border border-slate-800/50 overflow-hidden">
                  <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-800/50">
                    <Text className="text-white text-sm font-medium">
                      {language === 'ar' ? 'النص الكامل' : 'Full Text'}
                    </Text>
                    <Pressable
                      onPress={handleCopyRevised}
                      className="flex-row items-center bg-indigo-600/20 px-3 py-1.5 rounded-lg"
                    >
                      {copiedRevised ? (
                        <CheckCircle size={14} color="#10b981" />
                      ) : (
                        <Copy size={14} color="#818cf8" />
                      )}
                      <Text
                        className={`text-xs ml-1.5 font-medium ${
                          copiedRevised ? 'text-emerald-400' : 'text-indigo-400'
                        }`}
                      >
                        {copiedRevised
                          ? language === 'ar'
                            ? 'تم النسخ'
                            : 'Copied!'
                          : language === 'ar'
                          ? 'نسخ'
                          : 'Copy'}
                      </Text>
                    </Pressable>
                  </View>
                  <ScrollView style={{ maxHeight: 400 }}>
                    <Text className="text-slate-300 text-sm leading-6 p-4">
                      {revisedContract}
                    </Text>
                  </ScrollView>
                </View>

                <Pressable
                  onPress={() => setShowRevised(false)}
                  className="bg-indigo-600/20 rounded-2xl py-4 items-center mt-4 border border-indigo-800/50"
                >
                  <Text className="text-indigo-300 text-base font-medium">
                    {language === 'ar' ? 'العودة للنتائج' : 'Back to Results'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleReset}
                  className="bg-slate-800/50 rounded-2xl py-4 items-center mt-3 border border-slate-700"
                >
                  <Text className="text-slate-400 text-base font-medium">
                    {language === 'ar' ? 'تحليل عقد جديد' : 'Start New Analysis'}
                  </Text>
                </Pressable>
              </Animated.View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
