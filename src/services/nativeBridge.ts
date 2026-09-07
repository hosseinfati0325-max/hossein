import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { KeepAwake } from '@capacitor-community/keep-awake';

class NativeBridgeService {
  private isInitialized = false;

  public async initNativeFeatures(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // 1. Status Bar Setup
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0f172a' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (e) {
      console.warn('[NativeBridge] StatusBar error:', e);
    }

    try {
      // 2. Hide splash screen smoothly after app is mounted
      await SplashScreen.hide();
    } catch (e) {
      console.warn('[NativeBridge] SplashScreen error:', e);
    }

    try {
      // 3. Hardware Back Button Handling on Android
      CapApp.addListener('backButton', ({ canGoBack }) => {
        // Check if any modal or dialog is open in DOM
        const openModalCloseBtn = document.querySelector<HTMLButtonElement>(
          '[role="dialog"] button[aria-label="close"], [role="dialog"] .modal-close, #btn-modal-close'
        );
        if (openModalCloseBtn) {
          openModalCloseBtn.click();
          return;
        }

        if (canGoBack && window.history.length > 1) {
          window.history.back();
        } else {
          // If at root, exit app or minimize
          CapApp.exitApp();
        }
      });
    } catch (e) {
      console.warn('[NativeBridge] BackButton error:', e);
    }
  }

  public async setKeepAwake(enable: boolean): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      if (enable) {
        await KeepAwake.keepAwake();
      } else {
        await KeepAwake.allowSleep();
      }
    } catch (e) {
      console.warn('[NativeBridge] KeepAwake error:', e);
    }
  }
}

export const nativeBridge = new NativeBridgeService();
