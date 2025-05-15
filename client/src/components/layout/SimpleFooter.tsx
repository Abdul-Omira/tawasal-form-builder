import React from 'react';

const SimpleFooter: React.FC = () => {
  return (
    <footer className="bg-primary text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mb-2 md:mb-0">© 2023 وزارة الاتصالات وتقانة المعلومات. جميع الحقوق محفوظة.</p>
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