import React from 'react';
import ministryLogo from '../../assets/ministry-logo.png';

const SimpleFooter: React.FC = () => {
  // Get the current year for the copyright
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mb-4 md:mb-0">© {currentYear} وزارة الاتصالات وتقانة المعلومات. جميع الحقوق محفوظة.</p>
          
          {/* Syrian Emblem in the middle */}
          <div className="mb-4 md:mb-0 flex justify-center">
            <img 
              src={ministryLogo} 
              alt="شعار الجمهورية العربية السورية" 
              className="h-16 w-auto opacity-80"
            />
          </div>
          
          <div className="flex space-x-4 space-x-reverse">
            <a href="#" className="text-white hover:text-gray-200 text-sm">سياسة الخصوصية</a>
            <a href="#" className="text-white hover:text-gray-200 text-sm">شروط الاستخدام</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;