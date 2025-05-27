import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import MinisterCommunicationForm from '../components/form/MinisterCommunicationForm';
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
        customDescription="المنصة الرسمية لوزارة الاتصالات وتقانة المعلومات السورية للتواصل مع المواطنين وتلقي أفكارهم ومقترحاتهم وشكاواهم وطلباتهم"
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
                  text="التواصل مع وزير الاتصالات وتقانة المعلومات"
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
                  text="مرحباً، يسرني استقبال رسائلكم عبر هذه الصفحة. نراجع كل رسالة بعناية وجدية، ونحيلها إلى المتابعة المختصة عند الحاجة. أقدّر تواصلكم واهتمامكم، وأشكركم على مساهمتكم في تطوير قطاع الاتصالات والتكنولوجيا، راجياً تفهّمكم لعدم إمكانية الرد شخصياً على جميع المراسلات."
                  duration={0.015}
                  delay={0.5}
                  className="inline-block font-ibm"
                />
              </motion.div>
              
              <motion.div 
                className="mt-6 text-center text-white/90 font-ibm"
                variants={textVariants}
              >
                <div className="text-sm leading-relaxed">
                  <p className="mb-2">مع أطيب التمنيات،</p>
                  <p className="font-semibold">عبدالسلام هيكل</p>
                  <p className="text-sm">وزير الاتصالات وتقانة المعلومات</p>
                  <p className="text-sm">الجمهورية العربية السورية</p>
                </div>
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
              <MinisterCommunicationForm />
            </div>
          </div>
        </motion.section>
      </main>

      <SimpleFooter />
    </PageTransition>
  );
};

export default Home;
