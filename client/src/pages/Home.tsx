import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import SimpleBusinessFormNew from '../components/form/SimpleBusinessFormNew';
import SimpleHeader from '../components/layout/SimpleHeader';
import SimpleFooter from '../components/layout/SimpleFooter';
import PageTransition from '../components/ui/page-transition';
import PageSEO from '../components/seo/PageSEO';
import { CalligraphyAnimation, FancyCalligraphyAnimation } from '../components/animation/NewCalligraphyAnimation';

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
      {/* Add SEO component with page-specific metadata */}
      <PageSEO 
        pageName="home"
        customDescription="المنصة الرسمية لوزارة الاتصالات وتقانة المعلومات السورية لجمع معلومات حول الشركات الناشئة والأعمال المتأثرة بالعقوبات وتقديم الدعم اللازم لها"
      />
      <SimpleHeader />
      
      <main className="flex-grow">
        {/* Banner Section with animation */}
        <motion.section 
          className="bg-primary py-8 md:py-12 overflow-hidden font-ibm"
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center text-white font-ibm"
              variants={textVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 animate-theme font-ibm"
                variants={textVariants}
              >
                <FancyCalligraphyAnimation 
                  text="استمارة الشركات المتأثرة بالإجراءات الأميركية"
                  duration={0.06}
                  delay={0.2}
                  className="inline-block font-ibm"
                  as="h1"
                />
              </motion.div>
              <motion.div 
                className="mb-6 max-w-2xl mx-auto text-sm md:text-base font-ibm"
                variants={textVariants}
              >
                <CalligraphyAnimation 
                  text="هدف الاستمارة جمع أسماء الشركات الأميركية والعالمية التي أوقفت خدماتها في سورية أو حدت منها بسبب الإجراءات الأميركية المتعلقة بالعقوبات المفروضة على النظام البائد. شكلت وزارة الاتصالات وتقانة المعلومات مجموعة عمل للتواصل مع الشركات الأميركية والعالمية لتسريع عودة خدماتها إلى السوريين والسوق السوري فور صدور التعليمات التنفيذية لإعلان الرئيس الأميركي."
                  duration={0.015}
                  delay={0.5}
                  className="inline-block font-ibm"
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Form Section with animation */}
        <motion.section 
          className="py-8 md:py-12 font-ibm"
          variants={formVariants}
          initial="hidden"
          animate="visible"
          id="form-section"
        >
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg font-ibm">
              <SimpleBusinessFormNew />
            </div>
          </div>
        </motion.section>
      </main>

      <SimpleFooter />
    </PageTransition>
  );
};

export default Home;
