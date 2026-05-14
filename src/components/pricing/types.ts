export type PricingInterval = "month" | "year";

export type PricingApiResponse = {
  data: PricingProduct[];
};

export type PricingProduct = {
  id: string;
  name: string;
  description?: string | null;
  customData?: Record<string, string | undefined> | null;
  prices: PricingPrice[];
};

export type PricingPrice = {
  id: string;
  description?: string | null;
  billingCycle?: {
    interval?: PricingInterval | string;
    frequency?: number | null;
  } | null;
  trialPeriod?: {
    interval?: string;
    frequency?: number | null;
  } | null;
  unitPrice?: {
    amount?: string;
    currencyCode?: string;
  } | null;
  customData?: Record<string, string | undefined> | null;
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
  features: string[];
  priceAmount: string;
  currencyCode: string;
  billingInterval: PricingInterval | string;
  billingFrequency: number;
  trialLabel: string | null;
};

export interface PricingClientProps {
  interval?: PricingInterval;
  locale: string;
  children?: React.ReactNode;
  monthlyLabel: string;
  yearlyLabel: string;
  freeLabel: string;
  billingMonthLabel: string;
  billingYearLabel: string;
  popularLabel: string;
  trialLabel: string;
  ctaLabel: string;
  loadingTitle: string;
  errorTitle: string;
  errorBody: string;
  retryLabel: string;
}

export interface ToggleClientProps {
  interval?: PricingInterval;
  monthlyLabel: string;
  yearlyLabel: string;
  onIntervalChange?: (interval: PricingInterval) => void;
}