# Database Schema — Beautiful You

PostgreSQL with Prisma ORM. UUID primary keys, DateTime timestamps.

---

## Entity: User

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated (default: uuid()) |
| email | String | Unique, nullable (null for guests) |
| password | String | Nullable (null for guests), bcrypt hashed |
| name | String | Required, default "Guest" |
| isGuest | Boolean | Default false |
| ageVerified | Boolean | Default false |
| createdAt | DateTime | Auto (default: now()) |
| updatedAt | DateTime | Auto (@updatedAt) |

**Indexes**: unique on email (where email is not null)

**Relations**: has one UserSettings, has many MoodEntry, has many UserFavorite, has many PushToken

---

## Entity: UserSettings

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| userId | UUID | FK to User.id, unique, required, ON DELETE CASCADE |
| notificationsEnabled | Boolean | Default false |
| subscriptionStatus | String | Default "free" (values: "free", "premium") |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto (@updatedAt) |

**Indexes**: unique on userId

---

## Entity: Affirmation

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| text | String | Required |
| category | String | Required (enum values: "Self-Love", "Strength", "Hope", "Healing", "Recovery") |
| imageUrl | String | Nullable (external decorative image URL) |
| createdAt | DateTime | Auto |

**Indexes**: index on category

**Relations**: has many UserFavorite

**Seed data**: 50+ affirmations distributed across all 5 categories (10+ per category).

---

## Entity: UserFavorite

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| userId | UUID | FK to User.id, required, ON DELETE CASCADE |
| affirmationId | UUID | FK to Affirmation.id, required, ON DELETE CASCADE |
| createdAt | DateTime | Auto |

**Indexes**: unique compound index on (userId, affirmationId)

---

## Entity: MoodEntry

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| userId | UUID | FK to User.id, required, ON DELETE CASCADE |
| moodLevel | Integer | Required (1-5) |
| notes | String | Nullable, max 200 chars |
| date | String | Required (YYYY-MM-DD format) |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto (@updatedAt) |

**Indexes**: unique compound index on (userId, date), index on userId

---

## Entity: PushToken

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| userId | UUID | FK to User.id, required, ON DELETE CASCADE |
| token | String | Unique, required (Expo Push Token) |
| deviceType | String | Optional (ios/android) |
| createdAt | DateTime | Auto |

---

## Relationships Summary

```
User 1:1 UserSettings
User 1:N MoodEntry
User 1:N UserFavorite
User 1:N PushToken
Affirmation 1:N UserFavorite
```

## Seed Script Requirements

The seed script must populate the Affirmation table with 50+ entries:
- **Self-Love** (10+): e.g., "I am worthy of love and respect.", "I embrace who I am, flaws and all.", etc.
- **Strength** (10+): e.g., "I am stronger than my challenges.", "Every setback is a setup for a comeback.", etc.
- **Hope** (10+): e.g., "Tomorrow holds new possibilities.", "Even the darkest night will end.", etc.
- **Healing** (10+): e.g., "Healing is not linear, and that's okay.", "I give myself permission to heal at my own pace.", etc.
- **Recovery** (10+): e.g., "Every day is a new chance to grow.", "I am proud of how far I've come.", etc.

All imageUrl values should be null (no external images needed for MVP).
