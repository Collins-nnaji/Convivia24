# Convivia24 Mobile Release

This repo ships the existing hosted Next.js app through Capacitor.

## App Identity

- App name: Convivia24
- Bundle ID / package name: `com.convivia24.app`
- Production URL: `https://convivia24.com`
- Custom scheme: `convivia24://`
- Support URL: `https://convivia24.com/support`
- Privacy URL: `https://convivia24.com/privacy`
- Terms URL: `https://convivia24.com/terms`

## Store Copy

Short description:

> Verified hospitality staffing for outlets and workers in Lagos, Abuja, and Port Harcourt.

Full description:

> Convivia24 helps hospitality outlets find verified staff for open shifts and helps workers track opportunities, trust verification, and same-day payout readiness. Use the app to manage profile details, outlet applications, matching, shift records, and support.

Keywords:

> hospitality, staffing, shifts, workers, outlets, Lagos, Abuja, Port Harcourt, verification, payouts

## Required Store Materials

- 1024x1024 app icon generated from the icon source in `public/icons/icon.svg`.
- iPhone and Android phone screenshots for auth, staff home, shift board, verification, outlet console, and support.
- Privacy policy URL: `https://convivia24.com/privacy`.
- Support URL: `https://convivia24.com/support`.
- Age/content declaration: 18+ staffing/work marketplace.
- Data safety declaration: account info, profile info, photos/uploads, verification data, support messages, and app diagnostics.

## Native Setup

1. Install native dependencies with `npm install`.
2. Build/check the web app with `npm run build`.
3. Sync native projects with `npm run cap:sync`.
4. Open Xcode with `npm run cap:open:ios`.
5. Open Android Studio with `npm run cap:open:android`.

## Deep Link Finalization

Before submitting:

- Replace `TEAMID` in `public/.well-known/apple-app-site-association` with the Apple Developer Team ID.
- Replace `REPLACE_WITH_GOOGLE_PLAY_APP_SIGNING_SHA256` in `public/.well-known/assetlinks.json` with the Google Play app signing certificate SHA-256.
- In Xcode, add Associated Domains: `applinks:convivia24.com`.
- In Android Studio/Gradle, verify the generated app uses `com.convivia24.app` and supports verified app links for `convivia24.com`.
- Add OAuth/native redirect URLs in Neon/Google auth settings if provider configuration requires explicit mobile callback URLs.

## Release Checks

- Sign in and sign up complete in the native shell.
- `/auth/callback` returns to the app and lands on `/`.
- `/join/:id` opens inside the app from a shared link.
- Avatar upload and selfie verification request camera/photo permissions correctly.
- External WhatsApp/support links open outside the WebView.
- Android back button navigates back, then minimizes the app at the root screen.
- Safe areas look correct on notched iPhones and Android gesture navigation.
