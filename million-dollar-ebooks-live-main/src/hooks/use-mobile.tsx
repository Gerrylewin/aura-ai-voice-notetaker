
import * as React from "react"
import { useMobileUtils } from './useMobileUtils'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const { isMobile } = useMobileUtils()
  return isMobile
}
