'use client'

import { useEffect } from 'react'

/**
 * Forces a full reload when the user navigates away from this page via the
 * browser's back/forward gesture. Needed because the home page relies on
 * one-shot gsap.from entrance animations that don't replay cleanly when
 * the App Router's client-side segment cache restores the previous tree
 * without fully remounting the smooth-scroll + ScrollTrigger pipeline.
 */
export default function ReloadOnPop() {
  useEffect(() => {
    const onPop = () => {
      window.location.reload()
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return null
}
