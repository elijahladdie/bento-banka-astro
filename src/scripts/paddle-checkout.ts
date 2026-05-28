function initPaddleCheckout() {
  document.addEventListener("click", async (event) => {
    const target = event.target as Element | null;

    const button = target?.closest("[data-paddle-price-id]") as HTMLElement | null;

    if (!button) return;

    const priceId = button.getAttribute("data-paddle-price-id");

    if (!priceId) return;

    event.preventDefault();

    const checkoutUrl = new URL("/paddle", window.location.origin);
    checkoutUrl.searchParams.set("priceId", priceId);

    const planName = button.getAttribute("data-paddle-plan-name");

    if (planName) {
      checkoutUrl.searchParams.set("plan", planName);
    }

    window.location.href = checkoutUrl.toString();
  });
}

export default initPaddleCheckout;
export { initPaddleCheckout };