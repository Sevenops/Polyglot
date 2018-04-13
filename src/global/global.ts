import { translate } from './api'

// Get settings
const settingsKeys = [
  'keyValue',
  'useCtrlKey',
  'useMetaKey',
  'useShiftKey',
  'useAltKey',
  'targetLanguage',
]

let settings = <Settings>{}
settingsKeys.forEach(key => {
  settings[key] = safari.extension.settings[key]
})

// Set event handler
safari.application.addEventListener('command', performCommand, false)
safari.application.addEventListener('message', handleMessage, false)
safari.extension.settings.addEventListener('change', settingsChanged, false)

// Perform commands from users
function performCommand(event: SafariCommandEvent) {
  const { command } = event
  if (command === 'translateSelectedText') {
    safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('getSelectedText')
  }
}

// Handle message from injected script
function handleMessage(msg: SafariExtensionMessageEvent) {
  const { name } = msg
  if (name === 'finishedGetSelectedText') {
    handleFinishedGetSelectedText(msg)
  } else if (name === 'getSettings') {
    handleGetSettings(msg)
  }
}

async function handleFinishedGetSelectedText(msg: SafariExtensionMessageEvent) {
  if (msg.message === '') {
    return
  }
  const target = <SafariBrowserTab>msg.target
  target.page.dispatchMessage('showPanel', '<div class="polyglot__loader">Loading</div>')

  if (settings.targetLanguage === '') {
    target.page.dispatchMessage('updatePanel', 'Set target language')
    return
  }

  try {
    const translatedText = await translate(msg.message, settings.targetLanguage)
    target.page.dispatchMessage('updatePanel', translatedText)
  } catch (err) {
    target.page.dispatchMessage('updatePanel', err)
  }
}

function handleGetSettings(msg: SafariExtensionMessageEvent) {
  const target = <SafariBrowserTab>msg.target
  target.page.dispatchMessage('settingsReceived', settings)
}

// Update setting values immediately
function settingsChanged(event: SafariExtensionSettingsChangeEvent) {
  settings[event.key] = event.newValue
  safari.application.activeBrowserWindow.activeTab.page.dispatchMessage(
    'settingsReceived',
    settings
  )
}
