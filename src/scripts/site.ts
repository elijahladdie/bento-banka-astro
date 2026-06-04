import { bootstrapThemePreference } from '../utils/theme.ts';
import initLanguageSwitcher from './language-switcher';
import initMobileMenu from './init-mobile-menu';
import { handlePaddleCheckout } from './paddle-checkout';
import initThemeToggle from './theme-toggle';
import { initPricingToggle } from './pricing-toggle.ts';

function initSiteInteractions() {
  bootstrapThemePreference();
  initThemeToggle();
  initLanguageSwitcher();
  initPricingToggle();
  handlePaddleCheckout();
  initMobileMenu();

  window.requestAnimationFrame(() => {
    document.documentElement.classList.remove('preload');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSiteInteractions, {
    once: true,
  });
} else {
  initSiteInteractions();
}
