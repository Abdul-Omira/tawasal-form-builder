/**
 * Form Builder Platform - Main App Component
 * Integrates admin dashboard, form builder, and public forms
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RTLProvider } from './contexts/RTLContext';
import { cn } from './lib/utils';

// Admin Components
import Dashboard from './components/admin/Dashboard';
import FormManagement from './components/admin/FormManagement';
import Analytics from './components/admin/Analytics';
import AdvancedAnalytics from './components/admin/AdvancedAnalytics';
import SecurityAudit from './components/admin/SecurityAudit';
import Documentation from './components/admin/Documentation';

// Form Builder Components
import FormCanvas from './components/form-builder/FormCanvas';
import ComponentLibrary from './components/form-builder/ComponentLibrary';
import PropertyPanel from './components/form-builder/PropertyPanel';

// Public Components
import FormRenderer from './components/public/FormRenderer';
import FormSubmission from './components/public/FormSubmission';

// Types
import { Form, FormComponent, FormResponse, FormAnalyticsData } from './types/form';
import { BaseComponent } from './types/component';

// Mock data for development
const mockForms: Form[] = [
  {
    id: '1',
    title: 'نموذج استطلاع المواطنين',
    description: 'استطلاع لقياس رضا المواطنين عن الخدمات الحكومية',
    status: 'published',
    createdBy: 'admin',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-20'),
    publishedAt: new Date('2025-01-20'),
    settings: {},
  },
  {
    id: '2',
    title: 'نموذج تسجيل الأعمال',
    description: 'نموذج لتسجيل الشركات والمؤسسات',
    status: 'draft',
    createdBy: 'admin',
    createdAt: new Date('2025-01-18'),
    updatedAt: new Date('2025-01-22'),
    settings: {},
  },
];

const mockComponents: BaseComponent[] = [
  {
    id: 'comp1',
    type: 'text',
    config: {
      label: 'الاسم الكامل',
      placeholder: 'أدخل اسمك الكامل',
      required: true,
      helpText: 'يرجى إدخال اسمك الكامل كما هو مكتوب في الهوية',
    },
    validation: {
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    orderIndex: 0,
    isVisible: true,
    isRequired: true,
  },
  {
    id: 'comp2',
    type: 'email',
    config: {
      label: 'البريد الإلكتروني',
      placeholder: 'example@email.com',
      required: true,
      helpText: 'سيتم استخدام هذا البريد للتواصل معك',
    },
    validation: {
      required: true,
      pattern: '^[^@]+@[^@]+\\.[^@]+$',
    },
    orderIndex: 1,
    isVisible: true,
    isRequired: true,
  },
];

const mockAnalytics: FormAnalyticsData[] = [
  {
    formId: '1',
    totalViews: 1250,
    totalSubmissions: 340,
    completionRate: 0.85,
    avgCompletionTime: 180,
    dailyStats: [],
    componentAnalytics: [],
  },
  {
    formId: '2',
    totalViews: 890,
    totalSubmissions: 120,
    completionRate: 0.72,
    avgCompletionTime: 240,
    dailyStats: [],
    componentAnalytics: [],
  },
];

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'form-builder' | 'public-form' | 'analytics' | 'security' | 'documentation'>('dashboard');
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<BaseComponent | null>(null);
  const [forms, setForms] = useState<Form[]>(mockForms);
  const [components, setComponents] = useState<BaseComponent[]>(mockComponents);
  const [analytics, setAnalytics] = useState<FormAnalyticsData[]>(mockAnalytics);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Form Builder State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'input' | 'selection' | 'file' | 'date' | 'rating' | 'layout' | 'logic'>('all');

  // Handle form operations
  const handleCreateForm = () => {
    const newForm: Form = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'نموذج جديد',
      description: '',
      status: 'draft',
      createdBy: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {},
    };
    setForms(prev => [newForm, ...prev]);
    setSelectedForm(newForm);
    setCurrentView('form-builder');
  };

  const handleEditForm = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (form) {
      setSelectedForm(form);
      setCurrentView('form-builder');
    }
  };

  const handleDeleteForm = (formId: string) => {
    setForms(prev => prev.filter(f => f.id !== formId));
    if (selectedForm?.id === formId) {
      setSelectedForm(null);
      setCurrentView('dashboard');
    }
  };

  const handleViewForm = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (form) {
      setSelectedForm(form);
      setCurrentView('public-form');
    }
  };

  const handleShareForm = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (form) {
      const url = `${window.location.origin}/form/${formId}`;
      navigator.clipboard.writeText(url);
      // Show success message
      alert('تم نسخ رابط النموذج إلى الحافظة');
    }
  };

  const handleArchiveForm = (formId: string) => {
    setForms(prev => prev.map(f => 
      f.id === formId ? { ...f, status: 'archived' as const } : f
    ));
  };

  const handleDuplicateForm = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (form) {
      const duplicatedForm: Form = {
        ...form,
        id: Math.random().toString(36).substr(2, 9),
        title: `${form.title} (نسخة)`,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: undefined,
      };
      setForms(prev => [duplicatedForm, ...prev]);
    }
  };

  const handleViewAnalytics = (formId: string) => {
    // Switch to analytics view
    setCurrentView('dashboard');
  };

  // Form Builder Operations
  const handleComponentAdd = (component: BaseComponent) => {
    setComponents(prev => [...prev, component]);
    setIsDirty(true);
  };

  const handleComponentUpdate = (componentId: string, updates: Partial<BaseComponent>) => {
    setComponents(prev => prev.map(c => 
      c.id === componentId ? { ...c, ...updates } : c
    ));
    setIsDirty(true);
  };

  const handleComponentDelete = (componentId: string) => {
    setComponents(prev => prev.filter(c => c.id !== componentId));
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
    }
    setIsDirty(true);
  };

  const handleComponentSelect = (component: BaseComponent | null) => {
    setSelectedComponent(component);
  };

  const handleComponentMove = (fromIndex: number, toIndex: number) => {
    setComponents(prev => {
      const newComponents = [...prev];
      const [movedComponent] = newComponents.splice(fromIndex, 1);
      newComponents.splice(toIndex, 0, movedComponent);
      return newComponents;
    });
    setIsDirty(true);
  };

  const handleSaveForm = () => {
    if (selectedForm) {
      setForms(prev => prev.map(f => 
        f.id === selectedForm.id 
          ? { ...f, updatedAt: new Date() }
          : f
      ));
      setIsDirty(false);
      // Show success message
      alert('تم حفظ النموذج بنجاح');
    }
  };

  const handlePreviewForm = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handlePublishForm = () => {
    if (selectedForm) {
      setForms(prev => prev.map(f => 
        f.id === selectedForm.id 
          ? { ...f, status: 'published', publishedAt: new Date(), updatedAt: new Date() }
          : f
      ));
      setIsDirty(false);
      // Show success message
      alert('تم نشر النموذج بنجاح');
    }
  };

  // Public Form Operations
  const handleFormSubmit = async (response: FormResponse) => {
    console.log('Form submitted:', response);
    // In a real app, this would send to the API
    alert('تم إرسال النموذج بنجاح');
  };

  const handleSaveProgress = async (response: Partial<FormResponse>) => {
    console.log('Progress saved:', response);
    // In a real app, this would save to the API
  };

  const handleExportData = (format: 'csv' | 'pdf' | 'excel') => {
    console.log('Exporting data as:', format);
    // In a real app, this would trigger the export
    alert(`سيتم تصدير البيانات بصيغة ${format.toUpperCase()}`);
  };

  const handleFixSecurityIssue = (issueId: string) => {
    console.log('Fixing security issue:', issueId);
    // In a real app, this would fix the security issue
    alert('تم إصلاح مشكلة الأمان');
  };

  const handleRunFullAudit = () => {
    console.log('Running full security audit');
    // In a real app, this would run a full security audit
    alert('تم تشغيل التدقيق الأمني الشامل');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('تم نسخ الكود إلى الحافظة');
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            forms={forms}
            analytics={analytics}
            onCreateForm={handleCreateForm}
            onEditForm={handleEditForm}
            onDeleteForm={handleDeleteForm}
            onViewForm={handleViewForm}
            onShareForm={handleShareForm}
            onArchiveForm={handleArchiveForm}
          />
        );
      
      case 'analytics':
        return (
          <AdvancedAnalytics
            forms={forms}
            analytics={analytics}
            onExportData={handleExportData}
          />
        );
      
      case 'security':
        return (
          <SecurityAudit
            forms={forms}
            onFixIssue={handleFixSecurityIssue}
            onRunFullAudit={handleRunFullAudit}
          />
        );
      
      case 'documentation':
        return (
          <Documentation
            onCopyCode={handleCopyCode}
          />
        );
      
      case 'form-builder':
        return (
          <div className="flex h-screen">
            <ComponentLibrary
              onComponentDrag={handleComponentAdd}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            <div className="flex-1 flex">
              <FormCanvas
                form={selectedForm}
                components={components}
                selectedComponent={selectedComponent}
                onComponentAdd={handleComponentAdd}
                onComponentUpdate={handleComponentUpdate}
                onComponentDelete={handleComponentDelete}
                onComponentSelect={handleComponentSelect}
                onComponentMove={handleComponentMove}
                onSaveForm={handleSaveForm}
                onPreviewForm={handlePreviewForm}
                onPublishForm={handlePublishForm}
                isPreviewMode={isPreviewMode}
                isDirty={isDirty}
              />
              <PropertyPanel
                selectedComponent={selectedComponent}
                onConfigChange={(config) => selectedComponent && handleComponentUpdate(selectedComponent.id, { config })}
                onValidationChange={(validation) => selectedComponent && handleComponentUpdate(selectedComponent.id, { validation })}
                onConditionalLogicChange={(logic) => selectedComponent && handleComponentUpdate(selectedComponent.id, { conditionalLogic: logic })}
                onComponentDelete={handleComponentDelete}
                onComponentToggleVisibility={(id) => handleComponentUpdate(id, { isVisible: !components.find(c => c.id === id)?.isVisible })}
              />
            </div>
          </div>
        );
      
      case 'public-form':
        return selectedForm ? (
          <FormRenderer
            form={selectedForm}
            components={components}
            onSubmit={handleFormSubmit}
            onSaveProgress={handleSaveProgress}
            showProgress={true}
            allowSaveProgress={true}
            isPreview={false}
          />
        ) : (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                نموذج غير موجود
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                النموذج المطلوب غير موجود أو تم حذفه
              </p>
            </div>
          </div>
        );
      
      default:
        return <Navigate to="/dashboard" replace />;
    }
  };

  return (
    <RTLProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Navigation */}
          <nav className="bg-white dark:bg-gray-800 shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    منصة بناء النماذج
                  </h1>
                </div>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium",
                      currentView === 'dashboard'
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    )}
                  >
                    لوحة التحكم
                  </button>
                  <button
                    onClick={() => setCurrentView('form-builder')}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium",
                      currentView === 'form-builder'
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    )}
                  >
                    منشئ النماذج
                  </button>
                  <button
                    onClick={() => setCurrentView('analytics')}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium",
                      currentView === 'analytics'
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    )}
                  >
                    التحليلات
                  </button>
                  <button
                    onClick={() => setCurrentView('security')}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium",
                      currentView === 'security'
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    )}
                  >
                    الأمان
                  </button>
                  <button
                    onClick={() => setCurrentView('documentation')}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium",
                      currentView === 'documentation'
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    )}
                  >
                    الوثائق
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main>
            {renderCurrentView()}
          </main>
        </div>
      </Router>
    </RTLProvider>
  );
}

export default App;