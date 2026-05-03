# Sailcept Admin (Expo React Native)

This project has been migrated from a Vite web app to an Expo-managed React Native app.

## Prerequisites

- Node.js 20+
- npm 10+
- Expo Go on a physical device or an Android/iOS simulator

## Scripts

- `npm start` - start Expo dev server
- `npm run android` - run Android app
- `npm run ios` - run iOS app
- `npm run build` - TypeScript check (`tsc --noEmit`)
- `npm run lint` - run ESLint
- `npm test` - run Jest tests

## Project Notes

- Entry registration is in `index.js`.
- Main app code is in `src/App.tsx`.
- Test setup file is `src/test/setup.ts`.

## Current Scope

- Mobile-first shell with five sections: Overview, Boat, Calendar, Enquiries, Bookings.
- Native UI components replaced web-only dependencies.
- Jest + React Native Testing Library baseline in place.
