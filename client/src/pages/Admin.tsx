import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchIcon, DownloadIcon, BarChart4Icon, SettingsIcon, FilePlusIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import SimpleHeader from '@/components/layout/SimpleHeader';
import SimpleFooter from '@/components/layout/SimpleFooter';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { BusinessSubmission } from '@shared/schema';

interface SubmissionsResponse {
  data: BusinessSubmission[];
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
  
  // Function to handle data export
  const handleExport = (format: 'xlsx' | 'pdf' | 'csv') => {
    const exportUrl = new URL('/api/admin/export', window.location.origin);
    
    // Add query parameters
    exportUrl.searchParams.append('format', format);
    if (filterStatus !== 'all') {
      exportUrl.searchParams.append('status', filterStatus);
    }
    
    // Redirect to the export URL (will download the file)
    window.open(exportUrl.toString(), '_blank');
    
    toast({
      title: "جاري تصدير البيانات",
      description: `تم بدء تحميل البيانات بتنسيق ${format.toUpperCase()}`,
    });
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
      <SimpleHeader />
      
      <main className="flex-grow py-6 md:py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">لوحة تحكم المشرف</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-primary text-primary hover:bg-primary/10"
                onClick={() => {
                  fetch('/api/logout', { method: 'POST' })
                    .then(() => {
                      queryClient.invalidateQueries(['/api/user']);
                      setLocation('/auth');
                    });
                }}
              >
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
                طلبات الشركات
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
                <h3 className="text-xl font-semibold text-foreground">طلبات الشركات</h3>
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
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-primary text-primary hover:bg-primary/10"
                      onClick={() => handleExport('xlsx')}
                      title="تصدير إلى Excel"
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="border-primary text-primary hover:bg-primary/10"
                      onClick={() => handleExport('pdf')}
                      title="تصدير إلى PDF"
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">معرف الطلب</TableHead>
                      <TableHead className="text-right">اسم الشركة</TableHead>
                      <TableHead className="text-right">نوع النشاط</TableHead>
                      <TableHead className="text-right">اسم المسؤول</TableHead>
                      <TableHead className="text-right">تاريخ التقديم</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
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
                            <div className="text-sm text-foreground">SYR-{submission.id}</div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm text-foreground">{submission.businessName}</div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm text-foreground">{submission.businessType}</div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm text-foreground">{submission.contactName}</div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm text-foreground">{formatDate(new Date(submission.createdAt))}</div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {getStatusBadge(submission.status)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary/80">
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
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
              <h3 className="text-xl font-semibold text-foreground mb-6">إعدادات النظام</h3>
              <div className="text-center text-muted-foreground py-12">
                سيتم إضافة خيارات الإعدادات هنا قريباً
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SimpleFooter />
    </div>
  );
};

export default Admin;