import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import SimpleHeader from '@/components/layout/SimpleHeader';
import SimpleFooter from '@/components/layout/SimpleFooter';
import LoginForm from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';
import emblemSrc from '@assets/Emblem_of_Syria.svg.png';
import { useAuth } from '@/hooks/useAuth';
import PageSEO from '@/components/seo/PageSEO';

const AuthPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  
  // If user is already logged in, redirect to home or admin page
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (isAdmin) {
        setLocation('/admin');
      } else {
        setLocation('/');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, setLocation]);

  // Removed infinite loading check to prevent getting stuck
  // We'll only render the auth form for unauthenticated users

  return (
    <div className="flex flex-col min-h-screen">
      <PageSEO 
        pageName="auth"
        customTitle="تسجيل الدخول - استمارة الشركات المتأثرة بالإجراءات الأميركية"
        customDescription="صفحة تسجيل الدخول إلى منصة وزارة الاتصالات وتقانة المعلومات لمتابعة الشركات المتأثرة بالإجراءات الأميركية"
      />
      <SimpleHeader />
      
      <main className="flex-grow bg-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Login Form */}
            <motion.div 
              className="w-full md:w-1/2 p-8 md:p-12"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-8 text-center text-primary">تسجيل الدخول للموظفين</h2>
              <LoginForm />
            </motion.div>
            
            {/* Hero Section */}
            <motion.div 
              className="w-full md:w-1/2 bg-primary/90 p-8 md:p-12 flex flex-col justify-center items-center text-white"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex flex-col items-center">
                <img 
                  src={emblemSrc} 
                  alt="شعار الجمهورية العربية السورية" 
                  className="w-32 h-32 mb-6"
                />
                <h1 className="text-3xl font-bold text-center mb-4">وزارة الاتصالات وتقانة المعلومات</h1>
                <p className="text-lg text-center mb-6">
                  الجمهورية العربية السورية
                </p>
                <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-4">استمارة الشركات المتأثرة بالإجراءات الأميركية</h3>
                  <p className="text-sm">
                    هدف الاستمارة جمع أسماء الشركات الأميركية والعالمية التي أوقفت خدماتها في سورية أو حدت منها 
                    بسبب الإجراءات الأميركية المتعلقة بالعقوبات المفروضة على النظام البائد.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <SimpleFooter />
    </div>
  );
};

export default AuthPage;