import { Hono } from "hono";
import { z } from "zod";
import { env } from "../env";
import { extractResponseText } from "../lib/openai";

const contractsRouter = new Hono();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Finding {
  clause: string;
  standard: string;
  issue: string;
  severity: "high" | "medium" | "low";
  alternative: string;
}

interface ReviewResult {
  contractType: string;
  overallScore: number;
  totalClauses: number;
  compliantClauses: number;
  nonCompliantClauses: number;
  findings: Finding[];
  summary: string;
  revisedContract: string;
}

interface RevisionChange {
  original: string;
  revised: string;
  reason: string;
}

interface RevisionResult {
  revisedContract: string;
  changes: RevisionChange[];
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const reviewBodySchema = z.object({
  contractText: z.string().min(1, "contractText is required"),
  language: z.enum(["en", "ar"]).optional(),
});

const reviseBodySchema = z.object({
  contractText: z.string().min(1, "contractText is required"),
  findings: z.array(z.any()).min(1, "findings array is required and must not be empty"),
  language: z.enum(["en", "ar"]).optional(),
});

// ---------------------------------------------------------------------------
// AAOIFI Standards Reference (used in system prompts)
// ---------------------------------------------------------------------------

const AAOIFI_STANDARDS_REFERENCE = `AAOIFI Shariah Standards Reference:

SS1: Trading in Currencies - Rules for currency exchange (sarf), spot settlement requirements, prohibition of forward currency transactions except at spot rate, and conditions for currency trading.

SS2: Debit Card, Charge Card and Credit Card - Permissibility conditions for payment cards, prohibition of interest on outstanding balances, fees must not be linked to transaction amounts in ways that constitute riba.

SS3: Default in Payment by a Debtor - Prohibition of charging penalties that constitute riba, permissible actions against defaulting debtors, charitable penalty clauses, and rescheduling guidelines.

SS4: Settlement of Debt by Set-Off - Conditions under which mutual debts can be offset (muqassah), requirements for debts to be of the same kind, and restrictions on set-off involving different currencies.

SS5: Guarantees (Kafalah) - Types of guarantees, non-profit nature of guarantees, prohibition of charging fees for guarantees (though administrative costs may be recovered), conditions for validity.

SS8: Murabahah (Cost-Plus Sale) - Requirements for valid Murabahah: institution must own the asset before selling, cost and markup must be disclosed, no penalty interest on late payment, binding vs non-binding promise to purchase.

SS9: Ijarah (Leasing) and Ijarah Muntahia Bittamleek - Lessor retains ownership and bears major maintenance, lease payments cannot include interest, conditions for lease-to-own arrangements, insurance responsibilities.

SS10: Salam (Forward Sale) and Parallel Salam - Full price must be paid at contract inception, subject matter must be clearly specified by description and quantity, delivery date must be fixed, restrictions on selling Salam commodity before receipt.

SS11: Istisna'a (Manufacturing Contract) and Parallel Istisna'a - Price can be deferred or paid in installments, subject matter must be specified in detail, manufacturer bears liability until delivery, conditions for parallel Istisna'a.

SS12: Sharikah (Musharakah) and Modern Corporations - Profit sharing must be by agreed ratios (not fixed amounts), losses borne in proportion to capital contribution, partners can participate in management, diminishing Musharakah conditions.

SS13: Mudarabah (Profit-Sharing) - Capital provider bears all losses (unless negligence by Mudarib), profit ratio must be agreed upfront, Mudarib cannot guarantee capital, restrictions on Mudarib's activities.

SS14: Documentary Credit - Letters of credit conditions, fees for services are permissible, prohibition of interest-based documentary credits, and Shariah-compliant alternatives.

SS17: Investment Sukuk - Asset-backing requirements, Sukuk holders must bear ownership risks, prohibition of capital guarantees by issuer/manager, types of Sukuk (Ijarah, Musharakah, Mudarabah, etc.).

SS18: Possession (Qabd) - Constructive vs physical possession, requirements for valid possession in different contract types, risks transfer upon possession, and conditions for each type.

SS19: Loan (Qard) - Loans must be interest-free, borrower must return exact amount (no increment), lender cannot stipulate benefits, service charges permissible if covering actual costs only.

SS21: Financial Paper (Shares and Bonds) - Shariah screening criteria for equities, prohibition of conventional bonds, conditions for tradability of financial instruments, and purification requirements.

SS22: Concession Contracts - Government concession Shariah requirements, BOT arrangements, revenue-sharing models, and conditions for Shariah compliance in public-private partnerships.

SS23: Agency (Wakalah) and Act of Uncommissioned Agent (Fodooli) - Agent's duties and liabilities, fee structures for agency, restrictions on agent acting for own benefit, ratification of unauthorized acts.

SS25: Combination of Contracts - Prohibition of combining sale and loan in one transaction, restrictions on combining contracts that lead to riba or gharar, permissible contract combinations.

SS28: Banking Services - Shariah-compliant current accounts (Qard or Amanah basis), savings and investment accounts (Mudarabah basis), transfer services, and safe deposit box services.

SS29: Stipulations and Ethics of Fatwa - Requirements for issuing Shariah rulings, qualifications of Shariah board members, independence of Shariah supervision, and ethics of fatwa issuance.

SS30: Monetization (Tawarruq) - Conditions for permissible Tawarruq, prohibition of organized/arranged Tawarruq where the commodity returns to the original seller, distinction between individual and organized Tawarruq.

SS31: Gharar Controls - Threshold of acceptable vs excessive uncertainty, types of gharar (in existence, delivery, quantity, quality), and contracts exempt from gharar rules (e.g., gifts).

SS35: Zakah - Calculation methods, Zakah base, rates for different asset types, treatment of debts and liabilities, and institutional Zakah obligations.

SS40: Distribution of Profit in Mudarabah-Based Investment Accounts - Allocation of profits between bank and depositors, reserves and provisions, smoothing mechanisms, and disclosure requirements.

SS44: Obtaining and Deploying Liquidity - Shariah-compliant liquidity management tools, prohibition of interest-based instruments, Tawarruq for liquidity, and commodity Murabahah for interbank transactions.

SS56: Guarantee of Investment Fund Manager - Prohibition of capital guarantee by fund manager, permissible third-party guarantees, Tabarru-based guarantee mechanisms, and conditions for validity.

SS57: Gold and its Trading Controls - Rules for gold trading, spot settlement requirement, prohibition of deferred gold-for-gold exchange, gold savings accounts, and gold-based financial products.

SS58: Concession Contracts (BOT and its Variants) - Build-Operate-Transfer Shariah requirements, revenue-sharing models, risk allocation, and compliance conditions for infrastructure concessions.

SS59: Sale of Debt - Prohibition of selling debt to a third party at a discount (bay' al-dayn), permissible debt assignment at face value, and conditions for debt trading.

SS60: Rights Disposal - Trading of rights (huquq), intellectual property in Islamic law, right of pre-emption (shuf'ah), and conditions for transferring contractual rights.

SS61: Endowments (Waqf) - Requirements for valid Waqf, management responsibilities, investment of Waqf assets, beneficiary rights, and modern applications of Waqf.`;

// ---------------------------------------------------------------------------
// POST /review
// ---------------------------------------------------------------------------

contractsRouter.post("/review", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = reviewBodySchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues.map((i) => i.message).join("; ") }, 400);
    }

    const { contractText, language } = parsed.data;
    const lang = language ?? "en";

    const systemPrompt = `You are an expert Islamic finance scholar and legal analyst specializing in AAOIFI Shariah Standards compliance review. You possess deep knowledge of all published AAOIFI standards and their practical application to financial contracts.

${AAOIFI_STANDARDS_REFERENCE}

Your task is to review the provided contract for Shariah compliance. Follow these steps precisely:

1. **Identify Contract Type**: Determine what type of Islamic or conventional contract this is (e.g., sale, lease/Ijarah, partnership/Musharakah, loan/Qard, Murabahah, Mudarabah, Salam, Istisna'a, Sukuk, agency/Wakalah, or conventional loan/mortgage/etc.).

2. **Clause-by-Clause Analysis**: Examine each clause against the relevant AAOIFI Shariah Standards listed above. Pay special attention to:
   - **Riba (Interest)**: Any stipulation of interest, penalties that constitute interest, or time-value-of-money charges.
   - **Gharar (Excessive Uncertainty)**: Ambiguous terms, undefined obligations, speculative clauses, or unclear pricing.
   - **Prohibited Commodities/Activities**: References to alcohol, pork, gambling, tobacco, weapons, adult entertainment, or conventional interest-based financial instruments.
   - **Unjust Terms (Dhulm)**: Clauses that are manifestly unfair to one party, unconscionable penalties, or terms that violate the principle of mutual consent.

3. **Flag Non-Compliant Clauses**: For each non-compliant clause, provide:
   - The exact clause text (or a close summary)
   - Which AAOIFI Shariah Standard it violates (by number and name)
   - Why it is non-compliant
   - A severity rating: "high" (fundamental Shariah violation like riba), "medium" (significant issue needing correction), or "low" (minor concern or best-practice recommendation)
   - A specific Shariah-compliant alternative clause or modification

4. **Overall Compliance Score**: Calculate a score from 0 to 100 where 100 is fully Shariah-compliant.

5. **Generate Revised Contract**: Produce a complete revised version of the contract where all non-compliant clauses have been replaced with their Shariah-compliant alternatives while preserving the commercial intent.

6. **Language**: Respond in ${lang === "ar" ? "Arabic" : "English"}, matching the language of the contract.

Respond ONLY with a valid JSON object (no markdown, no code fences) in the following exact format:
{
  "contractType": "string",
  "overallScore": number,
  "totalClauses": number,
  "compliantClauses": number,
  "nonCompliantClauses": number,
  "findings": [
    {
      "clause": "The exact text of the non-compliant clause",
      "standard": "SS number and name (e.g., SS19: Loan (Qard))",
      "issue": "Description of why this clause is non-compliant",
      "severity": "high|medium|low",
      "alternative": "A Shariah-compliant replacement clause"
    }
  ],
  "summary": "A comprehensive summary paragraph of the review findings",
  "revisedContract": "The full revised Shariah-compliant contract text"
}`;

    const userMessage = `Please review the following contract for Shariah compliance:\n\n${contractText}`;

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5.2",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!openaiResponse.ok) {
      const errBody = await openaiResponse.text();
      console.error("OpenAI Responses API error:", openaiResponse.status, errBody);
      return c.json({ error: "Failed to review contract via AI" }, 502);
    }

    const openaiData = (await openaiResponse.json()) as Record<string, unknown>;
    const text = extractResponseText(openaiData);

    let result: ReviewResult;
    try {
      const jsonText = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      result = JSON.parse(jsonText) as ReviewResult;
    } catch {
      result = {
        contractType: "Unknown",
        overallScore: 0,
        totalClauses: 0,
        compliantClauses: 0,
        nonCompliantClauses: 0,
        findings: [],
        summary: text || "The AI response could not be parsed. Please try again.",
        revisedContract: "",
      };
    }

    return c.json(result);
  } catch (err) {
    console.error("POST /review error:", err);
    return c.json({ error: "Failed to review contract" }, 500);
  }
});

// ---------------------------------------------------------------------------
// POST /revise
// ---------------------------------------------------------------------------

contractsRouter.post("/revise", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = reviseBodySchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues.map((i) => i.message).join("; ") }, 400);
    }

    const { contractText, findings, language } = parsed.data;
    const lang = language ?? "en";

    const systemPrompt = `You are an expert Islamic finance legal drafter specializing in producing Shariah-compliant contracts that adhere to AAOIFI standards.

${AAOIFI_STANDARDS_REFERENCE}

Your task is to revise the provided contract to make it fully Shariah-compliant based on the compliance findings provided. For each finding:
- Replace the non-compliant clause with a Shariah-compliant alternative
- Preserve the commercial intent and business purpose of the original clause
- Ensure the replacement conforms to the relevant AAOIFI standard cited
- Maintain the overall structure and formatting of the original contract

Language: Respond in ${lang === "ar" ? "Arabic" : "English"}, matching the language of the contract.

Respond ONLY with a valid JSON object (no markdown, no code fences) in the following exact format:
{
  "revisedContract": "The complete revised contract text with all non-compliant clauses replaced",
  "changes": [
    {
      "original": "The original non-compliant clause text",
      "revised": "The replacement Shariah-compliant clause text",
      "reason": "Brief explanation of why this change was made and which standard it addresses"
    }
  ]
}`;

    const findingsSummary = JSON.stringify(findings, null, 2);

    const userMessage = `Please revise the following contract to be Shariah-compliant based on the findings below.

## Original Contract:
${contractText}

## Compliance Findings:
${findingsSummary}`;

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5.2",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!openaiResponse.ok) {
      const errBody = await openaiResponse.text();
      console.error("OpenAI Responses API error:", openaiResponse.status, errBody);
      return c.json({ error: "Failed to revise contract via AI" }, 502);
    }

    const openaiData = (await openaiResponse.json()) as Record<string, unknown>;
    const text = extractResponseText(openaiData);

    let result: RevisionResult;
    try {
      const jsonText = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      result = JSON.parse(jsonText) as RevisionResult;
    } catch {
      result = {
        revisedContract: text || "The AI response could not be parsed. Please try again.",
        changes: [],
      };
    }

    return c.json(result);
  } catch (err) {
    console.error("POST /revise error:", err);
    return c.json({ error: "Failed to revise contract" }, 500);
  }
});

export { contractsRouter };
