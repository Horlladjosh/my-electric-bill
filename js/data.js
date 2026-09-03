/**
 * Country Electricity Rates, Currencies, CO2 Factors & USD Exchange Rates
 * usdExchange: Local currency units per 1.00 USD (approx 2025/2026).
 */
const COUNTRY_DATA = [
    { code: 'US', name: 'United States', rate: 0.16, currency: '$', symbol: '$', co2Factor: 0.38, usdExchange: 1.0 },
    { code: 'NG', name: 'Nigeria', rate: 210, currency: '₦', symbol: '₦', co2Factor: 0.42, usdExchange: 1500 },
    { code: 'UK', name: 'United Kingdom', rate: 0.28, currency: '£', symbol: '£', co2Factor: 0.21, usdExchange: 0.79 },
    { code: 'EU_DE', name: 'Germany', rate: 0.38, currency: '€', symbol: '€', co2Factor: 0.35, usdExchange: 0.92 },
    { code: 'EU_FR', name: 'France', rate: 0.25, currency: '€', symbol: '€', co2Factor: 0.05, usdExchange: 0.92 },
    { code: 'EU_ES', name: 'Spain', rate: 0.24, currency: '€', symbol: '€', co2Factor: 0.18, usdExchange: 0.92 },
    { code: 'EU_IT', name: 'Italy', rate: 0.32, currency: '€', symbol: '€', co2Factor: 0.28, usdExchange: 0.92 },
    { code: 'EU_NL', name: 'Netherlands', rate: 0.30, currency: '€', symbol: '€', co2Factor: 0.31, usdExchange: 0.92 },
    { code: 'EU_BE', name: 'Belgium', rate: 0.33, currency: '€', symbol: '€', co2Factor: 0.16, usdExchange: 0.92 },
    { code: 'IN', name: 'India', rate: 7.5, currency: '₹', symbol: '₹', co2Factor: 0.71, usdExchange: 86.5 },
    { code: 'CN', name: 'China', rate: 0.60, currency: '¥', symbol: '¥', co2Factor: 0.58, usdExchange: 7.25 },
    { code: 'JP', name: 'Japan', rate: 31, currency: '¥', symbol: '¥', co2Factor: 0.47, usdExchange: 155.0 },
    { code: 'BR', name: 'Brazil', rate: 0.85, currency: 'R$', symbol: 'R$', co2Factor: 0.12, usdExchange: 5.70 },
    { code: 'CA', name: 'Canada', rate: 0.14, currency: 'CA$', symbol: 'CA$', co2Factor: 0.12, usdExchange: 1.40 },
    { code: 'AU', name: 'Australia', rate: 0.32, currency: 'A$', symbol: 'A$', co2Factor: 0.65, usdExchange: 1.55 },
    { code: 'MX', name: 'Mexico', rate: 1.80, currency: 'Mex$', symbol: 'Mex$', co2Factor: 0.43, usdExchange: 20.2 },
    { code: 'ZA', name: 'South Africa', rate: 3.20, currency: 'R', symbol: 'R', co2Factor: 0.90, usdExchange: 18.2 },
    { code: 'KE', name: 'Kenya', rate: 28, currency: 'KSh', symbol: 'KSh', co2Factor: 0.25, usdExchange: 130.0 },
    { code: 'GH', name: 'Ghana', rate: 1.45, currency: 'GH₵', symbol: 'GH₵', co2Factor: 0.32, usdExchange: 15.5 },
    { code: 'EG', name: 'Egypt', rate: 1.60, currency: 'E£', symbol: 'E£', co2Factor: 0.46, usdExchange: 50.0 },
    { code: 'AE', name: 'United Arab Emirates', rate: 0.30, currency: 'AED', symbol: 'AED', co2Factor: 0.50, usdExchange: 3.67 },
    { code: 'SA', name: 'Saudi Arabia', rate: 0.18, currency: 'SAR', symbol: 'SAR', co2Factor: 0.52, usdExchange: 3.75 },
    { code: 'SG', name: 'Singapore', rate: 0.30, currency: 'S$', symbol: 'S$', co2Factor: 0.41, usdExchange: 1.34 },
    { code: 'MY', name: 'Malaysia', rate: 0.40, currency: 'RM', symbol: 'RM', co2Factor: 0.54, usdExchange: 4.45 },
    { code: 'ID', name: 'Indonesia', rate: 1445, currency: 'Rp', symbol: 'Rp', co2Factor: 0.72, usdExchange: 16200 },
    { code: 'PH', name: 'Philippines', rate: 11.5, currency: '₱', symbol: '₱', co2Factor: 0.60, usdExchange: 58.5 },
    { code: 'TH', name: 'Thailand', rate: 4.20, currency: '฿', symbol: '฿', co2Factor: 0.44, usdExchange: 34.5 },
    { code: 'PK', name: 'Pakistan', rate: 45, currency: 'Rs', symbol: 'Rs', co2Factor: 0.48, usdExchange: 278.0 },
    { code: 'BD', name: 'Bangladesh', rate: 8.50, currency: '৳', symbol: '৳', co2Factor: 0.53, usdExchange: 120.0 },
    { code: 'AR', name: 'Argentina', rate: 45, currency: 'ARS$', symbol: 'ARS$', co2Factor: 0.33, usdExchange: 1050.0 }
];
