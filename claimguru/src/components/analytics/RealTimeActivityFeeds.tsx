import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Bell, 
  Clock, 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ActivityItem {
  id: string;
  type: 'claim_update' | 'client_registered' | 'deadline' | 'notification' | 'user_activity';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  user?: string;
  relatedId?: string;
  status?: string;
}

interface DeadlineItem {
  id: string;
  title: string;
  dueDate: string;
  type: 'task' | 'claim' | 'document' | 'meeting';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  overdue: boolean;
}

interface RealTimeActivityFeedsProps {
  organizationId: string;
}

export const RealTimeActivityFeeds: React.FC<RealTimeActivityFeedsProps> = ({ 
  organizationId 
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [notifications, setNotifications] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load initial data
  useEffect(() => {
    loadActivityData();
    
    // Set up real-time polling
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadActivityData();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [organizationId, autoRefresh]);

  const loadActivityData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent activities
      const [activitiesData, claimsData, tasksData, clientsData] = await Promise.all([
        supabase
          .from('activities')
          .select('*')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('claims')
          .select('id, claim_number, claim_status, updated_at, client_id')
          .eq('organization_id', organizationId)
          .order('updated_at', { ascending: false })
          .limit(10),
        supabase
          .from('tasks')
          .select('*')
          .eq('organization_id', organizationId)
          .order('due_date', { ascending: true })
          .limit(15),
        supabase
          .from('clients')
          .select('id, first_name, last_name, created_at')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      // Process activities
      const processedActivities: ActivityItem[] = [];
      
      // Add database activities
      if (activitiesData.data) {
        activitiesData.data.forEach(activity => {
          processedActivities.push({
            id: activity.id,
            type: 'user_activity',
            title: activity.title || activity.activity_type,
            description: activity.description || 'Activity recorded',
            timestamp: activity.created_at,
            priority: 'medium',
            user: activity.user_id
          });
        });
      }

      // Add recent claim updates
      if (claimsData.data) {
        claimsData.data.forEach(claim => {
          processedActivities.push({
            id: `claim-${claim.id}`,
            type: 'claim_update',
            title: `Claim ${claim.claim_number} Updated`,
            description: `Status changed to ${claim.claim_status?.replace('_', ' ')}`,
            timestamp: claim.updated_at,
            priority: 'medium',
            relatedId: claim.id,
            status: claim.claim_status
          });
        });
      }

      // Add new client registrations
      if (clientsData.data) {
        clientsData.data.forEach(client => {
          processedActivities.push({
            id: `client-${client.id}`,
            type: 'client_registered',
            title: 'New Client Registered',
            description: `${client.first_name} ${client.last_name} joined`,
            timestamp: client.created_at,
            priority: 'low',
            relatedId: client.id
          });
        });
      }

      // Process deadlines
      const processedDeadlines: DeadlineItem[] = [];
      if (tasksData.data) {
        tasksData.data.forEach(task => {
          if (task.due_date) {
            const dueDate = new Date(task.due_date);
            const now = new Date();
            const isOverdue = dueDate < now;
            
            processedDeadlines.push({
              id: task.id,
              title: task.title,
              dueDate: task.due_date,
              type: 'task',
              priority: task.priority || 'medium',
              assignee: task.assigned_to,
              overdue: isOverdue
            });
          }
        });
      }

      // Sort activities by timestamp
      processedActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Sort deadlines by due date
      processedDeadlines.sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );

      setActivities(processedActivities);
      setDeadlines(processedDeadlines);
      
      // Filter urgent notifications
      const urgentNotifications = processedActivities.filter(activity => 
        activity.priority === 'urgent' || activity.priority === 'high'
      );
      setNotifications(urgentNotifications.slice(0, 5));
      
    } catch (error) {
      console.error('Error loading activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'claim_update': return <FileText className="h-4 w-4" />;
      case 'client_registered': return <Users className="h-4 w-4" />;
      case 'deadline': return <Calendar className="h-4 w-4" />;
      case 'notification': return <Bell className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredActivities = filterType === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filterType);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Activity Feed */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Real-time Activity Feed</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-green-50 text-green-700' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </Button>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="all">All Activities</option>
                <option value="claim_update">Claim Updates</option>
                <option value="client_registered">New Clients</option>
                <option value="user_activity">User Activities</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading activities...</span>
              </div>
            ) : filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`p-2 rounded-full ${getPriorityColor(activity.priority)}`}>
                    <div className="text-white">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                      {activity.user && ` • by ${activity.user}`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines & Notifications */}
      <div className="space-y-6">
        {/* Urgent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-red-600" />
              <span>Urgent Notifications</span>
              {notifications.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {notifications.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900">
                        {notification.title}
                      </p>
                      <p className="text-xs text-red-700">
                        {notification.description}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">No urgent notifications</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span>Upcoming Deadlines</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {deadlines.length > 0 ? (
                deadlines.slice(0, 8).map((deadline) => {
                  const dueDate = new Date(deadline.dueDate);
                  const now = new Date();
                  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={deadline.id} className={`flex items-start space-x-2 p-2 rounded-lg border ${
                      deadline.overdue 
                        ? 'bg-red-50 border-red-200' 
                        : daysUntilDue <= 3 
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <Calendar className={`h-4 w-4 mt-0.5 ${
                        deadline.overdue 
                          ? 'text-red-600' 
                          : daysUntilDue <= 3 
                          ? 'text-orange-600'
                          : 'text-blue-600'
                      }`} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          deadline.overdue 
                            ? 'text-red-900' 
                            : daysUntilDue <= 3 
                            ? 'text-orange-900'
                            : 'text-blue-900'
                        }`}>
                          {deadline.title}
                        </p>
                        <p className={`text-xs ${
                          deadline.overdue 
                            ? 'text-red-700' 
                            : daysUntilDue <= 3 
                            ? 'text-orange-700'
                            : 'text-blue-700'
                        }`}>
                          {deadline.overdue 
                            ? `Overdue by ${Math.abs(daysUntilDue)} days`
                            : daysUntilDue === 0 
                            ? 'Due today'
                            : `Due in ${daysUntilDue} days`
                          }
                        </p>
                        {deadline.assignee && (
                          <p className="text-xs text-gray-600 mt-1">
                            Assigned to: {deadline.assignee}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">No upcoming deadlines</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};