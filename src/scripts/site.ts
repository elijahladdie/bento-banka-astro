import { bootstrapThemePreference } from "../utils/theme.ts";
import initLanguageSwitcher from "./language-switcher";
import initMobileMenu from "./init-mobile-menu";
import initPaddleCheckout from "./paddle-checkout";
// import initPricingToggle from "./pricing-toggle";
import initThemeToggle from "./theme-toggle";
import initPricingToggle from "./pricing-toggle.ts";

function initSiteInteractions() {
  bootstrapThemePreference();

  initThemeToggle();
  initLanguageSwitcher();
  initPricingToggle();
  initPaddleCheckout();
  initMobileMenu();

  window.requestAnimationFrame(() => {
    document.documentElement.classList.remove("preload");
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSiteInteractions, {
    once: true,
  });
} else {
  initSiteInteractions();
}
