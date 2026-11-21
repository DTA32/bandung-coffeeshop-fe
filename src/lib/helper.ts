import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'

const MOBILE_RE =
  /(android|iphone|ipad|ipod|blackberry|bb10|silk|kindle|playbook|webos|iemobile|opera mini|mobile|tablet|android(?!.*mobile))/i

const getUserAgentInfo = createServerFn({ method: 'GET' }).handler(() => {
  const ua = getRequestHeader('user-agent') ?? ''
  return { isMobile: MOBILE_RE.test(ua) }
})

// Pages that mirror their own state into the URL (e.g. meet in the middle's
// markers). A navigation that stays on one of these pages skips the
// root layout's loading dim; entering or leaving it still dims.
const NO_NAV_DIM_PATHS: RegExp[] = [/\/meet-in-the-middle\/?$/]

// skipNavigationDim reports whether a navigation from `fromPath` to `toPath`
// stays on one of the NO_NAV_DIM_PATHS pages.
function skipNavigationDim(fromPath: string | undefined, toPath: string) {
  if (!fromPath) return false
  return NO_NAV_DIM_PATHS.some((re) => re.test(fromPath) && re.test(toPath))
}

export { getUserAgentInfo, skipNavigationDim }
