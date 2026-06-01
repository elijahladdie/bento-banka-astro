import { getBillingLabel, formatCurrency } from "../utils/format";
import { getLocale, subscribeLocale, translate } from "../utils/i18n.ts";
import { loadPreference, savePreference, preferenceKeys } from "../utils/preferences.ts";
import type { PricingInterval } from "../types";

const pricingRootSelector = "[data-pricing-root]";

let currentPricingInterval: PricingInterval = "month";
let pricingRequestToken = 0;

function getPricingRoot() {
  return document.querySelector(pricingRootSelector) as HTMLElement | null;
}

function getPricingPanel(root: HTMLElement | null) {
  return root?.querySelector("[data-pricing-panel]") as HTMLElement | null;
}

function getPricingContent(root: HTMLElement | null) {
  return root?.querySelector("[data-pricing-content]") as HTMLElement | null;
}

function getPricingSkeleton(root: HTMLElement | null) {
  return root?.querySelector("[data-pricing-skeleton]") as HTMLElement | null;
}

function getStoredPricingInterval() {
  return loadPreference(preferenceKeys.pricingInterval, null) as PricingInterval | null;
}

function persistPricingInterval(interval: PricingInterval) {
  savePreference(preferenceKeys.pricingInterval, interval, { storage: "session", cookie: true });
}

function setPricingToggleState(interval: PricingInterval) {
  const switchElement = document.querySelector("[data-pricing-switch]") as HTMLElement | null;
  if (!switchElement) return;

  const thumb = switchElement.querySelector("[data-switch-thumb]") as HTMLElement | null;
  const isYearly = interval === "year";

  switchElement.setAttribute("aria-checked", String(isYearly));
  switchElement.dataset.currentInterval = interval;
  switchElement.classList.toggle("is-yearly", isYearly);

  if (thumb) {
    thumb.classList.toggle("translate-x-9", isYearly);
    thumb.classList.toggle("translate-x-1", !isYearly);
  }
}

function setPricingLoadingState(isLoading: boolean) {
  const root = getPricingRoot();
  const panel = getPricingPanel(root);
  const content = getPricingContent(root);
  const skeleton = getPricingSkeleton(root);
  if (!panel || !content || !skeleton) return;

  panel.setAttribute("aria-busy", String(isLoading));
  content.hidden = isLoading;
  skeleton.hidden = !isLoading;
}

function syncPricingLocaleLabels(locale: string) {
  const root = getPricingRoot();
  if (!root) return;

  root.dataset.pricingFreeLabel = translate(locale, "landing.pricing.free", root.dataset.pricingFreeLabel ?? "Free");
  root.dataset.pricingBillingMonthLabel = translate(locale, "landing.pricing.billingMonth", root.dataset.pricingBillingMonthLabel ?? "month");
  root.dataset.pricingBillingYearLabel = translate(locale, "landing.pricing.billingYear", root.dataset.pricingBillingYearLabel ?? "year");
}

function syncPricingDisplay(locale: string) {
  const root = getPricingRoot();
  if (!root) return;

  const freeLabel = root.dataset.pricingFreeLabel ?? "Free";
  const billingMonthLabel = root.dataset.pricingBillingMonthLabel ?? "month";
  const billingYearLabel = root.dataset.pricingBillingYearLabel ?? "year";

  const interval = (root.dataset.pricingInterval as PricingInterval) ?? currentPricingInterval;
  setPricingToggleState(interval);

  document.querySelectorAll("[data-plan-id]").forEach((card) => {
    if (!(card instanceof HTMLElement)) return;

    const amount = interval === "month"
      ? card.dataset.monthPriceAmount ?? card.dataset.priceAmount ?? "0"
      : card.dataset.yearPriceAmount ?? card.dataset.priceAmount ?? "0";

    const currency = interval === "month"
      ? card.dataset.monthPriceCurrency ?? card.dataset.priceCurrency ?? "USD"
      : card.dataset.yearPriceCurrency ?? card.dataset.priceCurrency ?? "USD";

    const amountNode = card.querySelector("[data-price-amount], [data-price-value]");
    const billingNode = card.querySelector("[data-billing-label]");

    if (amountNode) {
      amountNode.textContent = formatCurrency(locale, amount, currency, freeLabel);
    }

    if (billingNode) {
      billingNode.textContent = getBillingLabel({ billingInterval: interval } as any, billingMonthLabel, billingYearLabel);
    }
  });
}

async function fetchPricingSectionHTML(interval: PricingInterval) {
  persistPricingInterval(interval);
  const url = new URL(window.location.href);
  const response = await fetch(url.toString(), { headers: { "X-Requested-With": "fetch" } });
  if (!response.ok) throw new Error(`Pricing request failed with status ${response.status}`);
  return response.text();
}

function replacePricingSection(html: string) {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const nextRoot = parsed.querySelector(pricingRootSelector) as HTMLElement | null;
  if (!nextRoot) throw new Error("Pricing section missing in fetched HTML");

  const currentRoot = getPricingRoot();
  if (!currentRoot) throw new Error("Current pricing section missing");

  currentRoot.replaceWith(nextRoot);
}

async function handlePricingToggle(interval: PricingInterval) {
  if (interval === currentPricingInterval) {
    setPricingToggleState(interval);
    return;
  }

  const requestToken = ++pricingRequestToken;
  setPricingToggleState(interval);
  setPricingLoadingState(true);

  try {
    const html = await fetchPricingSectionHTML(interval);
    if (requestToken !== pricingRequestToken) return;
    replacePricingSection(html);
    currentPricingInterval = interval;
    syncPricingLocaleLabels(getLocale());
    syncPricingDisplay(getLocale());
  } catch (error) {
    if (requestToken !== pricingRequestToken) return;
    console.error("Pricing update failed", error);
    setPricingToggleState(currentPricingInterval);
  } finally {
    if (requestToken === pricingRequestToken) setPricingLoadingState(false);
  }
}

function initPricingToggle() {
  const root = getPricingRoot();
  if (!root) return;

  const storedInterval = getStoredPricingInterval();
  const initialInterval = storedInterval ?? (root.dataset.pricingInterval as PricingInterval) ?? "month";

  currentPricingInterval = initialInterval;
  root.dataset.pricingInterval = initialInterval;

  setPricingToggleState(initialInterval);
  syncPricingLocaleLabels(getLocale());
  syncPricingDisplay(getLocale());

  document.addEventListener("click", (event) => {
    const target = event.target as Element | null;
    const switchElement = target?.closest("[data-pricing-switch]") as HTMLElement | null;
    if (!switchElement) return;
    event.preventDefault();

    const current = switchElement.dataset.currentInterval === "year" ? "year" : "month";
    const next: PricingInterval = current === "month" ? "year" : "month";
    void handlePricingToggle(next);
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target as Element | null;
    const switchElement = target?.closest("[data-pricing-switch]") as HTMLElement | null;
    if (!switchElement) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();

    const current = switchElement.dataset.currentInterval === "year" ? "year" : "month";
    const next: PricingInterval = current === "month" ? "year" : "month";
    void handlePricingToggle(next);
  });
}

export default initPricingToggle;
export { initPricingToggle };

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initPricingToggle();
    subscribeLocale((locale) => {
      syncPricingLocaleLabels(locale);
      syncPricingDisplay(locale);
    });
  }, { once: true });
} else {
  initPricingToggle();
  subscribeLocale((locale) => {
    syncPricingLocaleLabels(locale);
    syncPricingDisplay(locale);
  });
}
