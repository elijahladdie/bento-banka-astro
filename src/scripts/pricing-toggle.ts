import {
  loadPreference,
  savePreference,
  preferenceKeys,
} from "../utils/preferences.ts";
import type { PricingInterval } from "../types";

const pricingRootSelector = "[data-pricing-root]";

function getPricingRoot() {
  return document.querySelector(pricingRootSelector) as HTMLElement | null;
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
  const switchElement = document.querySelector(
    "[data-pricing-switch]",
  ) as HTMLElement | null;

  if (!switchElement) return;

  const thumb = switchElement.querySelector(
    "[data-switch-thumb]",
  ) as HTMLElement | null;

  const isYearly = interval === "year";

  switchElement.setAttribute("aria-checked", String(isYearly));
  switchElement.dataset.currentInterval = interval;
  switchElement.classList.toggle("is-yearly", isYearly);

  if (thumb) {
    thumb.classList.toggle("translate-x-9", isYearly);
    thumb.classList.toggle("translate-x-1", !isYearly);
  }
}

function setPricingSectionVisibility(interval: PricingInterval) {
  const root = getPricingRoot();

  if (!root) return;

  const monthlySection = root.querySelector(
    "[data-pricing-month]",
  ) as HTMLElement | null;

  const yearlySection = root.querySelector(
    "[data-pricing-year]",
  ) as HTMLElement | null;

  const isYearly = interval === "year";

  if (monthlySection) {
    monthlySection.hidden = isYearly;
  }

  if (yearlySection) {
    yearlySection.hidden = !isYearly;
  }
}

function handlePricingToggle(interval: PricingInterval) {
  persistPricingInterval(interval);

  const root = getPricingRoot();

  if (!root) return;

  root.dataset.pricingInterval = interval;
  setPricingToggleState(interval);
  setPricingSectionVisibility(interval);
}

function initPricingToggle() {
  const root = getPricingRoot();

  if (!root) return;

  const storedInterval = getStoredPricingInterval();
  const initialInterval =
    storedInterval ??
    (root.dataset.pricingInterval as PricingInterval) ??
    "month";

  root.dataset.pricingInterval = initialInterval;
  setPricingToggleState(initialInterval);
  setPricingSectionVisibility(initialInterval);

  document.addEventListener("click", (event) => {
    const target = event.target as Element | null;
    const switchElement = target?.closest(
      "[data-pricing-switch]",
    ) as HTMLElement | null;

    if (!switchElement) return;

    event.preventDefault();

    const current =
      switchElement.dataset.currentInterval === "year" ? "year" : "month";

    const next: PricingInterval = current === "month" ? "year" : "month";

    handlePricingToggle(next);
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target as Element | null;
    const switchElement = target?.closest(
      "[data-pricing-switch]",
    ) as HTMLElement | null;

    if (!switchElement) return;

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();

    const current =
      switchElement.dataset.currentInterval === "year" ? "year" : "month";

    const next: PricingInterval = current === "month" ? "year" : "month";

    handlePricingToggle(next);
  });
}

export default initPricingToggle;
export { initPricingToggle };
