# Barakah Balance

A comprehensive Islamic Personal Finance app for Muslims, featuring Zakat calculators, investment portfolio tracking with live market data, Shariah contract compliance review, wealth management, financial goals, and distribution planning - all following AAOIFI standards. Available on mobile, tablet, and web.

## Platform Support

### Mobile (iOS/Android)
- Native mobile experience with touch-optimized UI
- Offline support with local data storage

### Tablet (iPad)
- Side-by-side layouts for calculator options
- Larger touch targets
- Optimized for landscape and portrait

### Web (Desktop)
- Full responsive design with hover states
- Drag-and-drop Excel file upload
- Keyboard shortcuts (Ctrl+Enter to proceed, Ctrl+F to search, Escape to close modals)
- Table view for asset entries
- Multi-column layouts for larger screens

## Features

### Dashboard (Islamic Wealth Management)
- **Zakat Status Hero Card**: Real-time Hawl countdown with circular progress, Nisab tracker, projected Zakat amount
- **Wealth Composition**: Visual breakdown of assets (liquid, investments, precious metals, real estate, business, exempt)
- **Asset Health Score**: 0-100 score based on halal purity, liquidity, diversification, debt ratio, and Zakat compliance
- **Financial Goals**: Maqasid Al-Shariah based goals (Deen, Nafs, Aql, Nasl, Mal) with progress tracking
- **Zakat Distribution Planner**: Allocate Zakat to 8 eligible categories (Fuqara, Masakin, Amil, Muallaf, Riqab, Gharimin, Fisabilillah, Ibnsabil)
- **Trend Analysis**: Historical wealth tracking with charts, projections, and year summaries
- **Alerts & Reminders**: Hawl notifications, Nisab alerts, Ramadan reminders
- **Quick Actions**: Fast access to add assets, calculate Zakat, generate reports
- **Reports Suite**: Multiple report types (Zakat calculation, business, wealth summary, payment history, trends)

### User Authentication & Portfolios
- **Google Sign-In**: Quick authentication with Google account
- **Email/Password**: Traditional login with email verification
- **Multiple Portfolios**: Manage personal zakat and multiple business portfolios
- **Calculation History**: Track and preserve past zakat calculations

### Individual Calculator
- **10 Asset Categories**: Cash, Bank Accounts, Investments, Digital Money, Precious Metals, Real Estate, Money Owed, Commodities, Unique Assets, and Extracted Resources (each with unique color coding)
- **Expandable Breakdown**: View detailed breakdown within each category with chevron expand/collapse
- **Go to Dashboard**: Direct navigation to dashboard from results page
- **Gold Calculator**: Support for 24k, 21k, and 18k gold with weight and price per gram
- **Automatic Nisab Calculation**: Based on current gold prices (85 grams threshold)
- **Two Calendar Options**: Islamic (2.5% rate) or Western (2.577% rate)
- **Deductions**: Zakat already paid, urgent debts, and receivables
- **Multi-Currency Support**: Add entries in different currencies with automatic conversion
- **Live Exchange Rates**: Real-time currency conversion with automatic fallback to offline rates
- **Gold Price API**: Average prices from multiple market sources (London Bullion Market, COMEX, Shanghai Gold Exchange)
- **Hijri Date API**: Country-specific Hijri date calculation via Aladhan API
- **Unit-Based Entry**: For stocks, crypto, and metals - enter number of units and value per unit
- **Searchable Countries**: Find countries quickly by typing name
- **Zakat History**: Save calculations with Gregorian and Hijri date tagging
- **Video Tutorials**: Learn about each asset class through educational videos

### Business Calculator
- **AAOIFI Compliant**: Follows Islamic accounting standards (FAS 9)
- **4-Category System**: Current Assets, Fixed Assets, Current Liabilities, Long Term Liabilities
- **Smart Classification**: Automatic categorization of balance sheet items
- **Islamic Financing Toggle**: Distinguish between Islamic financing (deductible) and conventional loans (NOT deductible)
- **Clickable Clarification**: Tap on items needing clarification to classify as short-term or long-term
- **Save to History**: Save business zakat calculations with company name to history
- **Excel Upload**: Import balance sheets from Excel/CSV files
- **Offline Support**: Built-in keyword database for offline classification

### Sharia Board
- **Scholar Profiles**: View AAOIFI Sharia board members and their credentials
- **Compliance Status**: See which standards and calculations have been approved
- **Scholarly Notes**: Access detailed notes on methodology

### Investment Portfolio Tracker
- **Stock Holdings**: Track stocks, ETFs, sukuk, bonds, and mutual funds with live market prices
- **Live Market Data**: Real-time stock quotes from Alpha Vantage API with fallback to curated data
- **Portfolio Summary**: Total value, daily gain/loss, performance metrics
- **Shariah Screening**: AI-powered Shariah compliance check per stock (debt ratios, haram revenue, interest thresholds)
- **Market Browser**: Search and discover stocks across global exchanges (NYSE, NASDAQ, Tadawul, etc.)
- **Watchlist**: Save stocks to watchlist for monitoring
- **Add Holdings**: Search stocks, enter shares and cost basis, auto-fetch current prices
- **Compliance Badges**: Visual Halal/Non-Compliant indicators on each holding

### Shariah Contract Review
- **Contract Analysis**: Paste any contract text for AI-powered Shariah compliance review
- **AAOIFI Standards Check**: Reviews against 31+ AAOIFI Shariah Standards (SS1-SS61)
- **Compliance Scoring**: 0-100 score with color-coded severity ratings
- **Clause-by-Clause Review**: Each non-compliant clause flagged with specific standard violated, issue description, and severity
- **Compliant Alternatives**: AI generates Shariah-compliant rewording for each flagged clause
- **Full Contract Revision**: Generate a complete Shariah-compliant version of the contract
- **Bilingual Support**: Analyze contracts in English or Arabic
- **Standards Coverage**: Murabahah (SS8), Ijarah (SS9), Musharakah (SS12), Mudarabah (SS13), Sukuk (SS17), Gharar Controls (SS31), and 25+ more

### AI Zakat Assistant
- **AAOIFI-Only Responses**: AI chatbot trained exclusively on AAOIFI zakat standards
- **Real-Time Guidance**: Get instant answers to complex zakat questions
- **Source Citations**: References to specific AAOIFI standards

### Printable Report
- **Comprehensive Output**: Asset/Liability ID, Amount, Clarification status, Final ruling, Final amount
- **Share Functionality**: Export and share reports via email, messaging, etc.
- **Professional Format**: Clean, printable layout for record-keeping

### Multi-Language Support
- English (fully supported)
- Arabic with RTL layout (fully supported)
- 12 more languages coming soon

### Other Features
- **70+ Countries**: Pre-configured with currencies and default gold prices
- **Privacy First**: All data stored locally on device
- **Auto-Save**: Progress saved automatically
- **Share Results**: Export calculations via system share
- **Clear Navigation**: Forward/back buttons throughout the app

## Tech Stack
- Expo SDK 53
- React Native 0.76.7
- React Native Web (for browser support)
- TypeScript
- NativeWind (TailwindCSS)
- Zustand (State Management)
- React Query (Server State)
- React Native Reanimated (Animations)
- OpenAI API (Zakat Assistant, Contract Review, Shariah Screening)
- Alpha Vantage API (Stock Market Data)
- Hono Backend (API routes for market data and contract analysis)
- expo-document-picker (Mobile Excel Upload)
- Native File API (Web drag-and-drop)

## Project Structure
```
src/
├── app/
│   ├── index.tsx              # Language selection
│   ├── auth.tsx               # Login/Signup/Verification
│   ├── portfolios.tsx         # Portfolio management
│   ├── calculator-type.tsx    # Choose Individual/Business (responsive)
│   ├── dashboard.tsx          # Islamic wealth management dashboard
│   ├── zakat-history.tsx      # Saved Zakat calculations with history
│   ├── alerts.tsx             # Notifications and reminders
│   ├── goals.tsx              # Maqasid-based financial goals
│   ├── trends.tsx             # Wealth trend analysis
│   ├── zakat-distribution.tsx # 8-category distribution planner
│   ├── reports.tsx            # Reports hub
│   ├── sharia-board.tsx       # Sharia board info
│   ├── zakat-chatbot.tsx      # AI assistant
│   ├── portfolio.tsx          # Investment portfolio tracker
│   ├── contract-review.tsx    # Shariah contract review
│   ├── market.tsx             # Stock market browser
│   ├── individual/
│   │   ├── welcome.tsx        # Introduction & rules
│   │   ├── location.tsx       # Country & currency setup (searchable)
│   │   ├── assets.tsx         # Mobile assets view (unit-based entry)
│   │   ├── assets.web.tsx     # Web/tablet assets view
│   │   ├── deductions.tsx     # Deductions entry
│   │   └── results.tsx        # Final calculation (save to history)
│   └── business/
│       ├── welcome.tsx        # Business introduction
│       ├── setup.tsx          # Country setup
│       ├── entry.tsx          # Mobile entry
│       ├── entry.web.tsx      # Web drag-drop Excel upload
│       ├── categories.tsx     # 4-category system
│       ├── analysis.tsx       # Line item analysis
│       ├── clarification.tsx  # Answer questions
│       ├── results.tsx        # Final calculation
│       └── report.tsx         # Printable report
├── lib/
│   ├── store.ts               # Zustand stores (includes Zakat history)
│   ├── api-services.ts        # Exchange rate & gold price APIs
│   ├── auth-store.ts          # Auth & portfolio state
│   ├── dashboard-store.ts     # Dashboard & wealth management state
│   ├── portfolio-store.ts     # Investment portfolio state
│   ├── enhanced-store.ts      # Multi-currency entries
│   ├── useResponsive.ts       # Responsive breakpoints hook
│   ├── translations.ts        # i18n translations
│   ├── countries.ts           # Country data
│   └── zakat-classifier.ts    # Offline classification
└── components/
    ├── Themed.tsx             # Theme components
    └── NavigationButtons.tsx  # Back/Next navigation
```

## Zakat Rules Implemented

### Individual Zakat
- Primary home: NOT zakatable
- Personal car: NOT zakatable
- Personal use items: NOT zakatable
- Investment items: Zakatable at market value
- Extracted resources: 20% special rate
- Agricultural produce: 5-10% (not yet implemented)

### Business Zakat (AAOIFI FAS 9)
- Cash & Bank: Zakatable
- Receivables: Zakatable
- Inventory: Zakatable at market value
- Fixed Assets: Exempt if used in operations
- Accounts Payable: Deductible
- **Islamic Financing: Deductible**
- **Conventional Loans: NOT deductible** (must be flagged separately)
- Customer Deposits: Deductible

## Getting Started

The app is pre-configured and runs automatically on port 8081.

1. Select your language (English or Arabic)
2. Sign in or create an account (optional)
3. Manage portfolios for personal and business zakat
4. Choose calculator type (Individual or Business)
5. Set up your country and gold price
6. Enter your assets/liabilities (manual or Excel upload)
7. View your Zakat calculation
8. Generate and share printable reports

## Quick Access Features
- **Dashboard**: Comprehensive Islamic wealth management view with portfolio snapshot
- **Portfolio**: Track investments with live stock prices and Shariah compliance screening
- **Contract Review**: AI-powered Shariah compliance analysis for any contract
- **Market**: Browse and search stocks across global exchanges
- **Portfolios**: Switch between personal and business calculations
- **Goals**: Track Maqasid-based financial goals
- **Distribution**: Plan Zakat allocation to 8 categories
- **Trends**: Analyze wealth growth over time
- **Sharia Board**: View scholarly approvals and AAOIFI compliance
- **Zakat Assistant**: AI chatbot for zakat questions (AAOIFI standards only)

## Backend API Endpoints
- `GET /api/market/quote?symbol=AAPL` - Get stock quote
- `GET /api/market/search?query=apple` - Search stocks
- `GET /api/market/batch?symbols=AAPL,MSFT` - Batch stock quotes
- `POST /api/market/shariah-screen` - AI Shariah compliance screening
- `POST /api/contracts/review` - AI contract compliance review (31+ AAOIFI standards)
- `POST /api/contracts/revise` - Generate Shariah-compliant contract revision

## Notes

- All calculations follow AAOIFI (Accounting and Auditing Organization for Islamic Financial Institutions) standards
- Conventional loans are NOT deductible per Islamic jurisprudence - only Islamic financing qualifies
- Consult a qualified Islamic scholar for complex cases
- Gold prices should be updated to current market rates for accurate Nisab calculation

## Deployment

### Web (Netlify/Vercel)
1. Run `npx expo export --platform web` to build the web version
2. Deploy the `dist` folder to your hosting provider
3. Configure redirects for single-page app routing

### Mobile (App Store/Play Store)
- Use Vibecode's "Share" > "Submit to App Store" feature
- Or use EAS Build for manual submission
