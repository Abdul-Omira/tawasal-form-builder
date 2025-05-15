import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { SearchIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BusinessSubmission } from '@shared/schema';

const Admin: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: submissions, isLoading } = useQuery<BusinessSubmission[]>({
    queryKey: ['/api/business-submissions'],
  });

  // Filter submissions based on search term and status
  const filteredSubmissions = submissions?.filter(submission => {
    const matchesSearch = 
      submission.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.id.toString().includes(searchTerm);
    
    const matchesStatus = 
      filterStatus === 'all' || 
      submission.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('statusPending')}</Badge>;
      case 'processed':
        return <Badge className="bg-green-100 text-green-800">{t('statusProcessed')}</Badge>;
      case 'needs_info':
        return <Badge className="bg-red-100 text-red-800">{t('statusNeedsInfo')}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center text-foreground">{t('adminDashboard')}</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h3 className="text-xl font-semibold text-foreground">{t('businessRequests')}</h3>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={t('search')}
                    className="pr-10 pl-4 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                </div>
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value)}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder={t('allRequests')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allRequests')}</SelectItem>
                    <SelectItem value="pending">{t('statusPending')}</SelectItem>
                    <SelectItem value="processed">{t('statusProcessed')}</SelectItem>
                    <SelectItem value="needs_info">{t('statusNeedsInfo')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">{t('requestID')}</TableHead>
                    <TableHead className="text-right">{t('businessNameHeader')}</TableHead>
                    <TableHead className="text-right">{t('businessTypeHeader')}</TableHead>
                    <TableHead className="text-right">{t('governorateHeader')}</TableHead>
                    <TableHead className="text-right">{t('submissionDate')}</TableHead>
                    <TableHead className="text-right">{t('status')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
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
                  ) : filteredSubmissions && filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm text-foreground">SYR-2023-{submission.id}</div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm text-foreground">{submission.businessName}</div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm text-foreground">{t(submission.businessType)}</div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm text-foreground">{t(submission.governorate)}</div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm text-foreground">{formatDate(new Date(submission.createdAt))}</div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {getStatusBadge(submission.status)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          <Button variant="link" className="text-primary hover:text-primary/80 ml-3 p-0">
                            {t('view')}
                          </Button>
                          {submission.status === 'pending' && (
                            <Button variant="link" className="text-muted-foreground hover:text-foreground p-0">
                              {t('process')}
                            </Button>
                          )}
                          {submission.status === 'processed' && (
                            <Button variant="link" className="text-muted-foreground hover:text-foreground p-0">
                              {t('edit')}
                            </Button>
                          )}
                          {submission.status === 'needs_info' && (
                            <Button variant="link" className="text-muted-foreground hover:text-foreground p-0">
                              {t('contactAction')}
                            </Button>
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
            
            {filteredSubmissions && filteredSubmissions.length > 0 && (
              <div className="mt-6 flex justify-between items-center flex-wrap gap-4">
                <div className="text-sm text-muted-foreground">
                  {t('showing')} <span className="font-medium">1</span> {t('to')} <span className="font-medium">{filteredSubmissions.length}</span> {t('from')} <span className="font-medium">{submissions?.length}</span> {t('records')}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="text-sm">
                    {t('previous')}
                  </Button>
                  <Button variant="outline" className="bg-primary text-white hover:bg-primary/90 text-sm">
                    1
                  </Button>
                  <Button variant="outline" className="text-sm">
                    {t('next')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
