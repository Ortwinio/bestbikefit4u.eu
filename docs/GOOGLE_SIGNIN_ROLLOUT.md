# Google Sign-In Rollout Notes

## Environment Variables

Set these before enabling the Google button in production:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SITE_URL`
- `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`

## Redirect URIs

Configure Google Cloud OAuth redirect URIs against the Convex Auth callback path for the active site URL.

Examples:

- Production: `https://bestbikefit4u.eu/api/auth/callback/google`
- Local: `http://localhost:3000/api/auth/callback/google`

## Data Ownership Rules

- `users.displayName` is the app-owned display name.
- `users.displayNameSource="manual"` prevents future automatic Google overwrite.
- `users.profile_image_url` is the custom uploaded profile image.
- `users.profileImageSource="manual"` prevents future automatic Google image takeover.
- Google provider data is still stored separately in:
  - `users.googleEmail`
  - `users.googleName`
  - `users.googleProfileImageUrl`

## Effective UI Fallbacks

Display name fallback:

1. `displayName`
2. `googleName`
3. auth `name`
4. email local-part
5. app fallback label

Profile image fallback:

1. `profile_image_url`
2. `googleProfileImageUrl`
3. auth `image`
4. `/default-profile.svg`

## Release Order

1. Deploy schema and auth callback changes.
2. Set Google env vars.
3. Enable `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED`.
4. Verify email magic-code login still works.
5. Verify first Google sign-in seeds defaults.
6. Verify manual display-name and profile-image edits survive later Google logins.
