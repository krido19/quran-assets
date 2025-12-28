import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'
import { Updater } from './lib/updater'

// Register service worker
registerSW({ immediate: true })

// Initialize updater - notify app is ready
Updater.notifyAppReady()

// Check for updates from GitHub Releases on app start
const checkUpdates = async () => {
  try {
    const updateInfo = await Updater.checkForUpdate()

    if (updateInfo.hasUpdate) {
      console.log(`Update available: ${updateInfo.currentVersion} → ${updateInfo.latestVersion}`)

      // Download and apply update
      const result = await Updater.downloadAndApply(
        updateInfo.downloadUrl,
        updateInfo.latestVersion
      )

      if (result.success) {
        console.log('Update applied! App will reload.')
      }
    } else {
      console.log('App is up to date:', Updater.getCurrentVersion())
    }
  } catch (error) {
    console.error('Update check failed:', error)
  }
}

// Run update check after short delay
setTimeout(checkUpdates, 3000)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
