import { useEffect, useRef } from 'react'
import { isDesktop } from '../utils/viewport.utils'

export const useCloseSidebarOnMobileNav = (pathname: string, closeSidebar: () => void): void => {
  const initialPathRef = useRef(pathname)

  useEffect(() => {
    if (pathname === initialPathRef.current) {
      initialPathRef.current = ''
      return
    }
    if (!isDesktop()) {
      closeSidebar()
    }
  }, [pathname, closeSidebar])
}
