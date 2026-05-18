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
  price_id: string | null;
  features: string[];
  priceAmount: string;
  currencyCode: string;
  billingInterval: PricingInterval | string;
  billingFrequency: number;
  trialLabel: string | null;
};