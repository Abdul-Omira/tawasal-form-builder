import React from 'react';
import { Link } from 'wouter';
import ministryLogo from '../../assets/ministry-logo.png';

const SimpleHeader: React.FC = () => {
  return (
    <header className="bg-white border-b border-border shadow-sm py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-center md:justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src={ministryLogo}
              alt="وزارة الاتصالات وتقانة المعلومات"
              className="h-24 w-auto"
            />
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/">
              <a className="text-primary hover:text-primary/80">
                الرئيسية
              </a>
            </Link>
            <Link href="/admin">
              <a className="text-muted-foreground hover:text-primary">
                لوحة التحكم
              </a>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;