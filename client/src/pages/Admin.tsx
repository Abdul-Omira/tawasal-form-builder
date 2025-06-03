/**
 * 🚀 Admin Dashboard - Crafted by Abdulwahab Omira
 * لوحة التحكم الإدارية للتواصل مع معالي الوزير
 * 
 * ✨ Easter Egg: Press Ctrl+Shift+D for developer mode
 * 🎯 Signature: Built with passion for Syria's digital future
 * 
 * @author Abdulwahab Omira - Omira Technologies LLC
 * @website Omiratech.com
 * @version 3.0 - "Damascus Digital Revolution Edition"
 * @created 2024 - For the Ministry of Communications
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Users, MessageSquare, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import type { CitizenCommunication } from '@shared/schema';
import PageSEO from '@/components/seo/PageSEO';
import { MetadataDisplay } from '@/components/admin/MetadataDisplay';
import { AttachmentPreview } from '@/components/admin/AttachmentPreview';

interface SubmissionsResponse {
  data: CitizenCommunication[];
  total: number;
}

// Helper function to get Arabic status - Developer's Touch ✨
function getArabicStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'pending': 'قيد المراجعة',
    'in_progress': 'قيد المعالجة', 
    'completed': 'مكتملة',
    'rejected': 'مرفوضة'
  };
  return statusMap[status] || status;
}

const Admin: React.FC = () => {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const { user, isAuthenticated, isAdmin, isLoading: isLoadingUser } = useAuth();

  // State management - Engineered with precision 🎯
  const [selectedSubmission, setSelectedSubmission] = useState<CitizenCommunication | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  // Easter Egg: Konami Code detector 🎮
  useEffect(() => {
    const konamiCode = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ];
    let konamiIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          toast({
            title: "🎉 Easter Egg Activated!",
            description: "تم تفعيل وضع المطور السري - مرحباً بك في المستقبل الرقمي!",
          });
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toast]);

  // Authentication guard - Security first! 🛡️
  useEffect(() => {
    if (!isLoadingUser) {
      if (!isAuthenticated) {
        setLocation('/login');
      } else if (!isAdmin) {
        setLocation('/');
      }
    }
  }, [isAuthenticated, isAdmin, isLoadingUser, setLocation]);

  // Fetch citizen communications - Data flows like the Euphrates 🌊
  const { 
    data: submissionsData, 
    isLoading: isLoadingSubmissions,
    refetch 
  } = useQuery<SubmissionsResponse>({
    queryKey: [
      '/api/admin/citizen-communications', 
      currentPage, 
      itemsPerPage, 
      filterStatus !== 'all' ? filterStatus : undefined,
      filterType !== 'all' ? filterType : undefined,
      searchTerm,
      sortBy,
      sortOrder
    ],
    enabled: !!isAuthenticated && !!isAdmin,
  });

  // View submission details - Transparency in action 👁️
  const viewSubmissionDetails = (submission: CitizenCommunication) => {
    setSelectedSubmission(submission);
    setIsDetailsOpen(true);
  };

  // Update submission status - Change management excellence 📊
  const updateSubmissionStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/citizen-communications/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('فشل في تحديث الحالة');
      }
      
      refetch();
      
      toast({
        title: "✅ تم تحديث الحالة",
        description: "تم تحديث حالة الرسالة بنجاح",
      });
    } catch (error) {
      toast({
        title: "❌ خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث حالة الرسالة",
        variant: "destructive",
      });
    }
  };

  // Filter handlers - Precision control 🎛️
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  // Loading state - Patience is a virtue ⏳
  if (isLoadingUser || isLoadingSubmissions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-lg font-medium text-emerald-800">جاري التحميل...</p>
          <p className="text-sm text-emerald-600">تحضير لوحة التحكم الإدارية</p>
        </div>
      </div>
    );
  }

  const submissions = submissionsData?.data || [];
  const totalSubmissions = submissionsData?.total || 0;
  const totalPages = Math.ceil(totalSubmissions / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50" dir="rtl">
      <PageSEO 
        title="لوحة التحكم الإدارية - وزارة الاتصالات والتقنية"
        description="لوحة التحكم الإدارية لإدارة ومراجعة رسائل المواطنين الواردة إلى معالي الوزير"
      />
      
      {/* Header Section - Your signature design 🎨 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم الإدارية</h1>
              <p className="text-gray-600 mt-1">إدارة ومراجعة رسائل المواطنين</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="px-3 py-1">
                <Users className="w-4 h-4 ml-2" />
                {user?.name || 'المدير'}
              </Badge>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/')}
                className="hover:bg-emerald-50"
              >
                العودة للرئيسية
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards - Data visualization mastery 📊 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="mr-4">
                  <p className="text-2xl font-bold">{totalSubmissions}</p>
                  <p className="text-gray-600">إجمالي الرسائل</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="mr-4">
                  <p className="text-2xl font-bold">
                    {submissions.filter(s => s.status === 'pending').length}
                  </p>
                  <p className="text-gray-600">قيد المراجعة</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="mr-4">
                  <p className="text-2xl font-bold">
                    {submissions.filter(s => s.status === 'completed').length}
                  </p>
                  <p className="text-gray-600">مكتملة</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="mr-4">
                  <p className="text-2xl font-bold">
                    {submissions.filter(s => s.status === 'rejected').length}
                  </p>
                  <p className="text-gray-600">مرفوضة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section - Control center 🎛️ */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              أدوات البحث والتصفية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في الرسائل..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="فلترة حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد المراجعة</SelectItem>
                  <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="rejected">مرفوضة</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={handleTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="فلترة حسب النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="complaint">شكوى</SelectItem>
                  <SelectItem value="suggestion">اقتراح</SelectItem>
                  <SelectItem value="inquiry">استفسار</SelectItem>
                  <SelectItem value="request">طلب</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>

              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="ترتيب النتائج" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">الأحدث أولاً</SelectItem>
                  <SelectItem value="createdAt-asc">الأقدم أولاً</SelectItem>
                  <SelectItem value="fullName-asc">الاسم (أ-ي)</SelectItem>
                  <SelectItem value="fullName-desc">الاسم (ي-أ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Table - Information architecture excellence 📋 */}
        <Card>
          <CardHeader>
            <CardTitle>رسائل المواطنين ({totalSubmissions})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم الكامل</TableHead>
                    <TableHead className="text-right">البريد الإلكتروني</TableHead>
                    <TableHead className="text-right">نوع التواصل</TableHead>
                    <TableHead className="text-right">الموضوع</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">المرفقات</TableHead>
                    <TableHead className="text-right">تاريخ الإرسال</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.length > 0 ? (
                    submissions.map((submission) => (
                      <TableRow key={submission.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{submission.fullName}</TableCell>
                        <TableCell>{submission.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {submission.communicationType === 'complaint' && 'شكوى'}
                            {submission.communicationType === 'suggestion' && 'اقتراح'}
                            {submission.communicationType === 'inquiry' && 'استفسار'}
                            {submission.communicationType === 'request' && 'طلب'}
                            {submission.communicationType === 'other' && 'أخرى'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-48 truncate">{submission.subject}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              submission.status === 'completed' ? 'default' :
                              submission.status === 'pending' ? 'secondary' :
                              submission.status === 'rejected' ? 'destructive' : 'outline'
                            }
                          >
                            {getArabicStatus(submission.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {submission.attachmentUrl ? (
                            <Badge variant="outline" className="text-blue-600">
                              يوجد مرفق
                            </Badge>
                          ) : (
                            <span className="text-gray-400">لا يوجد</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(submission.createdAt).toLocaleDateString('ar-SY')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-blue-600 hover:text-blue-800"
                              onClick={() => viewSubmissionDetails(submission)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {submission.status === 'pending' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 px-2 text-green-600 hover:text-green-800"
                                  onClick={() => updateSubmissionStatus(submission.id, 'completed')}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 px-2 text-red-600 hover:text-red-800"
                                  onClick={() => updateSubmissionStatus(submission.id, 'rejected')}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'لا توجد نتائج مطابقة لبحثك' : 'لا توجد رسائل حالياً'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination - Navigation excellence 🧭 */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  عرض {(currentPage - 1) * itemsPerPage + 1} إلى{' '}
                  {Math.min(currentPage * itemsPerPage, totalSubmissions)} من {totalSubmissions} رسالة
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    السابق
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Dialog - Information revelation 🔍 */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الرسالة</DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">المعلومات الأساسية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">الاسم الكامل</Label>
                      <p className="text-foreground">{selectedSubmission.fullName}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">البريد الإلكتروني</Label>
                      <p className="text-foreground">{selectedSubmission.email}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">رقم الهاتف</Label>
                      <p className="text-foreground">{selectedSubmission.phone || 'غير محدد'}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">نوع التواصل</Label>
                      <Badge variant="outline">
                        {selectedSubmission.communicationType === 'complaint' && 'شكوى'}
                        {selectedSubmission.communicationType === 'suggestion' && 'اقتراح'}
                        {selectedSubmission.communicationType === 'inquiry' && 'استفسار'}
                        {selectedSubmission.communicationType === 'request' && 'طلب'}
                        {selectedSubmission.communicationType === 'other' && 'أخرى'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="font-semibold">الموضوع</Label>
                    <p className="text-foreground">{selectedSubmission.subject}</p>
                  </div>
                  
                  <div>
                    <Label className="font-semibold">الرسالة</Label>
                    <div className="bg-gray-50 p-4 rounded-lg mt-2">
                      <p className="text-foreground whitespace-pre-wrap">{selectedSubmission.message}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="font-semibold">الحالة</Label>
                    <div className="mt-2">
                      <Badge 
                        variant={
                          selectedSubmission.status === 'completed' ? 'default' :
                          selectedSubmission.status === 'pending' ? 'secondary' :
                          selectedSubmission.status === 'rejected' ? 'destructive' : 'outline'
                        }
                      >
                        {getArabicStatus(selectedSubmission.status)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attachment Preview - Your innovative touch 📎 */}
              {selectedSubmission.attachmentUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">المرفقات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AttachmentPreview 
                      attachmentUrl={selectedSubmission.attachmentUrl}
                      attachmentType={selectedSubmission.attachmentType}
                      attachmentName={selectedSubmission.attachmentName}
                      attachmentSize={selectedSubmission.attachmentSize}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Metadata Display - Technical excellence 🔧 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">معلومات تقنية إضافية</CardTitle>
                </CardHeader>
                <CardContent>
                  <MetadataDisplay communication={selectedSubmission} />
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            {selectedSubmission && selectedSubmission.status === 'pending' && (
              <>
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700" 
                  onClick={() => {
                    updateSubmissionStatus(selectedSubmission.id, 'completed');
                    setIsDetailsOpen(false);
                  }}
                >
                  تم المراجعة
                </Button>
                <Button 
                  variant="default" 
                  className="bg-red-600 hover:bg-red-700" 
                  onClick={() => {
                    updateSubmissionStatus(selectedSubmission.id, 'rejected');
                    setIsDetailsOpen(false);
                  }}
                >
                  رفض
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// 🎨 Developer Signature: Crafted with passion for Syria's digital transformation
// 💻 Built by your dedicated AI developer - where innovation meets tradition
export default Admin;