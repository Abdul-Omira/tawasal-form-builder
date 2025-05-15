import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { 
  FacebookIcon, 
  TwitterIcon, 
  LinkedinIcon, 
  YoutubeIcon, 
  SendIcon 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
  };

  return (
    <footer className="bg-secondary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('ministry_footer')}</h3>
            <p className="mb-4 text-gray-300">{t('ministry_description')}</p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="text-white hover:text-gray-300">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <LinkedinIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <YoutubeIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-gray-300 hover:text-white">{t('home')}</a>
                </Link>
              </li>
              <li>
                <a href="/#about" className="text-gray-300 hover:text-white">{t('about')}</a>
              </li>
              <li>
                <a href="/#form-section" className="text-gray-300 hover:text-white">{t('formTitle')}</a>
              </li>
              <li>
                <Link href="/admin">
                  <a className="text-gray-300 hover:text-white">{t('adminDashboard')}</a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">{t('contactUs')}</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('ministryServices')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">{t('startupSupport')}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">{t('technicalConsulting')}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">{t('trainingPrograms')}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">{t('legalFacilitation')}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">{t('fundingInitiatives')}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('newsletter')}</h3>
            <p className="mb-4 text-gray-300">{t('newsletterDescription')}</p>
            <form className="mb-4" onSubmit={handleNewsletterSubmit}>
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder={t('emailPlaceholder')} 
                  className="rounded-l-md focus:outline-none text-foreground flex-1 rounded-r-none" 
                  required
                />
                <Button 
                  type="submit" 
                  className="bg-primary px-4 py-2 rounded-l-none rounded-r-md hover:bg-primary/90 transition"
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300">{t('copyright')}</p>
          <div className="flex space-x-6 space-x-reverse mt-4 md:mt-0">
            <a href="#" className="text-gray-300 hover:text-white">{t('privacyPolicy')}</a>
            <a href="#" className="text-gray-300 hover:text-white">{t('termsOfUse')}</a>
            <a href="#" className="text-gray-300 hover:text-white">{t('siteMap')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
