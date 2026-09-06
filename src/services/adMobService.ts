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

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Real-time AdMob size listener
    try {
      AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size: AdMobBannerSize) => {
        this.adHeight = size.height || 0;
        console.log('AdMob banner height measured dynamically:', this.adHeight);
        document.documentElement.style.setProperty('--admob-banner-height', `${this.adHeight}px`);
      });
    } catch (e) {
      console.log('AdMob size listener notice:', e);
    }

    try {
      await AdMob.initialize({
        initializeForTesting: true,
        testingDevices: TEST_DEVICE_IDS,
      });
      this.isInitialized = true;
      console.log('AdMob initialized successfully');
      await this.showBottomBanner();
    } catch (error) {
      console.warn('AdMob initialization notice:', error);
    }
  },

  async showBottomBanner(): Promise<void> {
    try {
      const options: BannerAdOptions = {
        adId: REAL_BANNER_ID,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: true,
      };
      await AdMob.showBanner(options);
      console.log('AdMob banner request sent');
    } catch (realAdError) {
      try {
        const fallbackOptions: BannerAdOptions = {
          adId: GOOGLE_TEST_BANNER_ID,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: true,
        };
        await AdMob.showBanner(fallbackOptions);
      } catch (fallbackError) {
        console.warn('Fallback banner notice:', fallbackError);
      }
    }
  },

  async hideBanner(): Promise<void> {
    try {
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
