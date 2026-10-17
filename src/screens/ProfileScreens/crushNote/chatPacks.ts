// Helper to extract numeric price for calculations
export const extractPriceNumber = (priceStr: string): { amount: number; currency: string } => {
  const amountMatch = priceStr.match(/[\d,.]+/);
  const amount = amountMatch ? parseFloat(amountMatch[0].replace(/,/g, "")) : 0;
  const currency = priceStr.replace(/[\d,.\s]+/g, "") || "₹";
  return { amount, currency };
};

/**
 * Turns the store's chat-pack products into display packs: item count (from the SKU), per-chat
 * price, "Save x%" badges against the single-chat pack, and a label. Largest pack first.
 */
export const buildChatPacks = (availableProducts: any[]): any[] => {
  // First pass: per-item pricing
  const productsWithPricing = availableProducts.map((prod: any) => {
    const productId = (prod.productId || prod.id || "").toString();
    const n = parseInt(productId.match(/\d+/)?.[0] || "1");

    const fullPriceStr = prod.localizedPrice || prod.displayPrice || "₹0";
    const priceInfo = extractPriceNumber(fullPriceStr);
    const total = priceInfo.amount;

    // Floor to 2 decimal places per item; the remainder is absorbed by the last item
    const perItemFixed = Math.floor((total / n) * 100) / 100;

    return {
      ...prod,
      count: n,
      displayPrice: fullPriceStr,
      perItemPrice: `${priceInfo.currency}${perItemFixed.toFixed(2)}`,
      perItemPriceAmount: perItemFixed,
      totalAmount: total,
      currency: priceInfo.currency,
    };
  });

  // Base price: the single-unit pack
  const baseUnitPrice = productsWithPricing.find((p: any) => p.count === 1)?.perItemPriceAmount || 0;

  // Second pass: discounts and labels
  const packs = productsWithPricing.map((prod: any) => {
    const n = prod.count;
    let discount = "";
    let discountPercent = 0;
    let label = "";

    if (n > 1 && baseUnitPrice > 0) {
      const perUnitSavings = baseUnitPrice - prod.perItemPriceAmount;
      discountPercent = Number(((perUnitSavings / baseUnitPrice) * 100).toFixed(2));
      const roundedDiscount = Math.round(discountPercent);

      // UI rules: show a badge from 10%, "Best Value" from 25%
      if (roundedDiscount >= 10) discount = `Save ${roundedDiscount}%`;
      if (roundedDiscount >= 25) label = "Best Value";
      else if (n === 3) label = "Most Popular";
    }

    return { ...prod, discount, discountPercent, label };
  });

  return packs.sort((a: any, b: any) => b.count - a.count);
};
