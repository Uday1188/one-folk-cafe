'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Clock } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useRouter } from 'next/navigation';
import { Notification } from '@/types';

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    router.push(`/admin/orders?viewOrder=${notification.orderId}`);
  };

  const parseUTC = (str: string) => {
    if (!str) return new Date();
    const cleanStr = str.endsWith('Z') || str.includes('+') || str.includes('-0') || (str.length > 10 && str.charAt(str.length - 6) === '-') || (str.length > 10 && str.charAt(str.length - 6) === '+') ? str : str + 'Z';
    return new Date(cleanStr);
  };

  const timeSince = (dateString: string) => {
    const diff = Math.max(0, Date.now() - parseUTC(dateString).getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-accent/10 transition-colors">
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent animate-ping" />
            <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center border-2 border-background">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-card rounded-2xl border border-border shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/50">
              <h3 className="font-bold">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllAsRead()}
                  className="text-xs font-semibold text-accent hover:text-accent/80 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto overscroll-contain">
              {notifications.filter(n => !n.isRead).length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                  <Bell className="w-8 h-8 opacity-20" />
                  <p>No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.filter(n => !n.isRead).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left p-4 hover:bg-secondary/50 transition-colors flex gap-3 ${!n.isRead ? 'bg-accent/5' : ''}`}
                    >
                      <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${!n.isRead ? 'bg-accent' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {n.message}
                        </p>
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{timeSince(n.createdAt)}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
