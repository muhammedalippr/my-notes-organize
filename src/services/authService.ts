import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';

export const AuthService = {
  /**
   * Performs biometric (Fingerprint / Face) or Device Lock Screen (PIN / Pattern / Password) authentication.
   * Returns true if authenticated successfully, or false if cancelled / failed.
   */
  async authenticate(reason: string = 'Confirm identity to proceed'): Promise<boolean> {
    try {
      const checkResult = await BiometricAuth.checkBiometry();
      
      // If biometry is not available or device has no lock credentials, allow fallback
      if (!checkResult.isAvailable) {
        console.log('Biometry not available on device, proceeding');
        return true;
      }

      await BiometricAuth.authenticate({
        reason,
        cancelTitle: 'Cancel',
        allowDeviceCredential: true, // Enables lock screen PIN, Pattern, or Password fallback
        androidTitle: 'Authenticate',
        androidSubtitle: reason,
      });

      return true;
    } catch (error: any) {
      console.warn('Biometric/Device authentication cancelled or failed:', error);
      return false;
    }
  }
};
