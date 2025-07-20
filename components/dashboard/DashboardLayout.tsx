import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  FileText,
  Home,
  Menu,
  Settings,
  Star,
  Users,
  X,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/util/cn';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    username: string;
    is_admin: boolean;
    is_donor: boolean;
  };
}

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'My Charts', href: '/dashboard/charts', icon: Star },
  { name: 'Blog Posts', href: '/dashboard/posts', icon: FileText },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const adminNavigation = [
  { name: 'Users', href: '/dashboard/admin/users', icon: Users },
  { name: 'All Posts', href: '/dashboard/admin/posts', icon: FileText },
  { name: 'Site Analytics', href: '/dashboard/admin/analytics', icon: TrendingUp },
];

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const allNavigation = user.is_admin
    ? [...navigation, { name: 'Admin', items: adminNavigation }]
    : navigation;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : '-100%',
        }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
          'lg:translate-x-0 lg:static lg:inset-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Star className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold">Dashboard</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {allNavigation.map((item) => {
              if ('items' in item) {
                return (
                  <div key={item.name} className="mt-6">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {item.name}
                    </h3>
                    <div className="mt-2 space-y-1">
                      {item.items.map((subItem) => {
                        const Icon = subItem.icon;
                        const isActive = router.pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                              isActive
                                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{user.username}</div>
                <div className="text-xs text-gray-500">
                  {user.is_admin && 'Admin'}
                  {user.is_donor && ' • Donor'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1" />

          {/* Quick actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="relative"
            >
              <Clock className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}