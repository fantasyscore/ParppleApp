import { Platform } from "react-native";

// Android products come from the "publish_*" subscription (silver tier) plus gold / platinum.
const ANDROID_SKUS = [
  "publish_one_week", "publish_one_month", "publish_six_months",
];
const IOS_SKUS = [
  "publish_one_week", "publish_one_month", "publish_six_months",
];

export const ALL_SUBSCRIPTION_SKUS: string[] = Platform.select({ android: ANDROID_SKUS, ios: IOS_SKUS }) ?? ANDROID_SKUS;

export type SubscriptionTier = "Silver" | "Gold" | "Platinum";

export const getTierFromProductId = (productId: string): SubscriptionTier => {
  const id = productId.toLowerCase();
  if (id.includes("silver")) return "Silver";
  if (id.includes("gold")) return "Gold";
  if (id.includes("platinum")) return "Platinum";
  return "Silver";
};

/**
 * Pick the plain base-plan offer (no promo offerId, single infinitely-recurring phase).
 * Never blindly use subscriptionOfferDetails[0]: Play returns every base plan/offer of the
 * product, so [0] may be a different billing period or a trial/intro offer.
 */
export const selectBaseOffer = (subscription: any): any | null => {
  const offers: any[] = subscription?.subscriptionOfferDetails ?? [];
  if (offers.length === 0) return null;
  const isPlainBasePlan = (offer: any) => {
    const phases = offer?.pricingPhases?.pricingPhaseList ?? [];
    return !offer?.offerId && phases.length === 1 && phases[0]?.recurrenceMode === 1;
  };
  const candidates = offers.filter(isPlainBasePlan);
  if (candidates.length === 0) return offers[0];
  // Prefer the weekly/monthly/etc. period implied by the SKU when several base plans exist
  const productId = (subscription.id || subscription.productId || "").toString().toLowerCase();
  const expected = productId.includes("6month") ? "P6M" : productId.includes("month") ? "P1M" : productId.includes("week") ? "P1W" : null;
  return candidates.find((offer) => offer.pricingPhases.pricingPhaseList[0].billingPeriod === expected) ?? candidates[0];
};

interface SubscriptionPeriod {
  planOf: string;
  ofPu: string;
  periodOrder: number;
  weeksCount: number;
}

// Rule: 1 month = 4 weeks, 6 months = 24 weeks
const monthPeriod = (months: number): SubscriptionPeriod => ({
  planOf: months === 1 ? "1 Month" : `${months} Months`,
  ofPu: "Month",
  periodOrder: months === 1 ? 2 : months === 6 ? 3 : 4,
  weeksCount: months === 6 ? 24 : months * 4,
});
const weekPeriod = (weeks: number): SubscriptionPeriod => ({ planOf: `${weeks} Week`, ofPu: "Week", periodOrder: 1, weeksCount: weeks });
const yearPeriod = (years: number): SubscriptionPeriod => ({ planOf: `${years} Year`, ofPu: "Year", periodOrder: 5, weeksCount: years * 52 });

/** Billing period of a store subscription (Android offer phases, iOS period fields, or the SKU name). */
export const extractSubscriptionPeriod = (subscription: any): SubscriptionPeriod => {
  const productId = (subscription.id || subscription.productId || subscription.productIdentifier || "").toString();

  // Android: ISO-8601 billing period of the base plan, e.g. P1W / P1M / P6M / P1Y
  const phase = selectBaseOffer(subscription)?.pricingPhases?.pricingPhaseList?.[0];
  if (phase) {
    const billingPeriod: string = phase.billingPeriod || "";
    const amount = parseInt(billingPeriod.match(/\d+/)?.[0] || "1");
    if (billingPeriod.includes("W")) return weekPeriod(amount);
    if (billingPeriod.includes("M")) return monthPeriod(amount);
    if (billingPeriod.includes("Y")) return yearPeriod(amount);
  }

  // iOS
  if (subscription.subscriptionPeriodNumberIOS && subscription.subscriptionPeriodUnitIOS) {
    const number = parseInt(subscription.subscriptionPeriodNumberIOS);
    // StoreKit reports the unit in lower case ("month"), other bridges in upper case: compare case-insensitively
    const unit = String(subscription.subscriptionPeriodUnitIOS).toUpperCase();
    if (unit === "WEEK") return weekPeriod(number);
    if (unit === "MONTH") return monthPeriod(number);
    if (unit === "YEAR") return yearPeriod(number);
  }

  // Fallback: the SKU name
  if (/6month|six_?month/i.test(productId)) return monthPeriod(6);
  if (productId.includes("month")) return monthPeriod(1);
  if (productId.includes("week")) return weekPeriod(1);
  if (productId.includes("year")) return yearPeriod(1);

  return { planOf: "Plan", ofPu: "", periodOrder: 0, weeksCount: 1 };
};

export const extractPrice = (subscription: any): string => {
  if (subscription.displayPrice) return subscription.displayPrice;
  if (subscription.localizedPrice) return subscription.localizedPrice;

  const phase = selectBaseOffer(subscription)?.pricingPhases?.pricingPhaseList?.[0];
  if (phase?.formattedPrice) return phase.formattedPrice;
  if (phase?.priceAmountMicros) {
    const amount = parseInt(phase.priceAmountMicros) / 1000000;
    return `${phase.priceCurrencyCode || "₹"}${amount.toFixed(0)}`;
  }

  if (subscription.price) return `${subscription.currency || "₹"}${subscription.price}`;
  return "N/A";
};

/** Splits a formatted price such as "₹499.00" into its number and currency symbol. */
export const extractPriceNumber = (priceStr: string): { amount: number; currency: string } => {
  const amountMatch = priceStr.match(/[\d,.]+/);
  const amount = amountMatch ? parseFloat(amountMatch[0].replace(/,/g, "")) : 0;
  const currency = priceStr.replace(/[\d,.\s]+/g, "") || "₹";
  return { amount, currency };
};

/**
 * Turns the store's subscription products into display plans: period label, price, per-week
 * price (floored to 2 decimals) and "Save x%" / "Best Value" against the tier's 1-week plan.
 */
export const buildSubscriptionPlans = (availableProducts: any[]): any[] => {
  // First pass: weekly pricing for every product
  const plans = availableProducts.map((prod: any) => {
    const periodInfo = extractSubscriptionPeriod(prod);
    const fullPriceStr = extractPrice(prod);
    const priceInfo = extractPriceNumber(fullPriceStr);

    const weeks = periodInfo.weeksCount;
    const total = priceInfo.amount;
    const weeklyFixed = Math.floor((total / weeks) * 100) / 100;

    const productId = prod.id || prod.productId || "";
    return {
      id: productId,
      tier: getTierFromProductId(productId),
      planOf: periodInfo.planOf,
      amount: `${priceInfo.currency}${weeklyFixed.toFixed(2)} /`,
      ofPu: "wk",
      periodOrder: periodInfo.periodOrder,
      displayPrice: fullPriceStr,
      weeklyPriceAmount: weeklyFixed,
      weeksCount: weeks,
      totalAmount: total,
      currency: priceInfo.currency,
      storeTitle: prod.title || prod.localizedTitle || prod.name || "",
      storeDescription: prod.description || prod.localizedDescription || "",
      rawSubscription: prod,
    };
  });

  // Second pass: discounts against each tier's 1-week plan
  return plans.map((plan: any) => {
    const baseWeeklyPrice = plans.find((p: any) => p.tier === plan.tier && p.weeksCount === 1)?.weeklyPriceAmount || 0;

    let discount = "";
    let discountPercent = 0;
    let label = "";

    if (plan.weeksCount > 1 && baseWeeklyPrice > 0) {
      const weeklySavings = baseWeeklyPrice - plan.weeklyPriceAmount;
      discountPercent = Number(((weeklySavings / baseWeeklyPrice) * 100).toFixed(2));
      const roundedDiscount = Math.round(discountPercent);

      // UI rules: show a badge from 10%, "Best Value" from 25%
      if (roundedDiscount >= 10) discount = `Save ${roundedDiscount}%`;
      if (roundedDiscount >= 25) label = "Best Value";
    }

    return { ...plan, discount, discountPercent, label };
  });
};
