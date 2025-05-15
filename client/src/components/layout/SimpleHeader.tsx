import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { MenuIcon, XIcon, UserIcon, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import syriaLogo from '../../assets/syria-logo.png';

const SimpleHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setLocation('/auth');
      toast({
        title: 'تم تسجيل الخروج بنجاح',
        description: 'نراك مرة أخرى قريباً'
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تسجيل الخروج',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm py-2 md:py-4 animate-smooth">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <motion.div
              className="relative flex items-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={syriaLogo}
                alt="شعار الجمهورية العربية السورية"
                className="h-20 md:h-28 w-auto hover-scale animate-smooth"
              />
              <div className="mr-3 md:mr-4">
                <h1 className="text-lg md:text-xl font-bold text-foreground">وزارة الاتصالات وتقانة المعلومات</h1>
                <p className="text-xs md:text-sm text-muted-foreground">الجمهورية العربية السورية</p>
              </div>
            </motion.div>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-primary hover:text-primary/80 font-medium animate-theme">
              الرئيسية
            </Link>
            
            {isAdmin && (
              <Link href="/admin" className="text-muted-foreground hover:text-primary font-medium animate-theme">
                لوحة التحكم
              </Link>
            )}
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <UserIcon className="h-4 w-4" />
                    {user?.name || user?.username}
                    {isAdmin && <ShieldCheck className="h-4 w-4 text-primary" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-right">
                    <span className="font-semibold">{user?.username}</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem className="text-primary text-right">
                      <ShieldCheck className="h-4 w-4 ml-2" />
                      <span>مشرف نظام</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive text-right">
                    <LogOut className="h-4 w-4 ml-2" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button variant="default" size="sm">
                  تسجيل الدخول
                </Button>
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 animate-smooth"
            aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {isMobileMenuOpen ? (
              <XIcon className="h-6 w-6 text-primary" />
            ) : (
              <MenuIcon className="h-6 w-6 text-primary" />
            )}
          </button>
        </div>
        
        {/* Mobile menu */}
        <motion.div 
          className={`md:hidden overflow-hidden`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: isMobileMenuOpen ? 'auto' : 0,
            opacity: isMobileMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="pt-4 pb-2 space-y-3">
            <Link 
              href="/" 
              className="block py-2 px-4 text-primary hover:bg-gray-50 rounded-md animate-smooth"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              الرئيسية
            </Link>
            
            {isAdmin && (
              <Link 
                href="/admin" 
                className="block py-2 px-4 text-muted-foreground hover:bg-gray-50 hover:text-primary rounded-md animate-smooth"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                لوحة التحكم
              </Link>
            )}
            
            {isAuthenticated ? (
              <div 
                className="block py-2 px-4 text-destructive hover:bg-gray-50 rounded-md animate-smooth cursor-pointer"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                تسجيل الخروج
              </div>
            ) : (
              <Link 
                href="/auth" 
                className="block py-2 px-4 text-primary font-medium hover:bg-gray-50 rounded-md animate-smooth"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                تسجيل الدخول
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default SimpleHeader;