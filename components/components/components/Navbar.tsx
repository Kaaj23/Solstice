import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-widest text-gold-gradient uppercase">
          Solstice
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-300">
          <Link href="#fragrances" className="hover:text-amber-400 transition-colors">
            Fragrances
          </Link>
          <Link href="#reviews" className="hover:text-amber-400 transition-colors">
            Reviews
          </Link>
          <Link href="#brands" className="hover:text-amber-400 transition-colors">
            Brands
          </Link>
          <Link href="#finder" className="hover:text-amber-400 transition-colors">
            AI Finder
          </Link>
        </nav>
        <button className="px-5 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:opacity-90 transition-all gold-glow">
          Explore Notes
        </button>
      </div>
    </header>
  );
}
