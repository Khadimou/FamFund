import Hero from '@/components/landing/Hero'
import Problems from '@/components/landing/Problems'
import Solution from '@/components/landing/Solution'
import Testimonials from '@/components/landing/Testimonials'
import FAQ from '@/components/landing/FAQ'
import CTAFinal from '@/components/landing/CTAFinal'
import Footer from '@/components/landing/Footer'
import StickyCTA from '@/components/landing/StickyCTA'

export default function Home() {
  return (
    <main className="bg-[#0C1A10]">
      <Hero />
      <Problems />
      <Solution />
      <Testimonials />
      <FAQ />
      <CTAFinal />
      <Footer />
      <StickyCTA />
    </main>
  )
}
