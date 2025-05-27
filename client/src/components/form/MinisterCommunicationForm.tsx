import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdaptiveCaptcha } from '@/components/ui/adaptive-captcha';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isValidEmail, isValidPhone } from '@/lib/utils';

// Create schema for minister communication form
const MinisterCommunicationSchema = z.object({
  communicationType: z.string().min(1, { message: "تصنيف الرسالة مطلوب" }),
  subject: z.string().min(1, { message: "الموضوع مطلوب" }),
  message: z.string().min(10, { message: "نص الرسالة مطلوب ويجب أن يكون 10 أحرف على الأقل" }),
  fullName: z.string().min(1, { message: "الاسم مطلوب" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  phone: z.string().optional(),
  attachmentUrl: z.string().optional(),
  attachmentName: z.string().optional(),
  attachmentType: z.string().optional(),
  attachmentSize: z.number().optional(),
  captchaAnswer: z.string().min(1, { message: "يرجى التحقق من أنك لست روبوت" }),
  consentToDataUse: z.boolean().refine(val => val === true, { message: "يجب الموافقة على استخدام المعلومات" }),
});

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.08
    }
  }
};

const formItemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const welcomeVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const MinisterCommunicationForm: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State to track submission success
  const [submissionSuccessful, setSubmissionSuccessful] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [captchaError, setCaptchaError] = useState('');
  
  // State for file attachment
  const [fileAttachment, setFileAttachment] = useState<{
    url: string;
    name: string;
    type: string;
    size: number;
  } | null>(null);
  
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  
  // Form handling
  const form = useForm<z.infer<typeof MinisterCommunicationSchema>>({
    resolver: zodResolver(MinisterCommunicationSchema),
    defaultValues: {
      communicationType: '',
      subject: '',
      message: '',
      fullName: '',
      email: '',
      phone: '',
      attachmentUrl: '',
      attachmentName: '',
      attachmentType: '',
      attachmentSize: undefined,
      captchaAnswer: '',
      consentToDataUse: false,
    }
  });
  
  // Form mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: any) => {
      console.log("Submitting minister communication:", data);
      
      const response = await apiRequest('/api/citizen-communications', 'POST', data);
      return response.json();
    },
    onSuccess: (data: any) => {
      console.log("Form submitted successfully:", data);
      
      // Set submission success state
      setSubmissionSuccessful(true);
      if (data && typeof data === 'object' && 'id' in data) {
        setSubmissionId(data.id);
      }
      
      // Show success toast
      toast({
        title: "تم إرسال الرسالة بنجاح",
        description: "ستصلكم رسالة تأكيد عبر البريد الإلكتروني",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error submitting form:", error);
      
      // Show error toast
      toast({
        title: "خطأ في إرسال الرسالة",
        description: "حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  });
  
  // Form submission handler
  const onSubmit = async (data: z.infer<typeof MinisterCommunicationSchema>) => {
    console.log("Form data:", data);
    mutate(data);
  };
  
  // Render success view
  if (submissionSuccessful) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="font-ibm"
      >
        <Card className="bg-white rounded-lg shadow-md max-w-3xl mx-auto animate-smooth">
          <CardContent className="p-6 md:p-8 text-center">
            <div className="text-center my-10">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4 text-center text-foreground font-ibm">
                شكرًا لتواصلكم
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                لن نتمكن من الرد على جميع الرسائل، لكن تأكدوا أن رسالتكم وصلت وستحظى بالاهتمام اللازم.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button onClick={() => setSubmissionSuccessful(false)} variant="default">
                  إرسال رسالة جديدة
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="font-ibm"
    >
      <Card className="bg-white rounded-lg shadow-md max-w-3xl mx-auto animate-smooth">
        <CardContent className="p-6 md:p-8">
          
          {/* رسالة ترحيب من الوزير */}
          <motion.div 
            variants={welcomeVariants}
            className="mb-8 text-center"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
              <h1 className="text-2xl font-bold text-blue-900 mb-4 font-ibm">
                أهلاً وسهلاً بكم
              </h1>
              <p className="text-gray-700 leading-relaxed mb-4 font-ibm">
                يسعدني أن أستقبل أفكاركم ومشاريعكم واقتراحاتكم وشكاواكم وطلباتكم، 
                وسأحرص على متابعة كل ما يصلني منكم بشكل شخصي.
              </p>
              <div className="text-right mt-6 text-blue-800 font-medium">
                <p className="font-ibm">المهندس عبد السلام هيكل</p>
                <p className="text-sm text-blue-600 font-ibm">وزير الاتصالات وتقانة المعلومات</p>
              </div>
            </div>
          </motion.div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <motion.div 
                className="space-y-6"
                variants={containerVariants}
              >
                {/* تصنيفات الرسائل */}
                <motion.div variants={formItemVariants}>
                  <FormField
                    control={form.control}
                    name="communicationType"
                    render={({ field }) => (
                      <FormItem className="animate-smooth">
                        <FormLabel className="font-medium text-lg">تصنيفات الرسائل:</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="focus:ring-1 focus:ring-primary animate-smooth font-ibm">
                              <SelectValue placeholder="اختر تصنيف الرسالة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="font-ibm">
                            <SelectItem value="اقتراح">اقتراح</SelectItem>
                            <SelectItem value="استفسار">استفسار</SelectItem>
                            <SelectItem value="رأي">رأي</SelectItem>
                            <SelectItem value="شكوى">شكوى</SelectItem>
                            <SelectItem value="تعاون">تعاون</SelectItem>
                            <SelectItem value="طلب">طلب</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                {/* الموضوع */}
                <motion.div variants={formItemVariants}>
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem className="animate-smooth">
                        <FormLabel className="font-medium text-lg">الموضوع:</FormLabel>
                        <p className="text-sm text-muted-foreground mb-2">
                          يرجى كتابة جملة مختصرة توضّح مضمون الرسالة.
                        </p>
                        <FormControl>
                          <Input 
                            {...field}
                            className="focus:border-primary focus:ring-1 focus:ring-primary animate-smooth font-ibm"
                            placeholder="موضوع الرسالة"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                
                {/* نص الرسالة */}
                <motion.div variants={formItemVariants}>
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className="animate-smooth">
                        <FormLabel className="font-medium text-lg">نص الرسالة:</FormLabel>
                        <p className="text-sm text-muted-foreground mb-2">
                          يرجى توضيح التفاصيل بشكل يساعدنا على المتابعة بشكل فعّال.
                        </p>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={6}
                            placeholder="اكتب رسالتك هنا..." 
                            className="focus:border-primary focus:ring-1 focus:ring-primary animate-smooth resize-none md:resize-y font-ibm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                {/* الاسم */}
                <motion.div variants={formItemVariants}>
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="animate-smooth">
                        <FormLabel className="font-medium text-lg">الاسم:</FormLabel>
                        <p className="text-sm text-muted-foreground mb-2">
                          (أفضل الرسائل هي التي تتضمن الاسم الكامل)
                        </p>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="focus:border-primary focus:ring-1 focus:ring-primary animate-smooth font-ibm"
                            placeholder="الاسم الكامل"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                {/* البريد الإلكتروني */}
                <motion.div variants={formItemVariants}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="animate-smooth">
                        <FormLabel className="font-medium text-lg">البريد الإلكتروني:</FormLabel>
                        <p className="text-sm text-muted-foreground mb-2">
                          (ستصلكم رسالة تأكيد عند استلام المراسلة)
                        </p>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email" 
                            className="focus:border-primary focus:ring-1 focus:ring-primary animate-smooth font-ibm"
                            placeholder="example@email.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                {/* رقم الهاتف */}
                <motion.div variants={formItemVariants}>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="animate-smooth">
                        <FormLabel className="font-medium text-lg">رقم الهاتف:</FormLabel>
                        <p className="text-sm text-muted-foreground mb-2">
                          (اختياري – فقط إذا استدعى الأمر تواصلاً مباشراً)
                        </p>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="tel" 
                            className="focus:border-primary focus:ring-1 focus:ring-primary animate-smooth font-ibm"
                            placeholder="09XXXXXXXX"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                
                {/* إرفاق ملفات */}
                <motion.div variants={formItemVariants}>
                  <div className="animate-smooth">
                    <label className="font-medium text-lg block mb-2">إرفاق ملف (اختياري):</label>
                    <p className="text-sm text-muted-foreground mb-3">
                      يمكنك إرفاق ملفات PDF أو عروض PowerPoint لدعم رسالتك
                    </p>
                    <FileUpload 
                      onFileUploaded={(fileData) => {
                        setFileAttachment(fileData);
                        form.setValue('attachmentUrl', fileData.url);
                        form.setValue('attachmentName', fileData.name);
                        form.setValue('attachmentType', fileData.type);
                        form.setValue('attachmentSize', Number(fileData.size));
                      }}
                      onUploadError={(error) => {
                        setFileUploadError(error);
                      }}
                      maxSizeMB={10}
                      allowedTypes={[
                        'application/pdf',
                        'application/vnd.ms-powerpoint',
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'image/jpeg', 
                        'image/png'
                      ]}
                    />
                    {fileUploadError && <p className="text-red-500 text-sm mt-1">{fileUploadError}</p>}
                    {fileAttachment && fileAttachment.url && (
                      <div className="mt-2 p-2 border rounded flex items-center justify-between">
                        <div className="flex items-center">
                          <Send className="h-4 w-4 ml-2 text-primary" />
                          <span className="text-sm">{fileAttachment.name} ({(fileAttachment.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            if (fileAttachment.type.startsWith('image/') || 
                                fileAttachment.type === 'application/pdf') {
                              window.open(fileAttachment.url, '_blank');
                            }
                          }}
                        >
                          عرض
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
                
                {/* التحقق الأمني */}
                <motion.div variants={formItemVariants}>
                  <FormField
                    control={form.control}
                    name="captchaAnswer"
                    render={({ field }) => (
                      <FormItem className="animate-smooth">
                        <FormLabel className="font-medium text-lg">التحقق الأمني:</FormLabel>
                        <p className="text-sm text-muted-foreground mb-2">
                          يرجى التأكد من أنك لست روبوت
                        </p>
                        <FormControl>
                          <AdaptiveCaptcha 
                            value={field.value} 
                            onChange={field.onChange}
                            error={form.formState.errors.captchaAnswer?.message?.toString()}
                          />
                        </FormControl>
                        {captchaError && <p className="text-red-500 text-sm mt-1">{captchaError}</p>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                
                {/* إقرار */}
                <motion.div variants={formItemVariants}>
                  <FormField
                    control={form.control}
                    name="consentToDataUse"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-x-reverse space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base font-medium leading-relaxed">
                            إقرار: أوافق على استخدام معلوماتي فقط لغرض معالجة هذه الرسالة.
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                
                {/* زر الإرسال */}
                <motion.div variants={formItemVariants} className="flex justify-center pt-4">
                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className="w-full md:w-auto min-w-[250px] bg-primary hover:bg-primary/90 text-white font-ibm animate-smooth text-lg py-3"
                  >
                    <Send className="ml-2 h-5 w-5" />
                    {isPending ? 'جارٍ الإرسال...' : 'أرسل الرسالة إلى الوزير'}
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MinisterCommunicationForm;