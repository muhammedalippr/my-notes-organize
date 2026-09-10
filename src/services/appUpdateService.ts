import { AppUpdate, AppUpdateAvailability, FlexibleUpdateInstallStatus } from '@capawesome/capacitor-app-update';

export const AppUpdateService = {
  async checkForUpdate(): Promise<void> {
    try {
      const result = await AppUpdate.getAppUpdateInfo();

      // 1. If an update was already downloaded in the background, complete it now by restarting
      if (result.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) {
        await AppUpdate.completeFlexibleUpdate();
        return;
      }

      // 2. If an update is available or already in progress:
      if (
        result.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE ||
        result.updateAvailability === AppUpdateAvailability.UPDATE_IN_PROGRESS
      ) {
        // Register listener for background flexible download completion
        await AppUpdate.addListener('onFlexibleUpdateStateChange', async (state) => {
          if (state.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) {
            await AppUpdate.completeFlexibleUpdate();
          }
        });

        // Prefer Immediate Update so user sees the download progress screen and auto-restarts
        if (result.immediateUpdateAllowed) {
          await AppUpdate.performImmediateUpdate();
        } else if (result.flexibleUpdateAllowed) {
          await AppUpdate.startFlexibleUpdate();
        } else {
          // Fallback: try immediate update, then flexible
          try {
            await AppUpdate.performImmediateUpdate();
          } catch {
            await AppUpdate.startFlexibleUpdate();
          }
        }
      }
    } catch (error) {
      // In-app updates only trigger in production signed release on Google Play Store
      console.log('In-app update check:', error);
    }
  }
};
