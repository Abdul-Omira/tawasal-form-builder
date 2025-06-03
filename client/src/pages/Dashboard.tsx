import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Users, MessageSquare, Clock, TrendingUp, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

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

interface Communication {
  id: number;
  fullName: string;
  subject: string;
  communicationType: string;
  status: string;
  createdAt: string;
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'in_progress':
      return 'default';
    case 'completed':
      return 'default';
    default:
      return 'outline';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'pending':
      return 'في الانتظار';
    case 'in_progress':
      return 'قيد المعالجة';
    case 'completed':
      return 'مكتملة';
    default:
      return status;
  }
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: recentCommunications, isLoading: communicationsLoading } = useQuery<Communication[]>({
    queryKey: ['/api/dashboard/recent-communications'],
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery<RecentActivity[]>({
    queryKey: ['/api/dashboard/activity'],
  });

  if (statsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة تفاعل المواطنين</h1>
          <p className="text-gray-600 mt-2">نظرة شاملة على التواصل مع المواطنين</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart className="w-4 h-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرسائل</CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.totalCommunications || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              آخر 30 يوم
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في الانتظار</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.pendingCommunications || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              تحتاج للمراجعة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.completedCommunications || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              تم الرد عليها
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الاستجابة</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.responseRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              من إجمالي الرسائل
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="communications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="communications">الرسائل الأخيرة</TabsTrigger>
          <TabsTrigger value="activity">النشاط الأخير</TabsTrigger>
        </TabsList>

        <TabsContent value="communications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                الرسائل الأخيرة
              </CardTitle>
              <CardDescription>
                آخر الرسائل الواردة من المواطنين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {communicationsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentCommunications && recentCommunications.length > 0 ? (
                <div className="space-y-4">
                  {recentCommunications.map((comm) => (
                    <div key={comm.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{comm.subject}</h4>
                        <p className="text-sm text-gray-600">من: {comm.fullName}</p>
                        <p className="text-xs text-gray-500">{comm.communicationType}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={getStatusBadgeVariant(comm.status) as any}>
                          {getStatusText(comm.status)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comm.createdAt), { 
                            addSuffix: true, 
                            locale: ar 
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  لا توجد رسائل حديثة
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                النشاط الأخير
              </CardTitle>
              <CardDescription>
                آخر الأنشطة والتحديثات في النظام
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activityLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={getStatusBadgeVariant(activity.status)}>
                            {getStatusText(activity.status)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(activity.date), { 
                              addSuffix: true, 
                              locale: ar 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  لا يوجد نشاط حديث
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}