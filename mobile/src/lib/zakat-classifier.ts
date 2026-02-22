import { LineItemClassification, BusinessLineItem } from './store';

// Offline keyword database for classifying balance sheet items
// Based on AAOIFI Islamic accounting standards

interface ClassificationRule {
  keywords: string[];
  classification: LineItemClassification;
  ruling?: string;
  clarificationQuestion?: string;
}

const zakatableRules: ClassificationRule[] = [
  {
    keywords: ['cash', 'cash on hand', 'petty cash', 'cash in bank', 'bank balance'],
    classification: 'zakatable',
    ruling: 'Cash and bank balances are always zakatable as they represent liquid assets.',
  },
  {
    keywords: ['accounts receivable', 'receivables', 'trade receivables', 'customer receivables', 'debtor'],
    classification: 'zakatable',
    ruling: 'Receivables expected to be collected are zakatable at their recoverable value.',
  },
  {
    keywords: ['inventory', 'stock', 'merchandise', 'goods for sale', 'trading goods', 'finished goods'],
    classification: 'zakatable',
    ruling: 'Inventory held for sale is zakatable at market value.',
  },
  {
    keywords: ['raw materials', 'work in progress', 'wip'],
    classification: 'zakatable',
    ruling: 'Raw materials and WIP are zakatable as they will become tradeable goods.',
  },
  {
    keywords: ['short term investment', 'marketable securities', 'trading securities', 'quoted shares'],
    classification: 'zakatable',
    ruling: 'Short-term investments held for trading are zakatable at market value.',
  },
  {
    keywords: ['sukuk', 'islamic bond', 'mudaraba', 'musharaka investment'],
    classification: 'zakatable',
    ruling: 'Islamic financial instruments are zakatable at their current value.',
  },
  {
    keywords: ['prepaid expense', 'prepayment', 'advance payment'],
    classification: 'zakatable',
    ruling: 'Prepaid expenses that can be recovered are zakatable.',
  },
];

const deductibleRules: ClassificationRule[] = [
  {
    keywords: ['accounts payable', 'payables', 'trade payables', 'supplier payable', 'creditor'],
    classification: 'deductible',
    ruling: 'Amounts owed to suppliers reduce the zakat base as they are current liabilities.',
  },
  {
    keywords: ['wages payable', 'salary payable', 'employee payable', 'accrued wages', 'accrued salary'],
    classification: 'deductible',
    ruling: 'Owed wages are deductible as they are obligations to employees.',
  },
  {
    keywords: ['accrued expense', 'accrued liability', 'expenses payable'],
    classification: 'deductible',
    ruling: 'Accrued expenses represent current obligations and are deductible.',
  },
  {
    keywords: ['customer deposit', 'advance from customer', 'unearned revenue', 'deferred revenue'],
    classification: 'deductible',
    ruling: 'Deposits held from customers are liabilities and reduce the zakat base.',
  },
  {
    keywords: ['zakat payable', 'zakat provision', 'zakat liability'],
    classification: 'deductible',
    ruling: 'Previously calculated zakat not yet paid is deductible.',
  },
  {
    keywords: ['tax payable', 'income tax payable', 'vat payable', 'sales tax payable'],
    classification: 'deductible',
    ruling: 'Taxes owed to government are deductible current liabilities.',
  },
  {
    keywords: ['islamic financing', 'murabaha payable', 'ijara payable', 'islamic loan'],
    classification: 'deductible',
    ruling: 'Islamic financing obligations are deductible from the zakat base.',
  },
];

const exemptRules: ClassificationRule[] = [
  {
    keywords: ['fixed asset', 'property plant equipment', 'ppe', 'building', 'land', 'machinery'],
    classification: 'exempt',
    ruling: 'Fixed assets used in business operations are exempt from zakat.',
  },
  {
    keywords: ['furniture', 'fixture', 'office equipment', 'computer equipment'],
    classification: 'exempt',
    ruling: 'Office equipment and furniture used for operations are exempt.',
  },
  {
    keywords: ['vehicle', 'motor vehicle', 'company car', 'delivery truck'],
    classification: 'exempt',
    ruling: 'Vehicles used for business operations are exempt from zakat.',
  },
  {
    keywords: ['accumulated depreciation', 'depreciation', 'amortization'],
    classification: 'exempt',
    ruling: 'Depreciation is an accounting entry and is exempt.',
  },
  {
    keywords: ['goodwill', 'intangible asset', 'trademark', 'patent', 'copyright'],
    classification: 'exempt',
    ruling: 'Intangible assets not held for sale are exempt from zakat.',
  },
  {
    keywords: ['retained earnings', 'accumulated profit', 'reserve', 'share capital', 'equity'],
    classification: 'exempt',
    ruling: 'Equity items are not directly zakatable - assets are assessed instead.',
  },
  {
    keywords: ['deferred tax', 'deferred expense'],
    classification: 'exempt',
    ruling: 'Deferred items are accounting entries and exempt from direct zakat assessment.',
  },
];

const notDeductibleRules: ClassificationRule[] = [
  {
    keywords: ['bank loan', 'conventional loan', 'interest loan', 'mortgage', 'bank borrowing'],
    classification: 'not_deductible',
    ruling: 'Interest-based loans cannot reduce the zakat base per Islamic principles.',
  },
  {
    keywords: ['long term debt', 'long term loan', 'bond payable', 'debenture'],
    classification: 'not_deductible',
    ruling: 'Long-term debts generally do not reduce current zakat obligations.',
  },
  {
    keywords: ['interest payable', 'finance charge', 'bank charge'],
    classification: 'not_deductible',
    ruling: 'Interest-related charges are not deductible under Islamic principles.',
  },
];

const needsClarificationRules: ClassificationRule[] = [
  {
    keywords: ['equipment', 'plant', 'machine'],
    classification: 'needs_clarification',
    clarificationQuestion: 'Is this equipment for trading/selling OR for business operations?',
  },
  {
    keywords: ['real estate', 'property', 'land'],
    classification: 'needs_clarification',
    clarificationQuestion: 'Is this property for trading/selling OR for business operations?',
  },
  {
    keywords: ['vehicle', 'car', 'truck', 'fleet'],
    classification: 'needs_clarification',
    clarificationQuestion: 'Is this vehicle for trading/selling OR for business operations?',
  },
  {
    keywords: ['short term loan', 'current loan', 'borrowing'],
    classification: 'needs_clarification',
    clarificationQuestion: 'Is this Islamic financing OR conventional interest-based?',
  },
  {
    keywords: ['security deposit', 'deposit', 'refundable deposit'],
    classification: 'needs_clarification',
    clarificationQuestion: 'Did you pay this deposit OR are you holding it from customers?',
  },
  {
    keywords: ['investment', 'investment in subsidiary', 'investment in associate'],
    classification: 'needs_clarification',
    clarificationQuestion: 'Is this investment for trading OR long-term strategic holding?',
  },
];

const allRules = [
  ...zakatableRules,
  ...deductibleRules,
  ...exemptRules,
  ...notDeductibleRules,
  ...needsClarificationRules,
];

export function classifyLineItem(itemName: string): {
  classification: LineItemClassification;
  ruling?: string;
  clarificationQuestion?: string;
} {
  const normalizedName = itemName.toLowerCase().trim();

  // Check each rule set
  for (const rule of allRules) {
    for (const keyword of rule.keywords) {
      if (normalizedName.includes(keyword.toLowerCase())) {
        return {
          classification: rule.classification,
          ruling: rule.ruling,
          clarificationQuestion: rule.clarificationQuestion,
        };
      }
    }
  }

  // Default: if we can't classify, mark as needs clarification
  return {
    classification: 'needs_clarification',
    clarificationQuestion: 'How should this item be treated for Zakat purposes?',
  };
}

export function generateLineItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createBusinessLineItem(name: string, amount: number): BusinessLineItem {
  const { classification, ruling, clarificationQuestion } = classifyLineItem(name);

  return {
    id: generateLineItemId(),
    name,
    amount,
    classification,
    islamicRuling: ruling,
    clarificationQuestion,
  };
}

// Common business line items for auto-generation in manual mode
export const commonLineItems = [
  // Assets
  { name: 'Cash on Hand', category: 'asset' },
  { name: 'Bank Balance', category: 'asset' },
  { name: 'Accounts Receivable', category: 'asset' },
  { name: 'Inventory', category: 'asset' },
  { name: 'Prepaid Expenses', category: 'asset' },
  { name: 'Fixed Assets', category: 'asset' },
  { name: 'Equipment', category: 'asset' },
  { name: 'Vehicles', category: 'asset' },
  { name: 'Land', category: 'asset' },
  { name: 'Building', category: 'asset' },
  { name: 'Short-term Investments', category: 'asset' },
  { name: 'Security Deposits', category: 'asset' },

  // Liabilities
  { name: 'Accounts Payable', category: 'liability' },
  { name: 'Wages Payable', category: 'liability' },
  { name: 'Accrued Expenses', category: 'liability' },
  { name: 'Customer Deposits', category: 'liability' },
  { name: 'Short-term Loan', category: 'liability' },
  { name: 'Bank Loan', category: 'liability' },
  { name: 'Tax Payable', category: 'liability' },
  { name: 'Zakat Payable', category: 'liability' },
];
