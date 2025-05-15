import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { CheckCircle, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { generateId } from '@/lib/utils';
import { BusinessSubmissionSchema } from '@shared/schema';

interface FormStep {
  id: number;
  title: string;
}

const BusinessForm: React.FC = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Initialize form steps
  const steps: FormStep[] = [
    { id: 1, title: t('step1Title') },
    { id: 2, title: t('step2Title') },
    { id: 3, title: t('step3Title') },
    { id: 4, title: t('step4Title') }
  ];
  
  // Track current step
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form handling
  const form = useForm({
    resolver: zodResolver(BusinessSubmissionSchema),
    defaultValues: {
      businessName: '',
      businessType: '',
      establishmentDate: '',
      employeesCount: '',
      address: '',
      governorate: '',
      registrationNumber: '',
      contactName: '',
      position: '',
      email: '',
      phone: '',
      alternativeContact: '',
      website: '',
      challenges: [] as string[],
      challengeDetails: '',
      techNeeds: [] as string[],
      techDetails: '',
      consentToDataUse: false,
      wantsUpdates: false,
      additionalComments: ''
    }
  });
  
  // Form mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/business-submissions', data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('confirmationTitle'),
        description: t('confirmationMessage'),
        duration: 5000,
      });
      
      // Redirect to confirmation page with request ID
      setLocation(`/confirmation?id=${data.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
        duration: 5000,
      });
    }
  });

  // Handle form navigation
  const nextStep = () => {
    // Validate the current step fields
    const fieldsToValidate = getFieldsForStep(currentStep);
    form.trigger(fieldsToValidate as any).then((isValid) => {
      if (isValid) {
        setCurrentStep(prev => prev < steps.length ? prev + 1 : prev);
      }
    });
  };

  const prevStep = () => {
    setCurrentStep(prev => prev > 1 ? prev - 1 : prev);
  };

  // Get fields to validate for each step
  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 1:
        return ['businessName', 'businessType', 'employeesCount', 'address', 'governorate'];
      case 2:
        return ['contactName', 'position', 'email', 'phone'];
      case 3:
        return ['challenges', 'challengeDetails', 'techNeeds'];
      case 4:
        return ['consentToDataUse'];
      default:
        return [];
    }
  };

  // Handle form submission
  const onSubmit = (data: any) => {
    mutate(data);
  };

  // Get progress information
  const getProgressText = () => {
    return t('step') + ' ' + currentStep + ' ' + t('of') + ' ' + steps.length + ': ' + steps[currentStep - 1].title;
  };

  const getProgressPercentage = () => {
    return `${(currentStep / steps.length) * 100}%`;
  };

  return (
    <Card className="bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <CardContent className="p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">{t('formTitle')}</h2>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">{getProgressText()}</span>
            <span className="text-sm font-medium">{getProgressPercentage()}</span>
          </div>
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`h-2 flex-1 rounded-full ${
                  index + 1 < currentStep 
                    ? 'progress-bar-item completed'
                    : index + 1 === currentStep 
                      ? 'progress-bar-item active' 
                      : 'progress-bar-item inactive'
                }`}
              />
            ))}
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Business Information */}
            <div className={`space-y-6 ${currentStep === 1 ? 'block' : 'hidden'}`}>
              <h3 className="text-xl font-semibold mb-4 text-foreground">{t('step1Title')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        {t('businessName')} <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        {t('businessType')} <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectBusinessType')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technology">{t('technology')}</SelectItem>
                          <SelectItem value="manufacturing">{t('manufacturing')}</SelectItem>
                          <SelectItem value="retail">{t('retail')}</SelectItem>
                          <SelectItem value="services">{t('services')}</SelectItem>
                          <SelectItem value="other">{t('other')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="establishmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">{t('establishmentDate')}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="employeesCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        {t('employeesCount')} <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectEmployeesCount')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-10">{t('employees1_10')}</SelectItem>
                          <SelectItem value="11-50">{t('employees11_50')}</SelectItem>
                          <SelectItem value="51-200">{t('employees51_200')}</SelectItem>
                          <SelectItem value="201+">{t('employeesMore')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      {t('address')} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="governorate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        {t('governorate')} <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectGovernorate')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="damascus">{t('damascus')}</SelectItem>
                          <SelectItem value="aleppo">{t('aleppo')}</SelectItem>
                          <SelectItem value="homs">{t('homs')}</SelectItem>
                          <SelectItem value="hama">{t('hama')}</SelectItem>
                          <SelectItem value="lattakia">{t('lattakia')}</SelectItem>
                          <SelectItem value="other">{t('other')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">{t('registrationNumber')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Step 2: Contact Information */}
            <div className={`space-y-6 ${currentStep === 2 ? 'block' : 'hidden'}`}>
              <h3 className="text-xl font-semibold mb-4 text-foreground">{t('step2Title')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        {t('contactName')} <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        {t('position')} <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        {t('email')} <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
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
                        {t('phone')} <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="alternativeContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">{t('alternativeContact')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">{t('website')}</FormLabel>
                    <FormControl>
                      <Input type="url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Step 3: Business Challenges and Tech Needs */}
            <div className={`space-y-6 ${currentStep === 3 ? 'block' : 'hidden'}`}>
              <h3 className="text-xl font-semibold mb-4 text-foreground">{t('step3Title')}</h3>
              
              <FormField
                control={form.control}
                name="challenges"
                render={() => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel className="font-medium">
                        {t('challenges')} <span className="text-destructive">*</span>
                      </FormLabel>
                    </div>
                    <div className="space-y-2">
                      {[
                        { id: 'challenge1', label: t('challenge1') },
                        { id: 'challenge2', label: t('challenge2') },
                        { id: 'challenge3', label: t('challenge3') },
                        { id: 'challenge4', label: t('challenge4') },
                        { id: 'challenge5', label: t('challenge5') },
                        { id: 'challengeOther', label: t('challengeOther') }
                      ].map((challenge) => (
                        <FormField
                          key={challenge.id}
                          control={form.control}
                          name="challenges"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex items-start space-x-3 space-x-reverse">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(challenge.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, challenge.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value: string) => value !== challenge.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {challenge.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
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
                      {t('challengeDetails')} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="techNeeds"
                render={() => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel className="font-medium">
                        {t('techNeeds')} <span className="text-destructive">*</span>
                      </FormLabel>
                    </div>
                    <div className="space-y-2">
                      {[
                        { id: 'techNeed1', label: t('techNeed1') },
                        { id: 'techNeed2', label: t('techNeed2') },
                        { id: 'techNeed3', label: t('techNeed3') },
                        { id: 'techNeed4', label: t('techNeed4') },
                        { id: 'techNeed5', label: t('techNeed5') },
                        { id: 'techNeedOther', label: t('techNeedOther') }
                      ].map((techNeed) => (
                        <FormField
                          key={techNeed.id}
                          control={form.control}
                          name="techNeeds"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex items-start space-x-3 space-x-reverse">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(techNeed.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, techNeed.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value: string) => value !== techNeed.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {techNeed.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="techDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">{t('techDetails')}</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Step 4: Consent and Submission */}
            <div className={`space-y-6 ${currentStep === 4 ? 'block' : 'hidden'}`}>
              <h3 className="text-xl font-semibold mb-4 text-foreground">{t('step4Title')}</h3>
              
              <div className="mb-6 p-4 bg-gray-50 border border-border rounded-md">
                <h4 className="font-semibold text-gray-800 mb-2">{t('consentTitle')}</h4>
                <p className="text-gray-600 text-sm mb-4">{t('consentDescription')}</p>
                <ul className="list-disc list-inside text-gray-600 text-sm mb-4 pr-4">
                  <li>{t('consentItem1')}</li>
                  <li>{t('consentItem2')}</li>
                  <li>{t('consentItem3')}</li>
                  <li>{t('consentItem4')}</li>
                </ul>
                <p className="text-gray-600 text-sm">{t('consentNote')}</p>
              </div>
              
              <FormField
                control={form.control}
                name="consentToDataUse"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-x-reverse">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-normal">
                        {t('consentCheckbox')} <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="wantsUpdates"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-x-reverse">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-normal">
                        {t('communicationCheckbox')}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additionalComments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">{t('additionalComments')}</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between">
              {currentStep > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="ml-2 h-4 w-4" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  {t('previous')}
                </Button>
              )}
              
              {currentStep < steps.length ? (
                <Button 
                  type="button" 
                  className="mr-auto ml-auto"
                  onClick={nextStep}
                >
                  {t('next')}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="mr-2 h-4 w-4" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="mr-auto ml-auto"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('loading')}
                    </>
                  ) : (
                    <>
                      {t('submit')}
                      <Layers className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BusinessForm;
