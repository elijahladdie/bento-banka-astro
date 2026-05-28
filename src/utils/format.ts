import type {
  PricingApiResponse,
  PricingInterval,
  PricingPlan,
} from "../types";

type PlanMetadata = {
  title: string;
  subtitle?: string;
  info?: string;
  features: string[];
};

const PLAN_METADATA: Record<string, PlanMetadata> = {
  starter: {
    title: "Perfect for testing or personal projects",

    info:
      "Your card will not be charged unless you upgrade to another plan. Card details are securely stored for future upgrades.",

    features: [
      "100 shortened links / month",
      "1 custom domain",
      "5,000 tracked clicks / month",
      "30-day analytics retention",
      "5 QR codes / month (PNG export)",
      "Basic link management",
    ],
  },

  pro: {
    title: "$296/year (save $52)",

    subtitle:
      "The Bitly alternative for solopreneurs and small teams",

    features: [
      "1,000 links / month",
      "3 custom domains",
      "Unlimited tracked clicks",
      "90-day analytics retention",
      "Advanced analytics",
      "Unlimited QR codes with SVG export",
      "UTM campaign builder",
      "API access (300 req/hour)",
      "Email support (24h response)",
    ],
  },

  growth: {
    title: "$500/year (save $88)",

    subtitle: "Best for agencies",

    features: [
      "5,000 links / month",
      "5 custom domains",
      "5 team members",
      "12-month analytics retention",
      "Geo-targeting redirects",
      "Link expiration scheduling",
      "Branded QR codes",
      "Zapier & webhook integrations",
      "Priority support",
      "API access (1,000 req/hour)",
    ],
  },

  professional: {
    title: "$1,010/year (save $178)",

    subtitle:
      "For established businesses scaling fast",

    features: [
      "10,000 links / month",
      "Unlimited custom domains",
      "15 team members",
      "Unlimited analytics retention",
      "White-label branding",
      "Bulk CSV operations",
      "Custom analytics reports",
      "Dedicated support",
      "Priority phone support",
      "API access (5,000 req/hour)",
    ],
  },

  enterprise: {
    title:
      "Custom pricing starting at $349/month",

    subtitle:
      "For teams managing multiple brands or clients",

    features: [
      "Unlimited usage",
      "SSO authentication",
      "99.9% SLA guarantee",
      "Dedicated account manager",
      "Multi-client workspace support",
      "Custom integrations",
      "Advanced compliance & security",
      "Custom contract terms",
      "Priority feature requests",
      "Quarterly business reviews",
    ],
  },
};

function resolveDescription(
  ...descriptions: Array<
    string | null | undefined
  >
) {
  return (
    descriptions
      .find(Boolean)
      ?.replace(/\s+/g, " ")
      .trim() ?? ""
  );
}

function buildTrialLabel(
  frequency?: number | null,
  interval?: string | null
) {
  if (!frequency || !interval) {
    return null;
  }

  const intervalLabel =
    frequency > 1
      ? `${interval}s`
      : interval;

  return `${frequency} ${intervalLabel} trial`;
}

function getSelectedPrice(
  prices: PricingApiResponse["data"][number]["prices"],
  billingInterval: PricingInterval
) {
  return (
    prices.find(
      ({ billingCycle }) =>
        billingCycle?.interval ===
        billingInterval
    ) ?? prices[0]
  );
}

export function formatCurrency(
  locale: string,
  amount: string,
  currencyCode: string,
  freeLabel = "Free"
) {
  const amountInMinorUnits = Number(amount);

  if (!amountInMinorUnits) {
    return freeLabel;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(amountInMinorUnits / 100);
}

export function mapPricingPlans(
  response: PricingApiResponse,
  billingInterval: PricingInterval
): PricingPlan[] {
  return response.data
    .map((product) => {
      const selectedPrice =
        getSelectedPrice(
          product.prices,
          billingInterval
        );

      const metadata =
        PLAN_METADATA[
        product.name.toLowerCase()
        ];

      const {
        id: price_id,
        description: priceDescription,
        billingCycle,
        trialPeriod,
        unitPrice,
      } = selectedPrice;
      const { name, description, id, customData } = product;
      return {
        id,

        name: name,

        description: resolveDescription(
          description,
          priceDescription
        ),

        order: Number(
          customData?.order ?? 0
        ),

        popular: customData?.popular == "true",

        featureTitle:
          metadata?.title ?? name,

        featureSubtitle:
          metadata?.subtitle ?? "",

        featureInfo:
          metadata?.info ??
          resolveDescription(
            description,
            priceDescription
          ),

        features:
          metadata?.features ?? [],

        price_id,

        priceAmount:
          unitPrice?.amount ?? "0",

        currencyCode:
          unitPrice?.currencyCode ?? "USD",

        billingInterval:
          billingCycle?.interval ??
          billingInterval,

        billingFrequency:
          billingCycle?.frequency ?? 1,

        trialLabel: buildTrialLabel(
          trialPeriod?.frequency,
          trialPeriod?.interval
        ),
      };
    })
    .sort(
      (firstPlan, secondPlan) =>
        Number(firstPlan.priceAmount) -
        Number(secondPlan.priceAmount)
    );
}

export function getBillingLabel(
  plan: PricingPlan,
  monthlyLabel: string,
  yearlyLabel: string
) {
  return plan.billingInterval === "year"
    ? yearlyLabel
    : monthlyLabel;
}
