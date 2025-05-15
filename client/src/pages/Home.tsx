import React from 'react';
import SimpleBusinessForm from '../components/form/SimpleBusinessForm';
import SimpleHeader from '../components/layout/SimpleHeader';
import SimpleFooter from '../components/layout/SimpleFooter';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SimpleHeader />
      
      <main className="flex-grow">
        {/* Banner Section */}
        <section className="bg-primary py-8">
          <div className="container mx-auto px-4">
            <div className="text-center text-white">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">نظام التواصل للشركات المتأثرة بالعقوبات</h1>
              <p className="mb-6 max-w-2xl mx-auto">
                منصة وزارة الاتصالات السورية لجمع معلومات حول الشركات الناشئة والأعمال المتأثرة بالعقوبات ومساعدتها في التغلب على التحديات
              </p>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <SimpleBusinessForm />
          </div>
        </section>
      </main>

      <SimpleFooter />
    </div>
  );
};

export default Home;
