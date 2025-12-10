// components/Navbar.tsx - ENHANCED VERSION
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Star, User, Settings, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';

interface NavbarProps {
  user?: {
    username: string;
    is_admin: boolean;
  };
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Blog', href: '/posts' },
    { name: 'Panchanga', href: '/panchanga' },
  ];

  return (
    <nav className="fixed top-0 w-full bg-white/10 backdrop-blur-lg border-b border-white/20 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <Star className="w-8 h-8 text-yellow-400 fill-current" />
            <span className="text-xl font-bold text-white">Cosmic Dharma</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                whileHover={{ y: -2 }}
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                >
                  <User className="w-4 h-4 text-white" />
                  <span className="text-white font-medium">{user.username}</span>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-lg rounded-lg shadow-lg border border-white/20"
                    >
                      <a href="/profile" className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors">
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </a>
                      {user.is_admin && (
                        <a href="/admin" className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors">
                          <Settings className="w-4 h-4" />
                          <span>Admin</span>
                        </a>
                      )}
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="secondary" size="sm" onClick={() => router.push('/login')}>
                  Login
                </Button>
                <Button variant="primary" size="sm" onClick={() => router.push('/register')}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/10 backdrop-blur-lg rounded-b-lg border-t border-white/20"
            >
              <div className="px-4 py-4 space-y-4">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                {user ? (
                  <div className="border-t border-white/20 pt-4 space-y-2">
                    <p className="text-white font-medium">{user.username}</p>
                    <a href="/profile" className="block text-gray-300 hover:text-white py-2">Profile</a>
                    {user.is_admin && (
                      <a href="/admin" className="block text-gray-300 hover:text-white py-2">Admin</a>
                    )}
                    <button
                      onClick={onLogout}
                      className="block text-red-400 hover:text-red-300 py-2 w-full text-left"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-white/20 pt-4 space-y-2">
                    <a href="/login" className="block text-center bg-white/10 hover:bg-white/20 rounded-lg py-2 transition-colors">Login</a>
                    <a href="/register" className="block text-center bg-purple-600 hover:bg-purple-700 rounded-lg py-2 transition-colors">Sign Up</a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
