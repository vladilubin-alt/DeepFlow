# Hybrid Monetization & Token Economy Protocol

## Economic Invariants

### Free Grant
- **+3 Grace Tokens** issued on account creation (via `FlareQuizService.completeOnboarding`).
- Tokens are stored in `profiles.grace_tokens` (integer, minimum 0).
- No other earning mechanisms exist — tokens are a finite,珍惜 resource.

### Vault Recovery Tiers
Recovering a draft from the graveyard follows a time-based cost schedule measured from `graveyard.deleted_at`:

| Time Since Deletion | Cost | Mechanism | Product ID (RevenueCat) |
|---|---|---|---|
| < 1 hour | 1 Grace Token | Deducted from `profiles.grace_tokens` | — |
| 1 – 168 hours (1–7 days) | $0.99 | RevenueCat non-consumable | `vault_recovery_0_99` |
| 168 – 720 hours (7–30 days) | $1.99 | RevenueCat non-consumable | `vault_recovery_1_99` |
| > 720 hours (30+ days) | Forever lost | — | — |

### Subscription (Removed from v1 scope)
The subscription tier (Yearly $39.99 / Weekly $4.99 for unlimited archaeology) is deferred to a future release.

## UI Messaging Directives

### Onboarding (Screen 5 — Analysis)
> "Initializing Flow Protection... 3 Grace Tokens secured. Your safety net is active."

### Protocol Status (Settings Screen)
Monospace data box:
```
[ GRACE_TOKENS: 03/03 ]
```
Tooltip: "Tokens protect your streak from 'Crash & Guilt.' Use them in the Vault to recover failed drafts."

### Post-Session Focus Report (Guillotined)
> "Life happened. 1 Grace Token consumed to save your streak. You're still on track."

### Vault Recovery Gate
> "This draft is in the Graveyard."
>
> < 1 hr: "Resurrect it with 1 Grace Token."
> 1–7 days: "This Fossil costs $0.99 to recover."
> 7–30 days: "This Fossil costs $1.99 to recover."
> 30+ days: "This draft has been permanently purged."

## Data Schema (profiles table)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "UserProfile",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "grace_tokens": { "type": "integer", "minimum": 0, "default": 3 },
    "has_active_subscription": { "type": "boolean", "default": false },
    "flare_type": { "type": ["string", "null"] },
    "streak_count": { "type": "integer", "minimum": 0, "default": 0 },
    "last_active_at": { "type": ["string", "null"], "format": "date-time" },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" }
  },
  "required": ["id", "grace_tokens", "has_active_subscription", "created_at"]
}
```

## Security & Validation

- Token deduction must be validated server-side (Supabase RLS + DB function).
- Client-side token display is for UX only — never trust client-reported token count for gating.
- All RevenueCat purchases must be receipt-validated server-side.
- The `vault_recovery_*` products are non-consumable — a user can only purchase each tier product once, but the vault recovery is per-draft, so the products represent single-use recovery rights.
