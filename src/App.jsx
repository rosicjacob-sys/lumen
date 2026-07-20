import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CartProvider } from './lib/cart'
import { startLenis } from './lib/scroll'
import { MQ_MOTION_OK } from './lib/env'
import AtelierStage from './three/AtelierStage'
import AnnouncementBar from './components/AnnouncementBar'
import Boot from './components/Boot'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Catalog from './components/Catalog'
import Process from './components/Process'
import Verify from './components/Verify'
import BatchRail from './components/BatchRail'
import Order from './components/Order'
import ColdChain from './components/ColdChain'
import Faq from './components/Faq'
import FinalCta from './components/FinalCta'
import Footer from './components/Footer'
import StickyCart from './components/StickyCart'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add(MQ_MOTION_OK, () => startLenis())
    return () => mm.revert()
  }, [])

  return (
    <CartProvider>
      <Boot />
      <a className="skip-link" href="#catalog">
        Skip to the catalog
      </a>
      <AnnouncementBar />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Catalog />
        <Process />
        <Verify />
        <BatchRail />
        <Order />
        <ColdChain />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <AtelierStage />
      <StickyCart />
    </CartProvider>
  )
}
