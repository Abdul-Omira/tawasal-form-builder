import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

// Define an interface for the component props
interface ClickCaptchaProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

// A list of simple button options for verification
const verificationOptions = [
  { id: "option1", label: "أنا لست روبوت", isHuman: true },
  { id: "option2", label: "اختار هذا الخيار", isHuman: false },
  { id: "option3", label: "اضغط هنا للمتابعة", isHuman: true },
  { id: "option4", label: "التحقق من الهوية", isHuman: true },
];

/**
 * A simple Arabic CAPTCHA component with click verification
 */
export const ClickCaptcha: React.FC<ClickCaptchaProps> = ({
  value,
  onChange,
  error
}) => {
  const [options, setOptions] = useState<Array<{id: string, label: string, isHuman: boolean}>>([]);
  const [verified, setVerified] = useState(false);
  
  // Generate random options on mount
  useEffect(() => {
    generateOptions();
  }, []);
  
  // Function to generate random order of options
  const generateOptions = () => {
    // Randomly select 3 options
    const shuffled = [...verificationOptions].sort(() => 0.5 - Math.random());
    // Ensure at least one human option is included
    let selected = shuffled.slice(0, 3);
    const hasHumanOption = selected.some(option => option.isHuman);
    
    if (!hasHumanOption) {
      // Replace one random non-human option with a human option
      const humanOptions = verificationOptions.filter(option => option.isHuman);
      selected[Math.floor(Math.random() * 3)] = humanOptions[Math.floor(Math.random() * humanOptions.length)];
    }
    
    // Shuffle again for final order
    setOptions(selected.sort(() => 0.5 - Math.random()));
  };
  
  // Handle option selection
  const handleOptionClick = (option: {id: string, label: string, isHuman: boolean}) => {
    if (option.isHuman) {
      setVerified(true);
      onChange("verified");
    } else {
      setVerified(false);
      onChange("");
      // Regenerate options if they choose wrong
      generateOptions();
    }
  };
  
  return (
    <div className="mt-4">
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-4">
          <div className="space-y-2">
            <Label>تحقق الأمان</Label>
            <p className="text-sm text-muted-foreground">
              يرجى النقر على الزر المناسب للتحقق من أنك لست روبوت:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {options.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  variant="outline"
                  onClick={() => handleOptionClick(option)}
                  className={`h-14 relative ${verified && option.isHuman ? 'bg-primary/10 border-primary' : ''}`}
                  disabled={verified}
                >
                  {option.label}
                  {verified && option.isHuman && (
                    <CheckCircle2 className="h-5 w-5 absolute top-2 right-2 text-primary" />
                  )}
                </Button>
              ))}
            </div>
            
            {verified && (
              <p className="text-sm text-green-600 font-medium mt-2">
                تم التحقق بنجاح!
              </p>
            )}
            
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClickCaptcha;