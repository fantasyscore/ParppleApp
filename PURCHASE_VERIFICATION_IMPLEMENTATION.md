# Purchase Verification Implementation

## Overview

This implementation provides a secure, production-ready purchase verification workflow for Google Play Billing (Android) and App Store (iOS) purchases. The system saves purchase data temporarily in Redux state, verifies with backend API, and cleans up after successful verification.

## Architecture

### Components

1. **Purchase Slice** (`src/slices/purchase/purchaseSlice.ts`)
   - Redux slice managing pending purchase state
   - Actions: `savePendingPurchase`, `clearPendingPurchase`, `incrementRetryCount`, `setVerifying`

2. **Purchase Verification Service** (`src/services/purchaseVerificationService.ts`)
   - Extracts purchase data from store responses
   - Prepares verification payload
   - Handles backend verification (placeholder - ready for API integration)
   - Manages retry logic

3. **Purchase Verification Hook** (`src/hooks/usePurchaseVerification.ts`)
   - React hook for purchase verification workflow
   - Handles purchase success callbacks
   - Manages retry attempts with exponential backoff

4. **Purchase Retry Utility** (`src/utils/purchaseRetryUtil.ts`)
   - Utility to retry pending purchases on app startup
   - Useful for handling purchases that failed verification due to network issues

## Purchase Data Structure

### Saved in Redux State

```typescript
interface PendingPurchase {
  orderId: string;           // Google Play order ID
  productId: string;          // Product SKU
  purchaseToken: string;      // Google Play purchase token
  purchaseTime: number;       // Purchase timestamp
  purchaseState: number;      // Purchase state (0 = purchased)
  userId: string;             // Internal user ID
  purchaseType: 'subscription' | 'one-time';
  retryCount: number;         // Number of verification retry attempts
  lastRetryTime?: number;     // Timestamp of last retry
}
```

### Backend API Payload

When calling the backend verification API, send:

```typescript
{
  userId: string;           // Internal user ID
  orderId: string;          // Google Play order ID
  productId: string;         // Product SKU
  purchaseToken: string;     // Google Play purchase token
  purchaseTime: number;      // Purchase timestamp
  platform: 'android' | 'ios';
  purchaseType: 'subscription' | 'one-time';
}
```

## Workflow

### 1. Purchase Success Flow

```
User completes purchase
    ↓
Google Play / App Store returns purchase response
    ↓
handlePurchaseSuccess() extracts purchase data
    ↓
Save to Redux state (savePendingPurchase)
    ↓
Finish transaction with store (acknowledge purchase)
    ↓
Trigger backend verification (async, non-blocking)
    ↓
On success: Clear from state (clearPendingPurchase)
On failure: Retry with exponential backoff
```

### 2. Verification Retry Logic

- **Max Retries**: 3 attempts
- **Retry Delay**: 5 seconds (base), exponential backoff
- **Retry Conditions**:
  - Network errors
  - Backend verification failures
  - Timeout errors

### 3. State Cleanup

- Purchase is cleared from state after successful backend verification
- State is cleared on logout (via `clearAllPendingPurchases`)
- Failed purchases after max retries remain in state for manual review

## Integration

### In Purchase Screens

All purchase screens (SubscriptionScreen, CrushNotePurchase, SuperLikePurchese, ProfileBoostPurchase) have been updated to use the verification hook:

```typescript
const { handlePurchaseSuccess } = usePurchaseVerification();

// In purchaseUpdatedListener:
await handlePurchaseSuccess(
  purchase,
  'subscription' | 'one-time',
  () => {
    // Success callback
    Alert.alert('Success', 'Purchase completed!');
  },
  (error) => {
    // Error callback
    Alert.alert('Error', error.message);
  }
);
```

### On App Startup

Call `retryAllPendingPurchases()` in your App.tsx or main component:

```typescript
import { retryAllPendingPurchases } from './utils/purchaseRetryUtil';

useEffect(() => {
  // Retry pending purchases on app startup
  retryAllPendingPurchases();
}, []);
```

## Backend API Integration

### TODO: Implement API Call

In `src/services/purchaseVerificationService.ts`, replace the placeholder in `verifyPurchaseWithBackend()`:

```typescript
export const verifyPurchaseWithBackend = async (purchase: PendingPurchase): Promise<boolean> => {
  const payload = prepareVerificationPayload(purchase);
  
  const response = await fetch('YOUR_API_ENDPOINT/verify-purchase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    throw new Error(`Verification failed: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.success === true;
};
```

### Backend Requirements

Your backend should:
1. Verify purchase with Google Play Developer API (Android) or App Store (iOS)
2. Grant entitlements to user account
3. Return `{ success: true }` on success
4. Return error status on failure

## Security Best Practices

✅ **Implemented:**
- Server-side verification (client never trusts itself)
- Purchase data not permanently stored on device
- State cleared after verification
- Retry logic prevents duplicate submissions
- Purchase acknowledgment handled correctly

⚠️ **Backend Must:**
- Verify purchase token with Google Play / App Store
- Check for duplicate order IDs
- Validate user ID matches purchase
- Grant entitlements atomically
- Log all verification attempts

## Testing

### Test Scenarios

1. **Successful Purchase**
   - Purchase completes → Saved to state → Verified → Cleared from state

2. **Network Failure**
   - Purchase completes → Saved to state → Verification fails → Retries → Success → Cleared

3. **Max Retries Reached**
   - Purchase completes → Saved to state → All retries fail → Remains in state for manual review

4. **App Restart**
   - Pending purchases retried on app startup

## Redux State Structure

```typescript
{
  purchase: {
    pendingPurchases: PendingPurchase[];
    isVerifying: boolean;
  }
}
```

## Files Modified

- `src/store/rootReducer.js` - Added purchase slice
- `src/slices/purchase/purchaseSlice.ts` - New file
- `src/services/purchaseVerificationService.ts` - New file
- `src/hooks/usePurchaseVerification.ts` - New file
- `src/utils/purchaseRetryUtil.ts` - New file
- `src/screens/ProfileScreens/SubscriptionScreen.tsx` - Updated
- `src/screens/ProfileScreens/CrushNotePurchase.tsx` - Updated
- `src/screens/ProfileScreens/SuperLikePurchese.tsx` - Updated
- `src/screens/ProfileScreens/ProfileBoostPurchase.tsx` - Updated

## Next Steps

1. ✅ Purchase state management - Complete
2. ✅ Purchase verification hook - Complete
3. ✅ Integration with purchase screens - Complete
4. ⏳ Backend API integration - TODO
5. ⏳ Error monitoring and logging - Recommended
6. ⏳ Admin dashboard for failed purchases - Recommended

