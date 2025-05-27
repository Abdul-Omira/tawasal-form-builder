import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import MinisterCommunicationForm from '../components/form/MinisterCommunicationForm';
import SimpleHeader from '../components/layout/SimpleHeader';
import SimpleFooter from '../components/layout/SimpleFooter';
import PageTransition from '../components/ui/page-transition';
import PageSEO from '../components/seo/PageSEO';
import { CalligraphyAnimation, FancyCalligraphyAnimation } from '../components/animation/NewCalligraphyAnimation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone, Mail, Users, Globe, Shield } from 'lucide-react';

const Home: React.FC = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const heroVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <PageTransition className="min-h-screen flex flex-col bg-background">
      <PageSEO 
        pageName="home"
        customDescription="المنصة الرسمية لوزارة الاتصالات وتقانة المعلومات السورية للتواصل مع المواطنين وتلقي أفكارهم ومقترحاتهم وشكاواهم وطلباتهم"
      />
      <SimpleHeader />
      
      <main className="flex-grow">
        {/* Hero Section with beautiful gradient */}
        <motion.section 
          className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-16 md:py-24 overflow-hidden"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-300 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-indigo-200 rounded-full blur-2xl"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="text-center text-white max-w-4xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="mb-6">
                <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20 font-ibm">
                  منصة التواصل الرسمية
                </Badge>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
              >
                <FancyCalligraphyAnimation 
                  text="التواصل مع وزير الاتصالات وتقانة المعلومات"
                  duration={0.06}
                  delay={0.3}
                  className="inline-block font-ibm"
                  as="h1"
                />
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
              >
                <CalligraphyAnimation 
                  text="مرحباً، يسرني استقبال رسائلكم عبر هذه الصفحة. نراجع كل رسالة بعناية وجدية، ونحيلها إلى المتابعة المختصة عند الحاجة."
                  duration={0.02}
                  delay={0.8}
                  className="inline-block font-ibm"
                />
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="text-center">
                  <p className="text-white/90 mb-3 font-ibm">مع أطيب التمنيات،</p>
                  <p className="text-xl font-bold text-white mb-1 font-ibm">عبدالسلام هيكل</p>
                  <p className="text-white/80 font-ibm">وزير الاتصالات وتقانة المعلومات</p>
                  <p className="text-sm text-white/70 font-ibm">الجمهورية العربية السورية</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section 
          className="py-16 bg-gradient-to-b from-gray-50 to-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-ibm">طرق التواصل المتاحة</h2>
              <p className="text-gray-600 max-w-2xl mx-auto font-ibm">
                نوفر لكم قنوات متعددة للتواصل معنا وإرسال مقترحاتكم وشكاواكم
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 font-ibm">الرسائل المباشرة</h3>
                    <p className="text-gray-600 font-ibm">
                      أرسل رسالتك مباشرة للوزير عبر النموذج الإلكتروني الآمن
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 font-ibm">أمان وحماية</h3>
                    <p className="text-gray-600 font-ibm">
                      جميع البيانات محمية ومشفرة، مع ضمان الخصوصية التامة
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 font-ibm">خدمة المواطنين</h3>
                    <p className="text-gray-600 font-ibm">
                      نحن هنا لخدمتكم والاستماع لآرائكم ومقترحاتكم البناءة
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Form Section with enhanced design */}
        <motion.section 
          className="py-16 bg-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          id="form-section"
        >
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-ibm">أرسل رسالتك</h2>
              <p className="text-gray-600 max-w-2xl mx-auto font-ibm">
                استخدم النموذج التالي لإرسال رسالتك مباشرة إلى وزير الاتصالات وتقانة المعلومات
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="max-w-4xl mx-auto"
            >
              <Card className="border-0 shadow-2xl">
                <CardContent className="p-0">
                  <MinisterCommunicationForm />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <SimpleFooter />
    </PageTransition>
  );
};

export default Home;