/**
 * Utility functions for SEO optimization
 * Handles page titles, descriptions, and other metadata
 */

/**
 * Sets the page title with proper formatting
 * @param pageTitle The specific page title
 * @param includeSiteName Whether to include the site name in the title
 */
export function setPageTitle(pageTitle: string, includeSiteName = true) {
  const siteName = 'وزارة الاتصالات وتقانة المعلومات';
  document.title = includeSiteName ? `${pageTitle} - ${siteName}` : pageTitle;
}

/**
 * Page metadata configuration
 */
interface PageMetadata {
  title: string;
  description: string;
  path: string;
}

/**
 * Page-specific metadata for different routes
 */
export const pageMetadata: Record<string, PageMetadata> = {
  home: {
    title: 'منصة دعم الشركات التقنية',
    description: 'المنصة الرسمية لوزارة الاتصالات وتقانة المعلومات السورية لجمع معلومات حول الشركات الناشئة والأعمال المتأثرة بالعقوبات',
    path: '/'
  },
  admin: {
    title: 'لوحة تحكم المشرف',
    description: 'إدارة بيانات الشركات المسجلة وعرض الإحصائيات والتقارير',
    path: '/admin'
  },
  auth: {
    title: 'تسجيل الدخول',
    description: 'تسجيل الدخول إلى منصة وزارة الاتصالات وتقانة المعلومات لإدارة بيانات الشركات',
    path: '/auth'
  },
  confirmation: {
    title: 'تأكيد التقديم',
    description: 'تم تسجيل بيانات الشركة بنجاح في منصة وزارة الاتصالات وتقانة المعلومات',
    path: '/confirmation'
  },
  privacyPolicy: {
    title: 'سياسة الخصوصية',
    description: 'معلومات حول كيفية جمع واستخدام وحماية البيانات في منصة وزارة الاتصالات وتقانة المعلومات',
    path: '/privacy-policy'
  },
  termsOfUse: {
    title: 'شروط الاستخدام',
    description: 'الشروط والأحكام المنظمة لاستخدام منصة وزارة الاتصالات وتقانة المعلومات',
    path: '/terms-of-use'
  },
  notFound: {
    title: 'الصفحة غير موجودة',
    description: 'الصفحة المطلوبة غير موجودة في منصة وزارة الاتصالات وتقانة المعلومات',
    path: '*'
  }
};

/**
 * Updates meta tags for OpenGraph and Twitter
 * @param metadata Page metadata for SEO
 */
export function updateMetaTags(metadata: PageMetadata) {
  const { title, description, path } = metadata;
  const baseUrl = 'https://communication-platform.moct.gov.sy';
  const fullUrl = `${baseUrl}${path}`;
  
  // Find and update OpenGraph tags
  const metaTags = {
    'og:title': title,
    'og:description': description,
    'og:url': fullUrl,
    'twitter:title': title,
    'twitter:description': description,
    'twitter:url': fullUrl
  };
  
  // Update each meta tag
  Object.entries(metaTags).forEach(([property, content]) => {
    let metaTag = document.querySelector(`meta[property="${property}"]`);
    if (metaTag) {
      metaTag.setAttribute('content', content);
    }
  });
  
  // Update canonical link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.setAttribute('href', fullUrl);
  }
}