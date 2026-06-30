# Review Request Protocol — First-Payment Delight

## Trigger Logic

### Primary Trigger: Purchase Success
Fire the Review Request modal immediately upon successful return from the Superwall/RevenueCat checkout flow, but **only for the first-ever transaction**.

| Criteria | Value |
|----------|-------|
| Trigger | `Purchases.addCustomerInfoUpdateListener` detects transition to paying state |
| Condition | `profiles.purchase_count == 0` AND `profiles.has_been_prompted == false` |
| Cooldown | 30-day global cooldown if user dismisses (`profiles.review_cooldown_until`) |
| Single-pass | `profiles.has_been_prompted = true` after first prompt — never again |

### Secondary Trigger: Focus Score (Free-tier fallback)
Users who haven't converted yet may be prompted when their Focus Score ≥ 80 (existing logic, preserved for parity).

## Flow Diagram

```
Purchase completes → RevenueCat fires customerInfoUpdateListener
  → reviewManager checks:
     ├─ has_been_prompted? → SKIP (already prompted)
     ├─ purchase_count > 0? → SKIP (already purchased before)
     ├─ cooldown active? → SKIP (within 30-day window)
     └─ all clear → show FirstPurchaseReviewModal
                     → user rates → has_been_prompted = true
                     → user dismisses → review_cooldown_until = now + 30d
```

## Database Columns (profiles table)

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `has_been_prompted` | boolean | false | Single-pass guard — never show twice |
| `purchase_count` | integer | 0 | Incremented each purchase; only prompt at 0→1 |
| `review_cooldown_until` | timestamptz | null | 30-day cooldown after dismiss |

## Exclusions
- Never show if transaction fails or user cancels at the Google Pay sheet.
- Never show if `has_been_prompted` is already true.
- Never show if `purchase_count == 0` (free-tier, rely on secondary trigger).
- Never show if `review_cooldown_until > now()`.

## Platform Behavior

### Android
Use the Google Play In-App Review API for native review flow. Fall back to the Midnight Luxe modal if the API is unavailable.

### Web
Show the Midnight Luxe fallback modal with a direct link to the Play Store listing.

## Copy (The "Knowing Nod")
- **Headline:** "Your flow is now secured."
- **Body:** "By investing in DeepFlow, you've chosen to move faster than your inner critic. Your rating helps other ADHD builders find their focus and beat the shame spiral."
- **Primary:** "Rate DeepFlow"
- **Secondary:** "Maybe later"

## Styling
- Palette: Obsidian (#0D0D12) background, Champagne (#C9A84C) accents
- Texture: Global CSS noise overlay at 0.05 opacity
- Animation: Champagne confetti burst on modal entry
