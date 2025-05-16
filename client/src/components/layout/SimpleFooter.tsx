import React from 'react';
import { motion } from 'framer-motion';
import syrianEmblem from '../../assets/syria-emblem.png';

const SimpleFooter: React.FC = () => {
  // Get the current year for the copyright
  const currentYear = new Date().getFullYear();
  
  return (
    <motion.footer 
      className="bg-primary text-white py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Copyright - Responsive for mobile */}
          <motion.p 
            className="text-sm md:text-base text-center md:text-right order-2 md:order-1"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            © {currentYear} وزارة الاتصالات وتقانة المعلومات.
            <span className="hidden sm:inline"> جميع الحقوق محفوظة.</span>
          </motion.p>
          
          {/* Syrian Emblem in the middle */}
          <motion.div 
            className="flex justify-center order-1 md:order-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="animate-smooth h-16 w-16 flex items-center justify-center">
              <img 
                src={syrianEmblem} 
                alt="شعار الجمهورية العربية السورية" 
                className="h-full w-auto"
              />
            </div>
          </motion.div>
          
          {/* Footer links - Responsive for mobile */}
          <motion.div 
            className="flex space-x-6 space-x-reverse order-3"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <a href="/privacy-policy" className="text-white hover:text-gray-200 text-sm md:text-base animate-theme">سياسة الخصوصية</a>
            <a href="/terms-of-use" className="text-white hover:text-gray-200 text-sm md:text-base animate-theme">شروط الاستخدام</a>
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
};

export default SimpleFooter;