import React, { useState } from 'react';
import { Bell, BellRing, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  incident_id?: string;
}

const NotificationsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'All notifications marked as read',
      });
    },
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-civic-emerald/10 text-civic-emerald border-civic-emerald/20';
      case 'warning': return 'bg-civic-amber/10 text-civic-amber border-civic-amber/20';
      case 'error': return 'bg-civic-red/10 text-civic-red border-civic-red/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        {unreadCount > 0 ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-civic-red text-white text-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 max-h-96 z-50 border-border/50 shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-border/30 cursor-pointer hover:bg-accent/50 transition-colors ${
                        !notification.is_read ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsReadMutation.mutate(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${!notification.is_read ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </p>
                            <Badge className={`text-xs ${getTypeColor(notification.type)}`}>
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPanel;