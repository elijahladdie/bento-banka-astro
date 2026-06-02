import { bootstrapThemePreference } from '../utils/theme.ts';
import initLanguageSwitcher from './language-switcher';
import initMobileMenu from './init-mobile-menu';
import { initPaddleCheckout, handlePaddleCheckout } from './paddle-checkout';
import initThemeToggle from './theme-toggle';
import { initPricingToggle } from './pricing-toggle.ts';

function initSiteInteractions() {
  bootstrapThemePreference();
  initThemeToggle();
  initLanguageSwitcher();
  initPricingToggle();
  handlePaddleCheckout();
  initPaddleCheckout();
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
