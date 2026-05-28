import {
  bootstrapLocale,
  getLocale,
  setLocale,
  subscribeLocale,
} from "../utils/i18n.ts";

function setLanguageSwitcherLabel(locale: string) {
  const desktopRoot = document.querySelector(
    '[data-language-dropdown="desktop"]',
  ) as HTMLElement | null;

  const mobileRoot = document.querySelector(
    '[data-language-dropdown="mobile"]',
  ) as HTMLElement | null;

  const roots = [desktopRoot, mobileRoot].filter(Boolean) as HTMLElement[];

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

function initDesktopLanguageSwitcher() {
  const desktopRoot = document.querySelector(
    '[data-language-dropdown="desktop"]',
  ) as HTMLElement | null;

  if (!desktopRoot) return;

  bootstrapLocale();

  const toggle = desktopRoot.querySelector(
    "[data-language-toggle]",
  ) as HTMLButtonElement | null;

  const panel = desktopRoot.querySelector(
    "[data-language-panel]",
  ) as HTMLElement | null;

  const options = Array.from(
    desktopRoot.querySelectorAll("[data-language-option]"),
  ) as HTMLButtonElement[];

  if (!toggle || !panel) return;

  const closeDropdown = () => {
    panel.classList.add("hidden");
  };

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    panel.classList.toggle("hidden");
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const locale = option.dataset.languageOption as string;

      setLocale(locale);
      closeDropdown();
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target as Element | null;

    if (target && !desktopRoot.contains(target)) {
      closeDropdown();
    }
  });

  subscribeLocale((locale) => {
    setLanguageSwitcherLabel(locale);
  });
}

function getMobileLanguageRoot() {
  return document.querySelector(
    '[data-language-dropdown="mobile"]',
  ) as HTMLElement | null;
}

function getMobileLanguageToggle(root: HTMLElement | null) {
  return root?.querySelector("[data-language-toggle]") as HTMLElement | null;
}

function getMobileLanguagePanel(root: HTMLElement | null) {
  return root?.querySelector("[data-language-panel]") as HTMLElement | null;
}

function getMobileLanguageOptions(root: HTMLElement | null) {
  return Array.from(
    root?.querySelectorAll("[data-language-option]") ?? [],
  ) as HTMLElement[];
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

  const updateUI = (locale: string) => {
    options.forEach((opt) => {
      const value = opt.getAttribute("data-language-option");
      const isActive = value === locale;

      opt.classList.toggle("bg-white/10", isActive);
      opt.classList.toggle("text-white", isActive);
      opt.classList.toggle("text-white/80", !isActive);
    });
  };

  updateUI(getLocale());

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    togglePanel();
  });

  options.forEach((opt) => {
    opt.addEventListener("click", () => {
      const locale = opt.getAttribute("data-language-option");

      if (!locale) return;

      setLocale(locale);

      setLanguageSwitcherLabel(locale);
      updateUI(locale);

      close();
    });
  });

  subscribeLocale((locale) => {
    setLanguageSwitcherLabel(locale);
    updateUI(locale);
  });

  const handleOutsidePointer = (event: Event) => {
    if (!isOpen) return;

    const target = event.target as Element | null;
    if (!target) return;

    if (!root.contains(target)) {
      close();
      event.stopImmediatePropagation();
    }
  };

  document.addEventListener("pointerdown", handleOutsidePointer, true);
}

function initLanguageSwitcher() {
  initDesktopLanguageSwitcher();
  initMobileLanguageSwitcher();
}

export default initLanguageSwitcher;
export { initLanguageSwitcher, setLanguageSwitcherLabel };