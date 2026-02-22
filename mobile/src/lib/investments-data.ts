export type IslamicContractType =
  | 'Murabaha'
  | 'Mudarabah'
  | 'Musharakah'
  | 'Ijarah'
  | 'Sukuk'
  | 'Wakalah'
  | 'Salam'
  | 'Istisna';

export type RiskLevel = 'Low' | 'Medium' | 'High';
export type PayoutFrequency = 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'At Maturity';

export interface HalalInvestment {
  id: string;
  entity: string;
  entityAr: string;
  product: string;
  productAr: string;
  description: string;
  descriptionAr: string;
  expectedReturn: string; // e.g. "5.5% - 7.0%"
  riskLevel: RiskLevel;
  minimumInvestment: number;
  currency: string;
  payoutFrequency: PayoutFrequency;
  country: string;
  countryAr: string;
  contractType: IslamicContractType;
  companyOverview: string;
  companyOverviewAr: string;
  investmentUse: string;
  investmentUseAr: string;
  terms: string;
  termsAr: string;
  shariaCompliance: string;
  shariaComplianceAr: string;
  maturity: string; // e.g. "3 years", "Open-ended"
  sector: string;
}

export const HALAL_INVESTMENTS: HalalInvestment[] = [
  {
    id: 'inv_1',
    entity: 'Al Rajhi Capital',
    entityAr: 'الراجحي المالية',
    product: 'Al Rajhi Sukuk Fund',
    productAr: 'صندوق صكوك الراجحي',
    description: 'A diversified sukuk fund investing in investment-grade Islamic bonds across GCC markets.',
    descriptionAr: 'صندوق صكوك متنوع يستثمر في صكوك إسلامية ذات تصنيف استثماري عبر أسواق دول مجلس التعاون.',
    expectedReturn: '4.5% - 6.0%',
    riskLevel: 'Low',
    minimumInvestment: 5000,
    currency: 'SAR',
    payoutFrequency: 'Quarterly',
    country: 'Saudi Arabia',
    countryAr: 'المملكة العربية السعودية',
    contractType: 'Sukuk',
    companyOverview: 'Al Rajhi Capital is the investment banking arm of Al Rajhi Bank, one of the largest Islamic banks in the world with over $100 billion in assets.',
    companyOverviewAr: 'الراجحي المالية هي الذراع الاستثمارية لمصرف الراجحي، أحد أكبر البنوك الإسلامية في العالم بأصول تتجاوز 100 مليار دولار.',
    investmentUse: 'Funds are allocated across sovereign and corporate sukuk issued by governments and top-rated corporations in the GCC region, focusing on infrastructure and real estate development.',
    investmentUseAr: 'يتم توزيع الأموال عبر صكوك سيادية وشركات صادرة عن حكومات وشركات كبرى في منطقة الخليج، مع التركيز على البنية التحتية والتطوير العقاري.',
    terms: 'Open-ended fund. Redemption requests processed within 5 business days. No lock-up period. Annual management fee of 0.75%.',
    termsAr: 'صندوق مفتوح. يتم معالجة طلبات الاسترداد خلال 5 أيام عمل. لا توجد فترة حجز. رسوم إدارة سنوية 0.75%.',
    shariaCompliance: 'Certified by Al Rajhi Bank Sharia Board. Compliant with AAOIFI Shariah Standard No. 17 (Investment Sukuk). Annual Sharia audit conducted.',
    shariaComplianceAr: 'معتمد من الهيئة الشرعية لمصرف الراجحي. متوافق مع معيار أيوفي الشرعي رقم 17 (صكوك الاستثمار). يتم إجراء تدقيق شرعي سنوي.',
    maturity: 'Open-ended',
    sector: 'Fixed Income',
  },
  {
    id: 'inv_2',
    entity: 'Wafra Capital',
    entityAr: 'وفرة كابيتال',
    product: 'Gulf Real Estate Ijarah Fund',
    productAr: 'صندوق إجارة العقارات الخليجية',
    description: 'A real estate fund that acquires commercial properties and leases them through Ijarah contracts.',
    descriptionAr: 'صندوق عقاري يستحوذ على عقارات تجارية ويؤجرها من خلال عقود إجارة.',
    expectedReturn: '7.0% - 9.5%',
    riskLevel: 'Medium',
    minimumInvestment: 25000,
    currency: 'USD',
    payoutFrequency: 'Quarterly',
    country: 'UAE',
    countryAr: 'الإمارات العربية المتحدة',
    contractType: 'Ijarah',
    companyOverview: 'Wafra Capital is an Islamic asset management firm specializing in real estate and private equity investments across the MENA region.',
    companyOverviewAr: 'وفرة كابيتال هي شركة إدارة أصول إسلامية متخصصة في الاستثمارات العقارية والملكية الخاصة في منطقة الشرق الأوسط وشمال أفريقيا.',
    investmentUse: 'Acquiring Grade A commercial office buildings and retail spaces in Dubai, Abu Dhabi, and Riyadh. Properties are leased to blue-chip tenants on long-term Ijarah agreements.',
    investmentUseAr: 'الاستحواذ على مباني مكاتب تجارية ومساحات تجزئة من الدرجة الأولى في دبي وأبوظبي والرياض. يتم تأجير العقارات لمستأجرين من الدرجة الأولى بعقود إجارة طويلة الأجل.',
    terms: 'Closed-end fund. 5-year investment horizon. Capital returned at maturity plus appreciation. Annual management fee of 1.5%. Minimum hold: 2 years.',
    termsAr: 'صندوق مغلق. أفق استثماري 5 سنوات. يتم إرجاع رأس المال عند الاستحقاق مع الارتفاع. رسوم إدارة سنوية 1.5%. حد أدنى للاحتفاظ: سنتان.',
    shariaCompliance: 'Supervised by an independent Sharia board. Compliant with AAOIFI SS No. 9 (Ijarah). Quarterly Sharia review reports available to investors.',
    shariaComplianceAr: 'تحت إشراف هيئة شرعية مستقلة. متوافق مع معيار أيوفي رقم 9 (الإجارة). تقارير المراجعة الشرعية الربع سنوية متاحة للمستثمرين.',
    maturity: '5 years',
    sector: 'Real Estate',
  },
  {
    id: 'inv_3',
    entity: 'Amundi Islamic',
    entityAr: 'أموندي الإسلامية',
    product: 'Global Equity Mudarabah Fund',
    productAr: 'صندوق الأسهم العالمية بالمضاربة',
    description: 'A global equity fund that invests in Sharia-compliant stocks through a Mudarabah structure.',
    descriptionAr: 'صندوق أسهم عالمي يستثمر في أسهم متوافقة مع الشريعة من خلال هيكل المضاربة.',
    expectedReturn: '8.0% - 14.0%',
    riskLevel: 'High',
    minimumInvestment: 1000,
    currency: 'USD',
    payoutFrequency: 'Annual',
    country: 'Malaysia',
    countryAr: 'ماليزيا',
    contractType: 'Mudarabah',
    companyOverview: 'Amundi Islamic is the Islamic investment arm of Amundi, Europe\'s largest asset manager with over €2 trillion under management.',
    companyOverviewAr: 'أموندي الإسلامية هي الذراع الاستثمارية الإسلامية لأموندي، أكبر مدير أصول في أوروبا بأصول تتجاوز 2 تريليون يورو.',
    investmentUse: 'Investing in a diversified portfolio of 80-120 Sharia-screened global equities across technology, healthcare, consumer goods, and industrials. Screens exclude alcohol, tobacco, weapons, gambling, and conventional financial services.',
    investmentUseAr: 'الاستثمار في محفظة متنوعة من 80-120 سهماً عالمياً مختاراً وفق الشريعة عبر قطاعات التكنولوجيا والرعاية الصحية والسلع الاستهلاكية والصناعات. يستبعد الفرز الكحول والتبغ والأسلحة والقمار والخدمات المالية التقليدية.',
    terms: 'Open-ended fund. Daily liquidity. Profit-sharing ratio: 70% investor / 30% manager. Annual management fee of 1.2%. No entry fee.',
    termsAr: 'صندوق مفتوح. سيولة يومية. نسبة تقاسم الأرباح: 70% للمستثمر / 30% للمدير. رسوم إدارة سنوية 1.2%. لا توجد رسوم اشتراك.',
    shariaCompliance: 'Certified by Securities Commission Malaysia Shariah Advisory Council. Stocks screened against AAOIFI and MSCI Islamic Index criteria. Annual purification ratio published.',
    shariaComplianceAr: 'معتمد من مجلس الاستشارات الشرعية لهيئة الأوراق المالية الماليزية. يتم فحص الأسهم وفق معايير أيوفي ومؤشر MSCI الإسلامي. يتم نشر نسبة التطهير السنوية.',
    maturity: 'Open-ended',
    sector: 'Equities',
  },
  {
    id: 'inv_4',
    entity: 'Boubyan Bank',
    entityAr: 'بنك بوبيان',
    product: 'Murabaha Savings Account',
    productAr: 'حساب التوفير بالمرابحة',
    description: 'A savings account structured as a commodity Murabaha, providing competitive returns on deposits.',
    descriptionAr: 'حساب توفير مهيكل كمرابحة سلعية، يوفر عوائد تنافسية على الودائع.',
    expectedReturn: '3.5% - 4.5%',
    riskLevel: 'Low',
    minimumInvestment: 500,
    currency: 'KWD',
    payoutFrequency: 'Monthly',
    country: 'Kuwait',
    countryAr: 'الكويت',
    contractType: 'Murabaha',
    companyOverview: 'Boubyan Bank is a leading Islamic bank in Kuwait, known for its digital banking innovation and consistent growth. It has been named Best Islamic Bank in Kuwait multiple times.',
    companyOverviewAr: 'بنك بوبيان هو بنك إسلامي رائد في الكويت، معروف بابتكاراته في الخدمات المصرفية الرقمية ونموه المستمر. حاز على جائزة أفضل بنك إسلامي في الكويت عدة مرات.',
    investmentUse: 'Deposits are deployed in commodity Murabaha transactions on the London Metal Exchange. The bank purchases commodities and sells them at a markup, with the profit passed to depositors.',
    investmentUseAr: 'يتم توظيف الودائع في معاملات مرابحة سلعية في بورصة لندن للمعادن. يشتري البنك السلع ويبيعها بهامش ربح، ويمرر الربح للمودعين.',
    terms: 'No minimum holding period. Withdraw anytime. Profit distributed monthly based on actual returns. No management fees. KDIPA insured up to KWD 75,000.',
    termsAr: 'لا يوجد حد أدنى لفترة الاحتفاظ. السحب في أي وقت. يتم توزيع الأرباح شهرياً بناءً على العوائد الفعلية. لا توجد رسوم إدارة. مؤمن لدى هيئة ضمان الودائع حتى 75,000 دينار.',
    shariaCompliance: 'Full Sharia-compliant bank. Supervised by internal Sharia board. Compliant with AAOIFI SS No. 8 (Murabaha). Central Bank of Kuwait regulated.',
    shariaComplianceAr: 'بنك إسلامي بالكامل. تحت إشراف الهيئة الشرعية الداخلية. متوافق مع معيار أيوفي رقم 8 (المرابحة). خاضع لرقابة بنك الكويت المركزي.',
    maturity: 'Open-ended',
    sector: 'Savings',
  },
  {
    id: 'inv_5',
    entity: 'SEDCO Capital',
    entityAr: 'سيدكو كابيتال',
    product: 'Prudent Ethical Fund',
    productAr: 'صندوق الاستثمار الأخلاقي الحصيف',
    description: 'A multi-asset fund combining sukuk, equities, and real estate for balanced growth with ethical screening.',
    descriptionAr: 'صندوق متعدد الأصول يجمع بين الصكوك والأسهم والعقارات لتحقيق نمو متوازن مع فحص أخلاقي.',
    expectedReturn: '6.0% - 8.5%',
    riskLevel: 'Medium',
    minimumInvestment: 10000,
    currency: 'USD',
    payoutFrequency: 'Semi-Annual',
    country: 'Saudi Arabia',
    countryAr: 'المملكة العربية السعودية',
    contractType: 'Wakalah',
    companyOverview: 'SEDCO Capital is one of the largest Sharia-compliant asset managers in the world, managing over $5 billion in assets. Based in Jeddah, it serves institutional and high-net-worth clients.',
    companyOverviewAr: 'سيدكو كابيتال هي واحدة من أكبر شركات إدارة الأصول المتوافقة مع الشريعة في العالم، تدير أكثر من 5 مليارات دولار. مقرها جدة وتخدم العملاء المؤسسيين وأصحاب الثروات.',
    investmentUse: 'Allocated across 40% global sukuk, 35% Sharia-compliant equities, and 25% real estate funds. The fund aims for capital preservation with moderate growth, suitable for retirement planning.',
    investmentUseAr: 'موزعة بين 40% صكوك عالمية، و35% أسهم متوافقة مع الشريعة، و25% صناديق عقارية. يهدف الصندوق إلى الحفاظ على رأس المال مع نمو معتدل، مناسب للتخطيط للتقاعد.',
    terms: 'Open-ended with quarterly redemption windows. 90-day notice for withdrawals over $100,000. Annual management fee of 1.0%. Performance fee of 10% above 5% hurdle.',
    termsAr: 'صندوق مفتوح مع نوافذ استرداد ربع سنوية. إشعار 90 يوماً للسحوبات فوق 100,000 دولار. رسوم إدارة سنوية 1.0%. رسوم أداء 10% فوق عتبة 5%.',
    shariaCompliance: 'Independent Sharia board with 3 renowned scholars. AAOIFI-compliant across all standards. UN PRI signatory. ESG screening applied alongside Sharia screening.',
    shariaComplianceAr: 'هيئة شرعية مستقلة من 3 علماء بارزين. متوافق مع جميع معايير أيوفي. موقع على مبادئ الأمم المتحدة للاستثمار المسؤول. يتم تطبيق فحص ESG بجانب الفحص الشرعي.',
    maturity: 'Open-ended',
    sector: 'Multi-Asset',
  },
  {
    id: 'inv_6',
    entity: 'Dubai Islamic Bank',
    entityAr: 'بنك دبي الإسلامي',
    product: 'Al Islami Fixed Deposit',
    productAr: 'الوديعة الثابتة الإسلامي',
    description: 'A fixed-term Murabaha deposit offering guaranteed capital return with competitive profit rates.',
    descriptionAr: 'وديعة مرابحة لأجل ثابت تقدم عائد رأسمالي مضمون مع معدلات ربح تنافسية.',
    expectedReturn: '4.0% - 5.5%',
    riskLevel: 'Low',
    minimumInvestment: 10000,
    currency: 'AED',
    payoutFrequency: 'At Maturity',
    country: 'UAE',
    countryAr: 'الإمارات العربية المتحدة',
    contractType: 'Murabaha',
    companyOverview: 'Dubai Islamic Bank, established in 1975, is the world\'s first full-service Islamic bank. It is listed on the Dubai Financial Market with assets exceeding $80 billion.',
    companyOverviewAr: 'بنك دبي الإسلامي، تأسس عام 1975، هو أول بنك إسلامي متكامل الخدمات في العالم. مدرج في سوق دبي المالي بأصول تتجاوز 80 مليار دولار.',
    investmentUse: 'Deployed in trade finance Murabaha transactions and corporate financing for Sharia-compliant projects in construction, logistics, and technology sectors across the UAE.',
    investmentUseAr: 'يتم توظيفها في معاملات المرابحة التجارية وتمويل الشركات للمشاريع المتوافقة مع الشريعة في قطاعات البناء والخدمات اللوجستية والتكنولوجيا في الإمارات.',
    terms: '3-month, 6-month, or 12-month terms available. Early withdrawal incurs profit forfeiture. Capital is protected. No management fees.',
    termsAr: 'متاحة بفترات 3 أشهر أو 6 أشهر أو 12 شهراً. السحب المبكر يؤدي إلى خسارة الأرباح. رأس المال محمي. لا توجد رسوم إدارة.',
    shariaCompliance: 'Supervised by DIB\'s Fatwa and Sharia Supervisory Board. Compliant with AAOIFI SS No. 8 (Murabaha). UAE Central Bank regulated and insured.',
    shariaComplianceAr: 'تحت إشراف هيئة الفتوى والرقابة الشرعية لبنك دبي الإسلامي. متوافق مع معيار أيوفي رقم 8 (المرابحة). خاضع لرقابة المصرف المركزي الإماراتي ومؤمن.',
    maturity: '3-12 months',
    sector: 'Fixed Income',
  },
  {
    id: 'inv_7',
    entity: 'Amanah Capital Group',
    entityAr: 'مجموعة أمانة كابيتال',
    product: 'Islamic Venture Capital Fund',
    productAr: 'صندوق رأس المال المخاطر الإسلامي',
    description: 'An early-stage venture fund investing in Sharia-compliant tech startups across MENA.',
    descriptionAr: 'صندوق رأس مال مخاطر يستثمر في شركات التكنولوجيا الناشئة المتوافقة مع الشريعة في الشرق الأوسط.',
    expectedReturn: '15.0% - 25.0%',
    riskLevel: 'High',
    minimumInvestment: 50000,
    currency: 'USD',
    payoutFrequency: 'At Maturity',
    country: 'Bahrain',
    countryAr: 'البحرين',
    contractType: 'Musharakah',
    companyOverview: 'Amanah Capital Group is a Bahrain-based Islamic venture capital firm that has invested in over 30 startups since 2018, with 4 successful exits.',
    companyOverviewAr: 'مجموعة أمانة كابيتال هي شركة رأس مال مخاطر إسلامية مقرها البحرين استثمرت في أكثر من 30 شركة ناشئة منذ 2018، مع 4 عمليات تخارج ناجحة.',
    investmentUse: 'Investing in Series A and B rounds of fintech, healthtech, edtech, and agritech startups. Structured as Musharakah partnerships with equity ownership in each venture.',
    investmentUseAr: 'الاستثمار في جولات التمويل A و B لشركات التكنولوجيا المالية والصحية والتعليمية والزراعية الناشئة. مهيكل كشراكات مشاركة مع ملكية أسهم في كل مشروع.',
    terms: 'Closed-end fund. 7-year term with 2-year extension option. Capital calls over first 3 years. Distributions begin year 4. Annual fee: 2%. Carry: 20% above 8% hurdle.',
    termsAr: 'صندوق مغلق. مدة 7 سنوات مع خيار تمديد سنتين. مطالبات رأس المال خلال أول 3 سنوات. التوزيعات تبدأ في السنة الرابعة. رسوم سنوية: 2%. حصة الأداء: 20% فوق عتبة 8%.',
    shariaCompliance: 'Sharia board includes scholars from AAOIFI. Compliant with SS No. 12 (Musharakah). All portfolio companies must pass halal business screening. No investments in gambling, alcohol, or conventional finance.',
    shariaComplianceAr: 'الهيئة الشرعية تضم علماء من أيوفي. متوافق مع المعيار رقم 12 (المشاركة). جميع شركات المحفظة يجب أن تجتاز فحص الأعمال الحلال. لا استثمارات في القمار أو الكحول أو التمويل التقليدي.',
    maturity: '7 years',
    sector: 'Venture Capital',
  },
  {
    id: 'inv_8',
    entity: 'Kuwait Finance House',
    entityAr: 'بيت التمويل الكويتي',
    product: 'KFH Ijara Auto Finance',
    productAr: 'تمويل السيارات بالإجارة من بيتك',
    description: 'Vehicle financing through Ijarah Muntahia Bittamleek — lease-to-own with competitive rates.',
    descriptionAr: 'تمويل المركبات من خلال إجارة منتهية بالتمليك — تأجير ينتهي بالتملك بأسعار تنافسية.',
    expectedReturn: '3.0% - 4.0%',
    riskLevel: 'Low',
    minimumInvestment: 0,
    currency: 'KWD',
    payoutFrequency: 'Monthly',
    country: 'Kuwait',
    countryAr: 'الكويت',
    contractType: 'Ijarah',
    companyOverview: 'Kuwait Finance House is one of the world\'s largest Islamic financial institutions, founded in 1977. It operates in banking, takaful, real estate, and investment services.',
    companyOverviewAr: 'بيت التمويل الكويتي هو أحد أكبر المؤسسات المالية الإسلامية في العالم، تأسس عام 1977. يعمل في الخدمات المصرفية والتكافل والعقارات والاستثمار.',
    investmentUse: 'KFH purchases the vehicle and leases it to the customer under Ijarah Muntahia Bittamleek. Ownership transfers to the customer at the end of the lease period through a gift or token sale.',
    investmentUseAr: 'يشتري بيتك المركبة ويؤجرها للعميل بموجب إجارة منتهية بالتمليك. تنتقل الملكية للعميل في نهاية فترة الإيجار من خلال هبة أو بيع رمزي.',
    terms: 'Financing up to 5 years. Down payment from 10%. Vehicle insurance (Takaful) required. Early settlement allowed with ibra (rebate).',
    termsAr: 'تمويل حتى 5 سنوات. دفعة أولى من 10%. تأمين المركبة (تكافل) مطلوب. السداد المبكر مسموح مع إبراء (خصم).',
    shariaCompliance: 'Fully Sharia-compliant. Supervised by KFH Sharia Board. Compliant with AAOIFI SS No. 9 (Ijarah). Kuwait Central Bank regulated.',
    shariaComplianceAr: 'متوافق تماماً مع الشريعة. تحت إشراف الهيئة الشرعية لبيتك. متوافق مع معيار أيوفي رقم 9 (الإجارة). خاضع لرقابة بنك الكويت المركزي.',
    maturity: '1-5 years',
    sector: 'Consumer Finance',
  },
];

// ─── Filter Options ──────────────────────────────────────────────────────────

export const CONTRACT_TYPE_FILTERS: { value: IslamicContractType; labelEn: string; labelAr: string }[] = [
  { value: 'Sukuk', labelEn: 'Sukuk', labelAr: 'صكوك' },
  { value: 'Murabaha', labelEn: 'Murabaha', labelAr: 'مرابحة' },
  { value: 'Mudarabah', labelEn: 'Mudarabah', labelAr: 'مضاربة' },
  { value: 'Musharakah', labelEn: 'Musharakah', labelAr: 'مشاركة' },
  { value: 'Ijarah', labelEn: 'Ijarah', labelAr: 'إجارة' },
  { value: 'Wakalah', labelEn: 'Wakalah', labelAr: 'وكالة' },
];

export const RISK_FILTERS: { value: RiskLevel; labelEn: string; labelAr: string }[] = [
  { value: 'Low', labelEn: 'Low Risk', labelAr: 'مخاطر منخفضة' },
  { value: 'Medium', labelEn: 'Medium Risk', labelAr: 'مخاطر متوسطة' },
  { value: 'High', labelEn: 'High Risk', labelAr: 'مخاطر عالية' },
];

export const COUNTRY_FILTERS: { value: string; labelEn: string; labelAr: string }[] = [
  { value: 'Saudi Arabia', labelEn: 'Saudi Arabia', labelAr: 'السعودية' },
  { value: 'UAE', labelEn: 'UAE', labelAr: 'الإمارات' },
  { value: 'Kuwait', labelEn: 'Kuwait', labelAr: 'الكويت' },
  { value: 'Bahrain', labelEn: 'Bahrain', labelAr: 'البحرين' },
  { value: 'Malaysia', labelEn: 'Malaysia', labelAr: 'ماليزيا' },
];
