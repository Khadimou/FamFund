export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#080F0A] border-t border-[#1A2D22] py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">

          {/* Logo */}
          <div className="font-serif text-xl text-primary-light font-bold tracking-tight">
            FamilyFund
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/60">
            <a href="/blog" className="hover:text-white transition-colors">
              Blog
            </a>
            <span className="text-white/20" aria-hidden>·</span>
            <a href="/guide" className="hover:text-white transition-colors">
              Guide gratuit
            </a>
            <span className="text-white/20" aria-hidden>·</span>
            <a href="/mentions-legales" className="hover:text-white transition-colors">
              Mentions légales
            </a>
            <span className="text-white/20" aria-hidden>·</span>
            <a href="/confidentialite" className="hover:text-white transition-colors">
              Politique de confidentialité
            </a>
            <span className="text-white/20" aria-hidden>·</span>
            <a href="mailto:contact@familyfund.fr" className="hover:text-white transition-colors">
              Contact
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-white/40">© {year} FamilyFund</p>
        </div>

        {/* RGPD */}
        <p className="text-center text-xs text-white/30 mt-6 max-w-md mx-auto leading-relaxed">
          En vous inscrivant, vous acceptez de recevoir des informations sur le lancement de
          FamilyFund. Désabonnement en un clic depuis chaque email. Vos données ne sont jamais
          cédées à des tiers.
        </p>
      </div>
    </footer>
  )
}
