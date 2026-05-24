import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'

const MOBILE_RE =
  /(android|iphone|ipad|ipod|blackberry|bb10|silk|kindle|playbook|webos|iemobile|opera mini|mobile|tablet|android(?!.*mobile))/i

const getUserAgentInfo = createServerFn({ method: 'GET' }).handler(() => {
  const ua = getRequestHeader('user-agent') ?? ''
  return { isMobile: MOBILE_RE.test(ua) }
})

export { getUserAgentInfo }