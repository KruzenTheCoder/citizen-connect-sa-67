import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, Users, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export function NotificationManagement() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info',
    targetAudience: 'all'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [notificationsResult, usersResult] = await Promise.all([
        supabase
          .from('notifications')
          .select(`
            *,
            profiles:user_id(full_name, email)
          `)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .order('full_name')
      ]);

      if (notificationsResult.error) throw notificationsResult.error;
      if (usersResult.error) throw usersResult.error;

      setNotifications(notificationsResult.data || []);
      setUsers(usersResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      let targetUsers: string[] = [];

      if (notificationForm.targetAudience === 'all') {
        targetUsers = users.map(user => user.id);
      } else if (notificationForm.targetAudience === 'citizens') {
        targetUsers = users.filter(user => user.role === 'citizen').map(user => user.id);
      } else if (notificationForm.targetAudience === 'admins') {
        targetUsers = users.filter(user => 
          user.role === 'municipality_admin' || user.role === 'super_admin'
        ).map(user => user.id);
      }

      // Create notifications for all target users
      const notificationData = targetUsers.map(userId => ({
        user_id: userId,
        title: notificationForm.title,
        message: notificationForm.message,
        type: notificationForm.type,
        metadata: { sender: 'admin', broadcast: true }
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notificationData);

      if (error) throw error;

      toast.success(`Notification sent to ${targetUsers.length} users`);
      setNotificationForm({
        title: '',
        message: '',
        type: 'info',
        targetAudience: 'all'
      });
      
      fetchData();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      default: return Bell;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Notification Management</h2>
        <p className="text-muted-foreground">Send bulk notifications to citizens and manage communication</p>
      </div>

      {/* Send Notification Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send New Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                placeholder="Notification title"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select 
                value={notificationForm.type} 
                onValueChange={(value) => setNotificationForm({ ...notificationForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Information</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="audience">Target Audience</Label>
            <Select 
              value={notificationForm.targetAudience} 
              onValueChange={(value) => setNotificationForm({ ...notificationForm, targetAudience: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users ({users.length})</SelectItem>
                <SelectItem value="citizens">
                  Citizens Only ({users.filter(u => u.role === 'citizen').length})
                </SelectItem>
                <SelectItem value="admins">
                  Admins Only ({users.filter(u => u.role !== 'citizen').length})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={notificationForm.message}
              onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
              placeholder="Enter your notification message..."
              rows={4}
              required
            />
          </div>

          <Button 
            onClick={sendNotification} 
            disabled={sending}
            className="w-full"
          >
            {sending ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => {
              const TypeIcon = getTypeIcon(notification.type);
              return (
                <div 
                  key={notification.id} 
                  className="flex items-start gap-3 p-3 border border-border rounded-lg"
                >
                  <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                    <TypeIcon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground">{notification.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(notification.type)}>
                          {notification.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>Sent to: {notification.profiles?.full_name || notification.profiles?.email || 'User'}</span>
                      {!notification.is_read && (
                        <Badge variant="outline" className="text-amber-600">
                          Unread
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {notifications.length === 0 && (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications sent</h3>
                <p className="text-muted-foreground">Start by sending your first notification above.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}