// components/layout/Footer.tsx
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const footerLinks = {
  'Explore': [
    { name: 'Birth Chart', href: '/profile' },
    { name: 'Blog', href: '/posts' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Panchanga', href: '/panchanga' }
  ],
  'Resources': [
    { name: 'About Vedic Astrology', href: '/about' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' }
  ],
  'Legal': [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' }
  ]
};

const socialLinks = [
  { name: 'Twitter', icon: '𝕏', href: '#' },
  { name: 'Instagram', icon: '📷', href: '#' },
  { name: 'YouTube', icon: '📺', href: '#' }
];

export default function Footer() {
  return (
    <footer className="relative mt-32 border-t border-gray-200 dark:border-gray-800">
      <div className="container py-16">
        {/* Top Section */}
        <div className="grid lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-2">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <span className="text-2xl font-bold gradient-text">Cosmic Dharma</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              Discover your cosmic blueprint through authentic Vedic astrology. 
              Join thousands on their journey of self-discovery and spiritual growth.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 
                           flex items-center justify-center text-lg
                           hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 
                           hover:text-white transition-all duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-purple-600 
                               dark:hover:text-purple-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold mb-2">Stay Connected</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get weekly cosmic insights and astrological wisdom delivered to your inbox
              </p>
            </div>
            <form className="flex gap-3 max-w-md w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 
                         bg-white dark:bg-gray-900 
                         focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 
                         text-white font-medium rounded-xl
                         hover:shadow-lg hover:shadow-purple-500/25 
                         transition-all duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Cosmic Dharma. All rights reserved.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Made with ❤️ and ✨ for cosmic souls everywhere
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-600 to-transparent" />
    </footer>
  );
}
