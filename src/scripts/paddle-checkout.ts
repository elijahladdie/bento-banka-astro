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
  // Not a Paddle checkout page
  if (!checkoutContainer) {
    return;
  }
  const priceId = checkoutContainer?.getAttribute('data-price-id') ?? '';
  const themeValue = checkoutContainer?.getAttribute('data-theme') ?? 'light';
  const locale = checkoutContainer?.getAttribute('data-locale') ?? 'en';
  const paddleToken = checkoutContainer?.getAttribute('data-paddle-token') ?? '';

  const resolvedTheme = themeValue === 'dark' ? 'dark' : 'light';

  const checkoutStatusUrl = '/paddle-checkout';

  function redirectWithStatus(status: string, message: string) {
    sessionStorage.setItem('checkout-status', status);
    sessionStorage.setItem('checkout-message', message);

    window.location.replace(checkoutStatusUrl);
  }

  function handleCheckoutEvent(eventName = '', payload: PaddleEventData) {
    switch (eventName) {
      case 'checkout.completed': {
        redirectWithStatus(
          'success',
          payload?.detail ||
            'Your transaction has been completed successfully. We have emailed your receipt and order details.'
        );
        break;
      }

      case 'checkout.payment.failed': {
        redirectWithStatus(
          'failed',
          payload?.detail ||
            'Your payment could not be processed. Please review your payment method and try again.'
        );
        break;
      }

      case 'checkout.error': {
        redirectWithStatus(
          'failed',
          payload?.detail ||
            'Your payment could not be processed. Please review your price info and try again.'
        );
        break;
      }

      case 'checkout.closed': {
        window.location.href = '/#pricing';
        break;
      }
    }
  }

  if (!priceId) {
    redirectWithStatus(
      'default',
      'No pricing information was provided. Please return to the pricing page and select a plan.'
    );

    return;
  }

  initializePaddle({
    environment: 'sandbox',
    token: paddleToken,

    eventCallback: (event: PaddleEventData) => {
      handleCheckoutEvent(event?.name, event);
    },

    checkout: {
      settings: {
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
        successUrl: new URL('/paddle-checkout', window.location.origin).toString(),
      },
    },
  })
    .then((paddle) => {
      if (!paddle) {
        throw new Error('Paddle failed to initialize.');
      }
      if (!priceId || !/^pri_[a-zA-Z0-9_]+$/.test(priceId)) {
        redirectWithStatus(
          'failed',
          'Invalid price identifier provided. Please return to the pricing page and select a valid plan.'
        );
      }

      return paddle.Checkout.open({
        items: [
          {
            priceId,
            quantity: 1,
          },
        ],
      });
    })
    .catch((error) => {
      console.error('Failed to initialize Paddle checkout:', error);

      const errorMessage =
        error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

      if (
        errorMessage.includes('price') ||
        errorMessage.includes('price_id') ||
        errorMessage.includes('priceid') ||
        errorMessage.includes('not found') ||
        errorMessage.includes('invalid')
      ) {
        redirectWithStatus(
          'invalid_price',
          'The provided pricing ID is not valid. Please return to the pricing page and select a valid plan.'
        );

        return;
      }

      redirectWithStatus(
        'failed',
        'Unable to load the checkout experience. Please refresh the page and try again.'
      );
    });
}

export { initPaddleCheckout, handlePaddleCheckout };
