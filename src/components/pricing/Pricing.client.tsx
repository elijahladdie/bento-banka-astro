"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, CircleCheck, RefreshCcw } from "lucide-react";

import PricingToggle from "./PricingToggle.client";
import type { PricingApiResponse, PricingClientProps, PricingInterval, PricingPlan } from "./types";
import { formatBillingLabel, formatMoney, transformPricingResponse } from "../../utils/format";
import { initializePaddle } from "@paddle/paddle-js";

export default function PricingClient({
  interval: initialInterval = "year",
  locale,
  children,
  monthlyLabel,
  yearlyLabel,
  freeLabel,
  billingMonthLabel,
  billingYearLabel,
  popularLabel,
  trialLabel,
  ctaLabel,
  errorTitle,
  errorBody,
  retryLabel,
}: PricingClientProps) {
  const [interval, setInterval] = useState<PricingInterval>(initialInterval);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [paddle, setPaddle] = useState<any>(null);
  useEffect(() => {
    async function loadPaddle() {
      try {
        const paddleInstance = await initializePaddle({
          environment: 'sandbox',
          token: import.meta.env.PUBLIC_PADDLE_TOKEN,
        });
        paddleInstance?.Initialize({
          token: import.meta.env.PUBLIC_PADDLE_TOKEN,
          eventCallback: (data) => {
            console.log(data);
          }
        })
        console.log("Paddle initialized:", paddleInstance);
        setPaddle(paddleInstance);
      } catch (err) {
        console.error("Failed to initialize Paddle:", err);
      }
    }

    loadPaddle();
  }, []);
  useEffect(() => {
    const controller = new AbortController();

    async function loadPricing() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/pricing?interval=${interval}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Pricing request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as PricingApiResponse;
        setPlans(transformPricingResponse(payload, interval));
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setError(err instanceof Error ? err.message : errorBody);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPricing();

    return () => controller.abort();
  }, [interval, refreshKey, errorBody]);



  return (
    <>
      <PricingToggle
        interval={interval}
        monthlyLabel={monthlyLabel}
        yearlyLabel={yearlyLabel}
        onIntervalChange={setInterval}
      />

      <div className="mx-auto w-full relative mt-10">
        <div className="pricing-grid">
          {loading ? (
            <div className="col-span-full w-full">{children}</div>
          ) : error ? (
            <div className="mx-auto max-w-2xl">
              <div className="glass-card p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.12)] text-[var(--error-text)]">
                    <AlertTriangle className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold text-[var(--text-primary)]">
                      {errorTitle}
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                      {errorBody}
                    </p>

                    <p className="mt-3 text-xs text-[var(--text-muted)]">{error}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRefreshKey((value) => value + 1)}
                    className="btn-primary glass-surface-lift inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
                    aria-label={retryLabel}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    {retryLabel}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            plans.map((plan) => {
              const formattedPrice = formatMoney(
                locale,
                plan.priceAmount,
                plan.currencyCode,
                freeLabel,
              );

              const billingLabel = formatBillingLabel(
                plan,
                billingMonthLabel,
                billingYearLabel,
              );

              return (
                <div
                  key={plan.id}
                  className={plan.popular ? "pricing-card is-popular glass-card-heavy p-8" : "pricing-card glass-card p-8"}
                >
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                          {plan.name}
                        </h3>

                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--text-secondary)]">
                          {plan.description}
                        </p>
                      </div>

                      {plan.popular ? (
                        <span className="inline-flex btn-secondary shrink-0 rounded-full border border-[rgba(110,180,80,0.55)] bg-[rgba(110,180,80,0.18)] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[rgba(110,180,80,0.9)]">
                          {popularLabel}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-8 flex items-end gap-3">
                      <span className="text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
                        {formattedPrice} /
                      </span>

                      <span className="pb-1 text-sm text-[var(--text-secondary)]">
                        {billingLabel}
                      </span>
                    </div>

                    <div className="my-4">
                      <button
                        type="button"
                        className={plan.popular ? "btn-secondary glass-surface-lift inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold" : "btn-primary glass-surface-lift inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"}
                        onClick={() => {
                          if (!paddle) {
                            console.error("Paddle is not initialized");
                            return;
                          }

                          paddle.Checkout.open({
                            items: [
                              {
                                priceId: `pri_01krjqpqwn3jrks4428b2prwmm`,// Currently hardcoded to a single price ID for testing purposes; replace with dynamic price ID as needed
                                quantity: 1,
                              },
                            ],
                          });
                        }}
                        aria-label={`${ctaLabel} ${plan.name}`}
                      >
                        {ctaLabel}
                      </button>
                    </div>

                    {plan.trialLabel ? (
                      <div className="mt-2 flex min-h-[28px] flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full border border-[rgba(96,165,250,0.35)] bg-[rgba(59,130,246,0.12)] px-3 py-1 text-xs font-medium text-[var(--info-primary)]">
                          {plan.trialLabel}
                        </span>

                        <span className="text-xs text-[var(--text-muted)]">{trialLabel}</span>
                      </div>
                    ) : null}

                    <p className="mt-2 py-2 text-sm font-bold text-[var(--text-muted)]">
                      What&apos;s included
                    </p>

                    {plan.features.length > 0 ? (
                      <div className="group relative">
                        <div className="space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                          {plan.features.map((feature) => (
                            <div key={feature} className="flex items-start gap-3">
                              <CircleCheck
                                className={plan.popular ? "mt-1 h-4 w-4 shrink-0 text-[rgb(20,20,20)]" : "mt-1 h-4 w-4 shrink-0 text-[var(--gold)]"}
                              />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}