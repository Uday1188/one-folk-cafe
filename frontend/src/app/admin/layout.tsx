'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ShoppingBag, Package, BarChart3, Settings, LogOut, ChevronRight, Coffee, Menu as MenuIcon, X as XIcon, Sun, Moon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '@/lib/api';
import { NotificationPanel } from '@/components/admin/NotificationPanel';
import { useDarkMode } from '@/hooks/useDarkMode';

const ADMIN_NAV = [
  { id: "/admin/dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
  { id: "/admin/orders", label: "Orders", icon: <ShoppingBag className="w-5 h-5" /> },
  { id: "/admin/products", label: "Products", icon: <Package className="w-5 h-5" /> },
  { id: "/admin/analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
  { id: "/admin/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { darkMode, toggleDark } = useDarkMode();

  const isAdmin = typeof window !== 'undefined' ? !!localStorage.getItem('adminToken') : false;

  const { data: orders } = useQuery({ 
    queryKey: ['orders'], 
    queryFn: () => fetchOrders(),
    enabled: pathname !== '/admin/login' && isAdmin
  });
  const pendingCount = orders?.filter((o: any) => o.status === 'PENDING').length || 0;

  // If we are on the login page, don't show the sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Ensure admin is logged in (simplified check)
  if (!isAdmin && typeof window !== 'undefined') {
    router.push('/admin/login');
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('fc_admin');
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border relative">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
          <Coffee className="w-5 h-5 text-white" />
        </div>
        {!collapsed && <span className="font-bold text-lg leading-tight truncate">One Folk<br /><span className="text-accent text-sm">Admin</span></span>}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="hidden md:flex absolute -right-3.5 top-7 w-7 h-7 bg-card border border-border rounded-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground items-center justify-center text-sidebar-foreground z-50 shadow-sm"
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? "" : "rotate-180"}`} />
        </button>
        {mobileOpen && (
          <button onClick={() => setMobileOpen(false)} className="md:hidden ml-auto">
            <XIcon className="w-6 h-6 text-sidebar-foreground/50" />
          </button>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {ADMIN_NAV.map(({ id, label, icon }) => {
          const active = pathname === id;
          const showBadge = id === "/admin/orders" && pendingCount > 0;
          return (
            <button key={id} onClick={() => { router.push(id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}>
              <span className="flex-shrink-0 relative">
                {icon}
                {showBadge && !collapsed && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">{pendingCount}</span>}
              </span>
              {(!collapsed || mobileOpen) && <span className="truncate">{label}</span>}
              {(!collapsed || mobileOpen) && showBadge && <span className="ml-auto px-1.5 py-0.5 rounded-full bg-accent text-white text-xs font-bold">{pendingCount}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button onClick={handleLogout} className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors ${collapsed && !mobileOpen ? 'justify-center px-0' : 'px-3'}`}>
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {(!collapsed || mobileOpen) && "Logout"}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex h-screen sticky top-0 bg-sidebar border-r border-sidebar-border flex-col transition-all duration-300 z-40 ${collapsed ? "w-[72px]" : "w-60"}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween" }}
            className="fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border z-50 flex flex-col md:hidden shadow-2xl">
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border h-16 flex items-center px-4 justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground">
              <MenuIcon className="w-5 h-5" />
            </button>
            <span className="font-bold">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleDark} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground">
              {darkMode ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
            </button>
            <NotificationPanel />
          </div>
        </header>
        
        {/* Desktop Topbar */}
        <header className="hidden md:flex sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border h-16 items-center px-8 justify-between">
          <h1 className="font-bold text-lg">{ADMIN_NAV.find(n => n.id === pathname)?.label || "Admin Portal"}</h1>
          <div className="flex items-center gap-2">
            <button onClick={toggleDark} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors">
              {darkMode ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
            </button>
            <NotificationPanel />
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" />
        )}
      </AnimatePresence>
    </div>
  );
}
