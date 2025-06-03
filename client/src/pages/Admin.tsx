import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchIcon, DownloadIcon, BarChart4Icon, SettingsIcon, FilePlusIcon, LockIcon, ShieldIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import SimpleHeader from '@/components/layout/SimpleHeader';
import SimpleFooter from '@/components/layout/SimpleFooter';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { CitizenCommunication } from '@shared/schema';
import ChangePasswordForm from '@/components/auth/ChangePasswordForm';
import PageSEO from '@/components/seo/PageSEO';

interface SubmissionsResponse {
  data: CitizenCommunication[];
  total: number;
}

const Admin: React.FC = () => {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const { user, isLoading: isLoadingUser, isAuthenticated, isAdmin } = useAuth();
  
  // Filtering and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Communication details dialog state
  const [selectedSubmission, setSelectedSubmission] = useState<CitizenCommunication | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Handle authentication and authorization redirects
  useEffect(() => {
    if (!isLoadingUser) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        setLocation('/auth');
      } else if (!isAdmin) {
        // Redirect non-admin users to the homepage
        setLocation('/');
      }
    }
  }, [isAuthenticated, isAdmin, isLoadingUser, setLocation]);

  // Fetch submissions with the admin API
  const { 
    data: submissionsData, 
    isLoading: isLoadingSubmissions,
    refetch 
  } = useQuery<SubmissionsResponse>({
    queryKey: [
      '/api/admin/business-submissions', 
      currentPage, 
      itemsPerPage, 
      filterStatus !== 'all' ? filterStatus : undefined,
      searchTerm,
      sortBy,
      sortOrder
    ],
    enabled: !!isAuthenticated && !!isAdmin, // Only fetch if user is admin
  });
  
  // Export functionality removed as requested
  
  // View submission details
  const viewSubmissionDetails = (submission: BusinessSubmission) => {
    setSelectedSubmission(submission);
    setIsDetailsOpen(true);
  };
  
  // Close details dialog
  const closeDetails = () => {
    setIsDetailsOpen(false);
  };
  
  // Update submission status function
  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/business-submissions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      // Refresh data
      refetch();
      
      toast({
        title: "تم تحديث الحالة",
        description: "تم تحديث حالة الطلب بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الحالة",
        variant: "destructive",
      });
    }
  };
  
  // Get status badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">قيد الانتظار</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">تمت الموافقة</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">مرفوض</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };
  
  // Helper function to get human-readable challenge labels
  const getChallengeLabel = (challenge: string) => {
    const challengeLabels: Record<string, string> = {
      'sanctions': 'العقوبات',
      'internet': 'مشاكل الإنترنت',
      'banking': 'صعوبات مصرفية',
      'software': 'برمجيات محظورة',
      'hardware': 'معدات محظورة',
      'shipping': 'شحن وتوصيل',
      'other': 'أخرى'
    };
    
    return challengeLabels[challenge] || challenge;
  };
  
  // Helper function to get human-readable tech need labels
  const getTechNeedLabel = (need: string) => {
    const techNeedLabels: Record<string, string> = {
      'internet_access': 'وصول للإنترنت',
      'cloud_services': 'خدمات سحابية',
      'software_access': 'وصول للبرمجيات',
      'technical_support': 'دعم فني',
      'training': 'تدريب',
      'localization': 'توطين',
      'other': 'أخرى'
    };
    
    return techNeedLabels[need] || need;
  };

  // Check if data is loading
  const isLoading = isLoadingUser || isLoadingSubmissions;
  
  // Pagination helpers
  const totalPages = submissionsData?.total ? Math.ceil(submissionsData.total / itemsPerPage) : 1;
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-foreground">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // If user is not admin, show access denied
  if (!isLoadingUser && (!isAuthenticated || !isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-foreground mb-2">صلاحيات غير كافية</h2>
          <p className="text-lg text-muted-foreground mb-6">ليس لديك الصلاحيات اللازمة للوصول إلى لوحة التحكم</p>
          <Button onClick={() => setLocation('/auth')}>تسجيل الدخول</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageSEO 
        pageName="admin"
        customTitle="لوحة تحكم المشرف - إدارة رسائل المواطنين"
        customDescription="لوحة تحكم إدارة رسائل المواطنين في منصة التواصل المباشر مع وزير الاتصالات وتقانة المعلومات"
      />
      <SimpleHeader />
      
      <main className="flex-grow py-6 md:py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-foreground">لوحة تحكم المشرف</h2>
                <Badge className="mr-3 bg-green-100 text-green-800 hover:bg-green-100 px-2 py-1">
                  <ShieldIcon className="h-3.5 w-3.5 ml-1" />
                  نظام آمن ومشفر
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">جميع البيانات الحساسة مشفرة باستخدام خوارزمية AES-256</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => setLocation('/dashboard')}
              >
                <BarChart4Icon className="h-3.5 w-3.5 ml-2" />
                لوحة التفاعل
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-primary text-primary hover:bg-primary/10"
                onClick={() => {
                  fetch('/api/logout', { method: 'POST' })
                    .then(() => {
                      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
                      setLocation('/auth');
                    });
                }}
              >
                <LockIcon className="h-3.5 w-3.5 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الطلبات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {isLoading ? '...' : submissionsData?.total || 0}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">قيد الانتظار</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {isLoading ? '...' : (submissionsData?.data?.filter(s => s.status === 'pending').length || 0)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">تمت الموافقة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {isLoading ? '...' : (submissionsData?.data?.filter(s => s.status === 'approved').length || 0)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">مرفوض</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {isLoading ? '...' : (submissionsData?.data?.filter(s => s.status === 'rejected').length || 0)}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="submissions" className="bg-white rounded-lg shadow-md">
            <TabsList className="w-full md:w-auto grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-white">
              <TabsTrigger value="submissions" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <FilePlusIcon className="ml-2 h-4 w-4" />
                رسائل المواطنين
              </TabsTrigger>
              <TabsTrigger value="statistics" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <BarChart4Icon className="ml-2 h-4 w-4" />
                الإحصائيات
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <SettingsIcon className="ml-2 h-4 w-4" />
                الإعدادات
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="submissions" className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-xl font-semibold text-foreground">رسائل المواطنين</h3>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="البحث..."
                      className="pl-10 w-full"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page on search
                      }}
                    />
                  </div>
                  <Select 
                    value={filterStatus} 
                    onValueChange={(value) => {
                      setFilterStatus(value);
                      setCurrentPage(1); // Reset to first page on filter change
                    }}
                  >
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="جميع الطلبات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الطلبات</SelectItem>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="approved">تمت الموافقة</SelectItem>
                      <SelectItem value="rejected">مرفوض</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Export buttons removed as requested */}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">معرف الرسالة</TableHead>
                      <TableHead className="text-right">الاسم الكامل</TableHead>
                      <TableHead className="text-right">نوع التواصل</TableHead>
                      <TableHead className="text-right">موضوع الرسالة</TableHead>
                      <TableHead className="text-right">البريد الإلكتروني</TableHead>
                      <TableHead className="text-right">رقم الهاتف</TableHead>
                      <TableHead className="text-right">المرفقات</TableHead>
                      <TableHead className="text-right">تاريخ الإرسال</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-8">
                          <div className="flex justify-center">
                            <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : submissionsData?.data && submissionsData.data.length > 0 ? (
                      submissionsData.data.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm text-foreground">MSG-{submission.id}</div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm text-foreground">{submission.fullName}</div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm text-foreground">{submission.communicationType}</div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm text-foreground">{submission.subject}</div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm text-foreground">{submission.email}</div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm text-foreground">{submission.phone || <span className="text-muted-foreground text-xs">غير محدد</span>}</div>
                          </TableCell>
                          <TableCell className="whitespace-normal">
                            <div className="text-sm text-foreground">
                              {submission.attachmentUrl ? (
                                <div className="flex flex-col gap-1">
                                  <span className="text-green-600 font-medium">نعم</span>
                                  <a 
                                    href={submission.attachmentUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline text-xs truncate max-w-[120px]"
                                    title={submission.attachmentName || 'عرض الملف'}
                                  >
                                    {submission.attachmentName || 'عرض الملف'}
                                  </a>
                                  {submission.attachmentType && (
                                    <span className="text-muted-foreground text-xs">
                                      {submission.attachmentType.includes('image') ? '📷 صورة' : 
                                       submission.attachmentType.includes('pdf') ? '📄 PDF' : 
                                       '📎 ملف'}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">لا</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm text-foreground">{formatDate(new Date(submission.createdAt))}</div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {getStatusBadge(submission.status)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-primary hover:text-primary/80"
                              onClick={() => viewSubmissionDetails(submission)}
                            >
                              عرض
                            </Button>
                            {submission.status === 'pending' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 px-2 text-green-600 hover:text-green-800"
                                  onClick={() => updateStatus(submission.id, 'approved')}
                                >
                                  موافقة
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 px-2 text-red-600 hover:text-red-800"
                                  onClick={() => updateStatus(submission.id, 'rejected')}
                                >
                                  رفض
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                          {searchTerm ? 'لا توجد نتائج مطابقة لبحثك' : 'لا توجد طلبات حاليًا'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {submissionsData?.data && submissionsData.data.length > 0 && (
                <div className="mt-6 flex justify-between items-center flex-wrap gap-4">
                  <div className="text-sm text-muted-foreground">
                    إظهار <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>{' '}
                    إلى{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, submissionsData.total)}
                    </span>{' '}
                    من <span className="font-medium">{submissionsData.total}</span> سجل
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      className="text-sm"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      السابق
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <Button
                          key={index}
                          variant={pageNumber === currentPage ? "default" : "outline"}
                          className="text-sm"
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                    <Button 
                      variant="outline" 
                      className="text-sm"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      التالي
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="statistics" className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6">إحصائيات الطلبات</h3>
              <div className="text-center text-muted-foreground py-12">
                سيتم إضافة رسوم بيانية هنا قريباً
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6">إعدادات الحساب</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>معلومات الحساب</CardTitle>
                      <CardDescription>عرض معلومات حسابك الحالية</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-1">
                        <Label>اسم المستخدم</Label>
                        <div className="font-medium">{user?.username}</div>
                      </div>
                      <div className="grid gap-1">
                        <Label>الاسم</Label>
                        <div className="font-medium">{user?.name || "—"}</div>
                      </div>
                      <div className="grid gap-1">
                        <Label>الصلاحيات</Label>
                        <div className="font-medium">
                          <Badge variant={user?.isAdmin ? "default" : "secondary"}>
                            {user?.isAdmin ? "مدير النظام" : "موظف"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <ChangePasswordForm />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SimpleFooter />
      
      {/* Submission Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">تفاصيل الطلب</DialogTitle>
            <DialogDescription>
              معلومات مفصلة عن الطلب المقدم
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6 mt-4 rtl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">معلومات الشركة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="font-semibold">اسم الشركة</Label>
                      <div className="text-foreground">{selectedSubmission.businessName}</div>
                    </div>
                    <div>
                      <Label className="font-semibold">نوع النشاط</Label>
                      <div className="text-foreground">{selectedSubmission.businessType}</div>
                    </div>
                    <div>
                      <Label className="font-semibold">عدد الموظفين</Label>
                      <div className="text-foreground">{selectedSubmission.employeesCount}</div>
                    </div>
                    <div>
                      <Label className="font-semibold">تاريخ التأسيس</Label>
                      <div className="text-foreground">{selectedSubmission.establishmentDate}</div>
                    </div>
                    <div>
                      <Label className="font-semibold">رقم التسجيل</Label>
                      <div className="text-foreground">{selectedSubmission.registrationNumber}</div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Contact Information */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">معلومات الاتصال</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="font-semibold">اسم المسؤول</Label>
                      <div className="text-foreground">{selectedSubmission.contactName}</div>
                    </div>
                    <div>
                      <Label className="font-semibold">المنصب</Label>
                      <div className="text-foreground">{selectedSubmission.position}</div>
                    </div>
                    <div>
                      <Label className="font-semibold">البريد الإلكتروني</Label>
                      <div className="text-foreground">{selectedSubmission.email}</div>
                    </div>
                    <div>
                      <Label className="font-semibold">رقم الهاتف</Label>
                      <div className="text-foreground">{selectedSubmission.phone}</div>
                    </div>
                    {selectedSubmission.alternativeContact && (
                      <div>
                        <Label className="font-semibold">رقم هاتف بديل</Label>
                        <div className="text-foreground">{selectedSubmission.alternativeContact}</div>
                      </div>
                    )}
                    <div>
                      <Label className="font-semibold">العنوان</Label>
                      <div className="text-foreground">
                        {selectedSubmission.address}, {selectedSubmission.governorate}
                      </div>
                    </div>
                    {selectedSubmission.website && (
                      <div>
                        <Label className="font-semibold">الموقع الإلكتروني</Label>
                        <div className="text-foreground">{selectedSubmission.website}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Challenges and Sanctions Information */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">معلومات العقوبات والتحديات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="font-semibold">التحديات</Label>
                    <div className="text-foreground mt-1">
                      {selectedSubmission.challenges && selectedSubmission.challenges.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedSubmission.challenges.map((challenge, index) => (
                            <Badge key={index} className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                              {getChallengeLabel(challenge)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">لم يتم تحديد تحديات</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                    <Label className="font-semibold text-lg text-primary pb-2 block border-b border-amber-200 mb-3">
                      الشركات المتأثرة بالإجراءات الأميركية
                    </Label>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="font-semibold text-primary/90">اسم الشركات التي ترغب بتسريع إتاحتها للخدمات في سورية</Label>
                        <div className="text-foreground p-3 bg-white rounded-md mt-1 shadow-sm">
                          {selectedSubmission.challengeDetails || "لا توجد تفاصيل"}
                        </div>
                      </div>
                      
                      {selectedSubmission.sanctionedCompanyName && (
                        <div>
                          <Label className="font-semibold text-primary/90">التحدي الرئيسي للشركات المذكورة</Label>
                          <div className="text-foreground p-3 bg-white rounded-md mt-1 shadow-sm">
                            {selectedSubmission.sanctionedCompanyName}
                          </div>
                        </div>
                      )}
                      
                      {selectedSubmission.sanctionedCompanyLink && (
                        <div>
                          <Label className="font-semibold text-primary/90">روابط الشركات</Label>
                          <div className="text-foreground p-3 bg-white rounded-md mt-1 shadow-sm">
                            {selectedSubmission.sanctionedCompanyLink}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="font-semibold">الاحتياجات التقنية</Label>
                    <div className="text-foreground mt-1">
                      {selectedSubmission.techNeeds && selectedSubmission.techNeeds.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedSubmission.techNeeds.map((need, index) => (
                            <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                              {getTechNeedLabel(need)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">لم يتم تحديد احتياجات تقنية</span>
                      )}
                    </div>
                  </div>
                  
                  {selectedSubmission.techDetails && (
                    <div>
                      <Label className="font-semibold">تفاصيل الاحتياجات التقنية</Label>
                      <div className="text-foreground p-2 bg-muted/30 rounded mt-1">
                        {selectedSubmission.techDetails}
                      </div>
                    </div>
                  )}
                  
                  {selectedSubmission.additionalComments && (
                    <div>
                      <Label className="font-semibold">ملاحظات إضافية</Label>
                      <div className="text-foreground p-2 bg-muted/30 rounded mt-1">
                        {selectedSubmission.additionalComments}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">الموافقة على استخدام البيانات</Label>
                      <div className="text-foreground">
                        {selectedSubmission.consentToDataUse ? 
                          <Badge variant="outline" className="bg-green-100 text-green-800">نعم</Badge> : 
                          <Badge variant="outline" className="bg-red-100 text-red-800">لا</Badge>}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="font-semibold">يرغب في تلقي تحديثات</Label>
                      <div className="text-foreground">
                        {selectedSubmission.wantsUpdates ? 
                          <Badge variant="outline" className="bg-green-100 text-green-800">نعم</Badge> : 
                          <Badge variant="outline" className="bg-red-100 text-red-800">لا</Badge>}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="font-semibold">الحالة الحالية</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedSubmission.status)}
                    </div>
                  </div>
                  
                  {selectedSubmission.attachmentUrl && (
                    <div>
                      <Label className="font-semibold">المرفقات</Label>
                      <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {selectedSubmission.attachmentType?.includes('image') ? '📷' : 
                             selectedSubmission.attachmentType?.includes('pdf') ? '📄' : '📎'}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-foreground">
                              {selectedSubmission.attachmentName || 'ملف مرفق'}
                            </div>
                            {selectedSubmission.attachmentType && (
                              <div className="text-sm text-muted-foreground">
                                نوع الملف: {selectedSubmission.attachmentType}
                              </div>
                            )}
                            {selectedSubmission.attachmentSize && (
                              <div className="text-sm text-muted-foreground">
                                الحجم: {(selectedSubmission.attachmentSize / 1024 / 1024).toFixed(2)} MB
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a 
                              href={selectedSubmission.attachmentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              تحميل
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="font-semibold">تاريخ التقديم</Label>
                    <div className="text-foreground">
                      {new Date(selectedSubmission.createdAt).toLocaleDateString('ar-SY')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter className="mt-6 gap-2">
            {selectedSubmission && selectedSubmission.status === 'pending' && (
              <>
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700" 
                  onClick={() => {
                    updateStatus(selectedSubmission.id, 'approved');
                    closeDetails();
                  }}
                >
                  موافقة على الطلب
                </Button>
                <Button 
                  variant="default" 
                  className="bg-red-600 hover:bg-red-700" 
                  onClick={() => {
                    updateStatus(selectedSubmission.id, 'rejected');
                    closeDetails();
                  }}
                >
                  رفض الطلب
                </Button>
              </>
            )}
            <Button variant="outline" onClick={closeDetails}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;