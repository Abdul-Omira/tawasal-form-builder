import React from 'react';
import SimpleHeader from '../components/layout/SimpleHeader';
import SimpleFooter from '../components/layout/SimpleFooter';
import { Separator } from '@/components/ui/separator';
import PageSEO from '@/components/seo/PageSEO';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <PageSEO pageName="privacyPolicy" />
      <SimpleHeader />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-8">سياسة الخصوصية</h1>
          <Separator className="mb-6 sm:mb-8" />

          <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none rtl" dir="rtl">
            <section className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-primary">مقدمة</h2>
              <p className="text-sm sm:text-base">ترحب وزارة الاتصالات وتقانة المعلومات السورية بكم في منصة دعم الشركات التقنية. نحن نلتزم بحماية خصوصيتكم وأمان بياناتكم. توضح سياسة الخصوصية هذه كيفية جمع المعلومات واستخدامها وحمايتها عند استخدام منصتنا.</p>
            </section>

            <section className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-primary">المعلومات التي نجمعها</h2>
              <p className="text-sm sm:text-base">تقوم وزارة الاتصالات وتقانة المعلومات بجمع البيانات التالية:</p>
              <ul className="list-disc mr-4 sm:mr-6 mt-2 space-y-1 sm:space-y-2 text-sm sm:text-base">
                <li>معلومات الشركة أو المؤسسة التي تقدمها عبر نموذج التسجيل، بما في ذلك اسم الشركة وعنوانها ونوع العمل ومعلومات الاتصال</li>
                <li>البيانات المتعلقة بتأثير العقوبات على عمل الشركة والمؤسسة</li>
                <li>معلومات الاتصال مثل اسم الشخص المسؤول ورقم الهاتف وعنوان البريد الإلكتروني</li>
                <li>بيانات السجل الإلكتروني التي تُجمع تلقائياً أثناء زيارة الموقع (مثل عنوان IP، نوع المتصفح، وقت الزيارة)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">كيفية استخدام المعلومات</h2>
              <p>تستخدم وزارة الاتصالات وتقانة المعلومات البيانات المقدمة للأغراض التالية:</p>
              <ul className="list-disc mr-6 mt-2 space-y-2">
                <li>تقييم احتياجات الشركات المتأثرة بالعقوبات وتقديم الدعم المناسب</li>
                <li>تطوير سياسات وبرامج لدعم قطاع تكنولوجيا المعلومات في سوريا</li>
                <li>التواصل مع الشركات المسجلة حول فرص الدعم والبرامج الحكومية</li>
                <li>إعداد تقارير إحصائية وتحليلية للاستخدام الحكومي الداخلي (مع إزالة المعلومات الشخصية)</li>
                <li>تحسين خدمات المنصة وتجربة المستخدم</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">حماية البيانات والأمان</h2>
              <p>تلتزم وزارة الاتصالات وتقانة المعلومات بحماية بياناتكم من خلال:</p>
              <ul className="list-disc mr-6 mt-2 space-y-2">
                <li>تطبيق تقنيات التشفير المتقدمة لحماية البيانات الحساسة المخزنة والمتبادلة</li>
                <li>تنفيذ ضوابط أمنية صارمة للحماية من الوصول غير المصرح به</li>
                <li>تقييد الوصول إلى البيانات للموظفين المخولين فقط وعلى أساس الحاجة إلى المعرفة</li>
                <li>الالتزام بمعايير أمان البيانات الحكومية</li>
                <li>مراجعة وتحديث الإجراءات الأمنية بشكل دوري</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">مشاركة البيانات</h2>
              <p>لا تقوم وزارة الاتصالات وتقانة المعلومات بمشاركة البيانات المقدمة إلا في الحالات التالية:</p>
              <ul className="list-disc mr-6 mt-2 space-y-2">
                <li>مع الجهات الحكومية الأخرى المعنية بتقديم الدعم للشركات المتأثرة بالعقوبات</li>
                <li>عند الالتزام بالمتطلبات القانونية والتنظيمية</li>
                <li>بموافقة صريحة من الشركة المعنية ولأغراض محددة</li>
              </ul>
              <p>لن يتم مشاركة البيانات مع أي جهات خارجية لأغراض تجارية أو تسويقية.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">حقوق المستخدمين</h2>
              <p>تحترم وزارة الاتصالات وتقانة المعلومات حقوق المستخدمين في:</p>
              <ul className="list-disc mr-6 mt-2 space-y-2">
                <li>الاطلاع على البيانات المخزنة وطلب نسخة منها</li>
                <li>تصحيح البيانات غير الدقيقة</li>
                <li>طلب حذف البيانات (في حدود المتطلبات القانونية للاحتفاظ بالسجلات)</li>
                <li>تقديم شكوى بشأن استخدام البيانات</li>
              </ul>
              <p>للاستفسارات أو طلبات الوصول إلى البيانات، يرجى التواصل مع مكتب حماية البيانات في وزارة الاتصالات وتقانة المعلومات.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">الاحتفاظ بالبيانات</h2>
              <p>تحتفظ وزارة الاتصالات وتقانة المعلومات بالبيانات المقدمة طوال فترة تنفيذ برامج الدعم وبعدها لفترة تحددها متطلبات الأرشفة الحكومية والمتطلبات القانونية. بعد انتهاء هذه الفترة، سيتم حذف البيانات بشكل آمن أو جعلها مجهولة المصدر.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">تحديثات سياسة الخصوصية</h2>
              <p>قد يتم تحديث سياسة الخصوصية هذه من وقت لآخر لتعكس التغييرات في الممارسات أو المتطلبات القانونية. سيتم نشر التحديثات على هذه الصفحة وإخطار المستخدمين بالتغييرات الهامة عند الاقتضاء.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">التواصل معنا</h2>
              <p>لأي استفسارات تتعلق بسياسة الخصوصية أو كيفية التعامل مع بياناتكم، يرجى التواصل مع:</p>
              <div className="p-4 bg-muted rounded-md mt-2">
                <p className="font-semibold">مكتب حماية البيانات</p>
                <p>وزارة الاتصالات وتقانة المعلومات</p>
                <p>دمشق، الجمهورية العربية السورية</p>
                <p>البريد الإلكتروني: info@moct.gov.sy</p>
              </div>
            </section>

            <div className="text-sm text-gray-600 mt-12 text-center">
              <p>تاريخ آخر تحديث: 1 مايو 2025</p>
            </div>
          </div>
        </div>
      </div>
      
      <SimpleFooter />
    </>
  );
};

export default PrivacyPolicy;