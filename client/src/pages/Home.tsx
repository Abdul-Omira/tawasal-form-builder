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
                className="text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 animate-theme font-ibm leading-tight px-2"
                variants={textVariants}
              >
                <FancyCalligraphyAnimation 
                  text="صفحة التواصل مع وزير الاتصالات وتقانة المعلومات"
                  duration={0.06}
                  delay={0.2}
                  className="inline-block font-ibm"
                  as="h1"
                />
              </motion.div>

              {/* Minister's Complete Message */}
              <motion.div 
                className="mb-6 sm:mb-8 md:mb-10 max-w-5xl mx-auto font-ibm mx-2 sm:mx-4"
                variants={textVariants}
              >
                <div className="relative overflow-hidden">
                  {/* Creative geometric background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-600/15 to-teal-700/20 rounded-3xl"></div>
                  
                  {/* Animated floating shapes */}
                  <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                  <div className="absolute bottom-10 left-10 w-16 h-16 bg-white/8 rounded-full blur-lg animate-pulse delay-1000"></div>
                  <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/6 rounded-full blur-md animate-pulse delay-500"></div>
                  
                  {/* Main content container */}
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-10 md:p-12 border border-white/20 shadow-2xl">
                    {/* Elegant top accent */}
                    <div className="absolute top-0 right-1/4 left-1/4 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"></div>
                    
                    <div className="text-white/95 leading-relaxed text-right">
                      {/* Main Message with creative styling */}
                      <div className="relative">
                        <div className="text-base mb-8 relative z-10">
                          <CalligraphyAnimation 
                            text="مرحباً، يسرني استقبال رسائلكم عبر هذه الصفحة. نراجع كل رسالة بعناية وجدية، ونحيلها إلى المتابعة المختصة عند الحاجة. أقدّر تواصلكم واهتمامكم، وأشكركم على مساهمتكم في تطوير قطاع الاتصالات والتكنولوجيا، راجياً تفهّمكم لعدم إمكانية الرد شخصياً على جميع المراسلات."
                            duration={0.015}
                            delay={0.5}
                            className="inline-block font-ibm"
                          />
                        </div>
                        
                        {/* Creative divider */}
                        <div className="flex items-center justify-center mb-6">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/30"></div>
                          <div className="px-4">
                            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/30"></div>
                        </div>
                        
                        {/* Signature with creative layout */}
                        <div className="text-base space-y-3">
                          <p className="text-white/80 italic text-center">مع أطيب التمنيات،</p>
                          
                          {/* Minister name with special background */}
                          <div className="relative text-center">
                            <div className="absolute inset-0 bg-white/5 rounded-xl blur-sm"></div>
                            <p className="relative text-white font-medium py-2 px-4">عبدالسلام هيكل</p>
                          </div>
                          
                          <p className="text-white/90 text-center">وزير الاتصالات وتقانة المعلومات</p>
                          <p className="text-white/80 text-center text-sm">الجمهورية العربية السورية</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom accent */}
                    <div className="absolute bottom-0 right-1/3 left-1/3 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"></div>
                  </div>
                </div>
              </motion.div>

              {/* Call to Action */}
              <motion.div 
                className="mt-4 sm:mt-6 md:mt-8 px-4"
                variants={textVariants}
              >
                <button 
                  onClick={() => {
                    const formSection = document.getElementById('form-section');
                    if (formSection) {
                      formSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full sm:w-auto bg-white/20 hover:bg-white/30 active:bg-white/25 text-white font-medium py-3 sm:py-4 px-6 sm:px-8 md:px-10 rounded-full transition-all duration-300 border border-white/30 hover:border-white/50 backdrop-blur-sm text-sm sm:text-base font-ibm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 min-h-[48px] touch-manipulation"
                >
                  أرسل رسالتك الآن
                </button>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Form Section with animation */}
        <motion.section 
          className="py-6 sm:py-8 md:py-10 lg:py-16 font-ibm bg-gray-50 min-h-screen"
          variants={formVariants}
          initial="hidden"
          animate="visible"
          id="form-section"
        >
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            {/* Section Header */}
            <motion.div 
              className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12"
              variants={textVariants}
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 font-ibm px-2">
                أرسل رسالتك إلى الوزير
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-ibm px-4">
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
