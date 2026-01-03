import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/Logo/Logo.png';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isChallengeDir = location.pathname === '/challenges';
  // If we are on Home or Challenge Directory and NOT scrolled, we are in "Transparent/Hero" mode (Dark background -> Light Text)
  // Otherwise, we are in "Solid/Page" mode (Light background -> Dark Text)
  const isTransparentMode = (isHome || isChallengeDir) && !isScrolled;

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Challenges', href: '/challenges' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'About', href: '/about' },
  ];

  const isActive = (href: string) => {
    const currentPath = location.pathname;
    if (href === '/') return currentPath === '/';
    if (href.startsWith('/#')) return currentPath === '/' && location.hash === href.substring(1);
    return currentPath.startsWith(href);
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] z-[100] bg-transparent pointer-events-none">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-accent-warm to-primary"
          style={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-premium ${isScrolled
          ? 'bg-background/80 backdrop-blur-2xl border-b border-black/5 py-2 shadow-sm'
          : 'bg-transparent py-4 md:py-6'
          }`}
      >
        <div className="container-premium flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group relative z-50 focus-premium rounded-lg"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img src={Logo} alt="PedalPulse" className="h-10 w-auto relative transform transition-transform duration-500 group-hover:scale-105" />
            </div>
            <span className={`font-display font-bold text-xl tracking-tight hidden sm:block transition-colors duration-300 ${isTransparentMode ? 'text-white' : 'text-foreground group-hover:text-primary'
              }`}>
              PedalPulse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center gap-1 rounded-full px-2 py-1.5 border transition-all duration-500 ${isTransparentMode
            ? 'bg-white/10 border-white/20 backdrop-blur-md'
            : 'bg-white/5 border-black/5 backdrop-blur-sm shadow-sm'
            }`}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${active
                    ? 'text-primary-foreground bg-primary shadow-md shadow-primary/20'
                    : isTransparentMode
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-black/5'
                    }`}
                >
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="navGlow"
                      className="absolute inset-0 bg-white/20 rounded-full blur-md -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>



          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden relative z-50 p-2 focus-premium rounded-full transition-colors ${isTransparentMode ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-black/5'
              }`}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block w-full h-0.5 bg-current rounded-full transition-transform duration-300 origin-left ${isMobileMenuOpen ? 'rotate-45 translate-x-px' : ''}`} />
              <span className={`block w-full h-0.5 bg-current rounded-full transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`block w-full h-0.5 bg-current rounded-full transition-transform duration-300 origin-left ${isMobileMenuOpen ? '-rotate-45 translate-x-px' : ''}`} />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu Portal */}
      {createPortal(
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[100] md:hidden flex flex-col bg-background/95 backdrop-blur-3xl supports-[backdrop-filter]:bg-background/80"
            >
              {/* Check if user is on Index (Home) - Use Dark theme menu for cool effect, OR keep same theme */}
              {/* Using standard theme but with high contrast */}

              {/* Decorative Background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-30 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-warm/20 rounded-full blur-[120px] opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              <div className="flex-1 flex flex-col justify-center px-8 relative z-10">
                <ul className="flex flex-col gap-6">
                  {navItems.map((item, index) => {
                    const active = isActive(item.href);
                    return (
                      <motion.li
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
                      >
                        <Link
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block text-4xl font-display font-bold tracking-tight transition-all duration-300 ${active
                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-warm pl-4 border-l-4 border-primary'
                            : 'text-muted-foreground hover:text-foreground hover:pl-2'
                            }`}
                        >
                          {item.label}
                        </Link>
                      </motion.li>
                    );
                  })}

                </ul>


              </div>

              <div className="p-8 border-t border-black/5 text-center text-muted-foreground text-sm">
                <p>© {new Date().getFullYear()} PedalPulse Performance</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default Header;
