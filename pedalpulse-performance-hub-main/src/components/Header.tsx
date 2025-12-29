import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/Logo/Logo.png';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Challenge', href: '/challenge' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'About', href: '/about' },
  ];

  // Check if a nav item is active
  const isActive = (href: string) => {
    const currentPath = location.pathname;

    // Exact match for home
    if (href === '/') {
      return currentPath === '/';
    }

    // For other pages, check if path starts with href (handles /challenge, /gallery, etc.)
    if (href.startsWith('/#')) {
      // Hash links on home page
      return currentPath === '/' && location.hash === href.substring(1);
    }

    return currentPath.startsWith(href);
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] z-[60] bg-transparent">
        <motion.div
          className="h-full bg-primary"
          style={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-premium ${isScrolled
          ? 'bg-background/95 backdrop-blur-xl shadow-sm py-1'
          : 'bg-background/90 backdrop-blur-md py-2'
          }`}
      >
        <div className="container-premium">
          <nav className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <a
              href="/"
              className="flex items-center gap-2 focus-premium rounded-md transition-opacity duration-300 hover:opacity-80"
            >
              <img src={Logo} alt="PedalPulse" className="h-8 md:h-9 w-auto" />
              <span className="font-display font-semibold text-lg md:text-xl tracking-tight text-primary-dark">
                PedalPulse
              </span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <ul className="flex items-center gap-8">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.label} className="relative">
                      <a
                        href={item.href}
                        className={`font-sans font-medium text-sm lg:text-base transition-colors duration-200 focus-premium rounded-md px-1 py-2 ${active
                          ? 'text-primary font-semibold'
                          : 'text-text-secondary hover:text-text-primary'
                          }`}
                      >
                        {item.label}
                      </a>
                      {/* Active Underline Indicator */}
                      {active && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>

              <a
                href="/challenge#pricing"
                className="ml-4 px-5 py-2.5 rounded-full font-sans font-semibold text-sm transition-all duration-300 transform hover:-translate-y-0.5 shadow-md bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25"
              >
                Register Now
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 focus-premium rounded-md transition-colors text-text-primary"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </nav>
        </div>

        {/* Premium Full-Screen Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 md:hidden bg-slate-950 flex flex-col"
            >
              {/* Menu Header with Logo and Close Button */}
              <div className="flex items-center justify-between px-6 h-20 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <img src={Logo} alt="PedalPulse" className="h-8 w-auto brightness-0 invert" />
                  <span className="font-display font-semibold text-lg text-white">PedalPulse</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Menu Content */}
              <div className="flex-1 flex flex-col justify-center items-center relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 opacity-30" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent-warm/20 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 opacity-30" />

                <ul className="relative z-10 flex flex-col items-center gap-8">
                  {navItems.map((item, index) => {
                    const active = isActive(item.href);
                    return (
                      <motion.li
                        key={item.label}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <a
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`font-display font-bold text-5xl md:text-6xl tracking-tight transition-all duration-300 hover:scale-110 inline-block ${active
                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-warm'
                            : 'text-white/40 hover:text-white'
                            }`}
                        >
                          {item.label}
                        </a>
                      </motion.li>
                    );
                  })}
                </ul>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-12 relative z-10"
                >
                  <a
                    href="/challenge#pricing"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-slate-950 font-display font-bold text-lg hover:bg-slate-200 transition-colors"
                  >
                    Register Now
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  </a>
                </motion.div>
              </div>

              {/* Footer Info */}
              <div className="p-8 text-center border-t border-white/10">
                <p className="text-white/30 text-xs uppercase tracking-widest">
                  © 2026 PedalPulse Performance
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;
