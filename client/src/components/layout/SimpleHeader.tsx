import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { MenuIcon, XIcon } from 'lucide-react';
import syriaLogo from '../../assets/syria-logo.png';

const SimpleHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm py-2 md:py-4 animate-smooth">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <motion.div
              className="relative flex items-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={syriaLogo}
                alt="شعار الجمهورية العربية السورية"
                className="h-20 md:h-28 w-auto hover-scale animate-smooth"
              />
              <div className="mr-3 md:mr-4">
                <h1 className="text-lg md:text-xl font-bold text-foreground">وزارة الاتصالات وتقانة المعلومات</h1>
                <p className="text-xs md:text-sm text-muted-foreground">الجمهورية العربية السورية</p>
              </div>
            </motion.div>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-primary hover:text-primary/80 font-medium animate-theme">
              الرئيسية
            </Link>
            <Link href="/admin" className="text-muted-foreground hover:text-primary font-medium animate-theme">
              لوحة التحكم
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 animate-smooth"
            aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {isMobileMenuOpen ? (
              <XIcon className="h-6 w-6 text-primary" />
            ) : (
              <MenuIcon className="h-6 w-6 text-primary" />
            )}
          </button>
        </div>
        
        {/* Mobile menu */}
        <motion.div 
          className={`md:hidden overflow-hidden`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: isMobileMenuOpen ? 'auto' : 0,
            opacity: isMobileMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="pt-4 pb-2 space-y-3">
            <Link 
              href="/" 
              className="block py-2 px-4 text-primary hover:bg-gray-50 rounded-md animate-smooth"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              الرئيسية
            </Link>
            <Link 
              href="/admin" 
              className="block py-2 px-4 text-muted-foreground hover:bg-gray-50 hover:text-primary rounded-md animate-smooth"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              لوحة التحكم
            </Link>
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default SimpleHeader;