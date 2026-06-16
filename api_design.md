# API Specification — Beautiful You

Base URL: `/api`

All authenticated endpoints require `Authorization: Bearer <token>` header. Guest users receive a JWT with `isGuest: true` claim and can access all endpoints.

---

## Auth

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| POST | /api/signup | {email: string (required), password: string (required), name: string (required), ageVerified: boolean (required, must be true)} | {token: string, user: {id: UUID, email: string, name: string, isGuest: boolean}} | No |
| POST | /api/auth/login | {email: string (required), password: string (required)} | {token: string, user: {id: UUID, email: string, name: string, isGuest: boolean}} | No |
| POST | /api/auth/guest | {ageVerified: boolean (required, must be true)} | {token: string, user: {id: UUID, email: string | null, name: string, isGuest: boolean}} | No |
| GET | /api/auth/me | — | {user: {id: UUID, email: string | null, name: string, isGuest: boolean, subscriptionStatus: string, notificationsEnabled: boolean, createdAt: ISO8601}} | Bearer |

Notes:
- Signup creates User + UserSettings (defaults: notificationsEnabled=false, subscriptionStatus="free").
- Guest auth creates a User with `isGuest=true`, `name="Guest"`, `email=null`, `password=null`, plus UserSettings.
- `/api/auth/me` returns merged user + settings data for the Profile screen.

---

## Affirmations

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| GET | /api/affirmations | query: ?category=string (optional) | {items: Affirmation[]} | Bearer |
| GET | /api/affirmations/daily | — | {affirmation: Affirmation} | Bearer |

**Affirmation shape:**
```
{
  id: UUID,
  text: string,
  category: string,       // "Self-Love" | "Strength" | "Hope" | "Healing" | "Recovery"
  imageUrl: string | null, // optional decorative image URL (external/static asset)
  isFavorited: boolean     // derived: whether current user has favorited this
}
```

Notes:
- `GET /api/affirmations` returns all affirmations. `category` query param filters. `isFavorited` is computed per-user by joining UserFavorite.
- `GET /api/affirmations/daily` returns a deterministic daily affirmation (based on day-of-year modulo total count). Also includes `isFavorited`.

---

## Favorites

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| GET | /api/favorites | — | {items: Affirmation[]} | Bearer |
| POST | /api/favorites/:affirmationId | — | {success: boolean} | Bearer |
| DELETE | /api/favorites/:affirmationId | — | {success: boolean} | Bearer |

---

## Moods

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| POST | /api/moods | {moodLevel: integer (required, 1-5), notes: string (optional, max 200), date: string (optional, YYYY-MM-DD, defaults to today)} | {mood: MoodEntry} | Bearer |
| GET | /api/moods/today | — | {mood: MoodEntry | null} | Bearer |
| GET | /api/moods | query: ?month=integer (1-12, required)&year=integer (required) | {items: MoodEntry[], insights: MoodInsights} | Bearer |
| PATCH | /api/moods/:id | {moodLevel: integer (optional, 1-5), notes: string (optional)} | {mood: MoodEntry} | Bearer |

**MoodEntry shape:**
```
{
  id: UUID,
  moodLevel: integer,     // 1-5
  notes: string | null,
  date: string,           // YYYY-MM-DD
  createdAt: ISO8601
}
```

**MoodInsights shape:**
```
{
  averageMood: number,           // float, e.g. 3.4
  totalEntries: integer,
  moodDistribution: {1: integer, 2: integer, 3: integer, 4: integer, 5: integer},
  weeklyAverages: {weekLabel: string, average: number}[],  // e.g. [{weekLabel: "Week 1", average: 3.2}, ...]
  trend: string                  // "improving" | "declining" | "stable" | "insufficient_data"
}
```

Notes:
- `POST /api/moods` — if an entry already exists for the given date, return 409 Conflict.
- `GET /api/moods?month=X&year=Y` returns all entries for that month plus computed insights.
- `GET /api/moods/today` returns today's entry or null (used by Home to show check/prompt).

---

## Settings

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| PATCH | /api/settings | {notificationsEnabled: boolean (optional), subscriptionStatus: string (optional)} | {notificationsEnabled: boolean, subscriptionStatus: string} | Bearer |

---

## Push Tokens

| Method | Path | Request Body | Response Body | Auth |
|--------|------|-------------|---------------|------|
| POST | /api/push-tokens | {token: string (required), deviceType: string (optional)} | {success: boolean} | Bearer |
| DELETE | /api/push-tokens/:token | — | {success: boolean} | Bearer |

---

## Error Responses

All errors follow:
```
{
  statusCode: integer,
  message: string,
  error: string
}
```

Common codes: 400 (validation), 401 (unauthorized), 404 (not found), 409 (conflict).
