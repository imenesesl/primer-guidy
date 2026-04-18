import '@testing-library/jest-dom/vitest'
import './i18n'

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.ResizeObserver
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
})

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
