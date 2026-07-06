import { registerRootComponent } from 'expo';
import "react-native-gesture-handler";
import { Alert } from 'react-native';

// ===== DEBUG: Global error handler =====
const defaultHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.log('========== CRASH LOG ==========');
  console.log('Fatal:', isFatal);
  console.log('Error:', error?.message);
  console.log('Stack:', error?.stack);
  console.log('================================');

  // Also show an alert so you can see it before the app closes
  try {
    Alert.alert(
      isFatal ? '💥 FATAL ERROR' : '⚠️ ERROR',
      error?.message || 'Unknown error',
    );
  } catch (e) {
    // Alert might fail if app is already dying
  }

  if (defaultHandler) defaultHandler(error, isFatal);
});

// Catch unhandled promise rejections
if (typeof globalThis !== 'undefined') {
  const originalHandler = globalThis.onunhandledrejection;
  globalThis.onunhandledrejection = (event) => {
    console.log('========== UNHANDLED PROMISE ==========');
    console.log('Reason:', event?.reason);
    console.log('========================================');
    if (originalHandler) originalHandler(event);
  };
}
// ===== END DEBUG =====

import App from './src/App';

registerRootComponent(App);
