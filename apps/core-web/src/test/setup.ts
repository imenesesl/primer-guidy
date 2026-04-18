import '@testing-library/jest-dom/vitest'
import './i18n'

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.ResizeObserver
}

if (!document.adoptedStyleSheets) {
  Object.defineProperty(document, 'adoptedStyleSheets', {
    value: [],
    writable: true,
  })
}

if (typeof ShadowRoot !== 'undefined' && !ShadowRoot.prototype.adoptedStyleSheets) {
  Object.defineProperty(ShadowRoot.prototype, 'adoptedStyleSheets', {
    value: [],
    writable: true,
  })
}
