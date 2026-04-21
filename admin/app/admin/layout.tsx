"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart3, Settings, Sparkles, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster, toast } from 'sonner';
import { createAdminBrowserClient } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/admin-service';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/customers', icon: Users, label: 'Customers' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createAdminBrowserClient();

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    getUser();

    // Listen for new orders
    const channel = supabaseAdmin
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as any;
          toast.success(`New Order: ${newOrder.order_number}`, {
            description: `Total: ₹${newOrder.total_amount}`,
            duration: 5000,
            action: {
              label: 'View',
              onClick: () => window.location.href = '/admin/orders'
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabaseAdmin.removeChannel(channel);
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen w-full" style={{ backgroundColor: '#0B0B0B' }}>
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
        {/* Logo */}
        <div className="px-6 py-7">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D06F)' }}>
              <Sparkles size={14} color="#0B0B0B" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-black tracking-[0.2em] text-sm" style={{ color: '#FAFAFA' }}>DALUXE</h1>
              <p className="text-[9px] tracking-[0.15em] uppercase" style={{ color: '#52525B' }}>Admin Panel</p>
            </div>
          </div>
        </div>

        <div className="gold-divider mx-4" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href}
                className={cn('flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive ? 'sidebar-active' : 'sidebar-item'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-6 mt-auto">
          <div className="gold-divider mb-4" />
          
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium transition-all duration-150 sign-out-btn mb-4"
          >
            <LogOut size={16} />
            Sign Out
          </button>

          <div className="px-3 border-l" style={{ borderColor: 'rgba(212,175,55,0.2)' }}>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#FAFAFA' }}>{userEmail || 'Admin'}</p>
            <p className="text-[9px] tracking-widest uppercase" style={{ color: '#3F3F46' }}>v1.0.0 · Daluxe Admin</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
      <Toaster position="top-right" theme="dark" richColors />
    </div>
  );
}
