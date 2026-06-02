import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

export enum LocaleCode {
  EN = 'en',
  FR = 'fr',
  KIN = 'kin',
}

export enum ThemePreference {
  SYSTEM = 'system',
  DARK = 'dark',
  LIGHT = 'light',
}

export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DANGER = 'danger',
  ICON = 'icon',
}

export enum ButtonType {
  BUTTON = 'button',
  SUBMIT = 'submit',
  RESET = 'reset',
}

export enum CardPadding {
  NONE = 'none',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
}

export enum PricingInterval {
  MONTH = 'month',
  YEAR = 'year',
}

export enum StorageScope {
  LOCAL = 'local',
  SESSION = 'session',
}

export enum PreferenceName {
  THEME = 'theme',
  LOCALE = 'locale',
  PRICING_INTERVAL = 'pricingInterval',
}

export type AppLocals = {
  locale: LocaleCode;
};

export type AstroApiContext = import('astro').APIContext & {
  locals: AppLocals;
};

export type LayoutProps = {
  title: string;
  description: string;
  canonical: string;
  locale?: LocaleCode;
};

export type LandingProps = {
  locale?: LocaleCode;
};

export type ThemeToggleProps = {
  theme?: ThemePreference;
  label: string;
  class?: string;
};

export type ButtonProps = {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  class?: string;
  disabled?: boolean;
  children?: unknown;
  type?: ButtonType;
};

export type CardProps = {
  heavy?: boolean;
  padding?: CardPadding;
  nohover?: boolean;
  class?: string;
  key?: string | number;
};

export type SpinnerProps = {
  size?: number;
};

type BillingCycle = {
  interval?: PricingInterval | string;
  frequency?: number | null;
};

type TrialPeriod = {
  interval?: string;
  frequency?: number | null;
};

type UnitPrice = {
  amount?: string;
  currencyCode?: string;
};

type PricingCustomData = Record<string, string | undefined> | null;

type IntervalPrice = {
  price_id: string | null;
  priceAmount: string;
  currencyCode: string;
  billingInterval: PricingInterval | string;
  billingFrequency: number;
  trialLabel: string | null;
};

/** internal only (flattened replacement for inline object) */
type IntervalPrices = {
  [P in PricingInterval]: IntervalPrice;
};

export type PricingPrice = {
  id: string;
  description?: string | null;
  billingCycle?: BillingCycle | null;
  trialPeriod?: TrialPeriod | null;
  unitPrice?: UnitPrice | null;
  customData?: PricingCustomData;
};

export type PricingProduct = {
  id: string;
  name: string;
  description?: string | null;
  customData?: PricingCustomData;
  prices: PricingPrice[];
};

export type PricingApiResponse = {
  data: PricingProduct[];
};

export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  order: number;
  popular: boolean;
  featureTitle: string;
  featureSubtitle: string;
  featureInfo: string;
  price_id: string | null;
  features: string[];
  priceAmount: string;
  currencyCode: string;
  billingInterval: PricingInterval | string;
  billingFrequency: number;
  trialLabel: string | null;

  intervalPrices: IntervalPrices;
};

export type PricingCache = {
  month: PricingApiResponse | null;
  year: PricingApiResponse | null;
  loadedAt: number | null;
};

export type CookieOptions = {
  path?: string;
  maxAge?: number;
  sameSite?: 'lax' | 'strict' | 'none';
  secure?: boolean;
};

export type PreferenceMeta = {
  storage: StorageScope;
  cookie: boolean;
  cookieMaxAge?: number;
};

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

export type PlanMetadata = {
  title: string;
  subtitle?: string;
  info?: string;
  features: string[];
};

export type FeatureItem = {
  icon: AstroComponentFactory;
  titleKey: string;
  descKey: string;
};

export type FeaturesProps = {
  t: (key: string, fallback?: string) => string;
  features: FeatureItem[];
};

export type StatItem = {
  value: number;
  labelKey: string;
  suffix: string;
};

export type StatsProps = {
  t: (key: string, fallback?: string) => string;
  stats: StatItem[];
};

export type OnBoardingStep = {
  step: number;
  titleKey: string;
  descKey: string;
};

export type OnBoardingProps = {
  t: (key: string, fallback?: string) => string;
  steps: OnBoardingStep[];
};

export type LanguageOption = {
  code: string;
  label: string;
  labelKey: string;
  flag: string;
};

export type NavProps = {
  t: (key: string, fallback?: string) => string;
  languages: LanguageOption[];
  currentLocale: string;
  theme: string;
};

export type PricingProps = { t: (path: string, fallback?: string) => string; locale?: LocaleCode };
export type PricingCardProps = {
  plan: PricingPlan;
  interval: PricingInterval;
  locale: string;
  freeLabel: string;
  billingMonthLabel: string;
  billingYearLabel: string;
  popularLabel: string;
  trialLabel: string;
  ctaLabel: string;
};
