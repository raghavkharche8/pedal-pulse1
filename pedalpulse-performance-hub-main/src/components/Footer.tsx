import { Instagram, MessageCircle, Mail } from 'lucide-react';
import Logo from '@/Logo/Logo.png';

const Footer = () => {
  const quickLinks = [
    { label: 'Challenges', href: '/challenge' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'About Us', href: '/about' },
  ];

  const socialLinks = [
    {
      icon: Instagram,
      href: 'https://instagram.com/pedalpulse',
      label: 'Instagram'
    },
    {
      icon: MessageCircle,
      href: 'https://wa.me/919999999999',
      label: 'WhatsApp'
    },
  ];

  return (
    <footer className="bg-primary-dark">
      <div className="container-premium py-16 lg:py-20">
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          {/* Brand Column */}
          <div>
            <a
              href="/"
              className="inline-flex items-center gap-3 focus-premium rounded-md"
            >
              <img src={Logo} alt="PedalPulse" className="h-12 w-auto" />
              <span className="font-display font-semibold text-xl text-primary-foreground">
                PedalPulse
              </span>
            </a>
            <p className="font-sans text-sm text-primary-foreground/60 mt-4">
              Premium virtual fitness challenges
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans font-semibold text-xs tracking-[0.12em] text-primary-foreground/50 uppercase mb-4">
              Navigate
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-sans text-base text-primary-foreground/80 hover:text-accent-warm transition-all duration-200 focus-premium rounded-md hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h4 className="font-sans font-semibold text-xs tracking-[0.12em] text-primary-foreground/50 uppercase mb-4">
              Connect
            </h4>

            {/* Email */}
            <a
              href="mailto:hello@pedalpulse.in"
              className="font-sans text-base text-primary-foreground/80 hover:text-primary transition-colors duration-200 flex items-center gap-2 focus-premium rounded-md mb-4"
            >
              <Mail className="w-4 h-4" />
              hello@pedalpulse.in
            </a>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 hover:scale-110 transition-all duration-300 focus-premium border border-primary-foreground/20 hover:border-primary/50"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8">
          <p className="font-sans text-sm text-primary-foreground/50 text-center">
            © 2026 PedalPulse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
