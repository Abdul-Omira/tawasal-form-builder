import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { LandmarkIcon, MenuIcon, XIcon } from 'lucide-react';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Determine if the link is active
  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-primary flex items-center justify-center rounded-full text-white font-bold text-xl">
            <LandmarkIcon className="h-8 w-8" />
          </div>
          <div className="mr-4">
            <h1 className="text-xl font-bold text-foreground">{t('ministry')}</h1>
            <p className="text-sm text-muted-foreground">{t('systemName')}</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/" className={`text-${isActive('/') ? 'primary' : 'muted-foreground'} hover:text-primary`}>
            {t('home')}
          </Link>
          <a href="/#about" className="text-muted-foreground hover:text-primary">
            {t('about')}
          </a>
          <a href="/#form-section" className="text-muted-foreground hover:text-primary">
            {t('form')}
          </a>
          <Link href="/admin" className={`text-${isActive('/admin') ? 'primary' : 'muted-foreground'} hover:text-primary`}>
            {t('adminDashboard')}
          </Link>
          <Button className="bg-primary text-white hover:bg-secondary transition">
            {t('login')}
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={toggleMobileMenu} 
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </Button>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-border py-2">
          <div className="container mx-auto px-4">
            <Link 
              href="/" 
              className={`block py-2 text-${isActive('/') ? 'primary' : 'muted-foreground'} hover:text-primary`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('home')}
            </Link>
            <a 
              href="/#about" 
              className="block py-2 text-muted-foreground hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('about')}
            </a>
            <a 
              href="/#form-section" 
              className="block py-2 text-muted-foreground hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('form')}
            </a>
            <Link 
              href="/admin" 
              className={`block py-2 text-${isActive('/admin') ? 'primary' : 'muted-foreground'} hover:text-primary`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('adminDashboard')}
            </Link>
            <Link 
              href="/login" 
              className="block py-2 text-muted-foreground hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('login')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
