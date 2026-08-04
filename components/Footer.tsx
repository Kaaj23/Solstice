"use client";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/40 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="text-xl font-bold tracking-widest text-gold-gradient uppercase">
            Solstice
          </span>
          <p className="text-xs text-gray-500 mt-2">
            © {new Date().getFullYear()} SOLSTICE. All rights reserved.
          </p>
        </div>
        <div className="flex space-x-6 text-xs text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
