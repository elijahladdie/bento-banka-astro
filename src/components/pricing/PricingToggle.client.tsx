import type { ToggleClientProps } from "./types";

export default function PricingToggleClient({
  interval = "year",
  monthlyLabel,
  yearlyLabel,
  onIntervalChange,
}: ToggleClientProps) {
  const checked = interval === "year";

  const toggleInterval = () => {
    onIntervalChange?.(checked ? "month" : "year");
  };

  return (
    <div className="mx-auto my-auto flex items-center gap-3">
      <span
        className={[
          "text-sm transition-colors duration-200",
          checked ? "text-white/50" : "font-medium text-white",
        ].join(" ")}
      >
        {monthlyLabel}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${monthlyLabel} / ${yearlyLabel}`}
        data-state={checked ? "checked" : "unchecked"}
        onClick={toggleInterval}
        className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-white/10 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent data-[state=checked]:bg-yellow-500"
      >
        <span
          data-state={checked ? "checked" : "unchecked"}
          className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 will-change-transform data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-5"
        />
      </button>

      <span
        className={[
          "text-sm transition-colors duration-200",
          checked ? "font-medium text-white" : "text-white/50",
        ].join(" ")}
      >
        {yearlyLabel}
      </span>
    </div>
  );
}