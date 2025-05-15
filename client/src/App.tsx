import { useEffect } from 'react';
import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { RTLProvider } from '@/contexts/RTLContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './lib/i18n';
import Home from '@/pages/Home';
import Admin from '@/pages/Admin';
import Confirmation from '@/pages/Confirmation';
import NotFound from '@/pages/not-found';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/admin" component={Admin}/>
      <Route path="/confirmation" component={Confirmation}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Set document title and meta description
  useEffect(() => {
    document.title = 'نظام التواصل - وزارة الاتصالات السورية';
    
    // Set meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'منصة وزارة الاتصالات السورية لجمع معلومات حول الشركات الناشئة والأعمال المتأثرة بالعقوبات ومساعدتها في التغلب على التحديات');
    
    // Add Open Graph tags
    const ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', 'نظام التواصل - وزارة الاتصالات السورية');
    document.head.appendChild(ogTitle);
    
    const ogDescription = document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', 'منصة وزارة الاتصالات السورية لجمع معلومات حول الشركات الناشئة والأعمال المتأثرة بالعقوبات ومساعدتها في التغلب على التحديات');
    document.head.appendChild(ogDescription);
    
    const ogType = document.createElement('meta');
    ogType.setAttribute('property', 'og:type');
    ogType.setAttribute('content', 'website');
    document.head.appendChild(ogType);
    
    // Add font links
    const fontLink = document.createElement('link');
    fontLink.setAttribute('rel', 'stylesheet');
    fontLink.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
    document.head.appendChild(fontLink);
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <RTLProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </RTLProvider>
    </I18nextProvider>
  );
}

export default App;
