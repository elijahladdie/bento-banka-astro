import { initializePaddle, type PaddleEventData } from '@paddle/paddle-js';

function initPaddleCheckout() {
  document.addEventListener('click', async (event) => {
    const target = event.target as Element | null;

    const button = target?.closest('[data-paddle-price-id]') as HTMLElement | null;

    if (!button) return;

    const priceId = button.getAttribute('data-paddle-price-id');

    if (!priceId) return;

    event.preventDefault();

    const checkoutUrl = new URL('/paddle', window.location.origin);
    checkoutUrl.searchParams.set('priceId', priceId);

    const planName = button.getAttribute('data-paddle-plan-name');

    if (planName) {
      checkoutUrl.searchParams.set('plan', planName);
    }

    window.location.href = checkoutUrl.toString();
  });
}

function handlePaddleCheckout() {
  const checkoutContainer = document.querySelector('.checkout-container');
  const errorBanner = document.getElementById('checkout-error');

  const priceId = checkoutContainer?.getAttribute('data-price-id') ?? '';
  const themeValue = checkoutContainer?.getAttribute('data-theme') ?? 'light';
  const locale = checkoutContainer?.getAttribute('data-locale') ?? 'en';
  const paddleToken = checkoutContainer?.getAttribute('data-paddle-token') ?? '';

  const resolvedTheme = themeValue === 'dark' ? 'dark' : 'light';

  const successUrl = new URL('/paddle-checkout', window.location.origin).toString();

  function setCheckoutStatus(status: string, message: string) {
    sessionStorage.setItem('checkout-status', status);
    sessionStorage.setItem('checkout-message', message);
  }

  function showCheckoutError(message: string) {
    if (!errorBanner) return;

    errorBanner.textContent = message;
    errorBanner.classList.remove('hidden');

    errorBanner.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }

  function handleCheckoutEvent(eventName: string = '', payload: PaddleEventData) {
    switch (eventName) {
      case 'checkout.completed': {
        const message =
          payload?.detail ||
          'Your transaction has been completed successfully. We have emailed your receipt and order details.';

        setCheckoutStatus('success', message);

        window.location.href = successUrl;
        break;
      }

      case 'checkout.payment.failed': {
        const message =
          payload?.detail ||
          'Your payment could not be processed. Please review your payment method and try again.';

        setCheckoutStatus('failed', message);
        showCheckoutError(message);

        break;
      }

      case 'checkout.closed':
        window.location.href = '/#pricing';
        break;
      default:
    }
  }

  async function openCheckout(currentPriceId: string) {
    const paddle = await initializePaddle({
      environment: 'sandbox',
      token: paddleToken,

      eventCallback: (event: PaddleEventData) => {
        handleCheckoutEvent(event?.name, event);
      },

      checkout: {
        settings: {
          displayMode: 'inline',
          frameTarget: 'checkout-container',
          frameInitialHeight: 470,
          frameStyle: `
            width: 100%;
            min-width: 100%;
            border: none;
          `,
          variant: 'multi-page',
          theme: resolvedTheme,
          locale,
          successUrl,
        },
      },
    });

    if (!paddle) {
      throw new Error('Paddle failed to initialize.');
    }

    paddle.Checkout.open({
      items: [
        {
          priceId: currentPriceId,
          quantity: 1,
        },
      ],
    });
  }

  if (priceId) {
    openCheckout(priceId).catch((error) => {
      console.error('Failed to initialize Paddle checkout:', error);

      showCheckoutError(
        'Unable to load the checkout experience. Please refresh the page and try again.'
      );
    });
  } else {
    showCheckoutError(
      'No pricing information was provided. Please return to the pricing page and select a plan.'
    );
  }
}
export { initPaddleCheckout, handlePaddleCheckout };
