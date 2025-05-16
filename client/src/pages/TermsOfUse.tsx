import React from 'react';
import SimpleHeader from '../components/layout/SimpleHeader';
import SimpleFooter from '../components/layout/SimpleFooter';
import { Separator } from '@/components/ui/separator';
import PageSEO from '@/components/seo/PageSEO';

const TermsOfUse: React.FC = () => {
  return (
    <>
      <PageSEO pageName="termsOfUse" />
      <SimpleHeader />
      
      <div className="container mx-auto px-4 py-10 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">شروط الاستخدام</h1>
          <Separator className="mb-8" />

          <div className="prose prose-lg max-w-none rtl" dir="rtl">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">مقدمة</h2>
              <p>مرحباً بكم في منصة دعم الشركات التقنية التابعة لوزارة الاتصالات وتقانة المعلومات في الجمهورية العربية السورية. تُنظم شروط الاستخدام هذه العلاقة بينكم وبين وزارة الاتصالات وتقانة المعلومات ("الوزارة") فيما يتعلق باستخدام المنصة.</p>
              <p>باستخدامكم للمنصة، فإنكم توافقون على الالتزام بهذه الشروط. إذا لم توافقوا على هذه الشروط، يرجى عدم استخدام المنصة.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">الغرض من المنصة</h2>
              <p>تهدف منصة دعم الشركات التقنية إلى:</p>
              <ul className="list-disc mr-6 mt-2 space-y-2">
                <li>جمع معلومات عن الشركات والمؤسسات التقنية المتأثرة بالعقوبات</li>
                <li>تمكين الوزارة من تقييم احتياجات هذه الشركات وتقديم الدعم المناسب</li>
                <li>تسهيل التواصل بين الحكومة والشركات في قطاع تكنولوجيا المعلومات</li>
                <li>تطوير سياسات وبرامج لدعم قطاع تكنولوجيا المعلومات في سوريا</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">استخدام المنصة</h2>
              <p>عند استخدام المنصة، توافقون على ما يلي:</p>
              <ul className="list-disc mr-6 mt-2 space-y-2">
                <li>تقديم معلومات دقيقة وصحيحة وحديثة</li>
                <li>الالتزام بالقوانين واللوائح المعمول بها في الجمهورية العربية السورية</li>
                <li>عدم انتحال شخصية أي فرد أو كيان آخر</li>
                <li>الحفاظ على سرية بيانات الدخول الخاصة بكم وعدم مشاركتها مع الآخرين</li>
                <li>عدم استخدام المنصة لأي غرض غير قانوني أو غير مصرح به</li>
                <li>عدم محاولة الوصول إلى أجزاء من المنصة غير متاحة لكم</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">التسجيل وتقديم المعلومات</h2>
              <p>عند تقديم معلومات حول شركتكم، يتعين عليكم:</p>
              <ul className="list-disc mr-6 mt-2 space-y-2">
                <li>ضمان صحة ودقة جميع المعلومات المقدمة</li>
                <li>التأكد من أنكم مخولون بتقديم هذه المعلومات نيابة عن الشركة</li>
                <li>تحديث المعلومات في حال تغييرها</li>
              </ul>
              <p>تحتفظ الوزارة بالحق في التحقق من المعلومات المقدمة وطلب وثائق إضافية عند الضرورة.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">الملكية الفكرية</h2>
              <p>جميع المحتويات المنشورة على المنصة، بما في ذلك النصوص والصور والشعارات والتصميمات والبرمجيات، هي ملك لوزارة الاتصالات وتقانة المعلومات في الجمهورية العربية السورية أو الجهات المرخص لها. يُمنع نسخ أو توزيع أو تعديل أو إعادة نشر هذه المحتويات دون إذن كتابي مسبق.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">حدود المسؤولية</h2>
              <p>تبذل الوزارة جهوداً معقولة لضمان دقة المعلومات المقدمة على المنصة وأمان استخدامها، ومع ذلك:</p>
              <ul className="list-disc mr-6 mt-2 space-y-2">
                <li>لا تضمن الوزارة أن المنصة ستكون متاحة بشكل مستمر وخالية من الأخطاء</li>
                <li>لا تتحمل الوزارة المسؤولية عن أي أضرار مباشرة أو غير مباشرة تنتج عن استخدام المنصة</li>
                <li>لا تضمن الوزارة نتائج محددة من استخدام المنصة أو المشاركة في برامج الدعم</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">التعديلات على شروط الاستخدام</h2>
              <p>تحتفظ الوزارة بالحق في تعديل شروط الاستخدام هذه في أي وقت. سيتم نشر الشروط المعدلة على هذه الصفحة، وستكون سارية المفعول فور نشرها. يُنصح المستخدمون بمراجعة شروط الاستخدام بشكل دوري.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">القانون الحاكم وتسوية النزاعات</h2>
              <p>تخضع شروط الاستخدام هذه لقوانين الجمهورية العربية السورية. أي نزاع ينشأ عن استخدام المنصة أو يتعلق بها سيتم حله بشكل ودي، وفي حال تعذر ذلك، سيتم إحالته إلى المحاكم المختصة في الجمهورية العربية السورية.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">الاتصال بنا</h2>
              <p>إذا كان لديكم أي استفسارات حول شروط الاستخدام هذه، يرجى التواصل مع:</p>
              <div className="p-4 bg-muted rounded-md mt-2">
                <p className="font-semibold">المكتب القانوني</p>
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

export default TermsOfUse;