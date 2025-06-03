import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  Send,
  Calendar,
  Bell,
  Settings
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CitizenCommunication } from '@shared/schema';
import { Link } from 'wouter';

interface DashboardStats {
  totalCommunications: number;
  pendingCommunications: number;
  completedCommunications: number;
  responseRate: number;
  avgResponseTime: string;
}

interface RecentActivity {
  id: number;
  type: 'communication' | 'response' | 'update';
  title: string;
  description: string;
  date: string;
  status: string;
}

const CitizenDashboard: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');

  // Fetch dashboard statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats', selectedTimeframe],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/stats?timeframe=${selectedTimeframe}`);
      return response.json() as Promise<DashboardStats>;
    }
  });

  // Fetch recent communications
  const { data: recentCommunications } = useQuery({
    queryKey: ['/api/dashboard/recent-communications'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/recent-communications?limit=5');
      return response.json() as Promise<CitizenCommunication[]>;
    }
  });

  // Fetch recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ['/api/dashboard/activity'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/activity?limit=10');
      return response.json() as Promise<RecentActivity[]>;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-ibm">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة المتابعة</h1>
          <p className="text-gray-600">تابع حالة رسائلك وتفاعل مع منصة التواصل مع الوزير</p>
        </div>

        {/* Timeframe Selector */}
        <div className="mb-6">
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe === 'week' ? 'أسبوع' : timeframe === 'month' ? 'شهر' : 'سنة'}
              </Button>
            ))}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الرسائل</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCommunications || 0}</div>
              <p className="text-xs text-muted-foreground">
                منذ آخر {selectedTimeframe === 'week' ? 'أسبوع' : selectedTimeframe === 'month' ? 'شهر' : 'سنة'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيد المراجعة</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingCommunications || 0}</div>
              <p className="text-xs text-muted-foreground">
                في انتظار الرد
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تم الرد عليها</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completedCommunications || 0}</div>
              <p className="text-xs text-muted-foreground">
                تمت المعالجة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل الاستجابة</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.responseRate || 0}%</div>
              <Progress value={stats?.responseRate || 0} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Communications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  الرسائل الأخيرة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentCommunications && recentCommunications.length > 0 ? (
                  <div className="space-y-4">
                    {recentCommunications.map((communication) => (
                      <div key={communication.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          {getStatusIcon(communication.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium truncate">{communication.subject}</h4>
                            <Badge className={getStatusColor(communication.status)}>
                              {communication.status === 'pending' ? 'قيد المراجعة' :
                               communication.status === 'in_progress' ? 'جاري المعالجة' :
                               communication.status === 'completed' ? 'مكتملة' : communication.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{communication.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(new Date(communication.createdAt))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد رسائل بعد</h3>
                    <p className="text-gray-500 mb-4">ابدأ بإرسال رسالتك الأولى إلى الوزير</p>
                    <Link href="/">
                      <Button>
                        <Send className="h-4 w-4 ml-2" />
                        إرسال رسالة جديدة
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  إجراءات سريعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/">
                  <Button className="w-full justify-start" variant="outline">
                    <Send className="h-4 w-4 ml-2" />
                    إرسال رسالة جديدة
                  </Button>
                </Link>
                <Link href="/dashboard/communications">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 ml-2" />
                    عرض جميع الرسائل
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline">
                  <Bell className="h-4 w-4 ml-2" />
                  إعدادات التنبيهات
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 ml-2" />
                  التواصل مع الدعم
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  النشاط الأخير
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity && recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-gray-500">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(new Date(activity.date))}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">لا يوجد نشاط حديث</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Engagement Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">نصائح للتواصل الفعال</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-1.5"></div>
                    <p>كن واضحاً ومحدداً في موضوع الرسالة</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-1.5"></div>
                    <p>أرفق المستندات المساعدة إذا أمكن</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-1.5"></div>
                    <p>استخدم لغة مهذبة ومهنية</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;