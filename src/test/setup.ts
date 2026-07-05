import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// React 19 act() environment flag. RTL 16 sets this itself, but make it explicit
// so renderHook + act behave deterministically regardless of import order.
globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Unmount React trees between tests (belt-and-suspenders alongside globals:true).
afterEach(() => {
  cleanup()
})
