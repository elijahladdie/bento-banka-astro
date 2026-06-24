import { initializePaddle, type PaddleEventData } from '@paddle/paddle-js';

function handlePaddleCheckout() {
  const checkoutContainer = document.querySelector('.checkout-container');
  // Not a Paddle checkout page
  if (!checkoutContainer) {
    return;
  }
  // const target = event.target as Element | null;
  const buttons = document.querySelectorAll<HTMLElement>('[data-pricing-button]');

  buttons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();

      const priceId = button.getAttribute('data-paddle-price-id');

      const themeValue = checkoutContainer?.getAttribute('data-theme') ?? 'light';
      const locale = checkoutContainer?.getAttribute('data-locale') ?? 'en';

      const resolvedTheme = themeValue === 'dark' ? 'dark' : 'light';

      const checkoutStatusUrl = '/payments/checkout/success';

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
            // Stay on the page and show an error message,
            break;
          }

          case 'checkout.error': {
            // Stay on the page and show an error message,
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
        environment: import.meta.env.PUBLIC_PADDLE_ENV,
        token: import.meta.env.PUBLIC_PADDLE_TOKEN,

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
            successUrl: new URL('/payments/checkout/success', window.location.origin).toString(),
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
    });
  });
}
export { handlePaddleCheckout };
