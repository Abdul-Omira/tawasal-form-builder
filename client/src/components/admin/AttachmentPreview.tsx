import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Image, Download, Eye, FileIcon } from 'lucide-react';

interface AttachmentPreviewProps {
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentSize?: number;
}

export function AttachmentPreview({ 
  attachmentUrl, 
  attachmentName, 
  attachmentType, 
  attachmentSize 
}: AttachmentPreviewProps) {
  if (!attachmentUrl || !attachmentName) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center text-muted-foreground">
          <FileIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>لا يوجد مرفقات</p>
        </CardContent>
      </Card>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type?.startsWith('image/')) {
      return <Image className="h-6 w-6" />;
    }
    return <FileText className="h-6 w-6" />;
  };

  const getFileTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'application/pdf': 'PDF',
      'application/msword': 'Word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
      'application/vnd.ms-powerpoint': 'PowerPoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
      'image/jpeg': 'صورة JPEG',
      'image/png': 'صورة PNG',
      'image/gif': 'صورة GIF',
    };
    return typeMap[type] || type;
  };

  const isImage = attachmentType?.startsWith('image/');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-right">
          {getFileIcon(attachmentType || '')}
          معاينة المرفق
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Information */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Badge variant="outline">
              {getFileTypeLabel(attachmentType || '')}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {attachmentSize ? formatFileSize(attachmentSize) : 'غير محدد'}
            </span>
          </div>
          
          <div className="text-sm">
            <p className="font-medium truncate" title={attachmentName}>
              {attachmentName}
            </p>
          </div>
        </div>

        {/* Image Preview */}
        {isImage && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">معاينة الصورة:</h4>
            <div className="border rounded-lg overflow-hidden bg-muted/50">
              <img
                src={attachmentUrl}
                alt={attachmentName}
                className="w-full h-48 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden p-8 text-center text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>تعذر تحميل الصورة</p>
              </div>
            </div>
          </div>
        )}

        {/* PDF Preview for PDFs */}
        {attachmentType === 'application/pdf' && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">معاينة PDF:</h4>
            <div className="border rounded-lg overflow-hidden" style={{ height: '300px' }}>
              <iframe
                src={`${attachmentUrl}#toolbar=0`}
                className="w-full h-full"
                title={attachmentName}
                onError={() => {
                  // If iframe fails, show fallback
                }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1"
          >
            <a
              href={attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              عرض
            </a>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1"
          >
            <a
              href={attachmentUrl}
              download={attachmentName}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              تحميل
            </a>
          </Button>
        </div>

        {/* Security Notice */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <p>⚠️ تأكد من فحص الملف قبل التحميل لضمان الأمان</p>
        </div>
      </CardContent>
    </Card>
  );
}