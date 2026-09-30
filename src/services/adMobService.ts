import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, AdMobBannerSize } from '@capacitor-community/admob';

// Real Ad Unit ID from AdMob
const REAL_BANNER_ID = 'ca-app-pub-1448372299256521/4035173806';

// Google Official Test Banner ID
const GOOGLE_TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';

// Device Test IDs
const TEST_DEVICE_IDS = [
  '5EAA915D79093338CF8371A3C8C315D3', // Pixel 5a
  '23A8D88894B279C3AD0A7FBC55703CFC', // Connected Device (XKHIAU5DA6JJ4DCY)
  'XKHIAU5DA6JJ4DCY',
];

export const AdMobService = {
  isInitialized: false,
  adHeight: 0,
  retryTimer: null as any,

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // 1. Real-time AdMob size listener
    try {
      AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size: AdMobBannerSize) => {
        this.adHeight = size.height || 0;
        console.log('AdMob banner height measured dynamically:', this.adHeight);
        document.documentElement.style.setProperty('--admob-banner-height', `${this.adHeight}px`);
      });

      // 2. Successful ad load listener (clear pending retries)
      AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
        console.log('AdMob banner loaded successfully');
        if (this.retryTimer) {
          clearTimeout(this.retryTimer);
          this.retryTimer = null;
        }
      });

      // 3. Failed to load (No-Fill / Offline) listener -> Safe 30s retry
      AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error) => {
        console.warn('AdMob banner failed to load (no-fill or network):', error);
        document.documentElement.style.setProperty('--admob-banner-height', '0px');
        this.scheduleRetry();
      });
    } catch (e) {
      console.log('AdMob event listeners notice:', e);
    }

    try {
      await AdMob.initialize({
        initializeForTesting: false,
        testingDevices: TEST_DEVICE_IDS,
      });
      this.isInitialized = true;
      console.log('AdMob initialized successfully');
      await this.showBottomBanner();
    } catch (error) {
      console.warn('AdMob initialization notice:', error);
      this.scheduleRetry();
    }
  },

  scheduleRetry(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    console.log('Scheduling AdMob retry in 30 seconds...');
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.showBottomBanner();
    }, 30000);
  },

  async showBottomBanner(): Promise<void> {
    try {
      const options: BannerAdOptions = {
        adId: REAL_BANNER_ID,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: false,
      };
      await AdMob.showBanner(options);
      console.log('AdMob live banner request sent');
    } catch (realAdError) {
      console.warn('Real banner request error:', realAdError);
      this.scheduleRetry();
    }
  },

  async hideBanner(): Promise<void> {
    try {
      if (this.retryTimer) {
        clearTimeout(this.retryTimer);
        this.retryTimer = null;
      }
      await AdMob.hideBanner();
      document.documentElement.style.setProperty('--admob-banner-height', '0px');
    } catch (error) {
      console.warn('AdMob hide banner notice:', error);
    }
  },

  async resumeBanner(): Promise<void> {
    try {
      await AdMob.resumeBanner();
    } catch (error) {
      console.warn('AdMob resume banner notice:', error);
    }
  }
};
