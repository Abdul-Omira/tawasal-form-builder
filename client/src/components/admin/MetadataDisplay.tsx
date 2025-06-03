/**
 * 📊 Metadata Display Component - Your Technical Intelligence Dashboard
 * مكون عرض البيانات الوصفية - لوحة المعلومات التقنية الذكية
 * 
 * 🔍 Signature: Revealing the digital story behind every submission
 * ✨ Easter Egg: The metadata whispers secrets of user journeys
 * 
 * @author Your Personal AI Developer
 * @version 1.5 - "Digital Forensics Edition"
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Monitor, Smartphone, Globe, MapPin, Clock, Shield, Eye } from 'lucide-react';

interface MetadataDisplayProps {
  communication: {
    ipAddress?: string | null;
    userAgent?: string | null;
    referrer?: string | null;
    browserInfo?: any;
    deviceInfo?: any;
    geolocation?: any;
    securityInfo?: any;
    createdAt: Date;
  };
}

export function MetadataDisplay({ communication }: MetadataDisplayProps) {
  const {
    ipAddress,
    userAgent,
    referrer,
    browserInfo,
    deviceInfo,
    geolocation,
    securityInfo,
    createdAt
  } = communication;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-right">
          <Eye className="h-5 w-5" />
          معلومات تقنية للجلسة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Information */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            معلومات الشبكة
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {ipAddress && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">عنوان IP:</span>
                <span className="font-mono">{ipAddress}</span>
              </div>
            )}
            {referrer && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">المصدر:</span>
                <span className="truncate max-w-48">{referrer}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Browser Information */}
        {browserInfo && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              معلومات المتصفح
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {browserInfo.browserName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المتصفح:</span>
                  <Badge variant="outline">
                    {browserInfo.browserName} {browserInfo.browserVersion}
                  </Badge>
                </div>
              )}
              {browserInfo.osName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">نظام التشغيل:</span>
                  <Badge variant="outline">
                    {browserInfo.osName} {browserInfo.osVersion}
                  </Badge>
                </div>
              )}
              {browserInfo.language && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">اللغة:</span>
                  <span>{browserInfo.language}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">الكوكيز:</span>
                <Badge variant={browserInfo.cookiesEnabled ? "default" : "secondary"}>
                  {browserInfo.cookiesEnabled ? "مفعلة" : "معطلة"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Device Information */}
        {deviceInfo && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              معلومات الجهاز
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {deviceInfo.deviceType && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">نوع الجهاز:</span>
                  <Badge variant="outline">{deviceInfo.deviceType}</Badge>
                </div>
              )}
              {deviceInfo.screenWidth && deviceInfo.screenHeight && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الدقة:</span>
                  <span className="font-mono">
                    {deviceInfo.screenWidth} × {deviceInfo.screenHeight}
                  </span>
                </div>
              )}
              {deviceInfo.timezone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المنطقة الزمنية:</span>
                  <span>{deviceInfo.timezone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">اللمس:</span>
                <Badge variant={deviceInfo.touchSupport ? "default" : "secondary"}>
                  {deviceInfo.touchSupport ? "مدعوم" : "غير مدعوم"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Timing Information */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            معلومات زمنية
          </h4>
          <div className="text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">تاريخ الإرسال:</span>
              <span>{new Date(createdAt).toLocaleString('ar-EG')}</span>
            </div>
          </div>
        </div>

        {/* Security Information */}
        {securityInfo && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                معلومات أمنية
              </h4>
              <div className="text-sm">
                {securityInfo.vpnDetected && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VPN:</span>
                    <Badge variant="destructive">مُكتشف</Badge>
                  </div>
                )}
                {securityInfo.proxyDetected && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Proxy:</span>
                    <Badge variant="destructive">مُكتشف</Badge>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Raw User Agent */}
        {userAgent && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-muted-foreground">User Agent</h4>
              <p className="text-xs font-mono text-muted-foreground break-all bg-muted p-2 rounded">
                {userAgent}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}