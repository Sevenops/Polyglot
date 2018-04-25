let settings = {}
let isPanelOpen = false
const PANEL_ID = 'polyglot__panel'

// Only initialize in a top-level page
if (window.top === window) {
  window.addEventListener('keypress', handleKeypress, false)
  window.addEventListener('mouseup', handleMouseUp, false)

  safari.self.addEventListener('message', handleMessage, false)
  safari.self.tab.dispatchMessage('getSettings')
}

// Get selected text and return to global script
function handleMessage(msg) {
  const name = msg.name
  if (name === 'settingsReceived') {
    settings = msg.message
  } else if (name === 'getSelectedText') {
    getSelectedText()
  } else if (name === 'showPanel') {
    showPanel(msg.message)
  } else if (name === 'updatePanel') {
    updatePanel(msg.message)
  }
}

function handleMouseUp(e) {
  const panel = document.getElementById(PANEL_ID)

  if (isPanelOpen && !isDescendant(panel, e.target)) {
    removePanel()
  }
}

function handleKeypress(e) {
  if (e.keyCode==116) {

    const selectedText = window.getSelection().toString()
      if(selectedText!=''){
        e.preventDefault()
  safari.self.tab.dispatchMessage('finishedGetSelectedText', selectedText)}
  }
}

function getSelectedText() {
  const selectedText = window.getSelection().toString()
  safari.self.tab.dispatchMessage('finishedGetSelectedText', selectedText)
}

function removePanel() {
  const panel = document.getElementById(PANEL_ID)
  panel.remove()
  isPanelOpen = false
}

// Show panel with given text
function showPanel(content) {
  if (isPanelOpen) {
    removePanel()
  }
  const bounds = getSelectionBoundingRect()
  if (bounds === null) {
    return false
  }
  const el = document.createElement('div')
  el.innerHTML = content
  el.id = PANEL_ID
  el.style.left = bounds.left + 'px'
  el.style.top = bounds.bottom + 'px'
  document.body.insertBefore(el, document.body.firstChild)
  isPanelOpen = true
}

function updatePanel(content) {
  const el = document.getElementById(PANEL_ID)
  el.innerHTML = content
}

// Return selection coords
function getSelectionBoundingRect() {
  const rect = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  }

  const sel = document.getSelection()
  for (let i = 0; i < sel.rangeCount; ++i) {
    const _rect = sel.getRangeAt(i).getBoundingClientRect()
    if (rect.left < _rect.left) {
      rect.left = _rect.left
    }
    if (rect.top < _rect.top) {
      rect.top = _rect.top
    }
    if (rect.right < _rect.right) {
      rect.right = _rect.right
    }
    if (rect.bottom < _rect.bottom) {
      rect.bottom = _rect.bottom
    }
  }
  rect.width = rect.right - rect.left
  rect.height = rect.bottom - rect.top
  rect.left += window.pageXOffset
  rect.top += window.pageYOffset
  rect.right += window.pageXOffset
  rect.bottom += window.pageYOffset

  return sel.rangeCount ? rect : null
}

function isDescendant(parent, child) {
  if (parent === child) {
    return true
  }
  let node = child.parentNode
  while (node !== null) {
    if (node === parent) {
      return true
    }
    node = node.parentNode
  }
  return false
}
