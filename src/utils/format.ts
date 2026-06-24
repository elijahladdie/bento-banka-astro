import { PricingApiResponse, PricingInterval, PricingPlan } from '../types';

function resolveDescription(...descriptions: Array<string | null | undefined>) {
  return descriptions.find(Boolean)?.replace(/\s+/g, ' ').trim() ?? '';
}

function buildTrialLabel(frequency?: number | null, interval?: string | null) {
  if (!frequency || !interval) {
    return null;
  }

  const intervalLabel = frequency > 1 ? `${interval}s` : interval;

  return `${frequency} ${intervalLabel} trial`;
}

function getSelectedPrice(
  prices: PricingApiResponse['data'][number]['prices'],
  billingInterval: PricingInterval
) {
  return (
    prices?.find(({ billingCycle }) => billingCycle?.interval === billingInterval) ?? prices[0]
  );
}

function buildPricingIntervalData(
  prices: PricingApiResponse['data'][number]['prices'],
  interval: PricingInterval
) {
  const selectedPrice = getSelectedPrice(prices, interval);

  return {
    price_id: selectedPrice.id,
    priceAmount: selectedPrice.unitPrice?.amount ?? '0',
    currencyCode: selectedPrice.unitPrice?.currencyCode ?? 'USD',
    billingInterval: selectedPrice.billingCycle?.interval ?? interval,
    billingFrequency: selectedPrice.billingCycle?.frequency ?? 1,
    trialLabel: buildTrialLabel(
      selectedPrice.trialPeriod?.frequency,
      selectedPrice.trialPeriod?.interval
    ),
  };
}

export function formatCurrency(
  locale: string,
  amount: string,
  currencyCode: string,
  freeLabel = 'Free'
) {
  const amountInMinorUnits = Number(amount);

  if (!amountInMinorUnits) {
    return freeLabel;
  }

  // Map short locales internally
  const normalizedLocale =
    {
      en: 'en-US',
      fr: 'fr-FR',
      kin: 'rw-RW',
    }[locale] || locale;

  return new Intl.NumberFormat(normalizedLocale, {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'narrowSymbol',
  })
    .format(amountInMinorUnits / 100)
    .replace(/[A-Z]{2}\$/g, '$');
}

export function mapPricingPlans(
  response: PricingApiResponse,
  billingInterval: PricingInterval
): PricingPlan[] {
  return response.data
    .map((product) => {
      const monthPricing = buildPricingIntervalData(product.prices, PricingInterval.MONTH);

      const yearPricing = buildPricingIntervalData(product.prices, PricingInterval.YEAR);

      const selectedPrice = billingInterval === 'year' ? yearPricing : monthPricing;

      // const metadata = PLAN_METADATA[product.name.toLowerCase()];
      const { name, description, id, customData } = product;

      const selectedPriceRecord = getSelectedPrice(product.prices, billingInterval);

      const { description: priceDescription } = selectedPriceRecord;
      return {
        id,

        name: name,

        description: resolveDescription(description, priceDescription),

        order: Number(customData?.order ?? 0),

        popular: customData?.popular == 'true',

        featureTitle: name,

        featureSubtitle: description ?? '',

        featureInfo: resolveDescription(description, priceDescription),

        features: product?.features ?? [],

        price_id: selectedPrice.price_id,

        priceAmount: selectedPrice.priceAmount,

        currencyCode: selectedPrice.currencyCode,

        billingInterval: selectedPrice.billingInterval,

        billingFrequency: selectedPrice.billingFrequency,

        trialLabel: selectedPrice.trialLabel,

        intervalPrices: {
          month: monthPricing,
          year: yearPricing,
        },
      };
    })
    .sort(
      (firstPlan, secondPlan) => Number(firstPlan.priceAmount) - Number(secondPlan.priceAmount)
    );
}

export function getBillingLabel(
  plan: Pick<PricingPlan, 'billingInterval'>,
  monthlyLabel: string,
  yearlyLabel: string
): string {
  return plan.billingInterval === 'year' ? yearlyLabel : monthlyLabel;
}
