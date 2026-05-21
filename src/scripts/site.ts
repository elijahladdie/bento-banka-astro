import { formatBillingLabel, formatMoney } from "../utils/format";
import {
  bootstrapLocale,
  getLocale,
  setLocale,
  subscribeLocale,
  translate,
} from "../utils/i18n.ts";
import {
  loadPreference,
  savePreference,
  preferenceKeys,
} from "../utils/preferences.ts";
import {
  applyThemePreference,
  bootstrapThemePreference,
  getThemePreference,
  saveThemePreference,
} from "../utils/theme.ts";
import { initMobileMenu } from "./init-mobile-menu";
import type { PricingInterval } from "../components/pricing/types";

type ThemePreference = "system" | "dark" | "light";

const pricingRootSelector = "[data-pricing-root]";

let currentPricingInterval: PricingInterval = "month";
let pricingRequestToken = 0;

function getPricingRoot() {
  return document.querySelector(
    pricingRootSelector,
  ) as HTMLElement | null;
}

function getPricingPanel(root: HTMLElement | null) {
  return root?.querySelector(
    "[data-pricing-panel]",
  ) as HTMLElement | null;
}

function getPricingContent(root: HTMLElement | null) {
  return root?.querySelector(
    "[data-pricing-content]",
  ) as HTMLElement | null;
}

function getPricingSkeleton(root: HTMLElement | null) {
  return root?.querySelector(
    "[data-pricing-skeleton]",
  ) as HTMLElement | null;
}

function getStoredPricingInterval() {
  return loadPreference(
    preferenceKeys.pricingInterval,
    null,
  ) as PricingInterval | null;
}

function persistPricingInterval(
  interval: PricingInterval,
) {
  savePreference(
    preferenceKeys.pricingInterval,
    interval,
    {
      storage: "session",
      cookie: true,
    },
  );
}

/**
 * Updated switch-style pricing toggle
 * Replaces old segmented button behavior
 */
function setPricingToggleState(interval: PricingInterval) {
  const switchElement = document.querySelector(
    "[data-pricing-switch]",
  ) as HTMLElement | null;

  if (!switchElement) return;

  const thumb = switchElement.querySelector(
    "[data-switch-thumb]",
  ) as HTMLElement | null;

  const isYearly = interval === "year";

  // accessibility
  switchElement.setAttribute("aria-checked", String(isYearly));

  // state
  switchElement.dataset.currentInterval = interval;

  // background state ONLY (safe to toggle UI shape, not color system)
  switchElement.classList.toggle("is-yearly", isYearly);

  // thumb movement only
  if (thumb) {
    thumb.classList.toggle("translate-x-9", isYearly);
    thumb.classList.toggle("translate-x-1", !isYearly);
  }
}

function setPricingLoadingState(
  isLoading: boolean,
) {
  const root = getPricingRoot();
  const panel = getPricingPanel(root);
  const content = getPricingContent(root);
  const skeleton = getPricingSkeleton(root);

  if (!panel || !content || !skeleton) return;

  panel.setAttribute(
    "aria-busy",
    String(isLoading),
  );

  content.hidden = isLoading;
  skeleton.hidden = !isLoading;
}

function syncPricingLocaleLabels(locale: string) {
  const root = getPricingRoot();

  if (!root) return;

  root.dataset.pricingFreeLabel =
    translate(
      locale,
      "landing.pricing.free",
      root.dataset.pricingFreeLabel ??
        "Free",
    );

  root.dataset.pricingBillingMonthLabel =
    translate(
      locale,
      "landing.pricing.billingMonth",
      root.dataset
        .pricingBillingMonthLabel ?? "month",
    );

  root.dataset.pricingBillingYearLabel =
    translate(
      locale,
      "landing.pricing.billingYear",
      root.dataset
        .pricingBillingYearLabel ?? "year",
    );

  root.dataset.pricingCtaLabel = translate(
    locale,
    "landing.pricing.cta",
    root.dataset.pricingCtaLabel ??
      "Subscribe",
  );
}

function syncPricingDisplay(locale: string) {
  const root = getPricingRoot();

  if (!root) return;

  const freeLabel =
    root.dataset.pricingFreeLabel ?? "Free";

  const billingMonthLabel =
    root.dataset.pricingBillingMonthLabel ??
    "month";

  const billingYearLabel =
    root.dataset.pricingBillingYearLabel ??
    "year";

  const ctaLabel =
    root.dataset.pricingCtaLabel ??
    "Subscribe";

  const interval =
    (root.dataset
      .pricingInterval as PricingInterval) ??
    currentPricingInterval;

  setPricingToggleState(interval);

  document
    .querySelectorAll("[data-plan-id]")
    .forEach((card) => {
      if (!(card instanceof HTMLElement))
        return;

      const amount =
        card.dataset.priceAmount ?? "0";

      const currency =
        card.dataset.priceCurrency ?? "USD";

      const amountNode =
        card.querySelector(
          "[data-price-amount]",
        );

      const billingNode =
        card.querySelector(
          "[data-billing-label]",
        );

      const button = card.querySelector(
        "[data-paddle-price-id]",
      ) as HTMLElement | null;

      if (amountNode) {
        amountNode.textContent = formatMoney(
          locale,
          amount,
          currency,
          freeLabel,
        );
      }

      if (billingNode) {
        billingNode.textContent =
          formatBillingLabel(
            {
              billingInterval: interval,
            } as any,
            billingMonthLabel,
            billingYearLabel,
          );
      }

      if (button) {
        const planName =
          button.getAttribute(
            "data-paddle-plan-name",
          ) ?? "";

        button.setAttribute(
          "aria-label",
          `${ctaLabel} ${planName}`.trim(),
        );
      }
    });
}

async function fetchPricingSectionHTML(
  interval: PricingInterval,
) {
  persistPricingInterval(interval);

  const url = new URL(window.location.href);

  const response = await fetch(
    url.toString(),
    {
      headers: {
        "X-Requested-With": "fetch",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Pricing request failed with status ${response.status}`,
    );
  }

  return response.text();
}

function replacePricingSection(html: string) {
  const parsed = new DOMParser().parseFromString(
    html,
    "text/html",
  );

  const nextRoot = parsed.querySelector(
    pricingRootSelector,
  ) as HTMLElement | null;

  if (!nextRoot) {
    throw new Error(
      "Pricing section missing in fetched HTML",
    );
  }

  const currentRoot = getPricingRoot();

  if (!currentRoot) {
    throw new Error(
      "Current pricing section missing",
    );
  }

  currentRoot.replaceWith(nextRoot);
}

async function handlePricingToggle(
  interval: PricingInterval,
) {
  if (interval === currentPricingInterval) {
    setPricingToggleState(interval);
    return;
  }

  const requestToken =
    ++pricingRequestToken;

  setPricingToggleState(interval);
  setPricingLoadingState(true);

  try {
    const html =
      await fetchPricingSectionHTML(
        interval,
      );

    if (
      requestToken !== pricingRequestToken
    ) {
      return;
    }

    replacePricingSection(html);

    currentPricingInterval = interval;

    syncPricingLocaleLabels(getLocale());

    syncPricingDisplay(getLocale());
  } catch (error) {
    if (
      requestToken !== pricingRequestToken
    ) {
      return;
    }

    console.error(
      "Pricing update failed",
      error,
    );

    setPricingToggleState(
      currentPricingInterval,
    );
  } finally {
    if (
      requestToken === pricingRequestToken
    ) {
      setPricingLoadingState(false);
    }
  }
}

/**
 * Updated pricing switch initialization
 */
function initPricingToggle() {
  const root = getPricingRoot();

  if (!root) return;

  const storedInterval =
    getStoredPricingInterval();

  const initialInterval =
    storedInterval ??
    (root.dataset
      .pricingInterval as PricingInterval) ??
    "month";

  currentPricingInterval =
    initialInterval;

  root.dataset.pricingInterval =
    initialInterval;

  setPricingToggleState(initialInterval);

  syncPricingLocaleLabels(getLocale());

  syncPricingDisplay(getLocale());

  // click interaction
  document.addEventListener(
    "click",
    (event) => {
      const target =
        event.target as Element | null;

      const switchElement =
        target?.closest(
          "[data-pricing-switch]",
        ) as HTMLElement | null;

      if (!switchElement) return;

      event.preventDefault();

      const current =
        switchElement.dataset
          .currentInterval === "year"
          ? "year"
          : "month";

      const next: PricingInterval =
        current === "month"
          ? "year"
          : "month";

      void handlePricingToggle(next);
    },
  );

  // keyboard accessibility
  document.addEventListener(
    "keydown",
    (event) => {
      const target =
        event.target as Element | null;

      const switchElement =
        target?.closest(
          "[data-pricing-switch]",
        ) as HTMLElement | null;

      if (!switchElement) return;

      if (
        event.key !== "Enter" &&
        event.key !== " "
      ) {
        return;
      }

      event.preventDefault();

      const current =
        switchElement.dataset
          .currentInterval === "year"
          ? "year"
          : "month";

      const next: PricingInterval =
        current === "month"
          ? "year"
          : "month";

      void handlePricingToggle(next);
    },
  );
}

function initThemeToggle() {
  const buttons = Array.from(
    document.querySelectorAll("[data-theme-toggle]"),
  ) as HTMLElement[];

  if (!buttons.length) return;

  const savedTheme =
    (getThemePreference() as ThemePreference) ?? "system";

  applyThemePreference(savedTheme);

  const updateButtons = (theme: ThemePreference) => {
    buttons.forEach((btn) => {
      btn.dataset.themeState = theme;
    });
  };

  updateButtons(savedTheme);

  const cycleTheme = (current: ThemePreference): ThemePreference => {
    if (current === "system") return "light";
    if (current === "light") return "dark";
    return "system";
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const current =
        (btn.dataset.themeState as ThemePreference) ?? "system";

      const next = cycleTheme(current);

      saveThemePreference(next);
      applyThemePreference(next);

      updateButtons(next);
    });
  });
}
function initLanguageSwitcher() {
  const desktopRoot = document.querySelector(
    '[data-language-dropdown="desktop"]',
  ) as HTMLElement | null;

  if (!desktopRoot) return;

  const currentLocale =
    bootstrapLocale() || getLocale();

  const toggle = desktopRoot.querySelector(
    "[data-language-toggle]",
  ) as HTMLButtonElement | null;

  const panel = desktopRoot.querySelector(
    "[data-language-panel]",
  ) as HTMLElement | null;

  const options = Array.from(
    desktopRoot.querySelectorAll(
      "[data-language-option]",
    ),
  ) as HTMLButtonElement[];

  if (!toggle || !panel) return;

  // Close dropdown when clicking outside
  const closeDropdown = () => {
    panel.classList.add("hidden");
  };

  // Toggle dropdown on button click
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.toggle("hidden");
  });

  // Handle language option clicks
  options.forEach((option) => {
    option.addEventListener("click", () => {
      const locale = option.dataset
        .languageOption as string;

      setLocale(locale);

      // Close dropdown
      closeDropdown();
    });
  });

  // Close on click outside
  document.addEventListener("click", (e) => {
    const target = e.target as Element | null;
    if (target && !desktopRoot.contains(target)) {
      closeDropdown();
    }
  });

  // Subscribe to locale changes from any source (mobile or desktop)
  subscribeLocale((locale) => {
    setLanguageSwitcherLabel(locale);
  });
}

function setLanguageSwitcherLabel(locale: string) {
  const desktopRoot = document.querySelector(
    '[data-language-dropdown="desktop"]',
  ) as HTMLElement | null;

  const mobileRoot = document.querySelector(
    '[data-language-dropdown="mobile"]',
  ) as HTMLElement | null;

  const roots = [desktopRoot, mobileRoot].filter(
    Boolean,
  ) as HTMLElement[];

  const flagMap: Record<string, string> = {
    en: "🇬🇧",
    fr: "🇫🇷",
    kin: "🇷🇼",
  };

  roots.forEach((root) => {
    const currentLabel = root.querySelector(
      "[data-language-current]",
    ) as HTMLElement | null;

    const currentFlag = root.querySelector(
      "[data-language-toggle] .text-base",
    ) as HTMLElement | null;

    if (currentLabel) {
      currentLabel.textContent = locale;
    }

    if (currentFlag) {
      currentFlag.textContent = flagMap[locale] || "🇬🇧";
    }
  });
}

function getMobileLanguageRoot() {
  return document.querySelector(
    '[data-language-dropdown="mobile"]',
  ) as HTMLElement | null;
}

function getMobileLanguageToggle(root: HTMLElement | null) {
  return root?.querySelector(
    "[data-language-toggle]",
  ) as HTMLElement | null;
}

function getMobileLanguagePanel(root: HTMLElement | null) {
  return root?.querySelector(
    "[data-language-panel]",
  ) as HTMLElement | null;
}

function getMobileLanguageOptions(root: HTMLElement | null) {
  return Array.from(
    root?.querySelectorAll("[data-language-option]") ?? [],
  ) as HTMLElement[];
}

function initPaddleCheckout() {
  document.addEventListener(
    "click",
    async (event) => {
      const target =
        event.target as Element | null;

      const button = target?.closest(
        "[data-paddle-price-id]",
      ) as HTMLElement | null;

      if (!button) return;

      const priceId =
        button.getAttribute(
          "data-paddle-price-id",
        );

      if (!priceId) return;

      event.preventDefault();

      try {
        const { initializePaddle } =
          await import("@paddle/paddle-js");

        const token = (import.meta as any)
          .env?.PUBLIC_PADDLE_TOKEN;

        const paddle =
          await initializePaddle({
            environment: "sandbox",
            token,
          });

        paddle?.Checkout.open({
          items: [
            {
              priceId,
              quantity: 1,
            },
          ],
        });
      } catch (error) {
        console.error(
          "Failed to open Paddle checkout:",
          error,
        );
      }
    },
  );
}
function initMobileLanguageSwitcher() {
  const root = getMobileLanguageRoot();

  if (!root) return;

  const toggle = getMobileLanguageToggle(root);
  const panel = getMobileLanguagePanel(root);
  const options = getMobileLanguageOptions(root);

  if (!toggle || !panel) return;

  let isOpen = false;

  const open = () => {
    panel.classList.remove("max-h-0", "opacity-0");
    panel.classList.add("max-h-80", "opacity-100");
    root.dataset.state = "open";
    toggle.setAttribute("aria-expanded", "true");
    const chevron = root.querySelector(
      "[data-language-chevron]",
    ) as HTMLElement | null;
    chevron?.classList.add("rotate-180");
    isOpen = true;
  };

  const close = () => {
    panel.classList.remove("max-h-80", "opacity-100");
    panel.classList.add("max-h-0", "opacity-0");
    root.dataset.state = "closed";
    toggle.setAttribute("aria-expanded", "false");
    const chevron = root.querySelector(
      "[data-language-chevron]",
    ) as HTMLElement | null;
    chevron?.classList.remove("rotate-180");
    isOpen = false;
  };

  const togglePanel = () => {
    isOpen ? close() : open();
  };

  const currentLocale = getLocale();

  const updateUI = (locale: string) => {
    options.forEach((opt) => {
      const value = opt.getAttribute("data-language-option");

      const isActive = value === locale;

      opt.classList.toggle("bg-white/10", isActive);
      opt.classList.toggle("text-white", isActive);
      opt.classList.toggle("text-white/80", !isActive);
    });
  };

  updateUI(currentLocale);

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    togglePanel();
  });

  options.forEach((opt) => {
    opt.addEventListener("click", () => {
      const locale = opt.getAttribute("data-language-option");

      if (!locale) return;

      setLocale(locale);

      syncPricingLocaleLabels(locale);
      syncPricingDisplay(locale);

      setLanguageSwitcherLabel(locale);

      updateUI(locale);

      close();
    });
  });

  // Subscribe to locale changes from any source (desktop or mobile)
  subscribeLocale((locale) => {
    setLanguageSwitcherLabel(locale);
    updateUI(locale);
    syncPricingLocaleLabels(locale);
    syncPricingDisplay(locale);
  });

  const handleOutsidePointer = (e: Event) => {
    if (!isOpen) return;

    const target = e.target as Element | null;
    if (!target) return;

    if (!root.contains(target)) {
      close();
      e.stopImmediatePropagation();
    }
  };

  // Capture phase improves reliability for touch/pointer interactions on mobile.
  document.addEventListener(
    "pointerdown",
    handleOutsidePointer,
    true,
  );
}

function initSiteInteractions() {
  bootstrapThemePreference();

  initThemeToggle();
  
  initMobileLanguageSwitcher();
  initLanguageSwitcher();

  initPricingToggle();

  initPaddleCheckout();

  initMobileMenu();

  window.requestAnimationFrame(() => {
    document.documentElement.classList.remove(
      "preload",
    );
  });
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initSiteInteractions,
    {
      once: true,
    },
  );
} else {
  initSiteInteractions();
}