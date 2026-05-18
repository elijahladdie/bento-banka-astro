import { formatBillingLabel, formatMoney } from "../utils/format";
import {
  bootstrapLocale,
  getLocale,
  setLocale,
  subscribeLocale,
  translate,
  updateTranslations,
} from "../utils/i18n.js";
import { loadPreference, savePreference, preferenceKeys } from "../utils/preferences.js";
import {
  applyThemePreference,
  bootstrapThemePreference,
  getThemePreference,
  saveThemePreference,
} from "../utils/theme.js";
import type { PricingInterval } from "../components/pricing/types";

type ThemePreference = "system" | "dark" | "light";

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
  savePreference(preferenceKeys.pricingInterval, interval, {
    storage: "session",
    cookie: true,
  });
}

function setPricingToggleState(interval: PricingInterval) {
  document.querySelectorAll("[data-pricing-toggle]").forEach((element) => {
    if (!(element instanceof HTMLElement)) return;

    const isActive = element.getAttribute("data-interval") === interval;
    element.classList.toggle("is-active", isActive);
    element.setAttribute("aria-pressed", String(isActive));
  });
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
  root.dataset.pricingBillingMonthLabel = translate(
    locale,
    "landing.pricing.billingMonth",
    root.dataset.pricingBillingMonthLabel ?? "month",
  );
  root.dataset.pricingBillingYearLabel = translate(
    locale,
    "landing.pricing.billingYear",
    root.dataset.pricingBillingYearLabel ?? "year",
  );
  root.dataset.pricingCtaLabel = translate(locale, "landing.pricing.cta", root.dataset.pricingCtaLabel ?? "Subscribe");
}

function syncPricingDisplay(locale: string) {
  const root = getPricingRoot();

  if (!root) return;

  const freeLabel = root.dataset.pricingFreeLabel ?? "Free";
  const billingMonthLabel = root.dataset.pricingBillingMonthLabel ?? "month";
  const billingYearLabel = root.dataset.pricingBillingYearLabel ?? "year";
  const ctaLabel = root.dataset.pricingCtaLabel ?? "Subscribe";
  const interval = (root.dataset.pricingInterval as PricingInterval) ?? currentPricingInterval;

  setPricingToggleState(interval);

  document.querySelectorAll("[data-plan-id]").forEach((card) => {
    if (!(card instanceof HTMLElement)) return;

    const amount = card.dataset.priceAmount ?? "0";
    const currency = card.dataset.priceCurrency ?? "USD";
    const amountNode = card.querySelector("[data-price-amount]");
    const billingNode = card.querySelector("[data-billing-label]");
    const button = card.querySelector("[data-paddle-price-id]") as HTMLElement | null;

    if (amountNode) {
      amountNode.textContent = formatMoney(locale, amount, currency, freeLabel);
    }

    if (billingNode) {
      billingNode.textContent = formatBillingLabel(
        {
          billingInterval: interval,
        } as any,
        billingMonthLabel,
        billingYearLabel,
      );
    }

    if (button) {
      const planName = button.getAttribute("data-paddle-plan-name") ?? "";
      button.setAttribute("aria-label", `${ctaLabel} ${planName}`.trim());
    }
  });
}

async function fetchPricingSectionHTML(interval: PricingInterval) {
  persistPricingInterval(interval);
  const url = new URL(window.location.href);

  const response = await fetch(url.toString(), {
    headers: {
      "X-Requested-With": "fetch",
    },
  });

  if (!response.ok) {
    throw new Error(`Pricing request failed with status ${response.status}`);
  }

  return response.text();
}

function replacePricingSection(html: string) {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const nextRoot = parsed.querySelector(pricingRootSelector) as HTMLElement | null;

  if (!nextRoot) {
    throw new Error("Pricing section missing in fetched HTML");
  }

  const currentRoot = getPricingRoot();

  if (!currentRoot) {
    throw new Error("Current pricing section missing");
  }

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

    if (requestToken !== pricingRequestToken) {
      return;
    }

    replacePricingSection(html);

    currentPricingInterval = interval;
    syncPricingLocaleLabels(getLocale());
    syncPricingDisplay(getLocale());
  } catch (error) {
    if (requestToken !== pricingRequestToken) {
      return;
    }

    console.error("Pricing update failed", error);
    setPricingToggleState(currentPricingInterval);
  } finally {
    if (requestToken === pricingRequestToken) {
      setPricingLoadingState(false);
    }
  }
}

function initPricingToggle() {
  const root = getPricingRoot();

  if (!root) return;

  const queryInterval = new URL(window.location.href).searchParams.get("interval");
  const storedInterval = getStoredPricingInterval();
  const initialInterval =
    storedInterval ?? (root.dataset.pricingInterval as PricingInterval) ?? "month";

  currentPricingInterval = initialInterval;
  root.dataset.pricingInterval = initialInterval;
  setPricingToggleState(initialInterval);
  syncPricingLocaleLabels(getLocale());
  syncPricingDisplay(getLocale());

  document.addEventListener("click", (event) => {
    const target = event.target as Element | null;
    const trigger = target?.closest("[data-pricing-toggle]") as HTMLElement | null;

    if (!trigger) return;

    const interval = trigger.getAttribute("data-interval") as PricingInterval | null;

    if (!interval) return;

    event.preventDefault();
    void handlePricingToggle(interval);
  });
}

function initThemeToggle() {
  const select = document.querySelector("[data-theme-toggle]") as HTMLSelectElement | null;

  if (!select) return;

  const savedTheme = (getThemePreference() as ThemePreference) ?? "system";
  select.value = savedTheme;
  applyThemePreference(savedTheme);

  select.addEventListener("change", () => {
    const nextTheme = select.value as ThemePreference;
    saveThemePreference(nextTheme);
    applyThemePreference(nextTheme);
  });
}

function initLanguageSwitcher() {
  const select = document.querySelector("[data-language-switcher]") as HTMLSelectElement | null;

  if (!select) return;

  const currentLocale = bootstrapLocale() || getLocale();
  select.value = currentLocale;
  syncPricingLocaleLabels(currentLocale);
  syncPricingDisplay(currentLocale);

  select.addEventListener("change", () => {
    const locale = select.value;
    setLocale(locale);
    syncPricingLocaleLabels(locale);
    syncPricingDisplay(locale);
  });

  subscribeLocale((locale) => {
    select.value = locale;
    syncPricingLocaleLabels(locale);
    syncPricingDisplay(locale);
  });
}

function initPaddleCheckout() {
  document.addEventListener("click", async (event) => {
    const target = event.target as Element | null;
    const button = target?.closest("[data-paddle-price-id]") as HTMLElement | null;

    if (!button) return;

    const priceId = button.getAttribute("data-paddle-price-id");

    if (!priceId) return;

    event.preventDefault();

    try {
      const { initializePaddle } = await import("@paddle/paddle-js");
      const token = (import.meta as any).env?.PUBLIC_PADDLE_TOKEN;

      const paddle = await initializePaddle({
        environment: "sandbox",
        token,
      });

      paddle?.Checkout.open({
        items: [{ priceId, quantity: 1 }],
      });
    } catch (error) {
      console.error("Failed to open Paddle checkout:", error);
    }
  });
}

function initSiteInteractions() {
  bootstrapThemePreference();
  initThemeToggle();
  initLanguageSwitcher();
  initPricingToggle();
  initPaddleCheckout();

  window.requestAnimationFrame(() => {
    document.documentElement.classList.remove("preload");
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSiteInteractions, { once: true });
} else {
  initSiteInteractions();
}
