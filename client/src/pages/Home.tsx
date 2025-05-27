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
          className="bg-primary py-10 sm:py-12 md:py-16 lg:py-20 overflow-hidden font-ibm relative"
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Subtle geometric shapes */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 left-10 w-48 h-48 bg-white/3 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/4 rounded-full blur-lg"></div>
            
            {/* Flowing lines */}
            <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 400 300" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.1"/>
                  <stop offset="100%" stopColor="white" stopOpacity="0.3"/>
                </linearGradient>
              </defs>
              <path 
                d="M0,150 Q100,50 200,150 T400,150" 
                fill="none" 
                stroke="url(#lineGradient)" 
                strokeWidth="2"
              />
              <path 
                d="M0,200 Q150,100 300,200 T400,200" 
                fill="none" 
                stroke="url(#lineGradient)" 
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              className="text-center text-white font-ibm max-w-5xl mx-auto"
              variants={textVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Main Title */}
              <motion.div 
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 sm:mb-8 animate-theme font-ibm leading-tight px-2"
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

              {/* Minister's Message */}
              <motion.div 
                className="mb-6 sm:mb-8 max-w-4xl mx-auto text-sm sm:text-base md:text-lg font-ibm bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 md:p-8 border border-white/20 mx-2 sm:mx-4"
                variants={textVariants}
              >
                <CalligraphyAnimation 
                  text="مرحباً، يسرني استقبال رسائلكم عبر هذه الصفحة. نراجع كل رسالة بعناية وجدية، ونحيلها إلى المتابعة المختصة عند الحاجة. أقدّر تواصلكم واهتمامكم، وأشكركم على مساهمتكم في تطوير قطاع الاتصالات والتكنولوجيا، راجياً تفهّمكم لعدم إمكانية الرد شخصياً على جميع المراسلات."
                  duration={0.015}
                  delay={0.5}
                  className="inline-block font-ibm leading-relaxed"
                />
              </motion.div>
              
              {/* Minister's Signature */}
              <motion.div 
                className="text-center text-white/95 font-ibm bg-white/5 backdrop-blur-sm rounded-lg p-4 sm:p-6 inline-block border border-white/10 mx-2"
                variants={textVariants}
              >
                <div className="text-sm sm:text-base leading-relaxed">
                  <p className="mb-2 text-white/80">مع أطيب التمنيات،</p>
                  <p className="font-semibold text-lg sm:text-xl text-white">عبدالسلام هيكل</p>
                  <p className="text-sm sm:text-base text-white/90">وزير الاتصالات وتقانة المعلومات</p>
                  <p className="text-xs sm:text-sm text-white/80">الجمهورية العربية السورية</p>
                </div>
              </motion.div>

              {/* Call to Action */}
              <motion.div 
                className="mt-6 sm:mt-8"
                variants={textVariants}
              >
                <button 
                  onClick={() => {
                    const formSection = document.getElementById('form-section');
                    if (formSection) {
                      formSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 sm:px-8 rounded-full transition-all duration-300 border border-white/30 hover:border-white/50 backdrop-blur-sm text-sm sm:text-base font-ibm shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  أرسل رسالتك الآن
                </button>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Form Section with animation */}
        <motion.section 
          className="py-8 sm:py-10 md:py-12 lg:py-16 font-ibm bg-gray-50 min-h-screen"
          variants={formVariants}
          initial="hidden"
          animate="visible"
          id="form-section"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <motion.div 
              className="text-center mb-8 sm:mb-10 md:mb-12"
              variants={textVariants}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-ibm">
                أرسل رسالتك إلى الوزير
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-ibm">
                استخدم النموذج أدناه لإرسال رسالتك مباشرة إلى وزير الاتصالات وتقانة المعلومات
              </p>
            </motion.div>

            {/* Form Container */}
            <motion.div 
              className="max-w-4xl mx-auto"
              variants={formVariants}
            >
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 font-ibm">
                <MinisterCommunicationForm />
              </div>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <SimpleFooter />
    </PageTransition>
  );
};

export default Home;
