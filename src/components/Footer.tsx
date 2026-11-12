import { Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import {
  Twitter,
  Send,
  Linkedin,
  Facebook,
  Mail,
  Phone,
  MapPin,
  Shield,
  ArrowUpRight,
} from 'lucide-react';

export default function Footer() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();

  const footerLinks = {
    Company: [
      { label: 'About Us', path: '/about' },
      { label: 'Blog', path: '/blog' },
      { label: 'Careers', path: '/careers' },
      { label: 'Contact', path: '/contact' },
    ],
    Products: [
      { label: 'Exchange', path: '/markets' },
      { label: 'Trading Terminal', path: '/trade/BTC_USDT' },
      { label: 'Wallet', path: '/wallet' },
      { label: 'Portfolio', path: '/portfolio' },
    ],
    Support: [
      { label: 'Help Center', path: '/help' },
      { label: 'FAQ', path: '/faq' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Privacy Policy', path: '/privacy' },
    ],
    Legal: [
      { label: 'Terms', path: '/terms' },
      { label: 'Privacy', path: '/privacy' },
      { label: 'Security', path: '/security' },
      { label: 'Compliance', path: '/compliance' },
    ],
  };

  const socials = [
    { icon: Twitter, url: settings?.twitter_url, label: 'Twitter' },
    { icon: Send, url: settings?.telegram_url, label: 'Telegram' },
    { icon: Linkedin, url: settings?.linkedin_url, label: 'LinkedIn' },
    { icon: Facebook, url: settings?.facebook_url, label: 'Facebook' },
  ];

  return (
    <footer className="bg-dark-900 border-t border-dark-700 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-white font-bold text-lg">
                {settings?.site_name?.split(' ')[0] || 'Next'}
                <span className="text-brand-400">BT</span>
              </span>
            </Link>
            <p className="text-dark-400 text-sm leading-relaxed max-w-xs mb-6">
              {settings?.about_content || 'Trade 200+ cryptocurrencies with confidence on the most secure digital asset platform.'}
            </p>
            <div className="space-y-2 text-sm text-dark-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>{settings?.contact_email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>{settings?.contact_phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>{settings?.contact_address}</span>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white font-semibold text-sm mb-4">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-dark-400 hover:text-brand-400 text-sm transition-colors flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-dark-700 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-dark-400">
            <span>&copy; {year} {settings?.footer_text || 'Next billion technologies. All rights reserved.'}</span>
            <Link to="/admin/login" className="text-dark-500 hover:text-brand-400 transition-colors">
              Admin
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-dark-500 mr-2">
              <Shield className="w-3.5 h-3.5 text-success-500" />
              <span>Secured & Encrypted</span>
            </div>
            {socials.map((social) => {
              if (!social.url) return null;
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-dark-800 hover:bg-brand-500 text-dark-300 hover:text-white flex items-center justify-center transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

      </div>
    </footer>
  );
}
