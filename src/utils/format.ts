import type { PricingApiResponse, PricingInterval, PricingPlan } from "../components/pricing/types";

export const pricingFeatures = [
  {
    name: "Starter",
    specificInfo:
      "Your card will not be charged unless you choose to upgrade to a different plan; to enhance your experience and streamline future transactions, we will securely save your card information upon subscribing to the Starter Plan.",
    title: "Perfect for testing or personal projects",
    subtitle: "",
    features: [
      "100 shortened links/ month",
      "1 custom domain",
      "5,000 clicks tracked / month",
      "30 - day analytics retention",
      "5 QR codes / month(PNG export )",
      "Basic link management",
    ],
  },
  {
    name: "Pro",
    title: "$296/year (save $52) ← 15% annual discount.",
    subtitle: "The Bitly alternative for solopreneurs and small teams",
    features: [
      "1,000 links / month(vs Bitly: 1, 500 for $199)",
      "3 custom domains",
      "Unlimited clicks tracked",
      "90-day analytics retention",
      "Advanced analytics(device, browser, location)",
      "Unlimited QR codes with SVG export",
      "UTM builder for campaign tracking",
      "Basic API access(300 requests/ hour)",
      "Email support(24 - hour response)",
    ],
  },
  {
    name: "Growth",
    title: "$500/year (save $88), BEST FOR AGENCIES",
    subtitle: "Everything in Pro, plus:",
    features: [
      "5,000 links / month",
      "5 custom domains",
      "5 team members included",
      "12-month analytics retention",
      "Geo-targeting & device redirects",
      "Link expiration scheduling",
      "Branded QR code downloads",
      "Advanced integrations(Zapier, Webhooks)",
      "Priority support(12 - hour response)",
      "Advanced API access(1,000 requests / hour)",
    ],
  },
  {
    name: "Professional",
    title: "$1,010/year (save $178)",
    subtitle:
      "For established businesses scaling fast Everything in Growth, plus:",
    features: [
      "10,000 links / month",
      "Unlimited custom domains",
      "15 team members included",
      "Unlimited analytics retention",
      "White-label options(remove HikrLink branding)",
      "Bulk operations(CSV import/export)",
      "Custom analytics reports",
      "Dedicated support(6-hour response)",
      "Priority phone support(weekly slots)",
      "Full API access(5,000 requests / hour)",
    ],
  },
  {
    name: "Enterprise",
    title:
      "Custom pricing. Starting at $349/ month. For teams managing multiple brands or clients\n\n",
    subtitle: "Everything in Professional, plus:",
    features: [
      "Unlimited everything",
      "SSO authentication(SAML, OAuth)",
      "SLA guarantees(99.9 % uptime)",
      "Dedicated account manager",
      "Multi-client workspace management",
      "Custom development & integrations",
      "Advanced security & compliance",
      "Custom contract terms",
      "Priority feature requests",
      "Quarterly business reviews",
      "Contact Sales: Response within 4 hours",
    ],
  },
];

type PricingFeatureEntry = (typeof pricingFeatures)[number];

const pricingFeatureMap = Object.fromEntries(
  pricingFeatures.map((plan) => [plan.name.toLowerCase(), plan])
) as Record<string, PricingFeatureEntry>;

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === "string" ? Number(value) : Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function getCurrencyFractionDigits(locale: string, currencyCode: string) {
  try {
    return (
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
      }).resolvedOptions().maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
}

export function formatMoney(locale: string, amount: string, currencyCode: string, freeLabel: string) {
  const minorUnits = toNumber(amount, 0);

  if (minorUnits === 0) {
    return freeLabel;
  }

  const fractionDigits = getCurrencyFractionDigits(locale, currencyCode);
  const divisor = 10 ** fractionDigits;
  const majorUnits = minorUnits / divisor;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(majorUnits);
}

function formatTrialLabel(frequency?: number | null, interval?: string | null) {
  if (!frequency || !interval) {
    return null;
  }

  const intervalLabel = frequency === 1 ? interval : `${interval}s`;

  return `${frequency}-${intervalLabel} trial`;
}

function getPlanDescription(productDescription?: string | null, priceDescription?: string | null) {
  return (productDescription ?? priceDescription ?? "").replace(/\s+/g, " ").trim();
}
export function transformPricingResponse(
  payload: PricingApiResponse,
  selectedInterval: PricingInterval
): PricingPlan[] {
  return payload.data
    .map((product) => {
      const matchingPrice =
        product.prices.find(
          (price) =>
            price.billingCycle?.interval === selectedInterval
        ) ?? product.prices[0];

      const priceAmount =
        matchingPrice?.unitPrice?.amount ?? "0";

      const currencyCode =
        matchingPrice?.unitPrice?.currencyCode ?? "USD";

      const billingInterval =
        matchingPrice?.billingCycle?.interval ??
        selectedInterval;

      const billingFrequency =
        matchingPrice?.billingCycle?.frequency ?? 1;

      const popular =
        String(product.customData?.popular) === "true";

      const featureData =
        pricingFeatureMap[
          product.name.toLowerCase()
        ] ?? null;

      const featureTitle =
        featureData?.title ?? product.name;

      const featureSubtitle =
        featureData?.subtitle ?? "";

      const featureInfo =
        featureData?.specificInfo ??
        getPlanDescription(
          product.description,
          matchingPrice?.description
        );

      return {
        id: product.id,
        name: product.name,
        description: getPlanDescription(
          product.description,
          matchingPrice?.description
        ),
        popular,
        featureTitle,
        featureSubtitle,
        featureInfo,
        features: featureData?.features ?? [],
        priceAmount,
        currencyCode,
        billingInterval,
        billingFrequency,
        trialLabel: formatTrialLabel(
          matchingPrice?.trialPeriod?.frequency ?? null,
          matchingPrice?.trialPeriod?.interval ?? null
        ),

        // helper field for sorting
        numericPrice: Number(priceAmount),
      };
    })

    // sort directly by price
    .sort((a, b) => a.numericPrice - b.numericPrice)

    // remove helper field
    .map(({ numericPrice, ...plan }) => plan);
}

export function formatBillingLabel(
  plan: PricingPlan,
  billingMonthLabel: string,
  billingYearLabel: string
) {
  const intervalLabel = plan.billingInterval === "year" ? billingYearLabel : billingMonthLabel;
  return intervalLabel
}