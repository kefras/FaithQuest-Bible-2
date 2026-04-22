# Firebase Security Specification - FaithQuest Bible

## Data Invariants
1. A User Profile must always belong to the authenticated user who created it (Identity Integrity).
2. Scores and statistics are strictly numeric and non-negative.
3. User Profiles are publicly readable for the Global Leaderboard, but only writable by the owner.
4. Timestamps (`lastPlayed`) must be validated against the server time.

## The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Attempting to create or update a profile with a `userId` that does not match the auth UID.
2. **Ghost Field Injection**: Adding undocumented fields like `isAdmin: true` to a profile.
3. **Negative Score**: Setting `totalScore` or `highScore` to a negative value.
4. **Type Malformation**: Setting `displayName` to an array or object.
5. **ID Poisoning**: Using a 2KB string as a document ID to exhaust resources.
6. **Immutable Field Tampering**: Attempting to change `userId` after creation.
7. **Future Timestamps**: Setting `lastPlayed` to a future date instead of `serverTimestamp()`.
8. **Unverified Write**: Writing as an unverified user (if required).
9. **Bulk Profile Scraper**: Attempting to list all users without being signed in (if restricted).
10. **Shadow Achievement**: Unlocking an achievement without following the game logic (client-side enforcement is weak, but we validate types).
11. **Negative Progress**: Setting progress counts to negative values.
12. **Orphaned Profile**: Creating a profile with a random ID that doesn't correspond to any auth user.

## The Test Runner
A `firestore.rules.test.ts` will verify these constraints.
