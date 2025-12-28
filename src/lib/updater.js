import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { Capacitor } from '@capacitor/core';

const GITHUB_OWNER = 'rido19';
const GITHUB_REPO = 'Quran';
const CURRENT_VERSION = '1.0.3'; // Update this when releasing

// Store version in localStorage
const VERSION_KEY = 'app_bundle_version';

export const Updater = {
    /**
     * Get current bundle version
     */
    getCurrentVersion() {
        return localStorage.getItem(VERSION_KEY) || CURRENT_VERSION;
    },

    /**
     * Check for updates from GitHub Releases
     */
    async checkForUpdate() {
        // Only check on native platform
        if (!Capacitor.isNativePlatform()) {
            return { hasUpdate: false };
        }

        try {
            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`
            );

            if (!response.ok) {
                console.log('No releases found');
                return { hasUpdate: false };
            }

            const release = await response.json();
            const latestVersion = release.tag_name.replace('v', '');
            const currentVersion = this.getCurrentVersion();

            // Find the bundle zip asset
            const bundleAsset = release.assets?.find(
                asset => asset.name === 'bundle.zip'
            );

            if (!bundleAsset) {
                console.log('No bundle.zip found in release');
                return { hasUpdate: false };
            }

            const hasUpdate = this.compareVersions(latestVersion, currentVersion) > 0;

            return {
                hasUpdate,
                latestVersion,
                currentVersion,
                downloadUrl: bundleAsset.browser_download_url,
                releaseNotes: release.body
            };
        } catch (error) {
            console.error('Failed to check for updates:', error);
            return { hasUpdate: false, error };
        }
    },

    /**
     * Download and apply update
     */
    async downloadAndApply(downloadUrl, version) {
        try {
            console.log('Downloading update from:', downloadUrl);

            // Use Capgo's download mechanism (it handles the zip extraction)
            const bundle = await CapacitorUpdater.download({
                url: downloadUrl,
                version: version
            });

            console.log('Bundle downloaded:', bundle.id);

            // Apply the update
            await CapacitorUpdater.set(bundle);

            // Save version
            localStorage.setItem(VERSION_KEY, version);

            return { success: true, bundle };
        } catch (error) {
            console.error('Failed to download/apply update:', error);
            return { success: false, error };
        }
    },

    /**
     * Compare two version strings
     * Returns: 1 if a > b, -1 if a < b, 0 if equal
     */
    compareVersions(a, b) {
        const partsA = a.split('.').map(Number);
        const partsB = b.split('.').map(Number);

        for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
            const numA = partsA[i] || 0;
            const numB = partsB[i] || 0;
            if (numA > numB) return 1;
            if (numA < numB) return -1;
        }
        return 0;
    },

    /**
     * Notify app is ready (required for Capacitor Updater)
     */
    notifyAppReady() {
        if (Capacitor.isNativePlatform()) {
            CapacitorUpdater.notifyAppReady();
        }
    }
};
