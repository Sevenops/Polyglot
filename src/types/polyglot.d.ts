interface Settings {
  keyValue?: string
  useCtrlKey?: boolean
  useMetaKey?: boolean
  useShiftKey?: boolean
  useAltKey?: boolean
  targetLanguage?: string
  [index: string]: any
}

interface BoundingBox {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}
