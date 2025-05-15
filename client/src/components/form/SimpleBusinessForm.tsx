import React from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
      // Need to add these fields to comply with the backend schema
      const formattedData = {
        ...data,
        employeesCount: "1-10", // default value
        address: "سوريا", // default value
        governorate: "damascus", // default value
        position: "مدير", // default value
        challenges: ["challenge1"], // default value
        techNeeds: ["techNeed1"], // default value
        wantsUpdates: true,
      };
      
      const response = await apiRequest('POST', '/api/business-submissions', formattedData);
      return await response.json();
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

  return (
    <Card className="bg-white rounded-lg shadow-md max-w-3xl mx-auto">
      <CardContent className="p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">استمارة تقديم المعلومات</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        اسم الشركة <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="أدخل اسم الشركة" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        نوع النشاط <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع النشاط" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technology">تكنولوجيا المعلومات</SelectItem>
                          <SelectItem value="manufacturing">تصنيع</SelectItem>
                          <SelectItem value="retail">تجارة تجزئة</SelectItem>
                          <SelectItem value="services">خدمات</SelectItem>
                          <SelectItem value="other">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        اسم المسؤول <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="أدخل اسم المسؤول" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        رقم الهاتف <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} placeholder="09xxxxxxxx" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      البريد الإلكتروني <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" {...field} placeholder="example@domain.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="challengeDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      ما هي التحديات الرئيسية التي تواجهها شركتك بسبب العقوبات؟ <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={3} 
                        {...field} 
                        placeholder="اشرح بإيجاز التحديات التي تواجهها شركتك..." 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="consentToDataUse"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-x-reverse space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none mr-2">
                      <FormLabel className="font-medium">
                        أوافق على استخدام المعلومات المقدمة لغرض التواصل وتقديم الدعم من قبل وزارة الاتصالات السورية
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-center pt-4">
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto px-8"
                disabled={isPending}
              >
                {isPending ? "جاري الإرسال..." : "إرسال الطلب"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SimpleBusinessForm;