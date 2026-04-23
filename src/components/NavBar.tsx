'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ClipboardList, BarChart3, LogOut } from 'lucide-react';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/', label: '房间', icon: Home },
  { href: '/inventory', label: '布草', icon: Package },
  { href: '/cleaning', label: '清洁', icon: ClipboardList },
  { href: '/reports', label: '报表', icon: BarChart3 },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.refresh();
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">退出</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
