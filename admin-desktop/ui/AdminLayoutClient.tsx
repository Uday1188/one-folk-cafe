'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ShoppingBag, Package, LogOut, ChevronRight, Menu as MenuIcon, X as XIcon, Sun, Moon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '@/lib/api';
import { NotificationPanel } from '@/components/admin/NotificationPanel';
import { useDarkMode } from '@/hooks/useDarkMode';

const ADMIN_NAV = [
  { id: "/admin/dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
  { id: "/admin/orders", label: "Orders", icon: <ShoppingBag className="w-5 h-5" /> },
  { id: "/admin/products", label: "Products", icon: <Package className="w-5 h-5" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { darkMode, toggleDark } = useDarkMode();
  const contentAreaRef = useRef<HTMLDivElement>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setIsAdmin(!!token);
    }
    setAuthChecked(true);
  }, [pathname, router]);

  // Whenever the route changes, instantly scroll the inner content container back to top
  useEffect(() => {
    if (contentAreaRef.current) {
      contentAreaRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  const { data: orders } = useQuery({ 
    queryKey: ['orders-count-badge'], 
    queryFn: () => fetchOrders(),
    enabled: pathname !== '/admin/login' && isAdmin
  });
  const pendingCount = (Array.isArray(orders) ? orders : orders?.content || []).filter((o: any) => o.status === 'PENDING').length || 0;

  // If we are on the login page, render login page directly
  if (pathname === '/admin/login') {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  // Prevent flash of content before checking auth
  if (!authChecked || (!isAdmin && typeof window !== 'undefined')) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-muted-foreground">Loading One Folk Admin...</span>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('fc_admin');
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full select-none">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border relative flex-shrink-0">
        <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-white shadow-xs">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-base leading-tight truncate text-sidebar-foreground">One Folk Cafe</span>
            <span className="text-accent text-xs font-semibold uppercase tracking-wider">Admin Suite</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="hidden md:flex absolute -right-3.5 top-6 w-7 h-7 bg-card border border-border rounded-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground items-center justify-center text-sidebar-foreground z-50 shadow-sm transition-transform"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? "" : "rotate-180"}`} />
        </button>
        {mobileOpen && (
          <button onClick={() => setMobileOpen(false)} className="md:hidden ml-auto p-1 text-sidebar-foreground/60 hover:text-sidebar-foreground">
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 py-4 px-2.5 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {ADMIN_NAV.map(({ id, label, icon }) => {
          const active = pathname === id || (id !== '/admin/dashboard' && pathname.startsWith(id));
          return (
            <Link
              key={id}
              href={id}
              prefetch={true}
              onClick={() => setMobileOpen(false)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm font-semibold" 
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <span className="flex-shrink-0">{icon}</span>
              {(!collapsed || mobileOpen) && (
                <span className="truncate flex-1 text-left">{label}</span>
              )}
              {id === "/admin/orders" && pendingCount > 0 && (!collapsed || mobileOpen) && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border flex-shrink-0">
        <button 
          onClick={handleLogout} 
          className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors ${
            collapsed && !mobileOpen ? 'justify-center px-0' : 'px-3.5'
          }`}
          title="Sign out of admin"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {(!collapsed || mobileOpen) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-background text-foreground">
      {/* Desktop Sidebar: Permanent fixed height, never scrolls with content */}
      <aside 
        className={`hidden md:flex h-full bg-sidebar border-r border-sidebar-border flex-col transition-all duration-200 z-30 flex-shrink-0 ${
          collapsed ? "w-[72px]" : "w-60"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ x: "-100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "-100%" }} 
            transition={{ type: "tween", duration: 0.2 }}
            className="fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border z-50 flex flex-col md:hidden shadow-2xl"
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Mobile Top Header */}
        <header className="md:hidden flex-shrink-0 bg-card/80 backdrop-blur-lg border-b border-border h-16 flex items-center px-4 justify-between z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground">
              <MenuIcon className="w-5 h-5" />
            </button>
            <span className="font-bold text-base">One Folk Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleDark} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground">
              {darkMode ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
            </button>
            <NotificationPanel />
          </div>
        </header>
        
        {/* Desktop Top Header: Pinned at top, never scrolls away */}
        <header className="hidden md:flex flex-shrink-0 bg-card/80 backdrop-blur-lg border-b border-border h-16 items-center px-8 justify-between z-20">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-lg">
              {ADMIN_NAV.find(n => n.id === pathname || (n.id !== '/admin/dashboard' && pathname.startsWith(n.id)))?.label || "Admin Portal"}
            </h1>
            {typeof window !== 'undefined' && !!(window as any).desktopAPI && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Desktop Suite • SQLite
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleDark} 
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
            </button>
            <NotificationPanel />
          </div>
        </header>

        {/* Scrollable Content Viewport: ONLY the inner content scrolls */}
        <main 
          ref={contentAreaRef} 
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 relative"
        >
          <div key={pathname} className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs" 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
