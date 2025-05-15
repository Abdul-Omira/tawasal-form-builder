import React from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isValidEmail, isValidPhone } from '@/lib/utils';

// Create a simplified schema for the form
const SimpleFormSchema = z.object({
  businessName: z.string().min(1, { message: "اسم الشركة مطلوب" }),
  businessType: z.string().min(1, { message: "نوع النشاط مطلوب" }),
  contactName: z.string().min(1, { message: "اسم المسؤول مطلوب" }),
  phone: z.string().min(1, { message: "رقم الهاتف مطلوب" }).refine(isValidPhone, { message: "رقم الهاتف غير صالح" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  challengeDetails: z.string().min(1, { message: "يرجى وصف التحديات التي تواجهها" }),
  consentToDataUse: z.boolean().refine(val => val === true, { message: "يجب الموافقة على استخدام البيانات" }),
});

const SimpleBusinessForm: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Form handling
  const form = useForm({
    resolver: zodResolver(SimpleFormSchema),
    defaultValues: {
      businessName: '',
      businessType: '',
      contactName: '',
      phone: '',
      email: '',
      challengeDetails: '',
      consentToDataUse: false,
    }
  });
  
  // Form mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: any) => {
      console.log("Submitting form data:", data);
      
      // Need to add these fields to comply with the backend schema
      const formattedData = {
        ...data,
        employeesCount: "1-10", // default value
        address: "سوريا", // default value
        governorate: "دمشق", // default value
        position: "مدير", // default value
        establishmentDate: new Date().toISOString().split('T')[0], // today as default
        registrationNumber: Math.floor(Math.random() * 1000000).toString(), // random number as default
        alternativeContact: "",
        website: "",
        challenges: ["sanctions"], // default value
        techNeeds: ["internet_access"], // default value
        techDetails: "",
        additionalComments: "",
        wantsUpdates: true,
      };
      
      console.log("Formatted data:", formattedData);
      
      try {
        const response = await apiRequest('POST', '/api/business-submissions', formattedData);
        const jsonResponse = await response.json();
        console.log("Submit response:", jsonResponse);
        return jsonResponse;
      } catch (error) {
        console.error("Error submitting form:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم إرسال البيانات بنجاح",
        description: "شكراً لتقديم معلومات شركتك. سيتم التواصل معك قريباً.",
        duration: 5000,
      });
      
      // Redirect to confirmation page with request ID
      setLocation(`/confirmation?id=${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: any) => {
    mutate(data);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };

  const formItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, delay: 0.6 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className="bg-white rounded-lg shadow-md max-w-3xl mx-auto animate-smooth">
        <CardContent className="p-6 md:p-8">
          <motion.h2
            className="text-2xl font-bold mb-6 text-center text-foreground"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            استمارة تقديم المعلومات
          </motion.h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <motion.div 
                className="space-y-6"
                variants={containerVariants}
              >
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
                  variants={formItemVariants}
                >
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem className="animate-smooth">
                        <FormLabel className="font-medium">
                          اسم الشركة <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="أدخل اسم الشركة" 
                            className="focus:border-primary focus:ring-1 focus:ring-primary animate-smooth"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem className="animate-smooth">
                        <FormLabel className="font-medium">
                          نوع النشاط <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="focus:border-primary focus:ring-1 focus:ring-primary animate-smooth">
                              <SelectValue placeholder="اختر نوع النشاط" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="technology">تكنولوجيا المعلومات والاتصالات</SelectItem>
                            <SelectItem value="software">تطوير البرمجيات</SelectItem>
                            <SelectItem value="ecommerce">التجارة الإلكترونية</SelectItem>
                            <SelectItem value="manufacturing">الصناعات التحويلية</SelectItem>
                            <SelectItem value="agriculture">الزراعة والإنتاج الغذائي</SelectItem>
                            <SelectItem value="textile">صناعة النسيج والألبسة</SelectItem>
                            <SelectItem value="retail">تجارة التجزئة</SelectItem>
                            <SelectItem value="wholesale">تجارة الجملة</SelectItem>
                            <SelectItem value="healthcare">الرعاية الصحية والطبية</SelectItem>
                            <SelectItem value="education">التعليم والتدريب</SelectItem>
                            <SelectItem value="tourism">السياحة والضيافة</SelectItem>
                            <SelectItem value="transport">النقل واللوجستيات</SelectItem>
                            <SelectItem value="pharmacy">صناعة الأدوية</SelectItem>
                            <SelectItem value="construction">البناء والمقاولات</SelectItem>
                            <SelectItem value="energy">الطاقة والكهرباء</SelectItem>
                            <SelectItem value="professional_services">خدمات مهنية</SelectItem>
                            <SelectItem value="financial">الخدمات المالية</SelectItem>
                            <SelectItem value="other">أخرى</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
                  variants={formItemVariants}
                >
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem className="animate-smooth">
                        <FormLabel className="font-medium">
                          اسم المسؤول <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="أدخل اسم المسؤول" 
                            className="focus:border-primary focus:ring-1 focus:ring-primary animate-smooth"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="animate-smooth">
                        <FormLabel className="font-medium">
                          رقم الهاتف <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            {...field} 
                            placeholder="09xxxxxxxx" 
                            className="focus:border-primary focus:ring-1 focus:ring-primary animate-smooth"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                
                <motion.div variants={formItemVariants}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="animate-smooth">
                        <FormLabel className="font-medium">
                          البريد الإلكتروني <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            {...field} 
                            placeholder="example@domain.com" 
                            className="focus:border-primary focus:ring-1 focus:ring-primary animate-smooth"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                
                <motion.div variants={formItemVariants}>
                  <FormField
                    control={form.control}
                    name="challengeDetails"
                    render={({ field }) => (
                      <FormItem className="animate-smooth">
                        <FormLabel className="font-medium">
                          ما هي التحديات الرئيسية التي تواجهها شركتك بسبب العقوبات؟ <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={3} 
                            {...field} 
                            placeholder="اشرح بإيجاز التحديات التي تواجهها شركتك..." 
                            className="focus:border-primary focus:ring-1 focus:ring-primary animate-smooth resize-none md:resize-y"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                
                <motion.div variants={formItemVariants}>
                  <FormField
                    control={form.control}
                    name="consentToDataUse"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-2 space-x-reverse space-y-0 rounded-md border p-4 hover:bg-muted/10 animate-smooth">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="animate-smooth data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none mr-2">
                          <FormLabel className="font-medium text-sm md:text-base">
                            أوافق على استخدام المعلومات المقدمة لغرض التواصل وتقديم الدعم من قبل وزارة الاتصالات السورية
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="flex justify-center pt-6"
                variants={buttonVariants}
              >
                <Button 
                  type="submit" 
                  className="bg-primary text-white w-full sm:w-auto px-8 py-6 text-base shadow-md animate-smooth"
                  disabled={isPending}
                >
                  {isPending ? "جاري الإرسال..." : "إرسال الطلب"}
                </Button>
              </motion.div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SimpleBusinessForm;