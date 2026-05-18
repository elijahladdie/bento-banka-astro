export function initMobileMenu() {
  const toggle = document.querySelector("[data-mobile-menu-toggle]") as HTMLElement | null;
  const menu = document.querySelector("[data-mobile-menu]") as HTMLElement | null;

  if (!toggle || !menu) return;

  const openIcon = toggle.querySelector("[data-menu-open]") as HTMLElement | null;
  const closeIcon = toggle.querySelector("[data-menu-close]") as HTMLElement | null;

  function openMenu() {
    menu.classList.remove("opacity-0", "invisible", "pointer-events-none");
    menu.classList.add("opacity-100", "visible", "pointer-events-auto");
    menu.setAttribute("aria-hidden", "false");

    toggle.setAttribute("aria-expanded", "true");

    if (openIcon) openIcon.classList.add("hidden");
    if (closeIcon) closeIcon.classList.remove("hidden");

    // disable body scroll while open
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    menu.classList.add("opacity-0", "invisible", "pointer-events-none");
    menu.classList.remove("opacity-100", "visible", "pointer-events-auto");
    menu.setAttribute("aria-hidden", "true");

    toggle.setAttribute("aria-expanded", "false");

    if (openIcon) openIcon.classList.remove("hidden");
    if (closeIcon) closeIcon.classList.add("hidden");

    document.body.style.overflow = "";
  }

  function toggleMenu() {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    if (isOpen) closeMenu(); else openMenu();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      closeMenu();
    }
  }

  function onResize() {
    if (window.innerWidth >= 640) {
      closeMenu();
    }
  }

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    toggleMenu();
  });

  document.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onResize);
}

export default initMobileMenu;
