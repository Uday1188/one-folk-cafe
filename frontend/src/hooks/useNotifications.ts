import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/api';
import { Notification } from '@/types';
import { toast } from 'sonner';

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const [stompClient, setStompClient] = useState<Client | null>(null);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => markNotificationAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    // Determine the WS url based on API base url
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const wsUrl = apiUrl.replace('/api', '/ws');

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      onConnect: () => {
        client.subscribe('/topic/notifications', (message) => {
          if (message.body) {
            const newNotification: Notification = JSON.parse(message.body);
            
            // Deduplicate: Check if we already received this notification (fixes StrictMode double-fire)
            const current = queryClient.getQueryData<Notification[]>(['notifications']) || [];
            if (current.some(n => n.id === newNotification.id)) return;
            
            // Add to cache
            queryClient.setQueryData<Notification[]>(['notifications'], [newNotification, ...current]);
            
            // Play local sound from public folder
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.warn('Audio play blocked by browser. Please interact with the page first:', e));


            
            // Also invalidate orders to refresh the table if admin is on orders page
            queryClient.invalidateQueries({ queryKey: ['orders'] });
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [queryClient]);

  const markAsRead = (id: number) => {
    if (notifications.find(n => n.id === id && !n.isRead)) {
      markAsReadMutation.mutate(id);
    }
  };

  const markAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  };
};
