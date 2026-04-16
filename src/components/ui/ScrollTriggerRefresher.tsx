'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * When returning to this page via browser back / bfcache, scroll position is
 * restored AFTER section effects have already created their ScrollTriggers,
 * so triggers computed positions against scrollY=0 and left `gsap.from`
 * elements stuck in their hidden initial state. Re-run refresh() a few times
 * after mount and on pageshow to recalculate everything against the real
 * scroll position.
 */
export default function ScrollTriggerRefresher() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()

    const t1 = window.setTimeout(refresh, 50)
    const t2 = window.setTimeout(refresh, 300)

    const onPageShow = (e: PageTransitionEvent) => {
      // bfcache restore → force a refresh so triggers re-evaluate.
      if (e.persisted) refresh()
      else refresh()
    }
    window.addEventListener('pageshow', onPageShow)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [])

  return null
}
