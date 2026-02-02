# Super Like In-App Purchase — iOS (react-native-iap v12)

This project uses **react-native-iap ^12.3.0** on the iOS branch (the Android branch may use a higher version that isn’t compatible with your Xcode setup).

## Why products don’t show on iOS

The app uses **`getProducts({ skus })`** on iOS (v12). If nothing appears:

### 1. Product IDs must match exactly

In App Store Connect, create **In-App Purchases** → **Consumable** with these **Product IDs** (case-sensitive):

- `10_super_likes`
- `3_super_likes`
- `1_super_like`

They must match the `PRODUCT_SKUS` in `SuperLikePurchese.tsx` exactly.

### 2. App Store Connect setup

- **Agreements, Tax, and Banking**: Paid Applications agreement must be **Active**; add bank and tax info if required.
- **Products**: Each consumable must be **Ready to Submit** (reference name, price, etc. filled).
- **App**: The app’s Bundle ID must match the one in Xcode (e.g. `com.parpple` or `com.app.parpple`).
- **Sandbox**: Test with a **Sandbox Apple ID** (Settings → App Store → Sandbox Account on device/simulator if applicable).

### 3. Propagation delay

New or updated products can take **15 minutes to 24 hours** to appear. Wait and try again, or use **Retry** in the app.

### 4. Library version (iOS branch)

- **iOS branch**: Use **react-native-iap v12.x** (e.g. `^12.3.0`). The code uses `getProducts({ skus })` and `requestPurchase({ sku })` (v12 API).
- **Android branch**: May use v14+ with `fetchProducts` and the `request` object; keep that logic only on the Android branch so Xcode compatibility isn’t affected.

### 5. Debugging

- In Xcode, check the console for `[Super Like IAP]` logs.
- If you see “No products returned”, double-check the checklist above and try **Retry** after fixing App Store Connect.

## Quick checklist

- [ ] Product IDs in App Store Connect: `10_super_likes`, `3_super_likes`, `1_super_like` (exact spelling).
- [ ] Paid Apps agreement **Active**; bank/tax completed.
- [ ] Each consumable is **Ready to Submit**.
- [ ] App Bundle ID matches.
- [ ] Testing with Sandbox Apple ID.
- [ ] Waited 15+ minutes after creating/editing products.
- [ ] iOS branch uses **react-native-iap v12** and `getProducts` (already applied in `SuperLikePurchese.tsx`).
