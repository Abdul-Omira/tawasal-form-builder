import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import SimpleBusinessForm from '../components/form/SimpleBusinessForm';
import SimpleHeader from '../components/layout/SimpleHeader';
import SimpleFooter from '../components/layout/SimpleFooter';
import PageTransition from '../components/ui/page-transition';

const Home: React.FC = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animation variants
  const bannerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.7,
        staggerChildren: 0.2,
        delayChildren: 0.3
      } 
    }
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        duration: 0.5, 
        delay: 0.4 
      } 
    }
  };

  return (
    <PageTransition className="min-h-screen flex flex-col bg-background">
      <SimpleHeader />
      
      <main className="flex-grow">
        {/* Banner Section with animation */}
        <motion.section 
          className="bg-primary py-8 md:py-12 overflow-hidden"
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center text-white"
              variants={textVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 
                className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 animate-theme"
                variants={textVariants}
              >
                نظام التواصل للشركات المتأثرة بالعقوبات
              </motion.h1>
              <motion.p 
                className="mb-6 max-w-2xl mx-auto text-sm md:text-base"
                variants={textVariants}
              >
                منصة وزارة الاتصالات السورية لجمع معلومات حول الشركات الناشئة والأعمال المتأثرة بالعقوبات ومساعدتها في التغلب على التحديات
              </motion.p>
            </motion.div>
          </div>
        </motion.section>

        {/* Form Section with animation */}
        <motion.section 
          className="py-8 md:py-12"
          variants={formVariants}
          initial="hidden"
          animate="visible"
          id="form-section"
        >
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
              <SimpleBusinessForm />
            </div>
          </div>
        </motion.section>
      </main>

      <SimpleFooter />
    </PageTransition>
  );
};

export default Home;
