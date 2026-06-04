import { applyThemePreference, getThemePreference, saveThemePreference } from '../utils/theme.ts';
import type { ThemePreference } from '../types';

function initThemeToggle() {
  const buttons = Array.from(document.querySelectorAll('[data-theme-toggle]')) as HTMLElement[];

  if (!buttons.length) return;

  const savedTheme = (getThemePreference() as ThemePreference) ?? 'system';

  applyThemePreference(savedTheme);

  const updateButtons = (theme: ThemePreference) => {
    buttons.forEach((btn) => {
      btn.dataset.themeState = theme;

      const wrapper = btn.parentElement;
      const checks = wrapper?.querySelectorAll('[data-theme-check]');

      checks?.forEach((check) => {
        const checkTheme = check.getAttribute('data-theme-check');

        check.classList.toggle('hidden', checkTheme !== theme);
      });
    });
  };

  updateButtons(savedTheme);

  buttons.forEach((btn) => {
    const wrapper = btn.parentElement;
    const popover = wrapper?.querySelector('[data-theme-popover]') as HTMLElement | null;
    const options = wrapper?.querySelectorAll('[data-theme-option]');

    btn.addEventListener('click', (event) => {
      event.stopPropagation();

      popover?.classList.toggle('hidden');
    });

    options?.forEach((option) => {
      option.addEventListener('click', () => {
        const selectedTheme = option.getAttribute('data-theme-option') as ThemePreference;

        saveThemePreference(selectedTheme);
        applyThemePreference(selectedTheme);
        updateButtons(selectedTheme);
        popover?.classList.add('hidden');
      });
    });
  });

  document.addEventListener('click', (event) => {
    const target = event.target;

    if (!(target instanceof Node)) return;

    document.querySelectorAll('[data-theme-popover]').forEach((popover) => {
      const wrapper = popover.parentElement;

      if (!wrapper?.contains(target)) {
        popover.classList.add('hidden');
      }
    });
  });
}

export default initThemeToggle;
export { initThemeToggle };
