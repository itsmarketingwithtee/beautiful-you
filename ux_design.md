# UX Specification — Beautiful You

<screens>

## 1. Welcome Screen (`app/auth/welcome.tsx`)
- **Purpose**: App introduction and entry point
- **Layout**: Full-screen gradient background (soft purple #B8A5D6 → blue #A5C9E5). Centered logo/brand mark "Beautiful You" in display font. Tagline: "Your daily companion for mental wellness". Three action buttons stacked at bottom.
- **UI Elements**:
  - App logo / brand illustration (local asset)
  - "Beautiful You" display title (36px, white)
  - Tagline subtitle (16px, semi-transparent white)
  - "Sign Up" gradient button (primary)
  - "Log In" outlined button
  - "Continue as Guest" text link button
- **Actions**:
  - Tap "Sign Up" → push to Sign Up screen
  - Tap "Log In" → push to Login screen
  - Tap "Continue as Guest" → push to Guest Disclaimer screen

## 2. Sign Up Screen (`app/auth/signup.tsx`)
- **Purpose**: Create account with email/password
- **Layout**: Scrollable form on gradient background
- **UI Elements**:
  - Back arrow → pop
  - "Create Account" heading
  - Name input (floating label, required)
  - Email input (floating label, email keyboard, required)
  - Password input (floating label, secure entry, min 8 chars, required)
  - Age verification checkbox: "I confirm I am 18 years or older" (required)
  - Mental health disclaimer card (glass card): "This app does not replace professional mental health care. If you are in crisis, please contact emergency services or call 988."
  - "Sign Up" gradient button (disabled until form valid)
  - "Already have an account? Log In" text link
- **Actions**:
  - Submit form → POST /api/signup. On success, AuthProvider state updates; the layout switches to the authenticated tab group.
  - Tap "Log In" link → push to Login screen
  - Validation: email format, password min 8, age checkbox checked, name non-empty

## 3. Login Screen (`app/auth/login.tsx`)
- **Purpose**: Authenticate existing users
- **Layout**: Similar gradient background, centered form
- **UI Elements**:
  - Back arrow → pop
  - "Welcome Back" heading
  - Email input (floating label)
  - Password input (floating label, secure entry)
  - "Log In" gradient button
  - "Don't have an account? Sign Up" text link
- **Actions**:
  - Submit → POST /api/auth/login. On success, AuthProvider state updates; the layout switches to the authenticated tab group.
  - Tap "Sign Up" link → push to Sign Up screen

## 4. Guest Disclaimer Screen (`app/auth/guest-disclaimer.tsx`)
- **Purpose**: Age verification + disclaimers for guest users
- **Layout**: Gradient background, centered content card
- **UI Elements**:
  - Back arrow → pop
  - "Before You Continue" heading
  - Age verification checkbox: "I confirm I am 18 years or older"
  - Disclaimer card: "This app does not replace professional mental health care."
  - Crisis resources info card: "If you or someone you know is in crisis: Call 988 (Suicide & Crisis Lifeline), Text HOME to 741741 (Crisis Text Line), Call 911 for emergencies"
  - "Continue as Guest" gradient button (disabled until age checkbox checked)
- **Actions**:
  - Tap "Continue as Guest" → POST /api/auth/guest. AuthProvider state updates; the layout switches to the authenticated tab group.

## 5. Home Dashboard (`app/tabs/home.tsx`)
- **Purpose**: Central hub with personalized greeting and quick actions
- **Layout**: Scrollable. Collapsing header with greeting. Cards below.
- **UI Elements**:
  - Greeting: "Good morning, {name}" or "Welcome, Beautiful" for guests. Time-based greeting (morning/afternoon/evening).
  - Subtitle: current date formatted nicely
  - **Today's Affirmation Card** — glass card with gradient accent border. Shows daily affirmation text, category chip, heart/favorite icon, share icon. Tap card → navigate to Affirmations tab.
  - **Check Your Mood Card** — glass card with emoji row preview. "How are you feeling today?" Tap → navigate to Mood tab.
  - **Crisis Help Card** — prominent card with warm red/coral (#E57373) background, phone icon. "Need help now? You're not alone." Tap → navigate to Crisis tab.
  - Bottom padding for tab bar
- **Data**: GET /api/affirmations/daily for today's affirmation, GET /api/moods/today to check if mood already logged today (show checkmark if so)

## 6. Affirmations Screen (`app/tabs/affirmations.tsx`)
- **Purpose**: Browse and favorite affirmations
- **Layout**: Header with search bar + category filter chips. Masonry/grid of affirmation cards below.
- **UI Elements**:
  - "Affirmations" heading
  - Search input with icon (filters by text content)
  - Horizontal scrolling category chips: All, Self-Love, Strength, Hope, Healing, Recovery. Selected chip uses gradient fill.
  - Grid of affirmation cards (2 columns). Each card: glass card, affirmation text, category label, heart icon (filled if favorited), share icon.
  - Pull-to-refresh
  - Toggle button: "All" / "Favorites" to filter
- **Actions**:
  - Tap category chip → filter list (GET /api/affirmations?category=X)
  - Tap heart → POST /api/favorites/{affirmationId} or DELETE /api/favorites/{affirmationId}
  - Tap share → native Share sheet with affirmation text + "— Beautiful You"
  - Search input → client-side filter on loaded affirmations
  - Tap "Favorites" toggle → GET /api/favorites

## 7. Mood Check-in Screen (`app/tabs/mood.tsx`)
- **Purpose**: Log mood and view history
- **Layout**: Two sections — check-in at top, history below
- **UI Elements**:
  - **Check-in Section** (if not logged today):
    - "How are you feeling?" heading
    - 5 emoji buttons in a row: 😢(1, #E57373), 😟(2, #FFB74D), 😐(3, #FFF176), 🙂(4, #AED581), 😊(5, #81C784)
    - Selected emoji scales up with spring animation, background tints to mood color
    - Optional notes text input (multiline, 200 char max)
    - "Save" gradient button
  - **Already Logged Today** state: shows today's mood with encouraging message, "Edit" option
  - **Mood Calendar**: month view with color-coded day cells matching mood colors. Navigate months with arrows.
  - **Insights Toggle**: "Week" / "Month" segmented control
    - Bar chart showing mood levels over selected period
    - Average mood display with emoji
    - Encouragement message based on trend (e.g., "Your mood has been improving this week! Keep it up! 🌟")
  - **History List**: recent mood entries with date, emoji, mood color dot, truncated note
- **Actions**:
  - Select emoji + tap Save → POST /api/moods
  - Tap calendar day with entry → show that day's mood detail in a bottom sheet
  - Tap month arrows → load that month's data (GET /api/moods?month=X&year=Y)

## 8. Crisis Resources Screen (`app/tabs/crisis.tsx`)
- **Purpose**: Immediate access to crisis help
- **Layout**: Clean, high-contrast, large touch targets. No clutter.
- **UI Elements**:
  - "You're Not Alone" heading (large, warm)
  - Subtitle: "Help is available 24/7"
  - **988 Suicide & Crisis Lifeline** — large card, coral/red gradient, phone icon, "Call 988". Tap → Linking.openURL('tel:988')
  - **Crisis Text Line** — large card, warm orange gradient, message icon, "Text HOME to 741741". Tap → Linking.openURL('sms:741741?body=HOME')
  - **Emergency Services** — large card, red gradient, alert icon, "Call 911". Tap → Linking.openURL('tel:911')
  - Divider
  - Additional resources text: "You matter. Reaching out takes courage."
  - Note: "These resources are available offline" (data is hardcoded, no API needed)
- **Offline**: This screen uses zero network calls. All content is hardcoded.

## 9. Profile Screen (`app/tabs/profile.tsx`)
- **Purpose**: User info, settings, subscription
- **Layout**: Scrollable list of sections
- **UI Elements**:
  - Avatar circle with initials (or generic icon for guests)
  - Name display (or "Guest User")
  - Email display (or "No account" for guests)
  - **Subscription Section**: glass card showing "Free Plan" or "Premium". "Upgrade to Premium — $9.99/month" gradient button (guests see "Create Account to Unlock Premium" instead). Tap → push to Upgrade screen. Feature comparison list: Free (daily affirmation, mood tracking, crisis resources) vs Premium (all affirmations, mood insights, favorites).
  - **Settings Section**:
    - "Daily Affirmation Reminder" toggle switch (controls push notifications)
  - **About Section**:
    - "About Beautiful You" → push to About screen
    - "Terms of Service" → push to Terms screen
    - "Privacy Policy" → push to Privacy screen
  - **Sign Out** button (red text) — for authenticated users
  - **"Create Account"** button — for guest users (navigates to signup)
- **Actions**:
  - Toggle notifications → PATCH /api/settings
  - Sign Out → AuthProvider.logout(); state updates; layout switches to unauthenticated welcome screen

## 10. Upgrade Screen (`app/upgrade.tsx`)
- **Purpose**: Premium subscription placeholder
- **Layout**: Gradient background, feature showcase
- **UI Elements**:
  - Back arrow → pop
  - "Beautiful You Premium" heading
  - Feature list with checkmark icons
  - Price: "$9.99/month"
  - "Start Free Trial" gradient button (shows toast: "Coming soon! Stay tuned.")
  - "Restore Purchase" text link (shows same toast)

## 11. About Screen (`app/about.tsx`)
- **Purpose**: App info
- **UI Elements**: Back arrow, app logo, version, description paragraph, credits

## 12. Terms Screen (`app/terms.tsx`)
- **Purpose**: Terms of service placeholder
- **UI Elements**: Back arrow, heading, placeholder legal text

## 13. Privacy Screen (`app/privacy.tsx`)
- **Purpose**: Privacy policy placeholder
- **UI Elements**: Back arrow, heading, placeholder legal text

</screens>

<navigation>

## File Structure
```
app/
  _layout.tsx          — Root layout: wraps AuthProvider, loads fonts, splash screen. If isLoading → splash. Routes to auth/ or tabs/ based on isAuthenticated.
  auth/
    _layout.tsx        — If isAuthenticated → <Redirect href="/tabs/home" />. Otherwise <Stack> with no headers.
    welcome.tsx
    signup.tsx
    login.tsx
    guest-disclaimer.tsx
  tabs/
    _layout.tsx        — If !isAuthenticated → <Redirect href="/auth/welcome" />. Returns <Tabs> with 5 tabs: Home, Affirmations, Mood, Crisis, Profile.
    home.tsx
    affirmations.tsx
    mood.tsx
    crisis.tsx
    profile.tsx
  upgrade.tsx          — Stack screen outside tabs
  about.tsx            — Stack screen outside tabs
  terms.tsx            — Stack screen outside tabs
  privacy.tsx          — Stack screen outside tabs
```

## Auth Flow
- Unauthenticated users see auth/ stack (welcome → signup/login/guest-disclaimer)
- On successful signup/login/guest-auth, AuthProvider updates state; root layout redirects to tabs/
- Guest users get a temporary JWT with is_guest=true; they can access all tabs but see limited profile info and "Create Account" prompts
- Logout clears token; AuthProvider state updates; layout switches to auth/welcome

## Tab Bar
- 5 tabs: Home (house icon), Affirmations (sparkles icon), Mood (smile icon), Crisis (heart-pulse icon), Profile (user icon)
- Crisis tab icon uses coral/red tint to stand out
- Active tab uses primary purple color

</navigation>

<design_direction>

## Theme: Light & Calming
This is a mental health app — use a warm, light theme with soft pastels. NOT dark theme.
- Background: warm off-white #FBF8FF with subtle lavender gradient overlays
- Card backgrounds: white with soft shadows, or glass cards with #F0EAF8 tint
- Text: soft dark #2D2040 (not pure black), secondary #6B5B7B

## Color Palette
- Primary: Soft Purple #B8A5D6
- Primary Dark: #9B85C0
- Accent: Gentle Pink #F4C5D8
- Secondary: Calm Blue #A5C9E5
- Surface: Lavender Mist #F0EAF8
- Background: #FBF8FF
- Crisis Red: #E57373 (warm, not alarming)
- Mood colors: #E57373 (1), #FFB74D (2), #FFF176 (3), #AED581 (4), #81C784 (5)

## Color Application
- Gradient buttons: [#B8A5D6, #A5C9E5] (purple to blue)
- Cards: white/glass with subtle purple border or shadow
- Category chips: pastel variants of primary palette
- Crisis cards: warm coral/red gradients
- Tab bar: white background, active icon #B8A5D6

## Typography
- Display/Heading: "Quicksand" (Google Font) — rounded, friendly, calming
- Body: "Nunito" (Google Font) — clean, warm, readable
- Type scale: Display 32px → Heading 22px → Body 16px → Caption 13px
- Affirmation cards: italic Quicksand 20px for quotes

## Backgrounds
- Subtle gradient overlays: #FBF8FF → #F0EAF8 (top to bottom)
- Auth screens: richer gradient #D4C5E8 → #C5DFF0
- Soft watercolor-style decorative blobs (local SVG assets) on auth screens

</design_direction>

<animation_and_motion>
- Screen transitions: gentle fade+slide (200ms)
- Emoji selection: spring scale to 1.3x with haptic
- Affirmation cards: staggered fade-in on load (50ms delay per card)
- Heart/favorite: scale bounce + color fill animation
- Mood save: confetti-like particle burst (subtle, pastel colors)
- Calendar day cells: gentle pulse on today's cell
- Pull-to-refresh: custom lavender spinner
- Skeleton shimmer on affirmation grid and mood history
- Button press: scale 0.97 with spring
- Bottom sheets (mood detail): multi-snap with backdrop blur
- Respect reduced motion preferences
</animation_and_motion>

<component_standards>
- Buttons: gradient fill [#B8A5D6, #A5C9E5], rounded 24px, press animation, loading spinner, disabled opacity 0.5
- Inputs: rounded 12px, lavender border on focus (#B8A5D6), floating labels, error shake with red border
- Cards: rounded 16px, white bg, soft shadow (0,2,8 rgba(0,0,0,0.06)), press scale on interactive cards
- Affirmation cards: rounded 16px, subtle gradient border, italic text centered
- Emoji buttons: 48px touch target, circular background tinted to mood color when selected
- Crisis buttons: minimum 56px height, large text, high contrast
- Lists: FlashList for affirmations grid
- States: skeleton shimmer loading, empty states with illustration + message, error with retry
- Spacing: 8pt grid. Padding: screen 16px, card internal 16px, between cards 12px
- Accessibility: contrast ≥ 4.5:1 (especially crisis screen), touch targets 44pt+, all emojis have accessible labels, screen reader announces mood levels
</component_standards>
