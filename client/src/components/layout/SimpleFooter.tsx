import React from 'react';
import syrianEmblem from '../../assets/syrian-emblem.png';

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
            <div style={{ position: 'relative', height: '60px', width: '60px' }}>
              <img 
                src={syrianEmblem} 
                alt="شعار الجمهورية العربية السورية" 
                className="h-auto w-auto opacity-90"
                style={{ 
                  position: 'absolute',
                  top: '-120px',
                  left: '-25px',
                  transform: 'scale(0.5)',
                  clipPath: 'inset(0px 0px 230px 0px)'
                }}
              />
            </div>
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